import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createRequire } from "node:module";
import { resetTables, createAgent, withCsrf } from "./helpers.js";

const require = createRequire(import.meta.url);
const app = require("../app.js");

describe("Sistem ve CSRF", () => {
    beforeEach(async () => { await resetTables(); });

    it("GET /api/health ok dondurur", async () => {
        const res = await request(app).get("/api/health");
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
    });

    it("GET /api/csrf-token string token dondurur", async () => {
        const res = await request(app).get("/api/csrf-token");
        expect(res.status).toBe(200);
        expect(typeof res.body.csrfToken).toBe("string");
        expect(res.body.csrfToken.length).toBeGreaterThan(10);
    });

    it("CSRF token'siz POST reddedilir (403)", async () => {
        const res = await request(app).post("/api/auth/register").send({
            email: "x@y.com", password: "secret123", name: "X"
        });
        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/CSRF/i);
    });

    it("Bilinmeyen /api endpoint 404 doner", async () => {
        const res = await request(app).get("/api/yok");
        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
    });
});

describe("Auth - Register / Login / Me / Signout", () => {
    beforeEach(async () => { await resetTables(); });

    it("Register -> Login -> Me -> Signout akisi", async () => {
        const agent = await createAgent(app);

        const reg = await withCsrf(agent.post("/api/auth/register"), agent).send({
            email: "alice@example.com", password: "secret123", name: "Alice", surname: "W"
        });
        expect(reg.status).toBe(201);
        expect(reg.body.user.fullname).toBe("Alice W");
        expect(reg.body.user.role).toBe("user");

        const login = await withCsrf(agent.post("/api/auth/login"), agent).send({
            email: "alice@example.com", password: "secret123"
        });
        expect(login.status).toBe(200);

        const me = await agent.get("/api/auth/me");
        expect(me.status).toBe(200);
        expect(me.body.user.fullname).toBe("Alice W");

        const out = await withCsrf(agent.post("/api/auth/signout"), agent);
        expect(out.status).toBe(200);

        const me2 = await agent.get("/api/auth/me");
        expect(me2.status).toBe(401);
    });

    it("Yanlis sifre 401 doner", async () => {
        const agent = await createAgent(app);
        await withCsrf(agent.post("/api/auth/register"), agent).send({
            email: "bob@example.com", password: "secret123", name: "Bob"
        });
        const res = await withCsrf(agent.post("/api/auth/login"), agent).send({
            email: "bob@example.com", password: "yanlis"
        });
        expect(res.status).toBe(401);
    });

    it("Ayni email ile ikinci kayit 409 verir", async () => {
        const agent = await createAgent(app);
        await withCsrf(agent.post("/api/auth/register"), agent).send({
            email: "dup@x.com", password: "secret123", name: "A"
        });
        const res = await withCsrf(agent.post("/api/auth/register"), agent).send({
            email: "dup@x.com", password: "secret123", name: "B"
        });
        expect(res.status).toBe(409);
    });

    it("Eksik alanlar 400 verir", async () => {
        const agent = await createAgent(app);
        const r1 = await withCsrf(agent.post("/api/auth/register"), agent).send({
            email: "", password: "123456", name: "X"
        });
        expect(r1.status).toBe(400);

        const r2 = await withCsrf(agent.post("/api/auth/register"), agent).send({
            email: "a@b.com", password: "123", name: "X"
        });
        expect(r2.status).toBe(400);
    });
});
