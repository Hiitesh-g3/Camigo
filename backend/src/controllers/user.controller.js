const FriendRequest = require("../../models/friendRequest");
const User = require("../../models/User");

async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user._id;

    // Fetch full user (with friends field)
    const currentUser = await User.findById(currentUserId).lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // If no friends, fallback to empty array
    const friendIds = (currentUser.friends || []).map(friend =>
      friend._id ? friend._id.toString() : friend.toString()
    );

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },  // Exclude current user
        { _id: { $nin: friendIds } },     // Exclude friends
        { isOnBoarded: true },            // Only onboarded users
      ],
    });

    

    res.status(200).json({ recommendedUsers });
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}



async function getFriends(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePicture nativeLanguage learningLanguage"
      );

    return res.status(200).json({ friends: user.friends }); // <-- send only the array
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function sendFriendRequest(req, res) {
  try {
    // Remove colon and trim spaces if present
    let { userId } = req.params;
    userId = userId.replace(/^:/, "").trim();

    const currentUserId = req.user._id;
    // console.log("Sanitized userId:", userId);

    if (userId === currentUserId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.friends.includes(currentUserId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    const friendRequest = await FriendRequest.create({
      sender: currentUserId,
      recipient: userId,
    });

    res.status(201).json({
      message: "Friend request sent successfully",
      friendRequest: {
        _id: friendRequest._id,
        sender: currentUserId,
        recipient: userId,
      },
    });

  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


async function acceptFriendRequest(req, res) { 
  try { 
    const requestId = req.params.userId.replace(/^:/, ""); // remove leading colon if present
    // const friendRequest = await FriendRequest.findById(requestId);

    const currentUserId = req.user._id;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "You are not authorized to accept this friend request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient }
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender }
    });

    res.status(200).json({ 
      message: "Friend request accepted successfully", 
      friendRequest 
    });

  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  } 
}







async function getFriendRequests(req, res) {
    try {
      
        const incomingRequest = await FriendRequest.find({
            recipient: req.user._id,
            status: "pending"
        }).populate("sender", "fullName profilePicture nativeLanguage learningLanguage");

        const acceptedRequests = await FriendRequest.find({
            recipient: req.user._id,
            status: "accepted"
        }).populate("sender", "fullName profilePicture");

        res.status(200).json({
            pendingRequests: incomingRequest,
            acceptedRequests: acceptedRequests
        });
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

async function getOutgoingFriendRequests(req, res){
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user._id,
            status: "pending"
        }).populate("recipient", "fullName profilePicture nativeLanguage learningLanguage");

        res.status(200).json({ outgoingRequests });
    } catch (error) {
        console.error("Error fetching outgoing friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}
module.exports = {
  getRecommendedUsers,
  getFriends,
  sendFriendRequest,
    acceptFriendRequest,
    getFriendRequests,
    getOutgoingFriendRequests
};
