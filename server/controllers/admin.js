import Courses from "../models/Courses.js";
import Lecture from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import User from "../models/User.js";
import Resource from "../models/Resource.js";

export const createCourse = async (req, res) => {
    try {
        const { title, description, category, instructor, duration, price } = req.body;
        const image = req.file;
        await Courses.create({ title, description, category, instructor, duration, price, image: image?.path });

        res.status(201).json({ message: 'Course created successfully', });

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

export const addLecture = async (req, res) => {
    const course = await Courses.findById(req.params.id);

    try {
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        const { title, description } = req.body;
        const file = req.file; // This might be undefined if no file was uploaded
        
        // Create lecture data object
        const lectureData = { 
            title, 
            description, 
            course: course._id 
        };
        
        // Only add video field if file exists
        if (file) {
            lectureData.video = file.path;
        }
        
        const lecture = await Lecture.create(lectureData);

        res.status(201).json({ 
            message: 'Lecture added successfully', 
            lecture 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

export const deleteLecture = async (req, res) => {
    const lecture = await Lecture.findByIdAndDelete(req.params.id);
    try {
        // Delete associated resources
        await Resource.deleteMany({ lecture: req.params.id });
        
        rm(lecture.video, () => {
            console.log('File deleted');
        });
        res.status(200).json({ message: 'Lecture deleted successfully', lecture });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

const unlink = promisify(fs.unlink);

export const deleteCourse = async (req, res) => {
    const course = await Courses.findById(req.params.id);
    const lectures = await Lecture.find({ course: course._id });

    try {
        await Promise.all(lectures.map(async (lecture) => {
            await unlink(lecture.video);
            await lecture.remove();
            console.log('Lecture deleted');
        }));
    
        rm(course.image, () => {
            console.log('File deleted');
        });
    
        await Lecture.find({ course: req.params.id }).deleteMany();
        await course.deleteOne();
        await User.updateMany({ $pull: { subscription: req.params.id } });

        res.status(200).json({ message: 'Course deleted successfully', course, });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

export const getStats = async (req, res) => {
    try {
        const totalCourses = await Courses.countDocuments();
        const totalLectures = await Lecture.countDocuments();
        const totalUsers = await User.countDocuments();

        res.status(200).json({ stats: { totalCourses, totalLectures, totalUsers }, });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id }}).select('-password');
        res.status(200).json({ users, });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

export const updateRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user.role === 'user') {
            user.role = 'admin';

            await user.save();

            res.status(200).json({ message: 'Role updated successfully', });
        }
        else {
            user.role = 'user';

            await user.save();

            res.status(200).json({ message: 'Role updated successfully', });
        }
        // await user.save();
        // res.status(200).json({ message: 'Role updated successfully', });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // If it's an uploaded file, delete it from the filesystem
    if (resource.isUploadedFile && resource.url) {
      try {
        await promisify(fs.unlink)(resource.url);
        console.log('Resource file deleted from filesystem');
      } catch (fileError) {
        console.log('Error deleting resource file:', fileError);
      }
    }
    
    await resource.deleteOne();
    
    res.status(200).json({ message: 'Resource deleted successfully', resource });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

export const addResourceFile = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, description, type } = req.body;
    const file = req.file;
    
    const lecture = await Lecture.findById(lectureId);
    
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }
    
    // Create resource with file path
    const resource = await Resource.create({
      title,
      type,
      url: file?.path, // Store file path in url field
      description,
      lecture: lectureId,
      isUploadedFile: true // Flag to identify it's a local file
    });
    
    res.status(201).json({ 
      message: "Resource file uploaded successfully", 
      resource 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

export const assignTeachingAssistant = async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Find the course
        const course = await Courses.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Check if user is already a teaching assistant for this course
        if (user.teachingAssistantFor.includes(courseId)) {
            return res.status(400).json({ message: 'User is already a teaching assistant for this course' });
        }
        
        // Add the course to user's teachingAssistantFor array
        user.teachingAssistantFor.push(courseId);
        await user.save();
        
        res.status(200).json({ 
            message: 'User successfully assigned as teaching assistant',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                teachingAssistantFor: user.teachingAssistantFor
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

export const removeTeachingAssistant = async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if user is a teaching assistant for this course
        if (!user.teachingAssistantFor.includes(courseId)) {
            return res.status(400).json({ message: 'User is not a teaching assistant for this course' });
        }
        
        // Remove the course from user's teachingAssistantFor array
        user.teachingAssistantFor = user.teachingAssistantFor.filter(
            course => course.toString() !== courseId
        );
        await user.save();
        
        res.status(200).json({ 
            message: 'Teaching assistant role removed successfully',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                teachingAssistantFor: user.teachingAssistantFor
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

export const getTeachingAssistants = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        // Find users who are teaching assistants for this course
        const teachingAssistants = await User.find({
            teachingAssistantFor: courseId
        }).select('-password');
        
        res.status(200).json({ teachingAssistants });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};