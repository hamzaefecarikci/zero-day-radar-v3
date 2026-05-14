const bcrypt = require("bcrypt");
const db = require("../model/db");

const BCRYPT_ROUNDS = 10;

// GET /api/auth/me - mevcut oturum kullanicisini doner
exports.me = (req, res) => {
    if (!req.session || !req.session.isAuth) {
        return res.status(401).json({ user: null });
    }
    return res.json({
        user: {
            userid: req.session.userid,
            fullname: req.session.fullname,
            role: req.session.role
        }
    });
};

// POST /api/auth/login - email + password ile giris
exports.postLogin = async (req, res, next) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        if (!email || !password) {
            return res.status(400).json({ error: "Email ve sifre zorunludur." });
        }

        const result = await db.execute(
            "SELECT userid, email, password, name, surname, role FROM users WHERE email = ? LIMIT 1",
            [email]
        );
        const row = result[0][0];

        if (!row) {
            return res.status(401).json({ error: "Email veya sifre hatali." });
        }

        const ok = await bcrypt.compare(password, row.password);
        if (!ok) {
            return res.status(401).json({ error: "Email veya sifre hatali." });
        }

        req.session.isAuth = true;
        req.session.userid = row.userid;
        req.session.fullname = `${row.name} ${row.surname}`.trim();
        req.session.role = row.role;

        return res.json({
            user: {
                userid: row.userid,
                fullname: req.session.fullname,
                role: row.role
            }
        });
    } catch (err) {
        return next(err);
    }
};

// POST /api/auth/register - hesap olustur. Iskelet asamasinda admin tohumlamak icin de kullanilir.
exports.postRegister = async (req, res, next) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");
        const name = String(req.body.name || "").trim();
        const surname = String(req.body.surname || "").trim();

        if (!email || !password || !name) {
            return res.status(400).json({ error: "Email, sifre ve ad zorunludur." });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Sifre en az 6 karakter olmali." });
        }

        const exists = await db.execute(
            "SELECT userid FROM users WHERE email = ? LIMIT 1",
            [email]
        );
        if (exists[0][0]) {
            return res.status(409).json({ error: "Bu email zaten kayitli." });
        }

        const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const insert = await db.execute(
            "INSERT INTO users (email, password, name, surname, role) VALUES (?, ?, ?, ?, 'user')",
            [email, hash, name, surname]
        );

        return res.status(201).json({
            user: {
                userid: insert[0].insertId,
                fullname: `${name} ${surname}`.trim(),
                role: "user"
            }
        });
    } catch (err) {
        return next(err);
    }
};

// POST /api/auth/signout - oturumu sonlandir
exports.postSignout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid");
        return res.json({ ok: true });
    });
};
