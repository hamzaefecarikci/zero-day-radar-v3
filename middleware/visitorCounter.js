// IP basina gunde 1 kez ip_visits tablosuna kayit dusurur.
// In-memory cache ile ayni IP'nin ayni gunki sonraki istekleri DB'ye gitmez.
// CLAUDE.md: "IP-based visitor counter must increment once per unique IP per day, tracked server-side"

const db = require("../model/db");

const seen = new Map(); // ip -> "YYYY-MM-DD"

function today() {
    return new Date().toISOString().slice(0, 10);
}

function extractIp(req) {
    const fwd = req.headers["x-forwarded-for"];
    if (fwd) return String(fwd).split(",")[0].trim();
    return req.ip || (req.socket && req.socket.remoteAddress) || null;
}

module.exports = (req, res, next) => {
    // Sadece sayfa benzeri GET'leri sayariz; csrf-token, health, stats vb. arka plan cagrilari sayilmaz.
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api/csrf-token")) return next();
    if (req.path.startsWith("/api/health")) return next();
    if (req.path.startsWith("/api/stats")) return next();

    const ip = extractIp(req);
    if (!ip) return next();

    const day = today();
    if (seen.get(ip) === day) return next();
    seen.set(ip, day);

    db.execute(
        "INSERT IGNORE INTO ip_visits (ip, visit_date) VALUES (?, ?)",
        [ip, day]
    ).catch((err) => console.error("[visitorCounter]", err.message));

    next();
};
