import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return Response.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return Response.json({ error: 'Email already registered' }, { status: 400 });
        }

        // Create user
        const user = await User.create({ name, email, password });
        const token = signToken(user._id);

        const response = Response.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email },
        });

        // Set cookie
        response.headers.set(
            'Set-Cookie',
            `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
        );

        return response;
    } catch (error) {
        console.error('Register error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
