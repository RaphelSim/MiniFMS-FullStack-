const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Grid = require("gridfs-stream");
const { Readable } = require("stream");

const router = express.Router();

// Setup GridFS
const conn = mongoose.connection;
let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
});

// Multer memory storage (stores file in memory before writing to MongoDB)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload file to MongoDB (GridFS)
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null);

        const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });

        const uploadStream = bucket.openUploadStream(req.file.originalname);
        readableStream.pipe(uploadStream);

        uploadStream.on("finish", () => {
            res.json({ message: "✅ File uploaded to MongoDB successfully", fileId: uploadStream.id });
        });

    } catch (error) {
        console.error("❌ Error uploading file:", error);
        res.status(500).json({ error: "Failed to upload file" });
    }
});

// Get all stored files
router.get("/", async (req, res) => {
    try {
        const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });

        bucket.find({}).toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.status(404).json({ error: "No files found" });
            }
            res.json(files);
        });

    } catch (error) {
        res.status(500).json({ error: "❌ Error fetching files" });
    }
});

// Download a file
router.get("/download/:id", async (req, res) => {
    try {
        const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });

        bucket.find({ _id: new mongoose.Types.ObjectId(req.params.id) }).toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.status(404).json({ error: "File not found" });
            }

            const downloadStream = bucket.openDownloadStream(files[0]._id);
            downloadStream.pipe(res);
        });

    } catch (error) {
        res.status(500).json({ error: "❌ Error downloading file" });
    }
});

module.exports = router;