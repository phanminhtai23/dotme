import {
    db,
    isSupabaseMigrationComplete,
    migrateSupabaseData,
} from "./database.js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const DOCUMENTS_TABLE = process.env.SUPABASE_DOCS_TABLE || "documents";
const VISITS_TABLE = process.env.SUPABASE_VISITS_TABLE || "visits";
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
const PAGE_SIZE = 1000;

function requireSupabaseConfig() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
    }
}

async function supabaseRequest(path, options = {}) {
    const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}${path}`, {
        ...options,
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            ...options.headers,
        },
    });
    if (!response.ok) {
        throw new Error(`Supabase request failed (${response.status}) for ${path.split("?")[0]}`);
    }
    return response;
}

async function readRestTable(table, select, order) {
    const rows = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
        const params = new URLSearchParams({ select, order });
        const response = await supabaseRequest(
            `/rest/v1/${encodeURIComponent(table)}?${params}`,
            { headers: { Range: `${offset}-${offset + PAGE_SIZE - 1}` } },
        );
        const page = await response.json();
        if (!Array.isArray(page)) {
            throw new Error(`Supabase table "${table}" did not return an array`);
        }
        rows.push(...page);
        if (page.length < PAGE_SIZE) return rows;
    }
}

async function listStorageObjects() {
    const objects = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
        const response = await supabaseRequest(
            `/storage/v1/object/list/${encodeURIComponent(STORAGE_BUCKET)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prefix: "",
                    limit: PAGE_SIZE,
                    offset,
                    sortBy: { column: "name", order: "asc" },
                }),
            },
        );
        const page = await response.json();
        if (!Array.isArray(page)) {
            throw new Error(`Supabase storage bucket "${STORAGE_BUCKET}" returned an invalid listing`);
        }
        objects.push(...page);
        if (page.length < PAGE_SIZE) return objects;
    }
}

async function downloadStorageObject(object) {
    if (!object.name || object.name.includes("/") || object.name.includes("\\")) {
        throw new Error(`Unsupported nested upload path in Supabase bucket: ${object.name}`);
    }
    const path = object.name
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/");
    const response = await supabaseRequest(
        `/storage/v1/object/${encodeURIComponent(STORAGE_BUCKET)}/${path}`,
    );
    const contentType =
        response.headers.get("content-type") ||
        object.metadata?.mimetype ||
        "application/octet-stream";

    return {
        filename: object.name,
        mimetype: contentType.split(";")[0].trim(),
        originalName: object.name,
        content: Buffer.from(await response.arrayBuffer()),
        createdAt: object.created_at || new Date().toISOString(),
    };
}

function rewriteStorageUrls(value, objectNames) {
    if (Array.isArray(value)) {
        return value.map((item) => rewriteStorageUrls(item, objectNames));
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
                key,
                rewriteStorageUrls(item, objectNames),
            ]),
        );
    }
    if (typeof value !== "string") return value;

    try {
        const url = new URL(value);
        const objectPrefix = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
        if (!url.pathname.startsWith(objectPrefix)) return value;
        const objectName = decodeURIComponent(url.pathname.slice(objectPrefix.length));
        return objectNames.has(objectName) ? `/uploads/${objectName}` : value;
    } catch {
        return value;
    }
}

async function migrate() {
    if (isSupabaseMigrationComplete()) {
        console.log("Supabase data has already been migrated; no data was changed.");
        return;
    }
    requireSupabaseConfig();

    const [documents, visits, storageObjects] = await Promise.all([
        readRestTable(DOCUMENTS_TABLE, "collection,item_key,payload,sort_order", "sort_order.asc"),
        readRestTable(
            VISITS_TABLE,
            "created_at,page,ip,user_agent,visitor_id,referrer",
            "created_at.asc",
        ),
        listStorageObjects(),
    ]);

    const uploads = await Promise.all(storageObjects.map(downloadStorageObject));
    const objectNames = new Set(uploads.map((upload) => upload.filename));
    const collections = {};
    for (const row of documents) {
        if (row.collection === "_seed_state") continue;
        const payload =
            typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
        if (!collections[row.collection]) collections[row.collection] = [];
        collections[row.collection].push(rewriteStorageUrls(payload, objectNames));
    }

    const migrated = migrateSupabaseData({ collections, visits, uploads });
    if (!migrated) {
        console.log("Supabase data has already been migrated; no data was changed.");
        return;
    }

    const summary = Object.fromEntries(
        Object.entries(collections).map(([name, items]) => [name, items.length]),
    );
    console.log(
        JSON.stringify(
            {
                collections: summary,
                visits: visits.length,
                uploads: uploads.map(({ filename }) => filename),
            },
            null,
            2,
        ),
    );
}

try {
    await migrate();
} catch (error) {
    console.error("Supabase to SQLite migration failed:", error.message);
    process.exitCode = 1;
} finally {
    db.close();
}
