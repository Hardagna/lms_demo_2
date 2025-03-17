// c:\Users\hbjm7\Sem7\btep\lms_demo_2\client\src\pages\CreateQuiz.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { server } from '../../main';
import { useNavigate, useParams } from 'react-router-dom';
import './quiz.css';

const CreateQuiz = () => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
    const navigate = useNavigate();
    const { lectureId } = useParams();

    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${server}/api/admin/quiz/create`, { title, questions, lectureId }, {
                headers: { token: localStorage.getItem('token') }
            });
            navigate(`/admin/quiz/${lectureId}`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="quiz-page">
            <div className="quiz-container">
                <h2>Create Quiz</h2>
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
                            className="create-quiz-btn"
                        >
                            Create Quiz
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuiz;