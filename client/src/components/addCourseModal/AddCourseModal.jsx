import React, { useState } from 'react';
import './addCourseModal.css';
import axios from 'axios';
import { server } from '../../main';
import toast from 'react-hot-toast';
import { CourseData } from '../../context/CourseContext';

const AddCourseModal = ({ onClose }) => {
  const { fetchCourses } = CourseData();
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    instructor: '',
    price: '',
    duration: '',
    category: ''
  });
  const [courseImage, setCourseImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setCourseImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseImage) {
      return toast.error('Please select an image for the course');
    }

    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('instructor', courseData.instructor);
    formData.append('price', courseData.price);
    formData.append('duration', courseData.duration);
    formData.append('category', courseData.category);
    formData.append('file', courseImage);

    try {
      setIsLoading(true);
      const { data } = await axios.post(`${server}/api/admin/course/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: localStorage.getItem('token')
        }
      });
      
      toast.success(data.message);
      fetchCourses();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Course</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={courseData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={courseData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="instructor">Instructor</label>
            <input
              type="text"
              id="instructor"
              name="instructor"
              value={courseData.instructor}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={courseData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (weeks)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={courseData.duration}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={courseData.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Course Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;