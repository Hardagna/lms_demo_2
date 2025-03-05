import Courses from "../models/Courses.js";
import Lecture from "../models/Lecture.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Courses.find();
    res.status(200).json({ courses, });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getCourse = async (req, res) => {
  try {
    const course = await Courses.findById(req.params.id);
    res.status(200).json({ course, });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find({ course: req.params.id });
    const user = await User.findById(req.user._id);

    if (user.role === "admin") {
      return res.status(200).json({ lectures, });
    }

    if (!user.subscription.includes(req.params.id)) {
      return res.status(401).json({ message: "You need to subscribe to this course to access the lectures." });
    }
    res.status(200).json({ lectures, });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (user.role === "admin") {
      return res.status(200).json({ lecture, });
    }

    if (!user.subscription.includes(lecture.course)) {
      return res.status(401).json({ message: "You need to subscribe to this course to access the lectures." });
    }
    res.status(200).json({ lecture, });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getMyCourse = async (req, res) => {
  
  try {
    const courses = await Courses.find({ _id: req.user.subscription });
    res.status(200).json({ courses, });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};


// export const addProgress = async (req, res) => {
//   try {
//     const progress = await Progress.findOne({ 
//     course: req.query.course, 
//     user: req.user._id });

//     const { lectureId } = req.query;
//     // progress.completedLectures.push(req.body.lecture);
//     // await progress.save();

//     // if (!progress) {
//     //   progress = await Progress.create({
//     //     course: course._id,
//     //     completedLectures: [],
//     //     user: req.user._id,
//     //   });
//     // }

//     if (progress.completedLectures.includes(lectureId)) {
//       return res.status(400).json({ message: "You have already completed this lecture" });
//     }

//     progress.completedLectures.push(lectureId);
//     await progress.save();
//     res.status(200).json({ message: "Progress updated successfully" });
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// };

// export const getProgress = async (req, res) => {
//   try {
//     const progress = await Progress.findOne({ 
//     course: req.query.course, 
//     user: req.user._id });

//     if (!progress) 
//       return res.status(404).json({ message: "Progress not found" });

//       const allLectures = (await Lecture.find({ course: req.query.course })).length;
//       const completedLectures = progress[0].completedLectures.length;
//       const progressPercentage = (completedLectures / allLectures) * 100;

//       res.status(200).json({ progressPercentage, completedLectures, allLectures, progress });
    

//     // res.status(200).json({ progress, });
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// };


export const addProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({ 
      course: req.query.course, 
      user: req.user._id 
    });

    const { lectureId } = req.query;

    if (!progress) {
      progress = await Progress.create({
        course: req.query.course,
        completedLectures: [],
        user: req.user._id,
      });
    }

    if (progress.completedLectures.includes(lectureId)) {
      return res.status(400).json({ message: "You have already completed this lecture" });
    }

    progress.completedLectures.push(lectureId);
    await progress.save();
    res.status(200).json({ message: "Progress updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ 
      course: req.query.course, 
      user: req.user._id 
    });

    const allLectures = await Lecture.countDocuments({ course: req.query.course });
    const completedLectures = progress ? progress.completedLectures.length : 0;
    const progressPercentage = allLectures ? (completedLectures / allLectures) * 100 : 0;

    res.status(200).json({ progressPercentage, completedLectures, allLectures });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};