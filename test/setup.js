// Her test dosyasi yuklenmeden once calisir. DB connection'i surec sonunda kapat.
import { afterAll } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const db = require("../model/db.js");

afterAll(async () => {
    try { await db.end(); } catch { /* zaten kapali */ }
});
