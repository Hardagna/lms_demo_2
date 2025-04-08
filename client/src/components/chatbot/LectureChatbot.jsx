import React, { useState } from 'react';
import axios from 'axios';
import { server } from '../../main';
import './LectureChatbot.css';

const LectureChatbot = ({ lecture }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResponse('');

        try {
            const result = await axios.post(
                `${server}/api/admin/chatbot/query`,
                {
                    query,
                    lectureContent: `${lecture.title}\n${lecture.description}`
                },
                {
                    headers: {
                        token: localStorage.getItem('token')
                    }
                }
            );

            if (result.data.response) {
                setResponse(result.data.response);
            } else {
                setError('No response received from the chatbot');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message ||
                err.response?.data?.error ||
                'Error processing query';
            setError(errorMsg);
            console.error('Chatbot error:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveAsResource = async () => {
        if (!response) return;

        setSaving(true);
        try {
            await axios.post(
                `${server}/api/admin/chatbot/save-response`,
                {
                    title: `Chatbot Response - ${query}`,
                    content: response,
                    lectureId: lecture._id
                },
                {
                    headers: {
                        token: localStorage.getItem('token')
                    }
                }
            );
            setSaving(false);
            setResponse(''); // Clear response after saving
            setQuery(''); // Clear query
            alert('Response saved as resource successfully!');
        } catch (err) {
            setSaving(false);
            alert('Error saving response as resource');
            console.error('Save error:', err);
        }
    };

    return (
        <div className="chatbot-container">
            <h3>Lecture Assistant</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question about this lecture..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !query}>
                    {loading ? 'Processing...' : 'Ask'}
                </button>
            </form>
            {error && <div className="error-message">{error}</div>}
            {response && (
                <div className="response-container">
                    <p>{response}</p>
                    <button
                        onClick={saveAsResource}
                        disabled={saving}
                        className="save-resource-btn"
                    >
                        {saving ? 'Saving...' : 'Save as Resource'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default LectureChatbot;