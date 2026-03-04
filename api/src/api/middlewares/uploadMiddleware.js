const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter - only allow ZIP files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/zip" || file.mimetype === "application/x-zip-compressed" || path.extname(file.originalname).toLowerCase() === ".zip") {
    cb(null, true);
  } else {
    cb(new Error("Only ZIP files are allowed"), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

module.exports = { upload };
