import express from 'express';
import { handleChatQuery, saveResponseAsResource } from '../controllers/chatbot.js';
import { isAuth, isTeachingAssistant } from '../middlewares/isAuth.js';

const router = express.Router();

router.post('/query', isAuth, isTeachingAssistant, handleChatQuery);
router.post('/save-response', isAuth, isTeachingAssistant, saveResponseAsResource);

export default router;