const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Grid = require("gridfs-stream");
const { Readable } = require("stream");
const File = require("../models/File"); // Import the schema from File.js

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


////////////////// Functional nodes //////////////////

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

        uploadStream.on("finish", async () => {
            //  Store file metadata in the `FileSchema` collection
            const newFile = new File({
                filename: req.file.originalname,
                fileId: uploadStream.id,  // Store the GridFS file ID
                size: req.file.size,
            });

            await newFile.save();
            res.json({ message: "✅ File uploaded successfully", file: newFile });
        });

    } catch (error) {
        console.error("❌ Error uploading file:", error);
        res.status(500).json({ error: "Failed to upload file" });
    }
});

// Get all stored files
router.get("/all", async (req, res) => {
    try {
        const files = await File.find({}).sort({ filename: 1 });

        res.json(files);
    } catch (error) {
        console.error("❌ Error fetching files:", error);
        res.status(500).json({ error: "Error fetching files" });
    }
});

// Download a file
router.get("/download/:id", async (req, res) => {
    try {
        // ✅ First, find the file metadata by _id
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }

        // ✅ Then, retrieve the file from GridFS
        const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });

        // Convert the file ID to an ObjectId
        const objectId = new mongoose.Types.ObjectId(file.fileId);
        const downloadStream = bucket.openDownloadStream(objectId);

        res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
        downloadStream.pipe(res);

    } catch (error) {
        res.status(500).json({ error: "❌ Error downloading file" });
    }
});

// Delete a file by ID
router.delete("/delete/:id", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });

        // Convert fileId to ObjectId
        const objectId = new mongoose.Types.ObjectId(file.fileId);

        // Delete file from GridFS (uploads.files & uploads.chunks)
        await bucket.delete(objectId);

        // Delete file metadata from 'files' collection
        await File.deleteOne({ _id: req.params.id });

        res.json({ message: "✅ File deleted successfully" });

    } catch (error) {
        console.error("❌ Error deleting file:", error);
        res.status(500).json({ error: "Error deleting file" });
    }
});

// Change the filename of a file
router.put("/update/:id", async (req, res) => {
    try {
        console.log("🔄 Update request for file ID:", req.params.id);

        // Find file metadata in 'files' collection
        const file = await File.findById(req.params.id);
        if (!file) {
            console.warn("❌ File not found in 'files' collection.");
            return res.status(404).json({ error: "File not found" });
        }

        // Update the filename
        file.filename = req.body.filename || file.filename; // Keep old name if not provided
        await file.save();

        res.json({ message: "✅ File updated successfully", file });

    } catch (error) {
        console.error("❌ Error updating file:", error);
        res.status(500).json({ error: "Error updating file" });
    }
});

module.exports = router;