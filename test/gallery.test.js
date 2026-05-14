import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { createRequire } from "node:module";
import { resetTables, registerAndLogin, withCsrf } from "./helpers.js";

const require = createRequire(import.meta.url);
const app = require("../app.js");
const db = require("../model/db.js");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");

// 1x1 transparan PNG
const PNG_1x1 = Buffer.from([
    0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,
    0x00,0x00,0x00,0x0d,0x49,0x48,0x44,0x52,
    0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,
    0x08,0x06,0x00,0x00,0x00,0x1f,0x15,0xc4,
    0x89,0x00,0x00,0x00,0x0d,0x49,0x44,0x41,
    0x54,0x78,0x9c,0x62,0x00,0x01,0x00,0x00,
    0x05,0x00,0x01,0x0d,0x0a,0x2d,0xb4,0x00,
    0x00,0x00,0x00,0x49,0x45,0x4e,0x44,0xae,
    0x42,0x60,0x82
]);

async function purgeUploads() {
    const rows = (await db.execute("SELECT filename FROM gallery"))[0];
    for (const r of rows) {
        const p = path.join(UPLOAD_DIR, r.filename);
        try { fs.unlinkSync(p); } catch {}
    }
}

describe("Gallery", () => {
    beforeEach(async () => {
        await purgeUploads();
        await resetTables();
    });

    afterAll(async () => {
        await purgeUploads();
    });

    it("User role upload yapamaz (403)", async () => {
        const agent = await registerAndLogin(app, { role: "user" });
        const res = await withCsrf(agent.post("/api/gallery"), agent)
            .attach("image", PNG_1x1, "test.png");
        expect(res.status).toBe(403);
    });

    it("Admin PNG upload + listele + image stream", async () => {
        const agent = await registerAndLogin(app, { role: "admin" });
        const up = await withCsrf(agent.post("/api/gallery"), agent)
            .field("caption", "Test caption")
            .attach("image", PNG_1x1, "ornek.png");
        expect(up.status).toBe(201);
        expect(up.body.data.galleryid).toBeGreaterThan(0);
        expect(up.body.data.image_url).toMatch(/^\/api\/gallery\/\d+\/image$/);

        const list = await request(app).get("/api/gallery");
        expect(list.status).toBe(200);
        expect(list.body.data.length).toBe(1);
        expect(list.body.data[0].caption).toBe("Test caption");

        const id = up.body.data.galleryid;
        const img = await request(app).get(`/api/gallery/${id}/image`);
        expect(img.status).toBe(200);
        expect(img.headers["content-type"]).toBe("image/png");
        expect(img.body.length).toBe(PNG_1x1.length);
    });

    it("Yanlis mime type reddedilir (400)", async () => {
        const agent = await registerAndLogin(app, { role: "admin" });
        const res = await withCsrf(agent.post("/api/gallery"), agent)
            .attach("image", Buffer.from("not an image"), { filename: "evil.txt", contentType: "text/plain" });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/png|jpeg|webp|gif/i);
    });

    it("Silinen kayit hem DB hem dosya sistemiden gider", async () => {
        const agent = await registerAndLogin(app, { role: "admin" });
        const up = await withCsrf(agent.post("/api/gallery"), agent)
            .attach("image", PNG_1x1, "delme.png");
        const id = up.body.data.galleryid;
        const filename = up.body.data.filename;
        const filePath = path.join(UPLOAD_DIR, filename);
        expect(fs.existsSync(filePath)).toBe(true);

        const del = await withCsrf(agent.delete(`/api/gallery/${id}`), agent);
        expect(del.status).toBe(200);

        const img = await request(app).get(`/api/gallery/${id}/image`);
        expect(img.status).toBe(404);
        expect(fs.existsSync(filePath)).toBe(false);
    });

    it("Bilinmeyen id /image icin 404", async () => {
        const res = await request(app).get("/api/gallery/99999/image");
        expect(res.status).toBe(404);
    });
});
