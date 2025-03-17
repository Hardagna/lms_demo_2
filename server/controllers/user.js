import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from '../middlewares/sendMail.js';

export const register = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Create username from name or email
        const username = name || email.split('@')[0];

        user = {
            name,
            email,
            username,
            password, // Plain password - will be hashed by the pre-save hook
        }

        const otp = Math.floor(Math.random() * 100000);
        const activationToken = jwt.sign({ user, otp }, process.env.ACTIVATION, { expiresIn: '10m' });
        const data = { name, otp };

        await sendMail(email, 'lms_demo', data);
        res.status(200).json({ message: 'Otp is sent to your email', activationToken });


    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

export const verifyUser = async (req, res) => {
    try {
        const { otp, activationToken } = req.body;
        const verify = jwt.verify(activationToken, process.env.ACTIVATION);

        if (!verify) {
            return res.status(400).json({ message: 'Invalid or expired otp' });
        }
        if (verify.otp !== otp) {
            return res.status(400).json({ message: 'Invalid otp' });
        }

        await User.create({
            name: verify.user.name,
            email: verify.user.email,
            username: verify.user.username || verify.user.email.split('@')[0],
            password: verify.user.password // This should be the plain password if using model-based hashing
        })

        res.status(200).json({ message: 'User registered successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }

        // Find user with password explicitly included
        const user = await User.findOne({ email }).select("+password");

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Make sure user.password exists before comparing
        if (!user.password) {
            return res.status(500).json({
                message: "User password data is corrupted",
            });
        }

        // Compare passwords with proper error handling
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password);
            console.log("Password", password);
            console.log("user.password", user.password);
            // Debug line - remove in production
            console.log("Password comparison result:", isMatch);
        } catch (compareError) {
            console.error("Password comparison error:", compareError);
            return res.status(500).json({
                message: "Error verifying password",
            });
        }

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password",
            });
        }

        // Generate token and send response
        const token = user.getJWTToken();

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                subscription: user.subscription,
                role: user.role,
                verified: user.verified,
                teachingAssistantFor: user.teachingAssistantFor || [],
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: error.message,
        });
    }
};

export const myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

// export const myProfile = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id).select('-password');
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json({ user });
//     }
//     catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };