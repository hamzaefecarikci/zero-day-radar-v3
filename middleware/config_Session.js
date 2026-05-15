const session = require("express-session");

const maxAge = Number(process.env.SESSION_MAX_AGE_MS) || 60 * 60 * 1000;

module.exports = session({
    secret: process.env.SESSION_SECRET || "lutfen-env-de-degistir",
    resave: false, //sadece session değiştiğinde güncelle. True olursa sürekli session bilgisini sunucuda günclller.
    saveUninitialized: false, //her kullanıcı için session oluştur ya da oluşturma.True yapılırsa kullanıcı giriş yapmasada session tanımlanır.
    cookie: {
        maxAge,
        httpOnly: true,
        sameSite: "lax"
    }
});
