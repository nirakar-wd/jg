const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Custom storage engine to use dynamic upload path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = req.uploadPath || './public/images/default'; // Fallback to default if not provided
    // Ensure the directory exists, create if not
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique file name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Set multer upload options
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});


module.exports = { upload };
