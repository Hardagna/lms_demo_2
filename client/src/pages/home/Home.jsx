import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="home">
        <div className="home-container">
          <h1>Welcome to your own LMS!!</h1>
          <p>Here you can create, read, update and delete courses and lectures.</p>
          <button onClick={() => navigate('/courses')} className='commonBtn'>Get Started</button>
        </div>
      </div>
    </div>
  )
};

export default Home;