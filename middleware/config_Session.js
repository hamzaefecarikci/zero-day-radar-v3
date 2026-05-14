const session = require("express-session");

const maxAge = Number(process.env.SESSION_MAX_AGE_MS) || 60 * 60 * 1000;

module.exports = session({
    secret: process.env.SESSION_SECRET || "lutfen-env-de-degistir",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge,
        httpOnly: true,
        sameSite: "lax"
    }
});
