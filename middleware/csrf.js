// PROJE-YAPISI.md: bu middleware sadece token'i locale yazar.
// csurf() dogrulamasi index.js'de global olarak yapilir.
// React frontend kullandigimiz icin token'i ayrica /api/csrf-token endpoint'i ile de sunariz.
module.exports = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
};
