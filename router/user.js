const express = require("express");
const router = express.Router();
const userController = require("../controller/user.js");
const isAuth = require("../middleware/isAuth.js");
const isAdmin = require("../middleware/isAdmin.js");

router.get("/", isAuth, isAdmin, userController.list);
router.put("/:id/role", isAuth, isAdmin, userController.updateRole);
router.delete("/:id", isAuth, isAdmin, userController.remove);

module.exports = router;
