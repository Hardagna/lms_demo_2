import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        // select: false,
    },
    avatar: {
        type: String,
    },
    subscription: {
        type: Array,
        default: [],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    teachingAssistantFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses'
    }],
    verified: {
        type: Boolean,
        default: false,
    },
    otp: Number,
    otp_expiry: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

// Update to add username during registering a user
userSchema.pre('save', function(next) {
    // If username is not set and name exists, use name as username
    if (!this.username && this.name) {
        this.username = this.name;
    }
    // If username is not set and email exists, use email prefix as username
    else if (!this.username && this.email) {
        this.username = this.email.split('@')[0];
    }
    next();
});

userSchema.methods.getJWTToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: '15d',
    });
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export default mongoose.model('User', userSchema);