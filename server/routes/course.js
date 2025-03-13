import express from 'express';
import { 
  getAllCourses, 
  getCourse, 
  getLectures, 
  getLecture, 
  getMyCourse,
  addProgress,
  getProgress 
} from '../controllers/course.js';
import { isAuth, isTeachingAssistant } from '../middlewares/isAuth.js';

const router = express.Router();

router.get('/course/all', getAllCourses);
router.get('/course/:id', getCourse);
router.get('/course/lectures/:id', isAuth, getLectures);
router.get('/course/lecture/:id', isAuth, getLecture);
router.get('/course/my', isAuth, getMyCourse);

router.post('/course/progress', isAuth, addProgress);
router.get('/course/progress', isAuth, getProgress);

export default router;