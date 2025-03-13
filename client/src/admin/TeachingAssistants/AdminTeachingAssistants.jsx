import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../../main';
import Layout from '../Utils/Layout';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './adminTeachingAssistants.css';

const AdminTeachingAssistants = ({ user }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [teachingAssistants, setTeachingAssistants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch all courses and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses
        const coursesResponse = await axios.get(`${server}/api/courses/course/all`);
        setCourses(coursesResponse.data.courses);
        
        // Fetch users
        const usersResponse = await axios.get(`${server}/api/admin/users`, {
          headers: { token: localStorage.getItem('token') }
        });
        setUsers(usersResponse.data.users);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error fetching data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Fetch teaching assistants when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      const fetchTeachingAssistants = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${server}/api/admin/teaching-assistant/${selectedCourse}`, {
            headers: { token: localStorage.getItem('token') }
          });
          setTeachingAssistants(response.data.teachingAssistants);
          setLoading(false);
        } catch (error) {
          console.error(error);
          toast.error('Error fetching teaching assistants');
          setLoading(false);
        }
      };
      
      fetchTeachingAssistants();
    }
  }, [selectedCourse]);

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const assignTeachingAssistant = async (userId) => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${server}/api/admin/teaching-assistant/assign`,
        { userId, courseId: selectedCourse },
        { headers: { token: localStorage.getItem('token') } }
      );
      
      toast.success(response.data.message);
      
      // Refresh teaching assistants list
      const taResponse = await axios.get(`${server}/api/admin/teaching-assistant/${selectedCourse}`, {
        headers: { token: localStorage.getItem('token') }
      });
      setTeachingAssistants(taResponse.data.teachingAssistants);
      
      setLoading(false);
    } catch (error) {
      console.error('Error assigning teaching assistant:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        toast.error(error.response.data.message || 'Error assigning teaching assistant');
      } else if (error.request) {
        console.error('Request data:', error.request);
        toast.error('No response received from server');
      } else {
        console.error('Error message:', error.message);
        toast.error('Error assigning teaching assistant');
      }
      setLoading(false);
    }
  };

  const removeTeachingAssistant = async (userId) => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${server}/api/admin/teaching-assistant/remove`,
        { userId, courseId: selectedCourse },
        { headers: { token: localStorage.getItem('token') } }
      );
      
      toast.success(response.data.message);
      
      // Refresh teaching assistants list
      const taResponse = await axios.get(`${server}/api/admin/teaching-assistant/${selectedCourse}`, {
        headers: { token: localStorage.getItem('token') }
      });
      setTeachingAssistants(taResponse.data.teachingAssistants);
      
      setLoading(false);
    } catch (error) {
      console.error('Error removing teaching assistant:', error);
      toast.error(error.response?.data?.message || 'Error removing teaching assistant');
      setLoading(false);
    }
  };

  const isTeachingAssistant = (userId) => {
    return teachingAssistants.some(ta => ta._id === userId);
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="teaching-assistants">
        <h1>Manage Teaching Assistants</h1>
        
        <div className="course-selector">
          <label htmlFor="course-select">Select Course:</label>
          <select 
            id="course-select" 
            value={selectedCourse} 
            onChange={handleCourseChange}
          >
            <option value="">-- Select a course --</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        
        {selectedCourse && (
          <div className="users-container">
            <h2>Current Teaching Assistants</h2>
            {teachingAssistants.length > 0 ? (
              <table className="ta-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teachingAssistants.map(ta => (
                    <tr key={ta._id}>
                      <td>{ta.username}</td>
                      <td>{ta.email}</td>
                      <td>
                        <button 
                          className="remove-btn"
                          onClick={() => removeTeachingAssistant(ta._id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No teaching assistants assigned to this course.</p>
            )}
            
            <h2>Available Users</h2>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      {isTeachingAssistant(user._id) ? (
                        <button
                          className="remove-btn"
                          onClick={() => removeTeachingAssistant(user._id)}
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          className="assign-btn"
                          onClick={() => assignTeachingAssistant(user._id)}
                        >
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminTeachingAssistants;