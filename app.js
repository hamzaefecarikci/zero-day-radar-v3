// Express app fabrikasi - test'lerde supertest tarafindan HTTP server baslatilmadan kullanilir.
// Middleware sirasi PROJE-YAPISI.md'ye uyar:
// bodyParser -> session -> cookieParser -> locals -> csurf -> router'lar

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
const multer = require("multer");

const configSession = require("./middleware/config_Session.js");
const csrfLocals = require("./middleware/csrf.js");
const visitorCounter = require("./middleware/visitorCounter.js");
const onlineTracker = require("./middleware/onlineTracker.js");

const authRouter = require("./router/auth.js");
const vulnerabilityRouter = require("./router/vulnerability.js");
const statsRouter = require("./router/stats.js");
const announcementRouter = require("./router/announcement.js");
const galleryRouter = require("./router/gallery.js");
const userRouter = require("./router/user.js");

const app = express();

// Galeri dosyalari direkt path uzerinden serve edilmez (CLAUDE.md kurali).
// Tek erisim yolu: /api/gallery/:id/image (DB-mediated).

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS (sadece dev - Vite'tan gelen istekler icin)
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
    const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", clientOrigin);
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type,X-CSRF-Token");
        if (req.method === "OPTIONS") return res.sendStatus(204);
        next();
    });
}

app.use(configSession);
app.use(onlineTracker);          // sessionID gerekir, session'dan sonra
app.use(visitorCounter);         // GET isteklerinde IP basina gunde 1 kez
app.use(cookieParser());
app.use(csurf());                // React frontend X-CSRF-Token header ile gonderir
app.use(csrfLocals);

app.get("/api/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

app.use("/api/auth", authRouter);
app.use("/api/vulnerabilities", vulnerabilityRouter);
app.use("/api/stats", statsRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/users", userRouter);

app.get("/api/health", (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});

// 404
app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "Kaynak bulunamadi." });
    }
    next();
});

// Global hata yakalayicisi
app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).json({ error: "Gecersiz CSRF token." });
    }
    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "Dosya cok buyuk (max 5 MB)."
            : `Yukleme hatasi: ${err.message}`;
        return res.status(400).json({ error: message });
    }
    if (err && err.message && err.message.startsWith("Sadece png")) {
        return res.status(400).json({ error: err.message });
    }
    if (process.env.NODE_ENV !== "test") console.error("[error]", err);
    if (req.path.startsWith("/api/")) {
        return res.status(500).json({ error: "Sunucu hatasi." });
    }
    return res.status(500).send("Sunucu hatasi.");
});

module.exports = app;
