import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Uploads/');
    },
    filename: (req, file, cb) => {
        const id = uuidv4();
        const fileExt = file.originalname.split('.').pop();
        const newFileName = `${id}.${fileExt}`;
        cb(null, newFileName);
    }
});

export const upload = multer({storage}).single('file');