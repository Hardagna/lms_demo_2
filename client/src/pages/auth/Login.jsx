import React, { useState } from 'react';
import './auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { UserData } from '../../context/UserContext';

const Login = () => {
    const navigate = useNavigate();
    const { btnLoading, loginUser } = UserData();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await loginUser(email, password, navigate);
    };
  
  return (
    <div className="auth-page">
        <div className="auth-form">
            <h2>Login</h2>
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='email' >Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor='password' >Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" disabled={btnLoading} className='commonBtn'>
                    {btnLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p>Don't have an account?
                <Link to="/register">Register</Link>
            </p>
        </div>
    </div>
  )
};

export default Login;