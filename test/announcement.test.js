import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createRequire } from "node:module";
import { resetTables, registerAndLogin, withCsrf } from "./helpers.js";

const require = createRequire(import.meta.url);
const app = require("../app.js");

describe("Announcements", () => {
    beforeEach(async () => { await resetTables(); });

    it("Public liste yalnizca is_active=1 doner", async () => {
        const agent = await registerAndLogin(app, { role: "admin" });
        await withCsrf(agent.post("/api/announcements"), agent).send({
            title: "Aktif duyuru", is_active: 1
        });
        await withCsrf(agent.post("/api/announcements"), agent).send({
            title: "Pasif duyuru", is_active: 0
        });

        const pub = await request(app).get("/api/announcements");
        expect(pub.body.data.length).toBe(1);
        expect(pub.body.data[0].title).toBe("Aktif duyuru");

        const all = await request(app).get("/api/announcements?all=1");
        expect(all.body.data.length).toBe(2);
    });

    it("User role create yapamaz (403)", async () => {
        const agent = await registerAndLogin(app, { role: "user" });
        const res = await withCsrf(agent.post("/api/announcements"), agent).send({
            title: "deneme"
        });
        expect(res.status).toBe(403);
    });

    it("Pasif duyuru public detayda 404, admin'de 200", async () => {
        const agentA = await registerAndLogin(app, { role: "admin", email: "a1@x.com" });
        const cr = await withCsrf(agentA.post("/api/announcements"), agentA).send({
            title: "Gizli", is_active: 0
        });
        const slug = cr.body.data.slug;

        const pub = await request(app).get(`/api/announcements/${slug}`);
        expect(pub.status).toBe(404);

        const adm = await agentA.get(`/api/announcements/${slug}`);
        expect(adm.status).toBe(200);
        expect(adm.body.data.title).toBe("Gizli");
    });

    it("Admin guncelleme ve silme", async () => {
        const agent = await registerAndLogin(app, { role: "admin" });
        const cr = await withCsrf(agent.post("/api/announcements"), agent).send({
            title: "Eski", body: "icerik"
        });
        const slug = cr.body.data.slug;

        const up = await withCsrf(agent.put(`/api/announcements/${slug}`), agent).send({
            title: "Yeni", body: "yeni icerik", is_active: 1
        });
        expect(up.status).toBe(200);

        const get = await request(app).get(`/api/announcements/${up.body.data.slug}`);
        expect(get.body.data.title).toBe("Yeni");

        const del = await withCsrf(agent.delete(`/api/announcements/${up.body.data.slug}`), agent);
        expect(del.status).toBe(200);
    });
});
