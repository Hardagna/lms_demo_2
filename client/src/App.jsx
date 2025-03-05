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
// import Dashboard from './pages/dashboard/Dashboard';
// import CourseSpace from './pages/courseSpace/CourseSpace';

const App = () => {

  const { isAuth, user } = UserData();
  return (
  <>
  <BrowserRouter>
    <Header isAuth={ isAuth } />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path='/courses' element={ <Courses /> } />
      <Route path='profile' element={ isAuth ? <Profile user = { user }  />:<Login />  } />
      <Route path="/login" element={ isAuth ? <Home />:<Login />} />
      <Route path="/register" element={ isAuth ? <Home />:<Register />} />
      <Route path="/verify" element={ isAuth ? <Home />:<Verify />} />
      <Route path="/courses/course/:id" element={isAuth ? <CourseDetails user = {user} />:<Login />} />
      {/* <Route path="/courses/course/:id" element={isAuth ? <Dashboard user = {user} />:<Login />} /> */}
      {/* <Route path="/courses/course//:id" element={isAuth ? <CourseSpace user = {user} />:<Login />} /> */}
      <Route path="/courses/course/lectures/:id" element={isAuth ? <Lecture user = {user} />:<Login />} />

      <Route path="/admin/dashboard" element={isAuth ? <AdminDashboard user = { user } />:<Login />} />
      <Route path="/admin/course/all" element={isAuth ? <AdminCourses user = { user } />:<Login />} />
      <Route path="/admin/users" element={isAuth ? <AdminUsers user = { user } />:<Login />} />

    </Routes>
  </BrowserRouter>
  </>
  );
};

export default App;