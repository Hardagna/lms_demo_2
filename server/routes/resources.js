import express from 'express';
import { isAuth, isAdmin, isTeachingAssistant } from '../middlewares/isAuth.js';
import { searchResources, addResource, getLectureResources, deleteResource, uploadResourceFile } from '../controllers/resources.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

// Routes for resource search and management
router.get('/search', isAuth, searchResources);
router.post('/add/:lectureId', isAuth, isTeachingAssistant, addResource);
router.get('/lecture/:lectureId', isAuth, getLectureResources);
router.delete('/:resourceId', isAuth, isTeachingAssistant, deleteResource);

// Add route for file uploads
router.post('/upload/:lectureId', isAuth, isTeachingAssistant, upload, uploadResourceFile);

export default router;