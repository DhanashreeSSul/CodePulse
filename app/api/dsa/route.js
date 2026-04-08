import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Activity from '@/models/Activity';
import { getAuthUser } from '@/lib/auth';

// POST /api/dsa — Log a manually solved problem
export async function POST(request) {
    try {
        const userId = await getAuthUser(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const body = await request.json();

        if (!body.problemName || !body.problemName.trim()) {
            return NextResponse.json({ error: 'Problem name is required' }, { status: 400 });
        }

        const activity = await Activity.create({
            userId,
            type: 'dsa_manual',
            platform: body.platform || 'offline',
            problemName: body.problemName.trim(),
            difficulty: body.difficulty || 'unknown',
            topic: body.topic || '',
            notes: body.notes || '',
            timestamp: new Date(),
        });

        return NextResponse.json({ success: true, activity }, { status: 201 });
    } catch (err) {
        console.error('[DSA POST error]', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// GET /api/dsa — Fetch user's manually logged problems
export async function GET(request) {
    try {
        const userId = await getAuthUser(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        const activities = await Activity.find({ userId, type: 'dsa_manual' })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();

        return NextResponse.json({ activities });
    } catch (err) {
        console.error('[DSA GET error]', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
