import request from "supertest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const db = require("../model/db.js");

export async function resetTables() {
    await db.execute("SET FOREIGN_KEY_CHECKS = 0");
    await db.execute("TRUNCATE TABLE gallery");
    await db.execute("TRUNCATE TABLE announcements");
    await db.execute("TRUNCATE TABLE vulnerabilities");
    await db.execute("TRUNCATE TABLE ip_visits");
    await db.execute("TRUNCATE TABLE users");
    await db.execute("SET FOREIGN_KEY_CHECKS = 1");
}

export async function createAgent(app) {
    const agent = request.agent(app);
    const res = await agent.get("/api/csrf-token");
    if (res.status !== 200) throw new Error("CSRF token alinamadi: " + res.status);
    agent.csrfToken = res.body.csrfToken;
    return agent;
}

export function withCsrf(req, agent) {
    return req.set("X-CSRF-Token", agent.csrfToken);
}

export async function registerAndLogin(app, opts = {}) {
    const user = {
        email: opts.email || `u${Date.now()}-${Math.random().toString(36).slice(2,6)}@test.com`,
        password: opts.password || "secret123",
        name: opts.name || "Test",
        surname: opts.surname || "User"
    };
    const role = opts.role || "user";

    const agent = await createAgent(app);

    const reg = await withCsrf(agent.post("/api/auth/register"), agent).send(user);
    if (reg.status !== 201) {
        throw new Error("Register basarisiz: " + reg.status + " " + JSON.stringify(reg.body));
    }

    if (role === "admin") {
        await db.execute("UPDATE users SET role = 'admin' WHERE email = ?", [user.email]);
    }

    const login = await withCsrf(agent.post("/api/auth/login"), agent).send({
        email: user.email, password: user.password
    });
    if (login.status !== 200) {
        throw new Error("Login basarisiz: " + login.status + " " + JSON.stringify(login.body));
    }
    agent.user = login.body.user;

    return agent;
}
