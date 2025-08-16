const express = require("express");
const protectRoute = require("../../middleware/auth.middleware");
const { getRecommendedUsers, getFriends, sendFriendRequest, acceptFriendRequest, getFriendRequests, getOutgoingFriendRequests } = require("../controllers/user.controller");

const router = express.Router();

router.use(protectRoute);

router.get("/" , getRecommendedUsers)

router.get("/friends", getFriends);

router.post("/friend-request/:userId", sendFriendRequest);

router.put("/friend-request/:userId", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);

router.get("/outgoing-requests", getOutgoingFriendRequests);

// reject friend request
// remove friend

module.exports = router;