import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const userId = await getAuthUser(request);
        if (!userId) {
            return Response.json({ user: null }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(userId);
        if (!user) {
            return Response.json({ user: null }, { status: 401 });
        }

        return Response.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profiles: user.profiles,
                platformStats: user.platformStats,
                githubData: user.githubData,
                lastSyncedAt: user.lastSyncedAt,
            },
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
