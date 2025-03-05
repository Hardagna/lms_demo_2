import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../Utils/Layout'
import { useState } from 'react'
import axios from 'axios'
import { server } from '../../main'
import './adminDashboard.css'

const AdminDashboard = ({ user }) => {

  const navigate = useNavigate();

  if (user && user.role !== 'admin') {
    navigate('/');
  }

  const [stats, setStats] = useState([]);

  async function getStats() {
    try {
      const { data } = await axios.get(`${server}/api/admin/stats`, {
        headers: {
          token: localStorage.getItem('token'),
        },
    });
    // setStats(data.stats);

    if (data && data.stats) {
      setStats(data.stats);
    } else {
      console.log("Stats data is missing or undefined");
    }
    
    } catch (error) {
      console.log(error);
  }
}
  
  useEffect(() => {
    getStats();
  }, [user, navigate]);
  
  return (
    <div>
      <Layout>
        <div className="main-content">
          <div className="box">
            <p>Total courses</p>
            <p>{stats.totalCourses}</p>
          </div>

          <div className="box">
            <p>Total lectures</p>
            <p>{stats.totalLectures}</p>
          </div>

          <div className="box">
            <p>Total users</p>
            <p>{stats.totalUsers}</p>
          </div>
        </div>
      </Layout>
    </div>
  )
}

export default AdminDashboard