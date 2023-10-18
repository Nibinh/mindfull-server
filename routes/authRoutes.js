const express = require("express");
const router = express.Router();

const auth = require("../controller/authController");

router.post("/register", auth.register);
router.post("/verifyotp", auth.verifyUserWithOTP);
router.post("/login", auth.loginUser);
module.exports = router;
