import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createRequire } from "node:module";
import { resetTables } from "./helpers.js";

const require = createRequire(import.meta.url);
const app = require("../app.js");

describe("Stats", () => {
    beforeEach(async () => { await resetTables(); });

    it("GET /api/stats ozet doner", async () => {
        const res = await request(app).get("/api/stats");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("total_visits");
        expect(res.body).toHaveProperty("today_visits");
        expect(res.body).toHaveProperty("online");
        expect(typeof res.body.online).toBe("number");
    });

    it("Public GET'ten sonra today_visits >= 1 olur", async () => {
        await request(app).get("/api/vulnerabilities").set("X-Forwarded-For", "10.0.0.1");
        // visitorCounter middleware'i async kayit yapar; kucuk bekleme
        await new Promise((r) => setTimeout(r, 80));
        const res = await request(app).get("/api/stats");
        expect(res.body.today_visits).toBeGreaterThanOrEqual(1);
        expect(res.body.total_visits).toBeGreaterThanOrEqual(1);
    });

    it("Online sayisi negatif degil", async () => {
        await request(app).get("/api/csrf-token");
        const res = await request(app).get("/api/stats");
        expect(res.body.online).toBeGreaterThanOrEqual(0);
    });
});
