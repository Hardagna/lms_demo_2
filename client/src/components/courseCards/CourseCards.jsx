import React from 'react'
import './courseCards.css'
import { server } from '../../main'
import { UserData } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { CourseData } from '../../context/CourseContext'

const CourseCards = ({ course }) => {

  const navigate = useNavigate();
  const { user, isAuth } = UserData();
  const { fetchCourses } = CourseData();

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`${server}/api/admin/course/delete-course/${id}`, {
          headers: {
            token: localStorage.getItem('token'),
          }
        });

        fetchCourses();
        toast.success(data.message);

      } catch (error) {
        // console.log(error);
        toast.error(error.response.data.message);
      }
    }
  }

  return (
    <div className="course-cards">
        <img src={`${server}/${course.image}`} alt="" className='course-img' />
        <h2>{course.title}</h2>
        <h4>
            Details: {course.description}
        </h4>
        <h4>
            Instructor: {course.instructor}
        </h4>
        <h5>
            Price: {course.price}
        </h5>
        <h5>
            Duration: {course.duration} weeks
        </h5>
        <h5>
            Category: {course.category}
        </h5>

        {
          isAuth && (
          <>
            {user && user.role !== "admin" && (
              <button onClick={() => navigate(`/courses/course/lectures/${course._id}`)} className='commonBtn'>
                View Course
              </button>
            )}
            {/* {user && user.role === "admin" && (
              <button onClick={() => navigate(`/courses/course/lectures/${course._id}`)} className='commonBtn'>
                Edit Course
              </button>
            )} */}

            {user && user.role === "admin" && (
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/courses/course/lectures/${course._id}`)} 
                  className="commonBtn"
                >
                  Edit Course
                </button>
                <button 
                  onClick={() => handleDeleteCourse(course._id)} 
                  className="commonBtn"
                  style={{ background: 'red' }}
                >
                  Delete Course
                </button>
              </div>
            )}

          </>
        )}


    </div>
  );
};


export default CourseCards