import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
    
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    completedLectures: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    timestamps: true
}
);

export default mongoose.model('Progress', ProgressSchema);