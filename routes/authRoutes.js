const express = require("express");
const router = express.Router();
const { verifyToken } = require("../services/middlewares");
const auth = require("../controller/authController");

router.post("/register", auth.register);
router.post("/verifyotp", auth.verifyUserWithOTP);
router.post("/login", auth.loginUser);
router.get("/getadmin/:id", verifyToken, auth.getAdminUser);
router.post("/logout", verifyToken, auth.logout);
module.exports = router;
