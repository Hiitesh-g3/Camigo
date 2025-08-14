const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protectRoute(req,res,next){
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({message: "Unauthorized access"});
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if(!decode){
            return res.status(401).json({message: "Unauthorized access"});
        }

        const user = await User.findById(decode.userId).select("-password -friends");
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        req.user = user;

        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

module.exports = protectRoute;