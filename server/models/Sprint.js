import mongoose from 'mongoose';

const SprintSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    weekStart: {
        type: Date,
        required: true
    },
    weekEnd: {
        type: Date,
        required: true
    },
    goals: {
        targetActiveDays: { type: Number, default: 5, min: 1, max: 7 },
        targetCommits: { type: Number, default: 15, min: 1 },
        targetRepos: { type: Number, default: 2, min: 1 }
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    }
}, { timestamps: true });

// Compound index: one sprint per user per week
SprintSchema.index({ user: 1, weekStart: 1 }, { unique: true });

export default mongoose.model('Sprint', SprintSchema);