import Comment from '../models/Comment.js';
import Lecture from '../models/Lecture.js';

export const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { lectureId } = req.params;
        const userId = req.user._id;

        const comment = await Comment.create({ content, user: userId, lecture: lectureId });

        await Lecture.findByIdAndUpdate(lectureId, { $push: { comments: comment._id } });

        res.status(201).json({ message: 'Comment added successfully', comment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getComments = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const comments = await Comment.find({ lecture: lectureId }).populate('user', 'username');

        res.status(200).json({ comments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }

        await comment.remove();
        await Lecture.findByIdAndUpdate(comment.lecture, { $pull: { comments: comment._id } });

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};