import { generateInsights } from '../lib/openai';

describe('rule-based insights fallback', () => {
    const originalKey = process.env.GROQ_API_KEY;

    beforeEach(() => {
        process.env.GROQ_API_KEY = '';
    });

    afterAll(() => {
        process.env.GROQ_API_KEY = originalKey;
    });

    test('returns a string when Groq key is missing', async () => {
        const output = await generateInsights([{ type: 'PushEvent', platform: 'GitHub' }]);
        expect(typeof output).toBe('string');
        expect(output.length).toBeGreaterThan(0);
    });

    test('output contains at least one recommendation when activity array is non-empty', async () => {
        const output = await generateInsights([{ type: 'PushEvent', platform: 'GitHub' }]);
        expect(output.toLowerCase()).toContain('recommendation');
    });

    test('handles empty activity array without throwing', async () => {
        await expect(generateInsights([])).resolves.toEqual(expect.any(String));
    });

    test('output is different for a user with 0 activity vs 20 activities', async () => {
        const emptyOutput = await generateInsights([]);
        const busyOutput = await generateInsights(
            Array.from({ length: 20 }, (_, idx) => ({
                type: 'PushEvent',
                platform: 'GitHub',
                repoName: `repo-${idx}`,
                timestamp: new Date().toISOString(),
            })),
        );

        expect(emptyOutput).not.toBe(busyOutput);
    });
});
