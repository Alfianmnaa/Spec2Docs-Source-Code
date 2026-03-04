const Documentation = require("../../models/Documentation");
const ParserResult = require("../../models/ParserResult");
const { parseExpressFile, scanFolder } = require("../../core/parser");
const { mapToOpenAPI } = require("../../core/mapper");
const { enrichWithAI } = require("../../core/aiService");
const { extractZip, cleanupFiles } = require("../../utils/fileHandler");
const { calculateQualityScore, getQualityGrade } = require("../../utils/qualityScorer");
const path = require("path");
const fs = require("fs-extra");

/**
 * Controller utama untuk generate dokumentasi dengan flow lengkap
 * Flow: Upload -> Extract -> Parse -> Map -> AI Enhance -> Score -> Save
 */
exports.generateDocs = async (req, res) => {
  const { projectName, useAI } = req.body;
  const zipFile = req.file;

  if (!zipFile) {
    return res.status(400).json({
      success: false,
      message: "File zip diperlukan",
    });
  }

  if (!projectName || projectName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Project name diperlukan",
    });
  }

  const tempFolder = path.join(__dirname, "../../../uploads", `temp_${Date.now()}`);
  let documentId = null;

  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, "../../../uploads");
    await fs.ensureDir(uploadsDir);
    console.log("📁 Uploads directory ensured:", uploadsDir);

    console.log("📦 Step 1: Extracting ZIP file...");
    console.log("ZIP file path:", zipFile.path);
    console.log("ZIP file size:", zipFile.size, "bytes");
    console.log("Temp folder:", tempFolder);

    // Ensure temp folder exists
    await fs.ensureDir(tempFolder);

    // 1. Ingestion: Ekstrak file
    try {
      await extractZip(zipFile.path, tempFolder);
      console.log("✅ Extraction completed");
    } catch (extractError) {
      console.error("❌ Extraction failed:", extractError.message);
      throw new Error(`Failed to extract ZIP: ${extractError.message}`);
    }

    // Verify extraction
    const extractedFiles = await fs.readdir(tempFolder);
    console.log(`📂 Extracted ${extractedFiles.length} items:`, extractedFiles.slice(0, 5));

    console.log("🔍 Step 2: Scanning for Express.js routes...");
    // 2. Discovery: Scanning seluruh folder untuk endpoint
    let endpoints = [];
    let parsingResults = null;
    try {
      const scanResult = scanFolder(tempFolder);
      endpoints = scanResult.endpoints;
      parsingResults = scanResult.parsingResults;
      console.log(`📁 Scanned folder:`, tempFolder);
      console.log(`✅ Successfully parsed: ${parsingResults.successful.length} files`);
      console.log(`⚠️  Failed to parse: ${parsingResults.failed.length} files`);
      console.log(`ℹ️  Skipped: ${parsingResults.skipped.length} files`);
    } catch (scanError) {
      console.error("❌ Scanning failed:", scanError.message);
      throw new Error(`Failed to scan files: ${scanError.message}`);
    }

    if (endpoints.length === 0) {
      await cleanupFiles(tempFolder);
      await cleanupFiles(zipFile.path);
      return res.status(400).json({
        success: false,
        message: "Tidak ditemukan endpoint Express.js dalam file yang diupload. Pastikan file berisi route definitions.",
      });
    }

    console.log(`✅ Found ${endpoints.length} endpoints`);

    console.log("🗺️  Step 3: Mapping to OpenAPI 3.0.3...");
    // 3. Mapping: Konversi ke OpenAPI
    let openApiSpec;
    try {
      openApiSpec = mapToOpenAPI(projectName, endpoints);
      console.log("✅ OpenAPI mapping completed");
    } catch (mapError) {
      console.error("❌ Mapping failed:", mapError.message);
      throw new Error(`Failed to map to OpenAPI: ${mapError.message}`);
    }

    console.log("🤖 Step 4: AI Enhancement...");
    // 4. AI Enrichment (Optional)
    let aiEnrichmentStatus = "skipped";
    if (useAI === "true") {
      try {
        openApiSpec = await enrichWithAI(openApiSpec);
        console.log("✨ AI enhancement completed");
        aiEnrichmentStatus = "success";
      } catch (aiError) {
        console.warn("⚠️  AI enhancement failed, using basic spec:", aiError.message);
        aiEnrichmentStatus = "failed";
        // Continue with basic spec
      }
    } else {
      console.log("⏭️  Skipping AI enhancement (user choice)");
      aiEnrichmentStatus = "skipped";
    }

    console.log("📊 Step 5: Calculating quality score...");
    // 5. Quality Scoring
    let qualityMetrics;
    let grade;
    try {
      qualityMetrics = calculateQualityScore(openApiSpec);
      grade = getQualityGrade(qualityMetrics.score);
      console.log(`📈 Quality Score: ${qualityMetrics.score}/100 (${grade})`);
    } catch (scoreError) {
      console.error("❌ Quality scoring failed:", scoreError.message);
      // Use default metrics
      qualityMetrics = {
        score: 50,
        summary: "Default score (scoring failed)",
        breakdown: {},
        suggestions: [],
      };
      grade = "C";
    }

    console.log("💾 Step 6: Saving to database...");
    // 6. Save ke Database
    let newDoc;
    try {
      newDoc = await Documentation.create({
        userId: req.user._id,
        projectName: projectName.trim(),
        sourceFileName: zipFile.originalname,
        openApiSpec,
        aiDescription: openApiSpec.info.description,
        qualityMetrics: {
          score: qualityMetrics.score,
          summary: qualityMetrics.summary,
          breakdown: qualityMetrics.breakdown,
          suggestions: qualityMetrics.suggestions,
          grade: grade,
        },
        status: "completed",
      });

      documentId = newDoc._id;
      console.log("✅ Documentation saved with ID:", documentId);
    } catch (dbError) {
      console.error("❌ Database save failed:", dbError.message);
      throw new Error(`Failed to save documentation: ${dbError.message}`);
    }

    console.log("💾 Step 7: Saving parser results...");
    // 7. Save Parser Results
    let parserResultId = null;
    if (parsingResults) {
      try {
        const totalFiles = parsingResults.successful.length + parsingResults.failed.length + parsingResults.skipped.length;
        const hasErrors = parsingResults.failed.length > 0;
        const hasWarnings = parsingResults.skipped.length > 0;

        console.log("📊 Parsing results to save:", {
          totalFiles,
          successful: parsingResults.successful.length,
          failed: parsingResults.failed.length,
          skipped: parsingResults.skipped.length,
        });

        // Determine completion status
        let completionStatus = "success";
        if (parsingResults.failed.length > 0 && parsingResults.successful.length === 0) {
          completionStatus = "failed";
        } else if (parsingResults.failed.length > 0 || parsingResults.skipped.length > 0) {
          completionStatus = "partial";
        }

        // Generate warnings array
        const warnings = [];
        if (hasErrors) {
          warnings.push({
            type: "parse_error",
            message: `${parsingResults.failed.length} file(s) failed to parse`,
            files: parsingResults.failed.map((f) => f.file),
          });
        }
        if (hasWarnings) {
          warnings.push({
            type: "skipped_files",
            message: `${parsingResults.skipped.length} file(s) were skipped`,
            files: parsingResults.skipped.map((f) => f.file),
          });
        }

        console.log("🔨 Creating ParserResult document...");
        const parserResult = await ParserResult.create({
          documentationId: newDoc._id,
          userId: req.user._id,
          summary: {
            totalFiles,
            successfulFiles: parsingResults.successful.length,
            failedFiles: parsingResults.failed.length,
            skippedFiles: parsingResults.skipped.length,
            totalEndpoints: endpoints.length,
          },
          successfulParsing: parsingResults.successful,
          failedParsing: parsingResults.failed,
          skippedFiles: parsingResults.skipped,
          warnings,
          completionStatus,
        });

        parserResultId = parserResult._id;
        console.log("✅ Parser results saved with ID:", parserResultId);
        console.log(`📊 Summary: ${parsingResults.successful.length} success, ${parsingResults.failed.length} failed, ${parsingResults.skipped.length} skipped`);
      } catch (parserSaveError) {
        console.error("⚠️  Failed to save parser results:", parserSaveError);
        console.error("Full error:", parserSaveError.stack);
        // Non-critical error, continue execution
      }
    } else {
      console.warn("⚠️  No parsing results to save (parsingResults is null)");
    }

    console.log("✅ Documentation generated successfully!");

    res.status(201).json({
      success: true,
      message: "Dokumentasi berhasil dibuat",
      data: {
        id: newDoc._id,
        projectName: newDoc.projectName,
        endpointCount: endpoints.length,
        qualityScore: qualityMetrics.score,
        qualityGrade: grade,
        aiEnhanced: useAI === "true",
        aiEnrichmentStatus: aiEnrichmentStatus,
        parserResultId: parserResultId,
        parsingStats: parsingResults
          ? {
              totalFiles: parsingResults.successful.length + parsingResults.failed.length + parsingResults.skipped.length,
              successfulFiles: parsingResults.successful.length,
              failedFiles: parsingResults.failed.length,
              skippedFiles: parsingResults.skipped.length,
            }
          : null,
        spec: openApiSpec,
        qualityMetrics: qualityMetrics,
        createdAt: newDoc.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error in generateDocs:", error);

    // If document was created, mark it as failed
    if (documentId) {
      try {
        await Documentation.findByIdAndUpdate(documentId, { status: "failed" });
      } catch (updateError) {
        console.error("Failed to update document status:", updateError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat generate dokumentasi",
      error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
    });
  } finally {
    // 8. Cleanup: Hapus file sementara
    console.log("🧹 Step 8: Cleaning up temporary files...");
    try {
      await cleanupFiles(tempFolder);
      await cleanupFiles(zipFile.path);
    } catch (cleanupError) {
      console.error("Cleanup warning:", cleanupError.message);
    }
  }
};

/**
 * Get documentation by ID
 */
exports.getDocById = async (req, res) => {
  try {
    const doc = await Documentation.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Dokumentasi tidak ditemukan",
      });
    }

    // Check if user owns this document
    if (doc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke dokumentasi ini",
      });
    }

    res.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    console.error("Error in getDocById:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all documentations for logged-in user
 */
exports.getAllDocs = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const docs = await Documentation.find({ userId: req.user._id })
      .select("-openApiSpec") // Exclude large spec from list
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Documentation.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: docs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllDocs:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete documentation
 */
exports.deleteDoc = async (req, res) => {
  try {
    const doc = await Documentation.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Dokumentasi tidak ditemukan",
      });
    }

    // Check ownership
    if (doc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke dokumentasi ini",
      });
    }

    await Documentation.findByIdAndDelete(req.params.id);

    // Also delete associated parser results
    try {
      await ParserResult.deleteMany({ documentationId: req.params.id });
    } catch (parserDeleteError) {
      console.warn("Failed to delete parser results:", parserDeleteError.message);
    }

    res.json({
      success: true,
      message: "Dokumentasi berhasil dihapus",
    });
  } catch (error) {
    console.error("Error in deleteDoc:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get parser results for a documentation
 */
exports.getParserResults = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if documentation exists and user owns it
    const doc = await Documentation.findById(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Dokumentasi tidak ditemukan",
      });
    }

    if (doc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke dokumentasi ini",
      });
    }

    // Get parser results
    const parserResult = await ParserResult.findOne({ documentationId: id });

    if (!parserResult) {
      return res.status(404).json({
        success: false,
        message: "Parser results not found for this documentation",
      });
    }

    res.json({
      success: true,
      data: parserResult,
    });
  } catch (error) {
    console.error("Error in getParserResults:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
