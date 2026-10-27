import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    points: { type: Number, required: true, default: 10 },
    deadline: { type: Date, required: true },
    tutorialVideoUrl: { 
        type: String, 
        trim: true, 
        default: '' 
    }, // ← Optional YouTube tutorial link for task guidance
    status: { 
        type: String, 
        enum: ['active', 'completed', 'expired'], 
        default: 'active' 
    },
    assignedTo: { 
        type: String, 
        enum: ['all', 'specific'], 
        default: 'all' 
    },
    specificUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: String, default: 'admin' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Task", taskSchema, "tasks");
