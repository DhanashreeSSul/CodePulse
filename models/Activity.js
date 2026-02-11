import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        ref: 'User',
    },
    type: {
        type: String, // 'PushEvent', 'PullRequestEvent', 'IssueEvent', 'LeetCode', 'HackerRank'
        required: true,
    },
    repoName: String,
    message: String,
    url: String,
    difficulty: String, // 'Easy', 'Medium', 'Hard'
    platform: {
        type: String, // 'GitHub', 'Practice'
        default: 'GitHub',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
