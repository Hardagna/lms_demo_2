import React from 'react';
import './TeachingAssistantsList.css';

const TeachingAssistantsList = ({ teachingAssistants }) => {
  if (!teachingAssistants || teachingAssistants.length === 0) {
    return null;
  }

  return (
    <div className="teaching-assistants-container">
      <h3>Teaching Assistants</h3>
      <div className="teaching-assistants-list">
        {teachingAssistants.map((ta) => (
          <div key={ta._id} className="teaching-assistant-card">
            <div className="teaching-assistant-avatar">
              {ta.username.charAt(0).toUpperCase()}
            </div>
            <div className="teaching-assistant-info">
              <div className="teaching-assistant-name">{ta.username}</div>
              <div className="teaching-assistant-email">{ta.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeachingAssistantsList;