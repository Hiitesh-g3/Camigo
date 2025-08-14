const FriendRequest = require("../../models/friendRequest");
const User = require("../../models/User");

async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user._id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude current user
        { _id: { $nin: currentUser.friends } }, // Exclude friends
        { isOnBoarded: true }, // Only include users who are onboarded
      ],
    });

    console.log("Recommended users fetched successfully:", recommendedUsers);

    res.status(200).json({ recommendedUsers });
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getFriends(req, res) {
  try {
    const userId = req.user._id;
    const friends = await User.findById(userId)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePicture nativeLanguage learningLanguage"
      );

    res.status(200).json({ friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function sendFriendRequest(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

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
    })

  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function acceptFriendRequest(req, res) {
    try {
        const userId = req.params.userId;
        const currentUserId = req.user._id;

        const friendRequest = await FriendRequest.findById(userId);
        if(!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        if(friendRequest.recipient.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: "You are not authorized to accept this friend request" });
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        // $addtoSet ensures that the user is added to the friends list only if not already present

        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        })

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }
        })

        res.status(200).json({
            message: "Friend request accepted successfully",
            friendRequest
        })

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
