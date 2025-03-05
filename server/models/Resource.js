import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["pdf", "video", "webpage", "wikipedia", "audio"],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Resource = mongoose.model("Resource", ResourceSchema);
export default Resource;