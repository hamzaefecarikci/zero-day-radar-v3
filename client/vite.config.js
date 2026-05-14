import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api ve /static isteklerini Express'e (3000) yonlendirir.
// Boylece tarayicidan tek origin gibi gozukur, CSRF/cookie sorunlari cikmaz.
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true
            },
            "/static": {
                target: "http://localhost:3000",
                changeOrigin: true
            }
        }
    }
});
