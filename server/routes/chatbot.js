import express from 'express';
import { handleChatQuery } from '../controllers/chatbot.js';
import { isAuth, isTeachingAssistant } from '../middlewares/isAuth.js';

const router = express.Router();

router.post('/query', isAuth, isTeachingAssistant, handleChatQuery);

export default router;