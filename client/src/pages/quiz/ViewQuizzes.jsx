// c:\Users\hbjm7\Sem7\btep\lms_demo_2\client\src\pages\ViewQuizzes.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { server } from '../../main';
import { useParams, useNavigate } from 'react-router-dom';
import './quiz.css'; // Import the same CSS file

const ViewQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { lectureId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${server}/api/admin/quiz/${lectureId}`, {
                    headers: { token: localStorage.getItem('token') }
                });
                setQuizzes(data.quizzes);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, [lectureId]);

    const handleDelete = async (quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await axios.delete(`${server}/api/admin/quiz/${quizId}`, {
                    headers: { token: localStorage.getItem('token') }
                });
                setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="quiz-page">
            <div className="quiz-container view-quizzes">
                <h2>Quiz Management</h2>
                
                <div className="quiz-actions">
                    <button 
                        className="create-quiz-btn"
                        onClick={() => navigate(`/admin/quiz/create/${lectureId}`)}
                    >
                        Create New Quiz
                    </button>
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading quizzes...</div>
                ) : quizzes.length === 0 ? (
                    <div className="no-quizzes">
                        <p>No quizzes available for this lecture.</p>
                    </div>
                ) : (
                    <div className="quizzes-list">
                        {quizzes.map((quiz) => (
                            <div key={quiz._id} className="quiz-card">
                                <div className="quiz-header">
                                    <h3>{quiz.title}</h3>
                                    <div className="quiz-actions">
                                        <button 
                                            className="edit-quiz-btn"
                                            onClick={() => navigate(`/admin/quiz/edit/${quiz._id}`)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="delete-quiz-btn"
                                            onClick={() => handleDelete(quiz._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="questions-preview">
                                    <p className="questions-count">
                                        <strong>{quiz.questions.length}</strong> {quiz.questions.length === 1 ? 'question' : 'questions'}
                                    </p>
                                    
                                    {quiz.questions.map((question, index) => (
                                        <div key={index} className="question-preview">
                                            <p className="question-text">
                                                <span className="question-number">{index + 1}.</span> {question.questionText}
                                            </p>
                                            
                                            <div className="options-preview">
                                                {question.options.map((option, i) => (
                                                    <p 
                                                        key={i} 
                                                        className={`option-text ${i === question.correctOption ? 'correct-option' : ''}`}
                                                    >
                                                        <span className="option-marker">{String.fromCharCode(65 + i)}</span>
                                                        {option}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewQuizzes;