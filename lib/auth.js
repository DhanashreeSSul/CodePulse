import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'codepulse-secret-key-2026';

export function signToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export function getTokenFromRequest(request) {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/token=([^;]+)/);
    return match ? match[1] : null;
}

export async function getAuthUser(request) {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded) return null;
    return decoded.userId;
}
