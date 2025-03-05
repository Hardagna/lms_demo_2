import React, { useEffect } from 'react'
import './adminUsers.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { server } from '../../main'
import Layout from '../Utils/Layout'
// import { updateRole } from '../../../../server/controllers/admin'
import toast from 'react-hot-toast'

const AdminUsers = ({ user }) => {

    const navigate = useNavigate();

    if (user && user.role !== 'admin') {
        navigate('/')
    }


    const [users, setUsers] = useState([]);   

    async function getUsers() {
        try {
            const { data } = await axios.get(`${server}/api/admin/users`, {
                headers: {
                    token: localStorage.getItem('token'),
                }
            });

            setUsers(data.users);
        } catch (error) {
            console.log(error);
        }
    }


    useEffect(() => {
        getUsers();
    }, []);

    const updateRole = async (id) => {
        if (window.confirm('Are you sure you want to update this user\'s role?')) {
            
            try {
                const { data } = await axios.put(`${server}/api/admin/user/${id}`, {}, {
                    headers: {
                        token: localStorage.getItem('token'),
                    }
                });
    
                toast.success(data.message);
                getUsers();
            } catch (error) {
                console.log(error);
            }

        }
    } 

    console.log(users);

  return (
    <Layout>
        <div className="users">
            <h1>All users</h1>
            <table>
                <thead>
                    <tr>
                        <td>*</td>
                        <td>Username</td>
                        <td>Email</td>
                        <td>Role</td>
                        <td>Update role</td>
                    </tr>
                </thead>

                {
                    users && users.map((e,i)=> (
                        <tbody>
                            <tr>
                                <td>{i+1}</td>
                                <td>{e.username}</td>
                                <td>{e.email}</td>
                                <td>{e.role}</td>
                                <td>
                                    <button  onClick={()=> updateRole(e._id)} className='commonBtn'>
                                        Update role
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                ))}
            </table>
        </div>
    </Layout>
  )
}

export default AdminUsers