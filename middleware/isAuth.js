// Korunmasi gereken her route'a takilir.
// API isteklerinde 401 doner, sayfa isteklerinde login'e yonlendirir.
module.exports = (req, res, next) => {
    if (req.session && req.session.isAuth) {
        return next();
    }

    if (req.path.startsWith("/api/") || req.xhr || req.accepts("json") === "json") {
        return res.status(401).json({ error: "Oturum acik degil." });
    }

    const returnUrl = encodeURIComponent(req.originalUrl);
    return res.redirect(`/auth/login?url=${returnUrl}`);
};
