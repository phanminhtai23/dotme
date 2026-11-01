import assert from "node:assert/strict";
import {
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { after, test } from "node:test";

const testDir = mkdtempSync(join(tmpdir(), "dotme-sqlite-"));
const databasePath = join(testDir, "test.sqlite");
process.env.SQLITE_PATH = databasePath;

const storage = await import("../database.js");
const legacyCollection = join(testDir, "links.json");
const legacyAnalytics = join(testDir, "analytics.json");

after(() => {
    if (storage.db.open) storage.db.close();
    rmSync(testDir, { recursive: true, force: true });
});

test("migrates legacy JSON once and persists collection and analytics writes", () => {
    const oldLinks = [{ id: "legacy-link" }, { id: "second-link" }];
    writeFileSync(legacyCollection, JSON.stringify(oldLinks));

    assert.equal(storage.initializeCollection("links", legacyCollection), true);
    assert.deepEqual(storage.readCollection("links"), oldLinks);

    storage.writeCollection("links", []);
    assert.equal(storage.initializeCollection("links", legacyCollection), false);
    assert.deepEqual(storage.readCollection("links"), []);

    const oldVisit = {
        createdAt: "2026-10-31T12:00:00.000Z",
        page: "/",
        ip: "127.0.0.1",
        userAgent: "legacy-browser",
        visitorId: "legacy-visitor",
        referrer: "",
    };
    writeFileSync(legacyAnalytics, JSON.stringify({ history: [oldVisit] }));
    assert.equal(storage.initializeAnalytics(legacyAnalytics), true);
    assert.equal(storage.readVisits().length, 1);

    const newVisit = {
        createdAt: "2026-11-01T12:00:00.000Z",
        page: "/projects",
        ip: "127.0.0.1",
        userAgent: "test-browser",
        visitorId: "test-visitor",
        referrer: "",
    };
    storage.saveVisit(newVisit);
    assert.equal(storage.readVisits().length, 2);

    const Database = storage.db.constructor;
    const reopened = new Database(databasePath);
    assert.deepEqual(
        reopened
            .prepare("SELECT payload FROM collection_items WHERE collection = 'links' ORDER BY position")
            .all(),
        [],
    );
    assert.equal(reopened.prepare("SELECT COUNT(*) AS count FROM visits").get().count, 2);
    reopened.close();

    assert.deepEqual(JSON.parse(readFileSync(legacyCollection, "utf8")), oldLinks);
});

test("stores uploaded image bytes in SQLite", () => {
    const imageBytes = Buffer.from([0, 1, 2, 255]);
    storage.saveUpload({
        filename: "certificate-test.png",
        mimetype: "image/png",
        originalName: "certificate.png",
        content: imageBytes,
        createdAt: "2026-11-01T12:00:00.000Z",
    });

    assert.deepEqual(storage.readUpload("certificate-test.png"), {
        mimetype: "image/png",
        content: imageBytes,
    });
    assert.equal(storage.getUploadStats().count, 1);
    assert.equal(storage.deleteUpload("certificate-test.png"), true);
    assert.equal(storage.readUpload("certificate-test.png"), undefined);
});

test("migrates existing upload files but skips the git placeholder", () => {
    const uploadsDir = join(testDir, "uploads");
    mkdirSync(uploadsDir);
    writeFileSync(join(uploadsDir, ".gitkeep"), "");
    writeFileSync(join(uploadsDir, "legacy-photo.jpg"), Buffer.from([1, 2, 3]));

    assert.equal(storage.initializeLegacyUploads(uploadsDir), true);
    assert.deepEqual(storage.readUpload("legacy-photo.jpg"), {
        mimetype: "image/jpeg",
        content: Buffer.from([1, 2, 3]),
    });
    assert.equal(storage.readUpload(".gitkeep"), undefined);
});

test("imports Supabase collections, visits, and uploads only once", () => {
    const source = {
        collections: { "content:certificates": [{ id: "supabase-certificate" }] },
        visits: [{
            created_at: "2026-11-01T11:00:00.000Z",
            page: "/",
            ip: "127.0.0.1",
            user_agent: "supabase-browser",
            visitor_id: "supabase-visitor",
            referrer: "",
        }],
        uploads: [{
            filename: "supabase-certificate.jpg",
            mimetype: "image/jpeg",
            originalName: "certificate.jpg",
            content: Buffer.from("image"),
            createdAt: "2026-11-01T11:00:00.000Z",
        }],
    };

    assert.equal(storage.migrateSupabaseData(source), true);
    assert.equal(storage.migrateSupabaseData(source), false);
    assert.deepEqual(storage.readCollection("content:certificates"), source.collections["content:certificates"]);
    assert.equal(storage.readVisits().length, 1);
    assert.deepEqual(storage.readUpload("supabase-certificate.jpg").content, Buffer.from("image"));
});
