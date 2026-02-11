import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false,
    },
    // Multi-platform profiles
    profiles: {
        github: { type: String, default: '' },
        leetcode: { type: String, default: '' },
        codeforces: { type: String, default: '' },
        codechef: { type: String, default: '' },
        hackerrank: { type: String, default: '' },
        gfg: { type: String, default: '' },
    },
    // Cached GitHub profile data
    githubData: {
        avatar_url: String,
        html_url: String,
        name: String,
        bio: String,
        public_repos: Number,
        followers: Number,
        following: Number,
    },
    // Cached platform stats
    platformStats: {
        leetcode: {
            totalSolved: { type: Number, default: 0 },
            easySolved: { type: Number, default: 0 },
            mediumSolved: { type: Number, default: 0 },
            hardSolved: { type: Number, default: 0 },
            ranking: { type: Number, default: 0 },
            totalQuestions: { type: Number, default: 0 },
        },
        codeforces: {
            rating: { type: Number, default: 0 },
            maxRating: { type: Number, default: 0 },
            rank: { type: String, default: '' },
            contestsParticipated: { type: Number, default: 0 },
            problemsSolved: { type: Number, default: 0 },
        },
        codechef: {
            rating: { type: Number, default: 0 },
            stars: { type: String, default: '' },
            problemsSolved: { type: Number, default: 0 },
        },
        hackerrank: {
            badges: { type: Number, default: 0 },
            certificates: { type: Number, default: 0 },
        },
        gfg: {
            totalSolved: { type: Number, default: 0 },
            easySolved: { type: Number, default: 0 },
            mediumSolved: { type: Number, default: 0 },
            hardSolved: { type: Number, default: 0 },
            score: { type: Number, default: 0 },
        },
        github: {
            totalRepos: { type: Number, default: 0 },
            totalCommits: { type: Number, default: 0 },
            topLanguages: [String],
            recentActivity: { type: Number, default: 0 },
        },
    },
    lastSyncedAt: Date,
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
