import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const userId = await getAuthUser(request);
        if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
        await dbConnect();
        const requestingUser = await User.findById(userId);
        if (!requestingUser || requestingUser.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }
        const users = await User.find({}, 'name email role profiles platformStats lastSyncedAt createdAt remarks').lean();
        return Response.json({ success: true, users });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
