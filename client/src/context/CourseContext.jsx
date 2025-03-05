import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../main';

const CourseContext = createContext();

export const CourseContextProvider = ({ children }) => {
    
    const [courses, setCourses] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
    const [course, setCourse] = useState([]);
    // const [myCourse, setMyCourse] = useState([]);

    async function fetchCourses() {
        
        try {

            const { data } = await axios.get(`${server}/api/courses/course/all`);
            setCourses(data.courses);
        } catch (error) {
            console.log(error);
            // setError(error);
        }

    }

    async function fetchCourse( id ) {
        
        try {

            const { data } = await axios.get(`${server}/api/courses/course/${id}`);
            setCourse(data.course);
        } catch (error) {
            console.log(error);
            // setError(error);
        }

    }

    // async function fetchMyCourse() {
        
    //     try {

    //         const { data } = await axios.get(`${server}/api/courses/course/my`, {
    //             headers: {
    //                 token: localStorage.getItem('token'),
    //             }
    //         });

    //         // console.log(data.courses);
    //         setMyCourse(data.courses);
    //     } catch (error) {
    //         console.log(error);
    //         // setError(error);
    //     }
    // }

    useEffect(() => {
        fetchCourses();
        // fetchMyCourse();
    }, []);

  return (
    <CourseContext.Provider value={{ courses, fetchCourses, fetchCourse, course }}>
      {children}
    </CourseContext.Provider>
  )
};

export const CourseData = () => useContext(CourseContext);