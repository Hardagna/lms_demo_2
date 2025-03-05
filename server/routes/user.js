import express from 'express';
import { loginUser, myProfile, register, verifyUser } from '../controllers/user.js';
import { isAuth } from '../middlewares/isAuth.js';
import { addProgress, getProgress } from '../controllers/course.js';

const router = express.Router();

router.post('/user/register', register);
router.post('/user/verify', verifyUser);
router.post('/user/login', loginUser);
router.get('/user/me', isAuth, myProfile);
router.post('/user/progress', isAuth, addProgress);
router.get('/user/progress', isAuth, getProgress);

export default router;