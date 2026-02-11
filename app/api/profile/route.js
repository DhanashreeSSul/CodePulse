import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import { fetchAllPlatformData } from '@/lib/platforms';
import { analyzeSkills } from '@/lib/analyzer';

// Save profile links
export async function PUT(request) {
    try {
        const userId = await getAuthUser(request);
        if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const { profiles } = await request.json();

        const user = await User.findByIdAndUpdate(
            userId,
            { profiles },
            { new: true }
        );

        return Response.json({ success: true, profiles: user.profiles });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

// Sync all platform data
export async function POST(request) {
    try {
        const userId = await getAuthUser(request);
        if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const user = await User.findById(userId);
        if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

        // Fetch data from all platforms
        const platformData = await fetchAllPlatformData(user.profiles);

        // Update cached stats
        const updateData = { lastSyncedAt: new Date() };

        if (platformData.github) {
            updateData.githubData = platformData.github.profile;
            updateData['platformStats.github'] = platformData.github.stats;
        }
        if (platformData.leetcode) {
            updateData['platformStats.leetcode'] = platformData.leetcode.stats;
        }
        if (platformData.codeforces) {
            updateData['platformStats.codeforces'] = platformData.codeforces.stats;
        }
        if (platformData.codechef) {
            updateData['platformStats.codechef'] = platformData.codechef.stats;
        }
        if (platformData.hackerrank) {
            updateData['platformStats.hackerrank'] = platformData.hackerrank.stats;
        }
        if (platformData.gfg) {
            updateData['platformStats.gfg'] = platformData.gfg.stats;
        }

        await User.findByIdAndUpdate(userId, updateData);

        // Analyze skills
        const skillAnalysis = analyzeSkills(platformData);

        return Response.json({
            success: true,
            platformData,
            skillAnalysis,
        });
    } catch (error) {
        console.error('Sync error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
