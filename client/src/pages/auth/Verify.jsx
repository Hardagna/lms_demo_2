import React, { useState } from 'react';
import './auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { UserData } from '../../context/UserContext';

const Verify = () => {
  const [code, setCode] = useState("");
  const {btnLoading, verifyCode} = UserData();

  const navigate = useNavigate();

  const handelSubmit = async (e) => {
    e.preventDefault();
    await verifyCode(Number(code), navigate);
    // console.log('code', code);
  }

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Verify your email</h2>
        <form onSubmit={handelSubmit}>
          <label htmlFor="code">Enter the verification code</label>
          <input type="number" value={code} onChange={(e) => setCode(e.target.value)} required />

          <button disabled={btnLoading} type="submit" className='commonBtn'>{btnLoading ? 'Verifying you...' : 'Verify'}</button>
        </form>
        <p>
          Continue your <Link to="/login">login</Link> process
        </p>
      </div>
    </div>
  )
}

export default Verify;