// c:\Users\hbjm7\Sem7\btep\lms_demo_2\server\models\Quiz.js
import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    questions: [
        {
            questionText: String,
            options: [String],
            correctOption: Number,
        },
    ],
    lecture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
        required: true,
    },
});

export default mongoose.model('Quiz', quizSchema);