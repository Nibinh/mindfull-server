const express = require("express");
const router = express.Router();

const { verifyToken } = require("../services/middlewares");

const user = require("../controller/userControllers");

router.post("/add", verifyToken, user.addingUser);
router.get("/getuser/:id", verifyToken, user.getUser);
router.get("/getall", verifyToken, user.getAllUsers);
router.delete("/delete/:id", verifyToken, user.deleteUser);
router.put("/edit/:id", verifyToken, user.editUser);

module.exports = router;
