const mongoose = require("mongoose");

const documentationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  sourceFileName: {
    type: String,
    required: true,
  },
  // Menyimpan objek OpenAPI Spec 3.0 hasil mapping
  openApiSpec: {
    type: Object,
    required: true,
  },
  // Narasi deskripsi yang dihasilkan oleh AI
  aiDescription: {
    type: String,
  },
  // Skor kualitas (0-100) dan rangkuman saran
  qualityMetrics: {
    score: { type: Number, default: 0 },
    summary: { type: String },
    grade: { type: String },
    breakdown: { type: Object },
    suggestions: [{ type: String }],
  },
  status: {
    type: String,
    enum: ["processing", "completed", "failed"],
    default: "processing",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual properties for backward compatibility and easier access
documentationSchema.virtual("qualityScore").get(function () {
  return this.qualityMetrics?.score || 0;
});

documentationSchema.virtual("qualityGrade").get(function () {
  return this.qualityMetrics?.grade || "N/A";
});

documentationSchema.virtual("endpointCount").get(function () {
  return this.openApiSpec?.paths ? Object.keys(this.openApiSpec.paths).length : 0;
});

documentationSchema.virtual("aiEnhanced").get(function () {
  return !!this.aiDescription && this.aiDescription.length > 50;
});

// Ensure virtuals are included in JSON output
documentationSchema.set("toJSON", { virtuals: true });
documentationSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Documentation", documentationSchema);
