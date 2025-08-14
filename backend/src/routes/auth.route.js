const express = require("express");
const { login, signup, logout, onBoard } = require("../controllers/auth.controller");
const protectRoute = require("../../middleware/auth.middleware");
const router = express.Router();

router.post("/login", login);

router.post("/signup", signup);

router.post("/logout", logout);

router.post("/onboarding", protectRoute ,onBoard)

router.get("/me" , protectRoute, (req, res) => {
    res.status(200).json({ success: "true", user: req.user });
  })

module.exports = router;

// to do 
// add forgot password and reset password routes
