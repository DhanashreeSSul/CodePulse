import dbConnect from '@/lib/db';
import Activity from '@/models/Activity';
import { fetchUserEvents } from '@/lib/github';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
        return Response.json({ error: 'Username required' }, { status: 400 });
    }

    try {
        await dbConnect();

        // Fetch from GitHub
        const ghEvents = await fetchUserEvents(username);

        // Fetch from DB (Practice activities)
        const dbActivities = await Activity.find({ username }).sort({ createdAt: -1 });

        // Transform GH events
        const formattedGhEvents = ghEvents.map(e => ({
            _id: e.id,
            type: e.type,
            repoName: e.repo ? e.repo.name : 'Unknown',
            timestamp: e.created_at,
            platform: 'GitHub',
            details: e.payload?.commits?.[0]?.message || e.payload?.action || 'No details'
        }));

        const formattedDbActivities = dbActivities.map(a => ({
            _id: a._id,
            type: a.type,
            repoName: a.repoName || a.difficulty, // Reusing field for display
            timestamp: a.createdAt,
            platform: a.platform,
            details: a.message || a.repoName
        }));

        const allActivities = [...formattedGhEvents, ...formattedDbActivities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return Response.json({ activities: allActivities });
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const activity = await Activity.create(body);
        return Response.json({ success: true, activity });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
