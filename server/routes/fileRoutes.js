const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const File = require("../models/File");

const router = express.Router();

// Define upload directory
const uploadDir = path.join(__dirname, "../uploads");

// Ensure uploads folder exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create folder if it doesn't exist
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files in 'uploads/' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname); // Ensure unique filenames
    },
});

const upload = multer({ storage });

// Upload file route
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const newFile = new File({
            filename: req.file.originalname,
            filepath: req.file.path,
            size: req.file.size,
        });

        await newFile.save();
        res.json({ message: "✅ File uploaded successfully", file: newFile });
    } catch (error) {
        console.error("❌ Error uploading file:", error);
        res.status(500).json({ error: "Failed to upload file" });
    }
});

// Get all files
router.get("/", async (req, res) => {
    try {
        const files = await File.find();
        res.json(files);
    } catch (error) {
        console.error("❌ Error fetching files:", error);
        res.status(500).json({ error: "Error fetching files" });
    }
});

module.exports = router;