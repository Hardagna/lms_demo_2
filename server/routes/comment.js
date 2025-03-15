import express from 'express';
import { isAuth, isTeachingAssistant } from '../middlewares/isAuth.js';
import { addComment, getComments, deleteComment } from '../controllers/comment.js';

const router = express.Router();

router.post('/:lectureId', isAuth, addComment);
router.get('/:lectureId', isAuth, getComments);
router.delete('/:commentId', isAuth, deleteComment);

export default router;