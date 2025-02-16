console.log("🚀 Server is starting...");

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileRoutes = require("./routes/fileRoutes");

const app = express();
app.use(cors({ origin: "*" })); // Allow all origins (for testing)
app.use(express.json());
app.use("/api/files", fileRoutes);

console.log("🔄 Attempting to connect to MongoDB...");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_LINK)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB connection error: ", err));

console.log("📡 MongoDB connection attempt sent...");

app.get("/", (req, res) => {
  res.send("File Management System API is running...");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));