// Session ID basina son aktiflik zamani tutar.
// Belirli pencerede aktif olanlar "online" sayilir. In-memory'dir; sunucu yeniden baslayinca sifirlanir.
// CLAUDE.md: "Online user count must use server-side session tracking, not client estimates"

const ACTIVE_WINDOW_MS = 2 * 60 * 1000; // 2 dakika

const active = new Map(); // sessionId -> lastSeen ms

function middleware(req, res, next) {
    if (req.sessionID) {
        active.set(req.sessionID, Date.now());
    }
    next();
}

middleware.count = function count() {
    const cutoff = Date.now() - ACTIVE_WINDOW_MS;
    for (const [id, ts] of active) {
        if (ts < cutoff) active.delete(id);
    }
    return active.size;
};

module.exports = middleware;
