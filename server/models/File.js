const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", FileSchema);