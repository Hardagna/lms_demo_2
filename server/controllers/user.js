import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from '../middlewares/sendMail.js';

export const register = async (req, res) => {
    try {
        // res.send('Register api');
        const { email, name, password } = req.body;
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        user = {
            name,
            email,
            password: hashedPassword,
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
            password: verify.user.password
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
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const mathPassword = await bcrypt.compare(password, user.password);

        if (!mathPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'Welcome back ${user.name}', token, user })
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
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