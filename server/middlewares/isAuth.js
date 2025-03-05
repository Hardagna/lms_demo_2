import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const isAuth = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(403).json({ message: 'You need to login' });
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedData.id).select('-password');
        next();

    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        console.log(error);
    }
};


export const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
}