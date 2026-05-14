// Vitest globalSetup: test DB'yi sifirla ve init.sql semasini yukle.
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB = "zero_day_radar_v3_test";

export default async function setup() {
    const root = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        multipleStatements: true
    });

    try {
        await root.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
        await root.query(
            `CREATE DATABASE \`${TEST_DB}\` DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci`
        );
        await root.query(`USE \`${TEST_DB}\``);

        const sqlPath = path.join(__dirname, "..", "db", "init.sql");
        const raw = fs.readFileSync(sqlPath, "utf8");
        const ddl = raw
            .replace(/CREATE\s+DATABASE[\s\S]*?;/gi, "")
            .replace(/USE\s+\w+\s*;/gi, "");
        await root.query(ddl);

        console.log(`[test setup] ${TEST_DB} hazirlandi`);
    } finally {
        await root.end();
    }

    return async () => {
        const r = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || ""
        });
        await r.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
        await r.end();
    };
}
