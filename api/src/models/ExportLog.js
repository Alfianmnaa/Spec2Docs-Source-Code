const mongoose = require("mongoose");

const exportLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  docId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Documentation",
    required: true,
  },
  format: {
    type: String,
    enum: ["JSON", "YAML", "MARKDOWN", "HTML"],
    required: true,
  },
  exportedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ExportLog", exportLogSchema);
