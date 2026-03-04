const express = require("express");
const router = express.Router();
const { generateDocs, getDocById, getAllDocs, deleteDoc, getParserResults } = require("../controllers/docController");
const { exportDocs } = require("../controllers/exportController");
const { testAI, testEnrichment } = require("../controllers/testController");
const { protect } = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/uploadMiddleware");

/**
 * @route   GET /api/docs/test-ai
 * @desc    Test Gemini AI models to find working one
 * @access  Private
 */
router.get("/test-ai", protect, testAI);

/**
 * @route   GET /api/docs/test-enrichment
 * @desc    Test AI enrichment with sample spec
 * @access  Private
 */
router.get("/test-enrichment", protect, testEnrichment);

/**
 * @route   POST /api/docs/generate
 * @desc    Generate new API documentation from uploaded ZIP
 * @access  Private
 */
router.post("/generate", protect, upload.single("file"), generateDocs);

/**
 * @route   GET /api/docs
 * @desc    Get all documentations for logged-in user
 * @access  Private
 */
router.get("/", protect, getAllDocs);

/**
 * @route   GET /api/docs/:id
 * @desc    Get single documentation by ID
 * @access  Private
 */
router.get("/:id", protect, getDocById);

/**
 * @route   GET /api/docs/:id/parser-results
 * @desc    Get parser results for a documentation
 * @access  Private
 */
router.get("/:id/parser-results", protect, getParserResults);

/**
 * @route   DELETE /api/docs/:id
 * @desc    Delete documentation
 * @access  Private
 */
router.delete("/:id", protect, deleteDoc);

/**
 * @route   GET /api/docs/export/:id/:format
 * @desc    Export documentation in specified format (json, yaml, markdown, html)
 * @access  Private
 */
router.get("/export/:id/:format", protect, exportDocs);

/**
 * @route   POST /api/docs/export/:id/:format
 * @desc    Export documentation with custom HTML content (for HTML format)
 * @access  Private
 */
router.post("/export/:id/:format", protect, exportDocs);

module.exports = router;
