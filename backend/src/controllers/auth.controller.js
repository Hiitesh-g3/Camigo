const { upsertStreamUser } = require("../../lib/stream");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie .... prevents XSS attacks
      sameSite: "strict", // Helps prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", // Ensures the cookie is sent over HTTPS in production
    });

    res.status(200).json({ success: "true", user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists , please use a different one" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      fullName,
      email,
      password,
      profilePicture: randomAvatar,
    });
    newUser.save();

    //   TODO : CREATE A USER IN STREAM AS WELL
    try {
      await upsertStreamUser({
        id : newUser._id.toString(),
        name : newUser.fullName,
        image : newUser.profilePicture || "",
      })
      console.log("Stream user created successfully for:", newUser.fullName);
    } catch (error) {
      console.error("Error creating Stream user:", error);
      
    }

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie .... prevents XSS attacks
      sameSite: "strict", // Helps prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", // Ensures the cookie is sent over HTTPS in production
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({success: "true", message: "Logged out successfully"});
}

async function onBoard(req,res){
  try {
    const userId = req.user._id;

    const {fullName,nativeLanguage, learningLanguage, location,bio} = req.body;

    if (!nativeLanguage || !learningLanguage || !location || !bio) {
      return res.status(400).json({ message: "All fields are required" ,
        missingFields: [
          !fullName && "fullName",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
          !bio && "bio"
        ].filter(Boolean)
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId,{
      ...req.body,
      isOnBoarded: true
    },{new : true});

    if(!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // TODO : CREATE A USER IN STREAM AS WELL
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePicture || "",
      });
      console.log("Stream user created successfully for:", updatedUser.fullName);
    } catch (error) {
      console.error("Error creating Stream user during onboarding:", error);
      return res.status(500).json({ message: "Internal server error" });
      
    }

    res.status(200).json({
      message: "Onboarding completed successfully",
      updatedUser
    })
  } catch (error) {
    console.error("Error during onboarding:", error);
    res.status(500).json({ message: "Internal server error" });
    
  }
}

module.exports = {
  login,
  signup,
  logout,
  onBoard
};
