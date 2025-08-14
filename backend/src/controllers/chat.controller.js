const { generateStreamToken } = require("../../lib/stream");

async function getStreamToken(req,res){
    try {
        const token = generateStreamToken(req.user._id);

        res.status(200).json({ token });
    } catch (error) {
        console.error("Error getting Stream token:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

module.exports = {
    getStreamToken
}