import React, { useEffect } from 'react';
import './courseDetails.css';
import { useParams, useNavigate } from 'react-router-dom';
import { CourseData } from '../../context/CourseContext';
import { server } from '../../main';

const CourseDetails = ({ user }) => {
    
    const params = useParams();
    // console.log(params.id);
    const navigate = useNavigate();
    // const { fetchUser } = UserData();
    const { fetchCourse, course } = CourseData();
    
    useEffect(() => {
        fetchCourse(params.id);
    }
    ,[]);

  return (
    <>
    {course && <div className="courseDetails">
        <div className="course-header">
          <img src={`${server}/${course.image}`} alt="" className='course-img' />
          <div className="course-details">
            <h2>{course.title}</h2>
            <h4>Instructor: {course.instructor}</h4>
            <h5>Price: {course.price}</h5>
            <h5>Duration: {course.duration}</h5>
            <h5>Category: {course.category}</h5>
            {/* <Link to = {`/courses/course/lectures/${course._id}`}>
              <h2>Lectures</h2>
            </Link> */}
          </div>
          {/* <p>Let's get started with {course.title} from next week</p> */}
          {/* {
            user && user.subscription.includes(course._id) ? (
              <button onClick={()=> navigate(`/courses/course/enrolled/${course._id}`) } className="commonBtn">Enrolled</button>
            ) : (
              <button className="commonBtn">Enroll</button>
            )
          } */}
          {/* {user ?.subscription ?.includes(course._id) ? (
              <button onClick={() => navigate(`/courses/course/enrolled/${course._id}`)} className="commonBtn">
                  Enrolled
              </button>
          ) : (
              <button className="commonBtn">Enroll</button>
          )} */}

        </div>
      </div>}
    </>
  )
}

export default CourseDetails