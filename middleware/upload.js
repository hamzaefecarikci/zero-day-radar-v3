// Multer config - galeri gorselleri public/uploads/ altina yazilir.
// CLAUDE.md: "validate file type and size before saving"
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");

const ALLOWED_MIME = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif"
]);

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = (path.extname(file.originalname) || "").toLowerCase().slice(0, 10);
        const rnd = crypto.randomBytes(12).toString("hex");
        cb(null, `${Date.now()}-${rnd}${ext}`);
    }
});

function fileFilter(req, file, cb) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
        return cb(new Error("Sadece png, jpeg, webp ve gif yuklenebilir."));
    }
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_SIZE_BYTES, files: 1 }
});

module.exports = {
    single: upload.single("image"),
    UPLOAD_DIR,
    MAX_SIZE_BYTES
};
