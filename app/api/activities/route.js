import dbConnect from '@/lib/db';
import Activity from '@/models/Activity';
import { getAuthUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const userId = await getAuthUser(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        const activities = await Activity.find({ userId })
            .sort({ timestamp: -1, createdAt: -1 })
            .limit(500)
            .lean();

        return NextResponse.json({ activities });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const userId = await getAuthUser(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const body = await request.json();
        const activity = await Activity.create({ ...body, userId });
        return NextResponse.json({ success: true, activity });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
