const multer = require("multer");
const fs = require("fs");

// const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const destPath = req.uploadPath;
    if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
    callback(null, destPath);
  },
  filename: function (req, file, callback) {
    const parts = file.originalname.split(".");
    const extension = parts[parts.length - 1];
    let fileName = file.fieldname + "-" + Date.now();
    if (extension === "png" || extension === "jpeg" || extension === "jpg")
      fileName += "." + extension;

    callback(null, fileName);
  },
});

const upload = multer({
  storage: storage,
//   limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = { upload };
