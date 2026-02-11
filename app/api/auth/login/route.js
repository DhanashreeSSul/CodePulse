import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();
        const { email, password } = await request.json();

        if (!email || !password) {
            return Response.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = signToken(user._id);

        const response = Response.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email },
        });

        response.headers.set(
            'Set-Cookie',
            `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
        );

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
