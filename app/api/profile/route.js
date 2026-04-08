import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import { fetchAllPlatformData } from '@/lib/platforms';
import { analyzeSkills } from '@/lib/analyzer';
import { NextResponse } from 'next/server';

// Save profile links
export async function PUT(request) {
    try {
        const userId = await getAuthUser(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const body = await request.json();
        const profiles = body.profiles || {};

        const leetcodeUsername = (body.leetcodeUsername ?? profiles.leetcode ?? '').trim();
        const codeforcesHandle = (body.codeforcesHandle ?? profiles.codeforces ?? '').trim();
        const codechefUsername = (body.codechefUsername ?? profiles.codechef ?? '').trim();
        const githubUsername = (body.githubUsername ?? profiles.github ?? '').trim();

        const updateDoc = {
            profiles: {
                ...profiles,
                github: githubUsername,
                leetcode: leetcodeUsername,
                codeforces: codeforcesHandle,
                codechef: codechefUsername,
            },
            githubUsername,
            leetcodeUsername,
            codeforcesHandle,
            codechefUsername,
        };

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateDoc },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            profiles: user.profiles,
            leetcodeUsername: user.leetcodeUsername,
            codeforcesHandle: user.codeforcesHandle,
            codechefUsername: user.codechefUsername,
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Sync all platform data
export async function POST(request) {
    try {
        const userId = await getAuthUser(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Fetch data from all platforms
        const platformData = await fetchAllPlatformData(user);

        const updateFields = { lastSyncedAt: new Date() };

        if (platformData.leetcode) {
            updateFields.leetcodeStats = platformData.leetcode.stats || {
                totalSolved: platformData.leetcode.totalSolved || 0,
                easySolved: platformData.leetcode.easySolved || 0,
                mediumSolved: platformData.leetcode.mediumSolved || 0,
                hardSolved: platformData.leetcode.hardSolved || 0,
                ranking: platformData.leetcode.ranking || 0,
                fetchedAt: platformData.leetcode.fetchedAt || new Date(),
            };
            updateFields['platformStats.leetcode'] = updateFields.leetcodeStats;
        }

        if (platformData.codeforces) {
            updateFields.codeforcesStats = platformData.codeforces.stats || {
                rating: platformData.codeforces.rating || 0,
                maxRating: platformData.codeforces.maxRating || 0,
                rank: platformData.codeforces.rank || 'unrated',
                totalContests: platformData.codeforces.totalContests || 0,
                fetchedAt: platformData.codeforces.fetchedAt || new Date(),
            };
            updateFields['platformStats.codeforces'] = {
                ...updateFields.codeforcesStats,
                contestsParticipated: updateFields.codeforcesStats.totalContests || 0,
                problemsSolved: platformData.codeforces.stats?.problemsSolved || 0,
            };
        }

        if (platformData.codechef) {
            updateFields.codechefStats = platformData.codechef.stats || {
                rating: platformData.codechef.rating || 0,
                stars: platformData.codechef.stars || 0,
                problemsSolved: platformData.codechef.problemsSolved || 0,
                globalRank: platformData.codechef.globalRank || 0,
                fetchedAt: platformData.codechef.fetchedAt || new Date(),
            };
            updateFields['platformStats.codechef'] = updateFields.codechefStats;
        }

        if (platformData.gfg) {
            const gfgStats = platformData.gfg.stats || {};
            updateFields['platformStats.gfg'] = {
                totalSolved: gfgStats.totalSolved || 0,
                easySolved: gfgStats.easySolved || 0,
                mediumSolved: gfgStats.mediumSolved || 0,
                hardSolved: gfgStats.hardSolved || 0,
                score: gfgStats.score || 0,
            };
        }

        if (platformData.github) {
            updateFields.githubData = platformData.github.profile;
            updateFields.githubStats = platformData.github.stats;
            updateFields['platformStats.github'] = platformData.github.stats;
        }

        await User.findByIdAndUpdate(user._id, { $set: updateFields });

        // Analyze skills
        const skillAnalysis = analyzeSkills(platformData);

        return NextResponse.json({
            success: true,
            platformData,
            skillAnalysis,
        });
    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
