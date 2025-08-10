import multer from "multer";
import fs from "node:fs";
import path from "node:path";
export const Multer = (customPath, _allowedTypes) => {
  const fullPath = `uploads/${customPath}`;
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() + 1e9);
      cb(null, uniqueSuffix + "_" + file.originalname);
    },
  });
  const fileFilter = (req, file, cb) => {
    const allowedTypes = _allowedTypes || /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
  });
  return upload;
};
