import Database from "better-sqlite3";
import {
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    statSync,
} from "fs";
import { dirname, extname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
export const DATABASE_PATH = process.env.SQLITE_PATH || join(DATA_DIR, "dotme.sqlite");

mkdirSync(dirname(DATABASE_PATH), { recursive: true });

export const db = new Database(DATABASE_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
        name TEXT PRIMARY KEY,
        initialized_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS collection_items (
        collection TEXT NOT NULL REFERENCES collections(name) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        payload TEXT NOT NULL,
        PRIMARY KEY (collection, position)
    );
    CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        page TEXT NOT NULL,
        ip TEXT NOT NULL,
        user_agent TEXT NOT NULL,
        visitor_id TEXT NOT NULL,
        referrer TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS visits_created_at_idx ON visits(created_at);
    CREATE TABLE IF NOT EXISTS migration_state (
        name TEXT PRIMARY KEY,
        completed_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS uploads (
        filename TEXT PRIMARY KEY,
        mimetype TEXT NOT NULL,
        original_name TEXT NOT NULL,
        content BLOB NOT NULL,
        created_at TEXT NOT NULL
    );
`);

const hasCollection = db.prepare("SELECT 1 FROM collections WHERE name = ?");
const selectCollection = db.prepare(
    "SELECT payload FROM collection_items WHERE collection = ? ORDER BY position",
);
const insertCollection = db.prepare(
    "INSERT INTO collection_items (collection, position, payload) VALUES (?, ?, ?)",
);
const deleteCollectionItems = db.prepare(
    "DELETE FROM collection_items WHERE collection = ?",
);
const insertUpload = db.prepare(`
    INSERT INTO uploads (filename, mimetype, original_name, content, created_at)
    VALUES (@filename, @mimetype, @originalName, @content, @createdAt)
    ON CONFLICT(filename) DO UPDATE SET
        mimetype = excluded.mimetype,
        original_name = excluded.original_name,
        content = excluded.content,
        created_at = excluded.created_at
`);

function readLegacyJson(file, fallback) {
    if (!existsSync(file)) return fallback;
    try {
        return JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
        throw new Error(`Could not migrate ${file}: ${error.message}`, { cause: error });
    }
}

function replaceCollection(collection, items) {
    const transaction = db.transaction(() => replaceCollectionContents(collection, items));
    transaction();
}

function replaceCollectionContents(collection, items) {
    db.prepare(
        "INSERT INTO collections (name, initialized_at) VALUES (?, ?) ON CONFLICT(name) DO NOTHING",
    ).run(collection, new Date().toISOString());
    deleteCollectionItems.run(collection);
    items.forEach((item, position) => {
        insertCollection.run(collection, position, JSON.stringify(item));
    });
}

export function isCollectionInitialized(collection) {
    return Boolean(hasCollection.get(collection));
}

export function initializeCollection(collection, legacyFile, fallback = []) {
    if (isCollectionInitialized(collection)) return false;
    const items = readLegacyJson(legacyFile, fallback);
    if (!Array.isArray(items)) {
        throw new Error(`Expected an array while migrating ${legacyFile}`);
    }
    replaceCollection(collection, items);
    return true;
}

export function readCollection(collection) {
    return selectCollection.all(collection).map(({ payload }) => JSON.parse(payload));
}

export function writeCollection(collection, items) {
    if (!Array.isArray(items)) {
        throw new TypeError(`Collection "${collection}" must be an array`);
    }
    replaceCollection(collection, items);
}

export function mutateCollection(collection, mutate) {
    if (typeof mutate !== "function") {
        throw new TypeError("Collection mutation must be a function");
    }

    const transaction = db.transaction(() => {
        const items = selectCollection.all(collection).map(({ payload }) => JSON.parse(payload));
        const { items: nextItems, result } = mutate(items);
        if (!Array.isArray(nextItems)) {
            throw new TypeError(`Collection "${collection}" mutation must return an array`);
        }
        replaceCollectionContents(collection, nextItems);
        return result;
    });
    return transaction.immediate();
}

export function initializeAnalytics(legacyFile) {
    const state = db.prepare("SELECT 1 FROM migration_state WHERE name = 'analytics'").get();
    if (state) return false;

    const legacy = readLegacyJson(legacyFile, { history: [] });
    const history = Array.isArray(legacy.history) ? legacy.history : [];
    const transaction = db.transaction(() => {
        const insertVisit = db.prepare(`
            INSERT INTO visits (created_at, page, ip, user_agent, visitor_id, referrer)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const visit of history) {
            insertVisit.run(
                visit.created_at || visit.createdAt || new Date().toISOString(),
                visit.page || "/",
                visit.ip || "unknown",
                visit.user_agent || visit.userAgent || "",
                visit.visitor_id || visit.visitorId || "",
                visit.referrer || "",
            );
        }
        db.prepare(
            "INSERT INTO migration_state (name, completed_at) VALUES ('analytics', ?)",
        ).run(new Date().toISOString());
    });
    transaction();
    return true;
}

export function initializeLegacyUploads(uploadsDir) {
    const state = db.prepare("SELECT 1 FROM migration_state WHERE name = 'uploads'").get();
    if (state) return false;

    const files = existsSync(uploadsDir)
        ? readdirSync(uploadsDir, { withFileTypes: true }).filter(
              (entry) => entry.isFile() && entry.name !== ".gitkeep",
          )
        : [];
    const mimeTypes = {
        ".gif": "image/gif",
        ".jpeg": "image/jpeg",
        ".jpg": "image/jpeg",
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".webp": "image/webp",
    };
    const transaction = db.transaction(() => {
        for (const file of files) {
            const filePath = join(uploadsDir, file.name);
            insertUpload.run({
                filename: file.name,
                mimetype: mimeTypes[extname(file.name).toLowerCase()] || "application/octet-stream",
                originalName: file.name,
                content: readFileSync(filePath),
                createdAt: new Date(statSync(filePath).mtimeMs).toISOString(),
            });
        }
        db.prepare(
            "INSERT INTO migration_state (name, completed_at) VALUES ('uploads', ?)",
        ).run(new Date().toISOString());
    });
    transaction();
    return true;
}

export function saveUpload(upload) {
    insertUpload.run(upload);
}

export function readUpload(filename) {
    return db
        .prepare("SELECT mimetype, content FROM uploads WHERE filename = ?")
        .get(filename);
}

export function deleteUpload(filename) {
    return db.prepare("DELETE FROM uploads WHERE filename = ?").run(filename).changes > 0;
}

export function getUploadStats() {
    return db.prepare("SELECT COUNT(*) AS count, COALESCE(SUM(length(content)), 0) AS bytes FROM uploads").get();
}

export function migrateSupabaseData({ collections, visits, uploads }) {
    if (isSupabaseMigrationComplete()) {
        return false;
    }

    const transaction = db.transaction(() => {
        for (const [collection, items] of Object.entries(collections)) {
            db.prepare(
                "INSERT INTO collections (name, initialized_at) VALUES (?, ?) ON CONFLICT(name) DO NOTHING",
            ).run(collection, new Date().toISOString());
            deleteCollectionItems.run(collection);
            items.forEach((item, position) => {
                insertCollection.run(collection, position, JSON.stringify(item));
            });
        }

        db.exec("DELETE FROM visits");
        const insertVisit = db.prepare(`
            INSERT INTO visits (created_at, page, ip, user_agent, visitor_id, referrer)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const visit of visits) {
            insertVisit.run(
                visit.created_at || visit.createdAt || new Date().toISOString(),
                visit.page || "/",
                visit.ip || "unknown",
                visit.user_agent || visit.userAgent || "",
                visit.visitor_id || visit.visitorId || "",
                visit.referrer || "",
            );
        }

        for (const upload of uploads) insertUpload.run(upload);
        db.prepare(
            "INSERT INTO migration_state (name, completed_at) VALUES ('supabase-import-v1', ?)",
        ).run(new Date().toISOString());
    });
    transaction();
    return true;
}

export function isSupabaseMigrationComplete() {
    return Boolean(
        db.prepare("SELECT 1 FROM migration_state WHERE name = 'supabase-import-v1'").get(),
    );
}

export function readVisits() {
    return db
        .prepare(
            `SELECT id, created_at AS createdAt, page, ip,
                    user_agent AS userAgent, visitor_id AS visitorId, referrer
             FROM visits ORDER BY created_at, id`,
        )
        .all();
}

export function saveVisit(visit) {
    db.prepare(`
        INSERT INTO visits (created_at, page, ip, user_agent, visitor_id, referrer)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        visit.createdAt,
        visit.page,
        visit.ip,
        visit.userAgent,
        visit.visitorId,
        visit.referrer,
    );
}

export function getCollectionCounts() {
    const rows = db
        .prepare(
            "SELECT name, COUNT(items.position) AS count FROM collections c LEFT JOIN collection_items items ON items.collection = c.name GROUP BY name",
        )
        .all();
    return Object.fromEntries(rows.map(({ name, count }) => [name, count]));
}

export function getDatabaseBytes() {
    return [DATABASE_PATH, `${DATABASE_PATH}-wal`, `${DATABASE_PATH}-shm`].reduce((total, file) => {
        try {
            return total + statSync(file).size;
        } catch (error) {
            if (error.code === "ENOENT") return total;
            throw error;
        }
    }, 0);
}
