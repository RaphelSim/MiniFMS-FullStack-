const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to GridFS file
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
});


module.exports = mongoose.model("File", FileSchema);