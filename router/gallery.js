const express = require("express");
const router = express.Router();
const galleryController = require("../controller/gallery.js");
const isAuth = require("../middleware/isAuth.js");
const isAdmin = require("../middleware/isAdmin.js");
const upload = require("../middleware/upload.js");

// Public
router.get("/", galleryController.list);
router.get("/:id/image", galleryController.serveImage);

// Admin
// NOT: multipart/form-data ile gelir. csurf body-parser sonrasi calistigi icin
// CSRF token'i form alani olarak veya X-CSRF-Token header'i olarak gondermek gerekir.
// Bizim React frontend her zaman X-CSRF-Token header'i kullaniyor.
router.post("/", isAuth, isAdmin, upload.single, galleryController.create);
router.delete("/:id", isAuth, isAdmin, galleryController.remove);

module.exports = router;
