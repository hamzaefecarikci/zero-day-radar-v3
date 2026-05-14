const db = require("../model/db");

const ROLES = ["admin", "user"];

// GET /api/users - admin liste
exports.list = async (req, res, next) => {
    try {
        const result = await db.execute(
            `SELECT userid, email, name, surname, role, created_at
             FROM users
             ORDER BY created_at DESC
             LIMIT 500`
        );
        return res.json({ data: result[0] });
    } catch (err) {
        return next(err);
    }
};

// PUT /api/users/:id/role - admin role degistir
exports.updateRole = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ error: "Gecersiz id." });

        const role = String(req.body.role || "");
        if (!ROLES.includes(role)) return res.status(400).json({ error: "Gecersiz role." });

        if (id === req.session.userid) {
            return res.status(400).json({ error: "Kendi rolunuzu degistiremezsiniz." });
        }

        const result = await db.execute(
            "UPDATE users SET role = ? WHERE userid = ?",
            [role, id]
        );
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: "Kullanici bulunamadi." });
        }
        return res.json({ ok: true });
    } catch (err) {
        return next(err);
    }
};

// DELETE /api/users/:id - admin sil
exports.remove = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ error: "Gecersiz id." });

        if (id === req.session.userid) {
            return res.status(400).json({ error: "Kendi hesabinizi silemezsiniz." });
        }

        // users uzerinde FK var (vulnerabilities.created_by, announcements.created_by,
        // gallery.uploaded_by). Iceriklere bagli kullaniciyi silmeden once iliskili kayitlar
        // varsa hata dondururuz; admin once iceriklerin sahibini degistirsin veya silsin.
        try {
            const result = await db.execute("DELETE FROM users WHERE userid = ?", [id]);
            if (result[0].affectedRows === 0) {
                return res.status(404).json({ error: "Kullanici bulunamadi." });
            }
            return res.json({ ok: true });
        } catch (dbErr) {
            if (dbErr.code === "ER_ROW_IS_REFERENCED_2" || dbErr.code === "ER_ROW_IS_REFERENCED") {
                return res.status(409).json({
                    error: "Bu kullaniciya ait icerikler var; once silinmeli."
                });
            }
            throw dbErr;
        }
    } catch (err) {
        return next(err);
    }
};
