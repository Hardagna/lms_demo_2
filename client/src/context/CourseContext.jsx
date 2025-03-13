import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../main';

const CourseContext = createContext();

export const CourseContextProvider = ({ children }) => {

    const [courses, setCourses] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
    const [course, setCourse] = useState([]);
    const [lectures, setLectures] = useState([]);
    // const [myCourse, setMyCourse] = useState([]);
    const [teachingAssistants, setTeachingAssistants] = useState([]);

    async function fetchCourses() {
        try {
            const { data } = await axios.get(`${server}/api/courses/course/all`);
            setCourses(data.courses);
        } catch (error) {
            console.log(error);
        }
    }

    async function fetchCourse(id) {
        try {
            const { data } = await axios.get(`${server}/api/courses/course/${id}`);
            setCourse(data.course);
            // Fetch teaching assistants for this course
            await fetchTeachingAssistants(id);
        } catch (error) {
            console.log(error);
        }
    }

    async function fetchLectures(courseId) {
        try {
            const { data } = await axios.get(
                `${server}/api/courses/course/lectures/${courseId}`,
                {
                    headers: {
                        token: localStorage.getItem('token'),
                    }
                }
            );
            setLectures(data.lectures);
            return data.lectures;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async function fetchTeachingAssistants(courseId) {
        try {
            const { data } = await axios.get(
                `${server}/api/admin/teaching-assistant/${courseId}`,
                {
                    headers: {
                        token: localStorage.getItem('token'),
                    }
                }
            );
            setTeachingAssistants(data.teachingAssistants);
            return data.teachingAssistants;
        } catch (error) {
            console.log(error);
            setTeachingAssistants([]);
            return [];
        }
    }

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <CourseContext.Provider
            value={{
                courses,
                fetchCourses,
                fetchCourse,
                course,
                lectures,
                fetchLectures,
                teachingAssistants,
                fetchTeachingAssistants
            }}
        >
            {children}
        </CourseContext.Provider>
    )
};

export const CourseData = () => useContext(CourseContext);