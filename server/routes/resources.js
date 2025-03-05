import express from 'express';
import { isAuth, isAdmin } from '../middlewares/isAuth.js';
import { searchResources, addResource, getLectureResources, deleteResource } from '../controllers/resources.js';

const router = express.Router();

// Routes for resource search and management
router.get('/search', isAuth, searchResources);
router.post('/add/:lectureId', isAuth, isAdmin, addResource);
router.get('/lecture/:lectureId', isAuth, getLectureResources);
router.delete('/:resourceId', isAuth, isAdmin, deleteResource);

export default router;