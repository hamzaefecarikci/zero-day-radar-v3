import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createRequire } from "node:module";
import { resetTables, registerAndLogin, withCsrf } from "./helpers.js";

const require = createRequire(import.meta.url);
const app = require("../app.js");
const db = require("../model/db.js");

describe("User management (admin)", () => {
    beforeEach(async () => { await resetTables(); });

    it("Auth'suz liste alinamaz (401)", async () => {
        const res = await request(app).get("/api/users");
        expect(res.status).toBe(401);
    });

    it("User role'la liste 403", async () => {
        const agent = await registerAndLogin(app, { role: "user" });
        const res = await agent.get("/api/users");
        expect(res.status).toBe(403);
    });

    it("Admin liste alir, kayitlar gorunur", async () => {
        const admin = await registerAndLogin(app, { role: "admin", email: "admin@x.com" });
        await registerAndLogin(app, { role: "user", email: "u1@x.com" });

        const res = await admin.get("/api/users");
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);
        const emails = res.body.data.map((x) => x.email);
        expect(emails).toContain("admin@x.com");
        expect(emails).toContain("u1@x.com");
    });

    it("Admin baska kullanicinin rolunu degistirebilir", async () => {
        const admin = await registerAndLogin(app, { role: "admin", email: "admin@x.com" });
        await registerAndLogin(app, { role: "user", email: "u@x.com" });

        const targetId = (await db.execute("SELECT userid FROM users WHERE email=?", ["u@x.com"]))[0][0].userid;

        const res = await withCsrf(admin.put(`/api/users/${targetId}/role`), admin).send({ role: "admin" });
        expect(res.status).toBe(200);

        const after = (await db.execute("SELECT role FROM users WHERE userid=?", [targetId]))[0][0];
        expect(after.role).toBe("admin");
    });

    it("Admin kendi rolunu degistiremez (400)", async () => {
        const admin = await registerAndLogin(app, { role: "admin", email: "admin@x.com" });
        const selfId = admin.user.userid;

        const res = await withCsrf(admin.put(`/api/users/${selfId}/role`), admin).send({ role: "user" });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/Kendi/i);
    });

    it("Admin kendini silemez (400)", async () => {
        const admin = await registerAndLogin(app, { role: "admin", email: "admin@x.com" });
        const res = await withCsrf(admin.delete(`/api/users/${admin.user.userid}`), admin);
        expect(res.status).toBe(400);
    });

    it("Iceriksiz user silinebilir, icerikli user 409 verir", async () => {
        const admin = await registerAndLogin(app, { role: "admin", email: "admin@x.com" });

        const u1 = await registerAndLogin(app, { role: "user", email: "iceriksiz@x.com" });
        const del1 = await withCsrf(admin.delete(`/api/users/${u1.user.userid}`), admin);
        expect(del1.status).toBe(200);

        const u2 = await registerAndLogin(app, { role: "admin", email: "icerikli@x.com" });
        await withCsrf(u2.post("/api/vulnerabilities"), u2).send({ title: "Vuln", severity: "Low" });
        const del2 = await withCsrf(admin.delete(`/api/users/${u2.user.userid}`), admin);
        expect(del2.status).toBe(409);
    });
});
