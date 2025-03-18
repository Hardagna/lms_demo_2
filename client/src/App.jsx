import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home';
import Header from './components/header/Header';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Verify from './pages/auth/Verify';
import About from './pages/about/About';
import Profile from './pages/profile/Profile';
import { UserData } from './context/UserContext';
import Courses from './pages/courses/Courses';
import CourseDetails from './pages/courseDetails/CourseDetails';
import Lecture from './pages/lecture/Lecture';
import AdminDashboard from './admin/Dashboard/AdminDashboard';
import AdminCourses from './admin/Courses/AdminCourses';
import AdminUsers from './admin/Users/AdminUsers';
import AdminTeachingAssistants from './admin/TeachingAssistants/AdminTeachingAssistants';
import CreateQuiz from './pages/quiz/CreateQuiz';
import ViewQuizzes from './pages/quiz/ViewQuizzes';
import EditQuiz from './pages/quiz/EditQuiz';

const App = () => {

  const { isAuth, user } = UserData();
  
  // Helper function to check if user is admin or teaching assistant
  const isAdminOrTA = () => {
    return user?.role === 'admin' || 
           (user?.teachingAssistantFor && user?.teachingAssistantFor.length > 0);
  };
  
  return (
    <>
      <BrowserRouter>
        <Header isAuth={isAuth} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path='/courses' element={<Courses />} />
          <Route path='profile' element={isAuth ? <Profile user={user} /> : <Login />} />
          <Route path="/login" element={isAuth ? <Home /> : <Login />} />
          <Route path="/register" element={isAuth ? <Home /> : <Register />} />
          <Route path="/verify" element={isAuth ? <Home /> : <Verify />} />
          <Route path="/courses/course/:id" element={isAuth ? <CourseDetails user={user} /> : <Login />} />
          <Route path="/courses/course/lectures/:id" element={isAuth ? <Lecture user={user} /> : <Login />} />

          {/* Admin routes - make these conditionally available to TAs where appropriate */}
          <Route path="/admin/dashboard" element={isAuth && user?.role === 'admin' ? <AdminDashboard user={user} /> : <Login />} />
          <Route path="/admin/course/all" element={isAuth && user?.role === 'admin' ? <AdminCourses user={user} /> : <Login />} />
          <Route path="/admin/users" element={isAuth && user?.role === 'admin' ? <AdminUsers user={user} /> : <Login />} />
          <Route path="/admin/teaching-assistants" element={isAuth && user?.role === 'admin' ? <AdminTeachingAssistants user={user} /> : <Login />} />
          
          {/* Allow both admins and TAs to access quiz creation/management */}
          <Route path="/admin/quiz/create/:lectureId" element={isAuth && isAdminOrTA() ? <CreateQuiz /> : <Login />} />
          <Route path="/admin/quiz/:lectureId" element={isAuth && isAdminOrTA() ? <ViewQuizzes /> : <Login />} />
          <Route path="/admin/quiz/edit/:quizId" element={isAuth && isAdminOrTA() ? <EditQuiz /> : <Login />} />

        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;