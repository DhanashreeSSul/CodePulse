import jwt from 'jsonwebtoken';
import { signToken, getAuthUser, verifyToken } from '../lib/auth';

describe('auth helpers', () => {
    test('signToken returns a string', () => {
        const token = signToken('user-123');
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(10);
    });

    test('a token signed with signToken can be verified and contains correct userId', () => {
        const token = signToken('abc123');
        const decoded = verifyToken(token);
        expect(decoded).toBeTruthy();
        expect(decoded.userId).toBe('abc123');
    });

    test('an expired or tampered token should fail verification', () => {
        const expired = jwt.sign(
            { userId: 'u1' },
            process.env.JWT_SECRET || 'codepulse-secret-key-2026',
            { expiresIn: '-1s' },
        );

        const tampered = `${signToken('u2')}tamper`;

        expect(verifyToken(expired)).toBeNull();
        expect(verifyToken(tampered)).toBeNull();
    });

    test('getAuthUser returns null if no token in request headers', async () => {
        const request = {
            headers: {
                get: () => '',
            },
        };

        const user = await getAuthUser(request);
        expect(user).toBeNull();
    });
});
