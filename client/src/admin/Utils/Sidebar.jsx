import React from 'react'
import './utils.css'
import { Link } from 'react-router-dom'
import { GoHomeFill } from "react-icons/go";
import { FaBook, FaUserAlt } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <Link to = {'/admin/dashboard'}>
            <div className="icon">
              <GoHomeFill />              
            </div>
            <span>
              Home
            </span>
          </Link>
        </li>

        <li>
          <Link to = {'/admin/courses'}>
            <div className="icon">
              <FaBook />              
            </div>
            <span>
              Courses
            </span>
          </Link>
        </li>

        <li>
          <Link to = {'/admin/users'}>
            <div className="icon">
              <FaUserAlt />              
            </div>
            <span>
              Users
            </span>
          </Link>
        </li>

        <li>
          <Link to = {'/profile'}>
            <div className="icon">
              <HiOutlineLogout />              
            </div>
            <span>
              Logout
            </span>
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar