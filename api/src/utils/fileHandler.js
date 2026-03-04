const admZip = require("adm-zip");
const fs = require("fs-extra");
const path = require("path");

/**
 * Mengekstrak file zip ke folder temporary
 * @param {string} zipPath - Jalur file zip yang diupload
 * @param {string} extractTo - Folder tujuan ekstraksi
 */
exports.extractZip = async (zipPath, extractTo) => {
  try {
    // Validate file extension
    if (!zipPath.toLowerCase().endsWith(".zip")) {
      throw new Error("Unsupported format. Only .zip files are allowed");
    }

    // Validate file exists
    if (!fs.existsSync(zipPath)) {
      throw new Error("File not found");
    }

    const zip = new admZip(zipPath);
    zip.extractAllTo(extractTo, true);
    return true;
  } catch (error) {
    throw new Error(error.message || "Gagal mengekstrak file: " + error.message);
  }
};

/**
 * Menghapus file/folder sementara setelah proses selesai (NFR-08)
 * @param {string} targetPath - Jalur yang akan dihapus
 */
exports.cleanupFiles = async (targetPath) => {
  try {
    if (fs.existsSync(targetPath)) {
      await fs.remove(targetPath);
    }
  } catch (error) {
    console.error("Cleanup Error:", error);
  }
};
