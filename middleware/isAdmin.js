// isAuth'tan sonra zincire eklenir. Sadece role='admin' olan kullanicilarin gecmesine izin verir.
module.exports = (req, res, next) => {
    if (req.session && req.session.role === "admin") {
        return next();
    }
    return res.status(403).json({ error: "Bu islem icin admin yetkisi gerekli." });
};
