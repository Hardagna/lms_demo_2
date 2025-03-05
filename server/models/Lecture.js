import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    video: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    }
});

export default mongoose.model("Lecture", Schema);