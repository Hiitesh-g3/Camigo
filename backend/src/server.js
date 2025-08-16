const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.route");
const connectDB = require("../lib/db");
const cookieParser = require("cookie-parser");
const protectRoute = require("../middleware/auth.middleware");
const userRoutes = require("./routes/user.route");
const chatRoutes = require("./routes/chat.route");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const rootDir = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);

app.get("/me" , protectRoute, (req, res) => {
  res.status(200).json({ success: "true", user: req.user });
})

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(rootDir , "../frontend/dist")));

  app.get("*" , (req,res) => {
    res.sendFile(path.join(rootDir , "../frontend/dist/index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB()
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.error("Database connection failed:", err));
});
