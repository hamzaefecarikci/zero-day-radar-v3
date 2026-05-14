const db = require("../model/db");

// Ayni slugify kuralini kullanmak icin vulnerability controller'dan al
function slugify(input) {
    const map = { "ç": "c", "Ç": "c", "ğ": "g", "Ğ": "g", "ı": "i", "İ": "i", "ö": "o", "Ö": "o", "ş": "s", "Ş": "s", "ü": "u", "Ü": "u" };
    return String(input || "")
        .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => map[ch] || ch)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 180);
}

async function ensureUniqueSlug(base, excludeId) {
    let slug = base || "announcement";
    let suffix = 1;
    while (true) {
        const sql = excludeId
            ? "SELECT announcementid FROM announcements WHERE slug = ? AND announcementid <> ? LIMIT 1"
            : "SELECT announcementid FROM announcements WHERE slug = ? LIMIT 1";
        const params = excludeId ? [slug, excludeId] : [slug];
        const rows = await db.execute(sql, params);
        if (!rows[0][0]) return slug;
        suffix += 1;
        slug = `${base}-${suffix}`;
    }
}

function validate(body) {
    const title = String(body.title || "").trim();
    if (!title) return { error: "Baslik zorunludur." };
    return {
        data: {
            title,
            body: body.body ? String(body.body) : null,
            is_active: body.is_active === false || body.is_active === 0 ? 0 : 1
        }
    };
}

// GET /api/announcements - public liste (sadece is_active=1)
exports.list = async (req, res, next) => {
    try {
        const all = req.query.all === "1";
        const sql = all
            ? "SELECT announcementid, slug, title, body, is_active, created_at FROM announcements ORDER BY created_at DESC LIMIT 200"
            : "SELECT announcementid, slug, title, body, created_at FROM announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 200";
        const result = await db.execute(sql);
        return res.json({ data: result[0] });
    } catch (err) {
        return next(err);
    }
};

// GET /api/announcements/:slug
exports.getBySlug = async (req, res, next) => {
    try {
        const result = await db.execute(
            `SELECT a.*, u.name AS author_name, u.surname AS author_surname
             FROM announcements a
             LEFT JOIN users u ON u.userid = a.created_by
             WHERE a.slug = ? LIMIT 1`,
            [req.params.slug]
        );
        const row = result[0][0];
        if (!row) return res.status(404).json({ error: "Duyuru bulunamadi." });
        if (!row.is_active && !(req.session && req.session.role === "admin")) {
            return res.status(404).json({ error: "Duyuru bulunamadi." });
        }
        return res.json({ data: row });
    } catch (err) {
        return next(err);
    }
};

// POST /api/announcements - admin
exports.create = async (req, res, next) => {
    try {
        const v = validate(req.body);
        if (v.error) return res.status(400).json({ error: v.error });

        const baseSlug = slugify(req.body.slug || v.data.title);
        const slug = await ensureUniqueSlug(baseSlug);

        const insert = await db.execute(
            `INSERT INTO announcements (slug, title, body, is_active, created_by) VALUES (?, ?, ?, ?, ?)`,
            [slug, v.data.title, v.data.body, v.data.is_active, req.session.userid]
        );

        return res.status(201).json({
            data: { announcementid: insert[0].insertId, slug }
        });
    } catch (err) {
        return next(err);
    }
};

// PUT /api/announcements/:slug - admin
exports.update = async (req, res, next) => {
    try {
        const existing = await db.execute(
            "SELECT announcementid FROM announcements WHERE slug = ? LIMIT 1",
            [req.params.slug]
        );
        const row = existing[0][0];
        if (!row) return res.status(404).json({ error: "Duyuru bulunamadi." });

        const v = validate(req.body);
        if (v.error) return res.status(400).json({ error: v.error });

        const baseSlug = slugify(req.body.slug || v.data.title);
        const slug = await ensureUniqueSlug(baseSlug, row.announcementid);

        await db.execute(
            "UPDATE announcements SET slug = ?, title = ?, body = ?, is_active = ? WHERE announcementid = ?",
            [slug, v.data.title, v.data.body, v.data.is_active, row.announcementid]
        );

        return res.json({ data: { announcementid: row.announcementid, slug } });
    } catch (err) {
        return next(err);
    }
};

// DELETE /api/announcements/:slug - admin
exports.remove = async (req, res, next) => {
    try {
        const result = await db.execute("DELETE FROM announcements WHERE slug = ?", [req.params.slug]);
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: "Duyuru bulunamadi." });
        }
        return res.json({ ok: true });
    } catch (err) {
        return next(err);
    }
};
