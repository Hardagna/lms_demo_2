import express from 'express';
import { isAuth, isAdmin, isTeachingAssistant } from '../middlewares/isAuth.js';
import { searchResources, addResource, getLectureResources, deleteResource } from '../controllers/resources.js';

const router = express.Router();

// Routes for resource search and management - allow TAs to access and search
router.get('/search', isAuth, searchResources);
// Allow TAs to add resources too
router.post('/add/:lectureId', isAuth, isTeachingAssistant, addResource);
router.get('/lecture/:lectureId', isAuth, getLectureResources);
// Allow TAs to delete resources
router.delete('/:resourceId', isAuth, isTeachingAssistant, deleteResource);

export default router;