import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../main';
import toast, { Toaster } from 'react-hot-toast';

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
    
    const [user, setUser] = useState([]);
    const [isAuth, setIsAuth] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    async function loginUser ( email, password, navigate ) {
        setBtnLoading(true);
        try {
            const { data } = await axios.post(`${server}/api/users/user/login`,{ email, password });

            toast.success(data.message);
            localStorage.setItem('token', data.token);
            setUser(data.user);
            setIsAuth(true);
            setBtnLoading(false);
            navigate('/');
        }
        catch (error) {
            setBtnLoading(false);
            setIsAuth(false);
            toast.error(error.response.data.message);
            // console.log(error);
        }
    }

    // async function loginUser(email, password, navigate) {
    //     setBtnLoading(true);
    //     try {
    //         const { data } = await axios.post(`${server}/api/users/user/login`, { email, password });
    //         toast.success(data.message);
    //         localStorage.setItem('token', data.token);
    //         console.log('Token stored:', data.token);
    //         setUser(data.user);
    //         setIsAuth(true);
    //         setBtnLoading(false);
    //         navigate('/');
    //     }
    //     catch (error) {
    //         setBtnLoading(false);
    //         setIsAuth(false);
    //         toast.error(error.response.data.message);
    //     }
    // }

    async function registerUser ( name, email, password, navigate ) {
        setBtnLoading(true);
        try {
            const { data } = await axios.post(`${server}/api/users/user/register`,{ name, email, password });

            toast.success(data.message);
            localStorage.setItem('activationToken', data.activationToken);
            // setUser(data.user);
            // setIsAuth(true);
            setBtnLoading(false);
            navigate('/verify');
        }
        catch (error) {
            setBtnLoading(false);
            // setIsAuth(false);
            toast.error(error.response.data.message);
            // console.log(error);
        }
    }

    async function verifyCode ( otp, navigate ) {
        setBtnLoading(true);
        const activationToken = localStorage.getItem('activationToken');

        try {
            const { data } = await axios.post(`${server}/api/users/user/verify`,{ otp, activationToken });

            toast.success(data.message);
            navigate('/login');
            localStorage.clear();
            setBtnLoading(false);
        }
        catch (error) {
            // setIsAuth(false);
            toast.error(error.response.data.message);
            setBtnLoading(false);
            // console.log(error);
        }
    }

    async function fetchUser () {
        try {
            const { data } = await axios.get(`${server}/api/users/user/me`, {
                headers: {
                    token: localStorage.getItem('token'),
                }
            });
            setUser(data);
            setIsAuth(true);
            setLoading(false);
        }
        catch (error) {
            // setIsAuth(false);
            console.log(error);
            setLoading(false);
        }
    };

    // async function fetchUser() {
    //     try {
    //         const token = localStorage.getItem('token');
    //         if (!token) {
    //             console.log("No token found, user is not authenticated.");
    //             setLoading(false);
    //             return;
    //         }
    
    //         const { data } = await axios.get(`${server}/api/users/user/me`, {
    //             headers: {
    //                 token: localStorage.getItem('token'),
    //             }
    //         });
    
    //         setUser(data);
    //         setIsAuth(true);
    //     } catch (error) {
    //         console.log("Error fetching user:", error.response ? error.response.data : error.message);
    //         setIsAuth(false);
    //     } finally {
    //         setLoading(false);
    //     }
    // }
        

    useEffect(() => {
        fetchUser();
    }, []);

    return ( 
    <UserContext.Provider value={{ user, setUser, isAuth, setIsAuth, btnLoading, loginUser, loading, registerUser, verifyCode }}>
        {children}
        <Toaster />
    </UserContext.Provider>
    );
};

export const UserData = () => useContext(UserContext);