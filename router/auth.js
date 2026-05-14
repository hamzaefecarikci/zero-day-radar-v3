const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.js");

// Tum auth route'lari /api/auth altinda calisir (index.js'de baglanir).
// CSRF dogrulamasi index.js'deki global csurf() tarafindan zaten yapilir.

router.get("/me", authController.me);
router.post("/login", authController.postLogin);
router.post("/register", authController.postRegister);
router.post("/signout", authController.postSignout);

module.exports = router;
