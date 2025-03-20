import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = 'Uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Uploads/');
    },
    filename: (req, file, cb) => {
        const id = uuidv4();
        const fileExt = path.extname(file.originalname) || '.unknown';
        const newFileName = `${id}${fileExt}`;
        cb(null, newFileName);
    }
});

// Export middleware function instead of configured middleware
export const upload = (req, res, next) => {
    const uploadMiddleware = multer({
        storage,
        limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
    }).single('file');

    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred
            console.error("Multer error:", err);
            console.error("Request headers:", req.headers);
            console.error("Form field names:", Object.keys(req.body));
            return res.status(400).json({
                message: `Upload error: ${err.message}`,
                field: err.field,
                code: err.code
            });
        } else if (err) {
            // An unknown error occurred
            console.error("Unknown upload error:", err);
            return res.status(500).json({ message: `Unknown upload error: ${err.message}` });
        }

        // Everything went fine
        next();
    });
};