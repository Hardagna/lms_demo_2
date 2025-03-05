import React from 'react'
import Sidebar from './Sidebar'
import './utils.css'

const Layout = ({ children }) => {
  return (
    <div className="admin-dashboard">
        <Sidebar />
        <div className="content">
            {children}
        </div>
    </div>
  )
}

export default Layout