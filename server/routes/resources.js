import express from 'express';
import { isAuth, isAdmin, isTeachingAssistant } from '../middlewares/isAuth.js';
import { searchResources, addResource, getLectureResources, deleteResource, uploadResourceFile, copyResource } from '../controllers/resources.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

// Routes for resource search and management
router.get('/search', isAuth, searchResources);
router.post('/add/:lectureId', isAuth, isTeachingAssistant, addResource);
router.get('/lecture/:lectureId', isAuth, getLectureResources);
router.delete('/:resourceId', isAuth, isTeachingAssistant, deleteResource);

// Correctly implement the file upload route
router.post('/upload/:lectureId', isAuth, isTeachingAssistant, (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            // Error is already handled in the upload middleware
            return;
        }
        next();
    });
}, uploadResourceFile);

// Ensure the copy route is properly defined

// Add a route for copying resources
router.post('/copy', isAuth, isTeachingAssistant, copyResource);

export default router;