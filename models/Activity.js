import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
    // Auth reference — keep username for existing GitHub activities, add userId for new DSA logs
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    username: {
        type: String,
        ref: 'User',
    },
    type: {
        type: String, // 'PushEvent', 'PullRequestEvent', 'IssueEvent', 'dsa_manual', 'LeetCode'
        required: true,
    },
    platform: {
        type: String, // 'GitHub', 'leetcode', 'codeforces', 'offline', etc.
        default: 'GitHub',
    },
    // GitHub-specific fields
    repoName: String,
    message: String,
    url: String,

    // DSA manual logging fields
    problemName: { type: String },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'unknown'],
        default: 'unknown',
    },
    topic: { type: String },
    notes: { type: String },

    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Index for fast user+type queries
ActivitySchema.index({ userId: 1, type: 1, timestamp: -1 });
ActivitySchema.index({ username: 1, timestamp: -1 });

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
