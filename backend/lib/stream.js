const {StreamChat} = require("stream-chat");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
    console.error("Stream API key or secret is not set in environment variables.");
}

// console.log("Stream API Key:", apiKey);
// console.log("Stream API Secret:", apiSecret);

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

async function upsertStreamUser(userData){
    try {
        await streamClient.upsertUser(userData);
        return userData;
    } catch (error) {
        console.error("Error upserting Stream user:", error);
    }
}

function generateStreamToken(userId) {
    try {
        const id = userId.toString(); // use a new variable name

        return streamClient.createToken(id);
    } catch (error) {
        console.error("Error generating Stream token:", error);
        throw new Error("Failed to generate Stream token");
    }
}


module.exports = {
    upsertStreamUser,
    generateStreamToken
}