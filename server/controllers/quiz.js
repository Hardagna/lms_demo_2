// c:\Users\hbjm7\Sem7\btep\lms_demo_2\server\controllers\quiz.js
import Quiz from '../models/Quiz.js';

export const createQuiz = async (req, res) => {
    try {
        const { title, questions, lectureId } = req.body;
        const quiz = await Quiz.create({ title, questions, lecture: lectureId });
        res.status(201).json({ message: 'Quiz created successfully', quiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getQuizzes = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const quizzes = await Quiz.find({ lecture: lectureId });
        res.status(200).json({ quizzes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { title, questions } = req.body;
        const quiz = await Quiz.findByIdAndUpdate(quizId, { title, questions }, { new: true });
        res.status(200).json({ message: 'Quiz updated successfully', quiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        await Quiz.findByIdAndDelete(quizId);
        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};