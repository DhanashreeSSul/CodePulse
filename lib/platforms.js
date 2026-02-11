/**
 * Multi-platform data fetcher for developer profiles.
 * Supports: GitHub, LeetCode, Codeforces, CodeChef, HackerRank, GeeksForGeeks
 */

// ==================== HELPER ====================
function extractUsername(url, platform) {
    if (!url) return null;
    url = url.trim().replace(/\/+$/, '');
    if (!url.includes('/') && !url.includes('.')) return url;
    try {
        const parts = url.split('/');
        switch (platform) {
            case 'github':
                return parts[parts.length - 1] || parts[parts.length - 2];
            case 'leetcode':
                if (parts.includes('u')) return parts[parts.indexOf('u') + 1];
                return parts[parts.length - 1];
            case 'codeforces':
                return parts[parts.length - 1];
            case 'codechef':
                return parts[parts.length - 1];
            case 'hackerrank':
                return parts[parts.length - 1];
            case 'gfg':
                return parts[parts.length - 1];
            default:
                return parts[parts.length - 1];
        }
    } catch {
        return url;
    }
}

// ==================== GITHUB ====================
export async function fetchGitHubData(profileUrl) {
    const username = extractUsername(profileUrl, 'github');
    if (!username) return null;

    try {
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
        if (!userRes.ok) return null;
        const user = await userRes.json();

        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, { headers });
        const repos = reposRes.ok ? await reposRes.json() : [];

        const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=30`, { headers });
        const events = eventsRes.ok ? await eventsRes.json() : [];

        const langCount = {};
        repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
        const topLanguages = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([lang]) => lang);

        const totalCommits = events
            .filter(e => e.type === 'PushEvent')
            .reduce((total, e) => total + (e.payload?.commits?.length || 0), 0);

        return {
            profile: {
                avatar_url: user.avatar_url, html_url: user.html_url,
                name: user.name || username, bio: user.bio,
                public_repos: user.public_repos, followers: user.followers, following: user.following,
            },
            stats: { totalRepos: user.public_repos, totalCommits, topLanguages, recentActivity: events.length },
            repos: repos.slice(0, 10).map(r => ({
                name: r.name, description: r.description, language: r.language,
                stars: r.stargazers_count, forks: r.forks_count, url: r.html_url, updatedAt: r.updated_at,
            })),
            events: events.map(e => ({
                id: e.id, type: e.type, repo: e.repo?.name,
                message: e.payload?.commits?.[0]?.message || e.payload?.action || '', createdAt: e.created_at,
            })),
        };
    } catch (err) {
        console.error('GitHub fetch error:', err.message);
        return null;
    }
}

// ==================== LEETCODE ====================
export async function fetchLeetCodeData(profileUrl) {
    const username = extractUsername(profileUrl, 'leetcode');
    if (!username) return null;

    try {
        const query = `
      query userProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile { ranking realName aboutMe reputation }
          submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
          tagProblemCounts {
            advanced { tagName problemsSolved }
            fundamental { tagName problemsSolved }
          }
        }
        allQuestionsCount { difficulty count }
      }
    `;

        const res = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { username } }),
        });

        if (!res.ok) return null;
        const data = await res.json();
        const user = data?.data?.matchedUser;
        const allQuestions = data?.data?.allQuestionsCount;
        if (!user) return null;

        const submissions = user.submitStatsGlobal?.acSubmissionNum || [];
        const easy = submissions.find(s => s.difficulty === 'Easy')?.count || 0;
        const medium = submissions.find(s => s.difficulty === 'Medium')?.count || 0;
        const hard = submissions.find(s => s.difficulty === 'Hard')?.count || 0;
        const totalAll = allQuestions?.find(q => q.difficulty === 'All')?.count || 0;

        const tags = [
            ...(user.tagProblemCounts?.fundamental || []),
            ...(user.tagProblemCounts?.advanced || []),
        ].filter(t => t.problemsSolved > 0).sort((a, b) => b.problemsSolved - a.problemsSolved).slice(0, 15);

        return {
            stats: { totalSolved: easy + medium + hard, easySolved: easy, mediumSolved: medium, hardSolved: hard, ranking: user.profile?.ranking || 0, totalQuestions: totalAll },
            tags,
            profile: { username: user.username, realName: user.profile?.realName, aboutMe: user.profile?.aboutMe, reputation: user.profile?.reputation },
        };
    } catch (err) {
        console.error('LeetCode fetch error:', err.message);
        return null;
    }
}

// ==================== CODEFORCES ====================
export async function fetchCodeforcesData(profileUrl) {
    const username = extractUsername(profileUrl, 'codeforces');
    if (!username) return null;

    try {
        const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
        if (!infoRes.ok) return null;
        const infoData = await infoRes.json();
        if (infoData.status !== 'OK') return null;
        const user = infoData.result[0];

        const ratingRes = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
        const ratingData = ratingRes.ok ? await ratingRes.json() : { result: [] };
        const contests = ratingData.status === 'OK' ? ratingData.result : [];

        const subRes = await fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=100`);
        const subData = subRes.ok ? await subRes.json() : { result: [] };
        const submissions = subData.status === 'OK' ? subData.result : [];

        const solvedSet = new Set();
        submissions.forEach(s => { if (s.verdict === 'OK') solvedSet.add(`${s.problem.contestId}-${s.problem.index}`); });

        const tagCount = {};
        submissions.forEach(s => {
            if (s.verdict === 'OK' && s.problem.tags) {
                s.problem.tags.forEach(tag => { tagCount[tag] = (tagCount[tag] || 0) + 1; });
            }
        });
        const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([tag, count]) => ({ tagName: tag, problemsSolved: count }));

        return {
            stats: { rating: user.rating || 0, maxRating: user.maxRating || 0, rank: user.rank || 'unrated', contestsParticipated: contests.length, problemsSolved: solvedSet.size },
            tags: topTags,
            ratingHistory: contests.slice(-20).map(c => ({
                contestName: c.contestName, newRating: c.newRating, oldRating: c.oldRating,
                rank: c.rank, date: new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
            })),
            profile: { handle: user.handle, avatar: user.titlePhoto, rank: user.rank, maxRank: user.maxRank },
        };
    } catch (err) {
        console.error('Codeforces fetch error:', err.message);
        return null;
    }
}

// ==================== CODECHEF ====================
export async function fetchCodeChefData(profileUrl) {
    const username = extractUsername(profileUrl, 'codechef');
    if (!username) return null;
    return {
        stats: { rating: 0, stars: 'N/A', problemsSolved: 0 },
        profile: { username, message: 'Add CodeChef stats manually or wait for API support.' },
    };
}

// ==================== HACKERRANK ====================
export async function fetchHackerRankData(profileUrl) {
    const username = extractUsername(profileUrl, 'hackerrank');
    if (!username) return null;
    return {
        stats: { badges: 0, certificates: 0 },
        profile: { username, message: 'Add HackerRank stats manually or wait for API support.' },
    };
}

// ==================== GEEKSFORGEEKS ====================
export async function fetchGFGData(profileUrl) {
    const username = extractUsername(profileUrl, 'gfg');
    if (!username) return null;

    try {
        // GFG public API endpoint
        const res = await fetch(`https://geeks-for-geeks-stats-api.vercel.app/?userName=${username}`);
        if (!res.ok) return null;
        const data = await res.json();

        // Extract solved problems by difficulty
        const totalSolved = data.totalProblemsSolved || 0;
        const easy = data.Easy || data.school || 0;
        const medium = data.Medium || data.basic || 0;
        const hard = data.Hard || 0;

        return {
            stats: {
                totalSolved,
                easySolved: easy,
                mediumSolved: medium,
                hardSolved: hard,
                score: data.codingScore || 0,
                instituteRank: data.instituteRank || 'N/A',
            },
            profile: {
                username,
                instituteRank: data.instituteRank || 'N/A',
            },
        };
    } catch (err) {
        console.error('GFG fetch error:', err.message);
        // Fallback
        return {
            stats: { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, score: 0, instituteRank: 'N/A' },
            profile: { username, message: 'Could not fetch GFG data. Please check your username.' },
        };
    }
}

// ==================== UNIFIED FETCHER ====================
export async function fetchAllPlatformData(profiles) {
    const results = {};
    const fetchers = [
        { key: 'github', fn: fetchGitHubData, url: profiles.github },
        { key: 'leetcode', fn: fetchLeetCodeData, url: profiles.leetcode },
        { key: 'codeforces', fn: fetchCodeforcesData, url: profiles.codeforces },
        { key: 'codechef', fn: fetchCodeChefData, url: profiles.codechef },
        { key: 'hackerrank', fn: fetchHackerRankData, url: profiles.hackerrank },
        { key: 'gfg', fn: fetchGFGData, url: profiles.gfg },
    ];

    const promises = fetchers
        .filter(f => f.url && f.url.trim() !== '')
        .map(async ({ key, fn, url }) => { results[key] = await fn(url); });

    await Promise.all(promises);
    return results;
}
