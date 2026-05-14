const path = require("path");
const fs = require("fs");
const db = require("../model/db");
const { UPLOAD_DIR } = require("../middleware/upload.js");

// GET /api/gallery - public liste
exports.list = async (req, res, next) => {
    try {
        const result = await db.execute(
            `SELECT g.galleryid, g.filename, g.caption, g.mime, g.size_bytes, g.created_at,
                    u.name AS uploader_name
             FROM gallery g
             LEFT JOIN users u ON u.userid = g.uploaded_by
             ORDER BY g.created_at DESC
             LIMIT 200`
        );
        const items = result[0].map((row) => ({
            ...row,
            image_url: `/api/gallery/${row.galleryid}/image`
        }));
        return res.json({ data: items });
    } catch (err) {
        return next(err);
    }
};

// GET /api/gallery/:id/image - public dosya servisi (DB-mediated)
exports.serveImage = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(404).end();

        const result = await db.execute(
            "SELECT filename, mime FROM gallery WHERE galleryid = ? LIMIT 1",
            [id]
        );
        const row = result[0][0];
        if (!row) return res.status(404).end();

        // path traversal koruma: filename'in icinde / veya .. olmamali
        if (row.filename.includes("/") || row.filename.includes("\\") || row.filename.includes("..")) {
            return res.status(400).end();
        }

        const filePath = path.join(UPLOAD_DIR, row.filename);
        if (!fs.existsSync(filePath)) return res.status(404).end();

        res.setHeader("Content-Type", row.mime);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.sendFile(filePath);
    } catch (err) {
        return next(err);
    }
};

// POST /api/gallery - admin upload (multipart/form-data, field=image)
exports.create = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Dosya yuklenmedi." });
        }
        const caption = String(req.body.caption || "").trim().slice(0, 255) || null;

        const insert = await db.execute(
            `INSERT INTO gallery (filename, original_name, mime, size_bytes, caption, uploaded_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                req.file.filename,
                req.file.originalname.slice(0, 255),
                req.file.mimetype,
                req.file.size,
                caption,
                req.session.userid
            ]
        );

        return res.status(201).json({
            data: {
                galleryid: insert[0].insertId,
                filename: req.file.filename,
                image_url: `/api/gallery/${insert[0].insertId}/image`
            }
        });
    } catch (err) {
        // Yukleme DB'ye yazilamadiysa fiziksel dosyayi temizle
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => {});
        }
        return next(err);
    }
};

// DELETE /api/gallery/:id - admin
exports.remove = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(404).json({ error: "Bulunamadi." });

        const result = await db.execute(
            "SELECT filename FROM gallery WHERE galleryid = ? LIMIT 1",
            [id]
        );
        const row = result[0][0];
        if (!row) return res.status(404).json({ error: "Bulunamadi." });

        await db.execute("DELETE FROM gallery WHERE galleryid = ?", [id]);

        const filePath = path.join(UPLOAD_DIR, row.filename);
        fs.unlink(filePath, () => { /* sessiz: dosya yoksa bile DB kaydi silindi */ });

        return res.json({ ok: true });
    } catch (err) {
        return next(err);
    }
};
