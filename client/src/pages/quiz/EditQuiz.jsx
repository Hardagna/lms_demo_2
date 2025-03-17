import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../../main';
import { useParams, useNavigate } from 'react-router-dom';
import './quiz.css';

const EditQuiz = () => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
    const [loading, setLoading] = useState(true);
    const { quizId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${server}/api/admin/quiz/${quizId}`, {
                    headers: { token: localStorage.getItem('token') }
                });
                const quiz = data.quizzes[0];
                setTitle(quiz.title);
                setQuestions(quiz.questions);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${server}/api/admin/quiz/${quizId}`, { title, questions }, {
                headers: { token: localStorage.getItem('token') }
            });
            // Navigate back to the quiz listing with the lecture ID
            const { lectureId } = await fetchLectureIdFromQuiz(quizId);
            navigate(`/admin/quiz/${lectureId}`);
        } catch (error) {
            console.error(error);
        }
    };

    // Helper function to get the lecture ID for navigation after edit
    const fetchLectureIdFromQuiz = async (quizId) => {
        try {
            const { data } = await axios.get(`${server}/api/admin/quiz/${quizId}/lecture`, {
                headers: { token: localStorage.getItem('token') }
            });
            return { lectureId: data.lectureId };
        } catch (error) {
            console.error(error);
            return { lectureId: '' };
        }
    };

    if (loading) {
        return (
            <div className="quiz-page">
                <div className="quiz-container">
                    <div className="loading-spinner">Loading quiz...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-page">
            <div className="quiz-container">
                <h2>Edit Quiz</h2>
                <form className="quiz-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="quiz-title">Quiz Title</label>
                        <input 
                            type="text" 
                            id="quiz-title"
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Enter quiz title" 
                            required 
                        />
                    </div>
                    
                    {questions.map((q, index) => (
                        <div key={index} className="question-card">
                            <div className="question-header">
                                <span className="question-number">Question {index + 1}</span>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor={`question-${index}`}>Question Text</label>
                                <input 
                                    type="text" 
                                    id={`question-${index}`}
                                    value={q.questionText} 
                                    onChange={(e) => {
                                        const newQuestions = [...questions];
                                        newQuestions[index].questionText = e.target.value;
                                        setQuestions(newQuestions);
                                    }} 
                                    placeholder="Enter your question" 
                                    required 
                                />
                            </div>
                            
                            <div className="options-container">
                                {q.options.map((option, i) => (
                                    <div key={i} className="form-group option-wrapper">
                                        <span className="option-label">{i + 1}</span>
                                        <input 
                                            className="option-input"
                                            type="text" 
                                            value={option} 
                                            onChange={(e) => {
                                                const newQuestions = [...questions];
                                                newQuestions[index].options[i] = e.target.value;
                                                setQuestions(newQuestions);
                                            }} 
                                            placeholder={`Option ${i + 1}`} 
                                            required 
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor={`correct-option-${index}`}>Correct Answer</label>
                                <select 
                                    id={`correct-option-${index}`}
                                    className="correct-option-select"
                                    value={q.correctOption} 
                                    onChange={(e) => {
                                        const newQuestions = [...questions];
                                        newQuestions[index].correctOption = parseInt(e.target.value);
                                        setQuestions(newQuestions);
                                    }}
                                >
                                    <option value={0}>Option 1</option>
                                    <option value={1}>Option 2</option>
                                    <option value={2}>Option 3</option>
                                    <option value={3}>Option 4</option>
                                </select>
                            </div>
                        </div>
                    ))}
                    
                    <div className="quiz-buttons">
                        <button 
                            type="button" 
                            className="add-question-btn" 
                            onClick={handleAddQuestion}
                        >
                            Add Question
                        </button>
                        <button 
                            type="submit" 
                            className="update-quiz-btn"
                        >
                            Update Quiz
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditQuiz;