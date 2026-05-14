import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globalSetup: ["./test/global-setup.js"],
        setupFiles: ["./test/setup.js"],
        env: {
            NODE_ENV: "test",
            DB_NAME: "zero_day_radar_v3_test",
            SESSION_SECRET: "test-secret-do-not-use-in-prod",
            SESSION_MAX_AGE_MS: "3600000"
        },
        // Tum testler ayni MySQL'i kullaniyor; paralelligi kapat
        fileParallelism: false,
        pool: "forks",
        hookTimeout: 30000,
        testTimeout: 15000
    }
});
