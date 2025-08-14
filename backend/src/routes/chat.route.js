const express = require("express");
const { getStreamToken } = require("../controllers/chat.controller");
const protectRoute = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("token",protectRoute, getStreamToken);

module.exports = router;
