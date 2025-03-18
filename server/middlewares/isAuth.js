import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const isAuth = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({
                message: 'Please login first',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded._id);
        next();
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'You are not authorized to access this resource',
            });
        }
        next();
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const isTeachingAssistant = async (req, res, next) => {
    try {
        const courseId = req.params.courseId || req.params.id || req.query.course;
        
        // Allow access if user is admin
        if (req.user.role === 'admin') {
            return next();
        }
        
        // Check if user is teaching assistant for this course
        if (req.user.teachingAssistantFor && req.user.teachingAssistantFor.includes(courseId)) {
            return next();
        }

        // If we're trying to access a lecture directly, find the lecture and check if the user is
        // a teaching assistant for the course that lecture belongs to
        if (req.params.id && !courseId) {
            const Lecture = (await import('../models/Lecture.js')).default;
            const lecture = await Lecture.findById(req.params.id);
            
            if (lecture && req.user.teachingAssistantFor && req.user.teachingAssistantFor.includes(lecture.course.toString())) {
                return next();
            }
        }

        return res.status(403).json({
            message: 'You are not authorized to access this resource',
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};