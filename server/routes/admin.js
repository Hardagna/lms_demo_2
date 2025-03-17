import express from 'express';
import { isAuth, isAdmin, isTeachingAssistant } from '../middlewares/isAuth.js';
import {
    createCourse,
    addLecture,
    deleteLecture,
    deleteCourse,
    updateRole,
    getAllUsers,
    getStats,
    deleteResource,
    addResourceFile,
    assignTeachingAssistant,
    removeTeachingAssistant,
    getTeachingAssistants
} from '../controllers/admin.js';
import { upload } from '../middlewares/multer.js';
import { createQuiz, getQuizzes, updateQuiz, deleteQuiz } from '../controllers/quiz.js';

const router = express.Router();

router.post('/course/add', isAuth, isAdmin, upload, createCourse);
router.post('/course/add-lecture/:id', isAuth, isTeachingAssistant, upload, addLecture);
router.delete('/course/delete-lecture/:id', isAuth, isTeachingAssistant, deleteLecture);
router.delete('/course/delete-course/:id', isAuth, isAdmin, deleteCourse);
router.get('/stats', isAuth, isAdmin, getStats);
router.put('/user/:id', isAuth, isAdmin, updateRole);
router.get('/users', isAuth, isAdmin, getAllUsers);
router.delete('/resource/:id', isAuth, isTeachingAssistant, deleteResource);
router.post('/resource/upload/:lectureId', isAuth, isTeachingAssistant, upload, addResourceFile);

// Teaching assistant management routes
router.post('/teaching-assistant/assign', isAuth, isAdmin, assignTeachingAssistant);
router.post('/teaching-assistant/remove', isAuth, isAdmin, removeTeachingAssistant);
router.get('/teaching-assistant/:courseId', isAuth, isAdmin, getTeachingAssistants);

// Quiz management routes
router.post('/quiz/create', isAuth, isAdmin, createQuiz);
router.get('/quiz/:lectureId', isAuth, isAdmin, getQuizzes);
router.put('/quiz/:quizId', isAuth, isAdmin, updateQuiz);
router.delete('/quiz/:quizId', isAuth, isAdmin, deleteQuiz);

export default router;