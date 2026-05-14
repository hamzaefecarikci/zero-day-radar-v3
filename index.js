// Zero-Day Radar - Express giris noktasi
// Middleware sirasi PROJE-YAPISI.md'ye uyar:
// bodyParser -> session -> cookieParser -> locals -> csurf -> router'lar

require("dotenv").config();

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");

const configSession = require("./middleware/config_Session.js");
const csrfLocals = require("./middleware/csrf.js");

const authRouter = require("./router/auth.js");

const app = express();

// 1) Statik dosyalar (galeri gorselleri vb.)
app.use("/static", express.static(path.join(__dirname, "public")));

// 2) Body parser - hem form hem JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// 3) Vite dev sunucusundan gelen istekler icin CORS (sadece dev)
if (process.env.NODE_ENV !== "production") {
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

// 4) Session
app.use(configSession);

// 5) Cookie parser (csurf'tan once gelmeli)
app.use(cookieParser());

// 6) CSRF - tum POST/PUT/DELETE isteklerinde dogrulanir.
//    React frontend X-CSRF-Token header'i ile gonderir.
app.use(csurf());

// 7) Token'i res.locals'a koy (EJS kullanan ileride eklenecek sayfalar icin)
app.use(csrfLocals);

// 8) React frontend icin token endpoint'i
app.get("/api/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// 9) API router'lari
app.use("/api/auth", authRouter);

// 10) Saglik kontrolu
app.get("/api/health", (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});

// 11) 404 yakalayicisi
app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "Kaynak bulunamadi." });
    }
    next();
});

// 12) Global hata yakalayicisi
app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).json({ error: "Gecersiz CSRF token." });
    }
    console.error("[error]", err);
    if (req.path.startsWith("/api/")) {
        return res.status(500).json({ error: "Sunucu hatasi." });
    }
    return res.status(500).send("Sunucu hatasi.");
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`[server] http://localhost:${PORT}`);
});
