import React, { useState } from 'react'
import './courses.css'
import { CourseData } from '../../context/CourseContext'
import CourseCards from '../../components/courseCards/CourseCards'
import { UserData } from '../../context/UserContext'
import AddCourseModal from '../../components/addCourseModal/AddCourseModal'

const Courses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { courses } = CourseData();
  const { user, isAuth } = UserData();
  
  return (
    <div className="courses">
      <div className="courses-header">
        <h2>Courses</h2>
        {isAuth && user && user.role === "admin" && (
          <button 
            className="add-course-btn" 
            onClick={() => setIsModalOpen(true)}
          >
            Add New Course
          </button>
        )}
      </div>

      <div className="course-container">
        {
          courses && courses.length > 0 ? courses.map((e)=>(
            <CourseCards key={e._id} course={e} />
          )):(<p>No courses yet!!</p>
        )}
      </div>

      {isModalOpen && (
        <AddCourseModal 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}

export default Courses;