import express from 'express';
import { isAuth, isAdmin } from '../middlewares/isAuth.js';
import { createCourse, addLecture, deleteLecture, deleteCourse, updateRole, getAllUsers, getStats, deleteResource } from '../controllers/admin.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

router.post('/course/add', isAuth, isAdmin, upload, createCourse);
router.post('/course/add-lecture/:id', isAuth, isAdmin, upload, addLecture);
router.delete('/course/delete-lecture/:id', isAuth, isAdmin, deleteLecture);
router.delete('/course/delete-course/:id', isAuth, isAdmin, deleteCourse);
router.get('/stats', isAuth, isAdmin, getStats);
router.put('/user/:id', isAuth, isAdmin, updateRole);
router.get('/users', isAuth, isAdmin, getAllUsers);
router.delete('/resource/:id', isAuth, isAdmin, deleteResource); // Add this line

export default router;