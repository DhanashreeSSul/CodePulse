import { generateInsights } from '@/lib/openai';

export async function POST(request) {
    const { activities } = await request.json();
    const summary = activities.slice(0, 10);
    const insight = await generateInsights(summary);
    return Response.json({ insight });
}
