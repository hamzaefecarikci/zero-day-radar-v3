const express = require("express");
const router = express.Router();
const ancController = require("../controller/announcement.js");
const isAuth = require("../middleware/isAuth.js");
const isAdmin = require("../middleware/isAdmin.js");

router.get("/", ancController.list);
router.get("/:slug", ancController.getBySlug);

router.post("/", isAuth, isAdmin, ancController.create);
router.put("/:slug", isAuth, isAdmin, ancController.update);
router.delete("/:slug", isAuth, isAdmin, ancController.remove);

module.exports = router;
