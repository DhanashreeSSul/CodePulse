import * as cheerio from 'cheerio';

const HTML_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

function parseNumber(value) {
    if (!value) return 0;
    const cleaned = String(value).replace(/,/g, '').match(/\d+/)?.[0];
    return cleaned ? Number.parseInt(cleaned, 10) || 0 : 0;
}

function normalizeHandle(value, platform) {
    if (!value) return '';
    const input = String(value).trim().replace(/\/+$/, '');
    if (!input.includes('/')) return input;
    const parts = input.split('/').filter(Boolean);
    if (platform === 'leetcode') {
        const uIdx = parts.findIndex((p) => p === 'u');
        if (uIdx >= 0 && parts[uIdx + 1]) return parts[uIdx + 1];
    }
    return parts[parts.length - 1] || '';
}

function buildLeetCodeResponse(username, { totalSolved, easySolved, mediumSolved, hardSolved, ranking, fetchedAt, tags = [] }) {
    return {
        platform: 'leetcode',
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        ranking,
        fetchedAt,
        stats: {
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            ranking,
            fetchedAt,
        },
        tags,
        profile: { username },
    };
}

async function fetchLeetCodeFromGraphQL(username) {
    const query = `
        query userProfile($username: String!) {
            matchedUser(username: $username) {
                profile {
                    ranking
                }
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
                tagProblemCounts {
                    advanced {
                        tagName
                        problemsSolved
                    }
                    intermediate {
                        tagName
                        problemsSolved
                    }
                    fundamental {
                        tagName
                        problemsSolved
                    }
                }
            }
        }
    `;

    try {
        const res = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'User-Agent': HTML_HEADERS['User-Agent'],
                Referer: `https://leetcode.com/u/${username}/`,
                Origin: 'https://leetcode.com',
            },
            body: JSON.stringify({ query, variables: { username } }),
            signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
            console.error(`[LeetCode GraphQL] HTTP ${res.status} for user: ${username}`);
            return null;
        }

        const data = await res.json();
        const user = data?.data?.matchedUser;
        if (!user) return null;

        const submissionStats = user.submitStatsGlobal?.acSubmissionNum || [];
        const getCount = (difficulty) => parseNumber(submissionStats.find((entry) => entry.difficulty === difficulty)?.count);

        const easySolved = getCount('Easy');
        const mediumSolved = getCount('Medium');
        const hardSolved = getCount('Hard');
        let totalSolved = getCount('All');
        if (!totalSolved) totalSolved = easySolved + mediumSolved + hardSolved;

        const rawTags = [
            ...(user.tagProblemCounts?.advanced || []),
            ...(user.tagProblemCounts?.intermediate || []),
            ...(user.tagProblemCounts?.fundamental || []),
        ];
        const tags = rawTags
            .map((tag) => ({
                tagName: tag.tagName,
                problemsSolved: parseNumber(tag.problemsSolved),
            }))
            .filter((tag) => tag.tagName && tag.problemsSolved > 0);

        const ranking = parseNumber(user.profile?.ranking);
        const fetchedAt = new Date();

        return buildLeetCodeResponse(username, {
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            ranking,
            fetchedAt,
            tags,
        });
    } catch (err) {
        console.error(`[LeetCode GraphQL failed] ${err.message}`);
        return null;
    }
}

export async function fetchGitHubData(usernameOrUrl) {
    const username = normalizeHandle(usernameOrUrl, 'github');
    if (!username) return null;

    try {
        const headers = { Accept: 'application/vnd.github.v3+json' };
        if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

        const [userRes, reposRes, eventsRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`, { headers, signal: AbortSignal.timeout(10000) }),
            fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, { headers, signal: AbortSignal.timeout(10000) }),
            fetch(`https://api.github.com/users/${username}/events/public?per_page=30`, { headers, signal: AbortSignal.timeout(10000) }),
        ]);

        if (!userRes.ok) {
            console.error(`[GitHub] HTTP ${userRes.status} for user: ${username}`);
            return null;
        }

        const user = await userRes.json();
        const repos = reposRes.ok ? await reposRes.json() : [];
        const events = eventsRes.ok ? await eventsRes.json() : [];

        const languageCount = {};
        repos.forEach((repo) => {
            if (repo.language) languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        });

        const topLanguages = Object.entries(languageCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([lang]) => lang);

        const totalCommits = events
            .filter((event) => event.type === 'PushEvent')
            .reduce((total, event) => total + (event.payload?.commits?.length || 0), 0);

        const fetchedAt = new Date();
        return {
            platform: 'github',
            profile: {
                avatar_url: user.avatar_url,
                html_url: user.html_url,
                name: user.name || username,
                bio: user.bio,
                public_repos: user.public_repos,
                followers: user.followers,
                following: user.following,
            },
            stats: {
                totalRepos: user.public_repos || 0,
                totalCommits,
                topLanguages,
                recentActivity: events.length,
                fetchedAt,
            },
            repos: repos.slice(0, 10).map((repo) => ({
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                url: repo.html_url,
                updatedAt: repo.updated_at,
            })),
            events: events.map((event) => ({
                id: event.id,
                type: event.type,
                repo: event.repo?.name,
                message: event.payload?.commits?.[0]?.message || event.payload?.action || '',
                createdAt: event.created_at,
            })),
            fetchedAt,
        };
    } catch (err) {
        console.error(`[GitHub fetch failed] ${err.message}`);
        return null;
    }
}

export async function fetchLeetCodeData(usernameOrUrl) {
    const username = normalizeHandle(usernameOrUrl, 'leetcode');
    if (!username) return null;

    // Primary source: LeetCode GraphQL (more reliable than profile HTML scraping).
    const graphQLResult = await fetchLeetCodeFromGraphQL(username);
    if (graphQLResult) return graphQLResult;

    try {
        const res = await fetch(`https://leetcode.com/u/${username}/`, {
            headers: HTML_HEADERS,
            signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
            console.error(`[LeetCode] HTTP ${res.status} for user: ${username}`);
            return null;
        }

        const html = await res.text();
        const $ = cheerio.load(html);
        const fullText = $('body').text();

        let easySolved = 0;
        let mediumSolved = 0;
        let hardSolved = 0;
        let totalSolved = 0;
        let ranking = 0;

        // Best effort text-based extraction for unstable class names.
        $('span, div, p').each((_, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (!text) return;

            if (!easySolved && /easy/i.test(text) && /\d/.test(text)) easySolved = parseNumber(text);
            if (!mediumSolved && /medium/i.test(text) && /\d/.test(text)) mediumSolved = parseNumber(text);
            if (!hardSolved && /hard/i.test(text) && /\d/.test(text)) hardSolved = parseNumber(text);
            if (!ranking && /ranking/i.test(text) && /\d/.test(text)) ranking = parseNumber(text);
            if (!totalSolved && /solved/i.test(text) && /\d/.test(text)) totalSolved = parseNumber(text);
        });

        // Fallback regex parse from whole page text.
        if (!easySolved) easySolved = parseNumber(fullText.match(/Easy\s*(\d[\d,]*)/i)?.[1]);
        if (!mediumSolved) mediumSolved = parseNumber(fullText.match(/Medium\s*(\d[\d,]*)/i)?.[1]);
        if (!hardSolved) hardSolved = parseNumber(fullText.match(/Hard\s*(\d[\d,]*)/i)?.[1]);
        if (!ranking) ranking = parseNumber(fullText.match(/Ranking\s*#?\s*(\d[\d,]*)/i)?.[1]);
        if (!totalSolved) totalSolved = parseNumber(fullText.match(/Solved\s*(\d[\d,]*)/i)?.[1]);

        if (!totalSolved) totalSolved = easySolved + mediumSolved + hardSolved;
        const fetchedAt = new Date();

        return buildLeetCodeResponse(username, {
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            ranking,
            fetchedAt,
        });
    } catch (err) {
        console.error(`[LeetCode scrape failed] ${err.message}`);
        return null;
    }
}

export async function fetchCodeforcesData(handleOrUrl) {
    const handle = normalizeHandle(handleOrUrl, 'codeforces');
    if (!handle) return null;

    try {
        const [infoRes, ratingRes] = await Promise.all([
            fetch(`https://codeforces.com/api/user.info?handles=${handle}`, {
                signal: AbortSignal.timeout(10000),
            }),
            fetch(`https://codeforces.com/api/user.rating?handle=${handle}`, {
                signal: AbortSignal.timeout(10000),
            }),
        ]);

        if (!infoRes.ok) {
            console.error(`[Codeforces] HTTP ${infoRes.status} for user: ${handle}`);
            return null;
        }

        const infoData = await infoRes.json();
        const ratingData = ratingRes.ok ? await ratingRes.json() : { status: 'FAILED', result: [] };

        if (infoData.status !== 'OK') return null;

        const user = infoData.result?.[0] || {};
        const contests = ratingData.status === 'OK' ? ratingData.result : [];
        const fetchedAt = new Date();

        return {
            platform: 'codeforces',
            rating: user.rating || 0,
            maxRating: user.maxRating || 0,
            rank: user.rank || 'unrated',
            totalContests: contests.length,
            fetchedAt,
            stats: {
                rating: user.rating || 0,
                maxRating: user.maxRating || 0,
                rank: user.rank || 'unrated',
                totalContests: contests.length,
                contestsParticipated: contests.length,
                problemsSolved: 0,
                fetchedAt,
            },
            tags: [],
            ratingHistory: contests.slice(-20).map((contest) => ({
                contestName: contest.contestName,
                newRating: contest.newRating,
                oldRating: contest.oldRating,
                rank: contest.rank,
                date: new Date(contest.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
            })),
            profile: { handle },
        };
    } catch (err) {
        console.error(`[Codeforces fetch failed] ${err.message}`);
        return null;
    }
}

export async function fetchCodeChefData(usernameOrUrl) {
    const username = normalizeHandle(usernameOrUrl, 'codechef');
    if (!username) return null;

    try {
        const res = await fetch(`https://www.codechef.com/users/${username}`, {
            headers: HTML_HEADERS,
            signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
            console.error(`[CodeChef] HTTP ${res.status} for user: ${username}`);
            return null;
        }

        const html = await res.text();
        const $ = cheerio.load(html);
        const fullText = $('body').text();

        const rating = parseNumber($('.rating-number').first().text()) || parseNumber(fullText.match(/Rating\s*(\d[\d,]*)/i)?.[1]);

        let stars = 0;
        const starText = $('.rating-star').text() || fullText.match(/([1-7])\s*★/)?.[0] || '';
        const starMatches = String(starText).match(/★/g);
        if (starMatches?.length) stars = starMatches.length;
        if (!stars) stars = parseNumber(fullText.match(/([1-7])\s*★/)?.[1]);

        let problemsSolved = 0;
        $('h3, h4, p, li, span').each((_, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (!problemsSolved && /problems solved/i.test(text) && /\d/.test(text)) {
                problemsSolved = parseNumber(text);
            }
        });
        if (!problemsSolved) {
            problemsSolved = parseNumber(fullText.match(/Problems\s*Solved[^\d]*(\d[\d,]*)/i)?.[1]);
        }

        let globalRank = 0;
        $('li, div, span').each((_, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (!globalRank && /(global|world)\s*rank/i.test(text) && /\d/.test(text)) {
                globalRank = parseNumber(text);
            }
        });
        if (!globalRank) {
            globalRank = parseNumber(fullText.match(/(Global|World)\s*Rank[^\d]*(\d[\d,]*)/i)?.[2]);
        }

        const fetchedAt = new Date();
        const payload = {
            platform: 'codechef',
            rating,
            stars,
            problemsSolved,
            globalRank,
            fetchedAt,
        };

        return {
            ...payload,
            stats: {
                rating,
                stars,
                problemsSolved,
                globalRank,
                fetchedAt,
            },
            profile: { username },
        };
    } catch (err) {
        console.error(`[CodeChef scrape failed] ${err.message}`);
        return null;
    }
}

export async function fetchHackerRankData() {
    return null;
}

function extractEscapedJsonNumber(html, key) {
    const regex = new RegExp(`\\\\\"${key}\\\\\"\\s*:\\s*([0-9]+)`, 'i');
    const match = html.match(regex);
    return parseNumber(match?.[1]);
}

function buildGFGResponse(username, { totalSolved, easySolved, mediumSolved, hardSolved, score, instituteRank, fetchedAt }) {
    return {
        platform: 'gfg',
        stats: {
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            score,
            instituteRank,
            fetchedAt,
        },
        profile: { username },
        fetchedAt,
    };
}

async function fetchGFGFromProfilePage(username) {
    try {
        const res = await fetch(`https://www.geeksforgeeks.org/profile/${encodeURIComponent(username)}`, {
            headers: HTML_HEADERS,
            signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
            console.error(`[GFG Profile] HTTP ${res.status} for user: ${username}`);
            return null;
        }

        const html = await res.text();

        const totalSolved = extractEscapedJsonNumber(html, 'total_problems_solved');
        const score = extractEscapedJsonNumber(html, 'score');
        const instituteRankValue = extractEscapedJsonNumber(html, 'institute_rank');

        // Optional keys that may appear on some profiles/builds.
        const easySolved = extractEscapedJsonNumber(html, 'easy_problems_solved') || extractEscapedJsonNumber(html, 'school');
        const mediumSolved = extractEscapedJsonNumber(html, 'medium_problems_solved') || extractEscapedJsonNumber(html, 'basic');
        const hardSolved = extractEscapedJsonNumber(html, 'hard_problems_solved');

        if (!totalSolved && !score) {
            console.error(`[GFG Profile] Could not parse stats for user: ${username}`);
            return null;
        }

        const fetchedAt = new Date();
        return buildGFGResponse(username, {
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            score,
            instituteRank: instituteRankValue || 'N/A',
            fetchedAt,
        });
    } catch (err) {
        console.error(`[GFG profile scrape failed] ${err.message}`);
        return null;
    }
}

export async function fetchGFGData(usernameOrUrl) {
    const username = normalizeHandle(usernameOrUrl, 'gfg');
    if (!username) return null;

    try {
        const res = await fetch(`https://geeks-for-geeks-stats-api.vercel.app/?userName=${encodeURIComponent(username)}`, {
            headers: {
                Accept: 'application/json',
                'User-Agent': HTML_HEADERS['User-Agent'],
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
            console.error(`[GFG] HTTP ${res.status} for user: ${username}`);
            return await fetchGFGFromProfilePage(username);
        }

        const data = await res.json();
        if (data?.error) {
            console.error(`[GFG] API error for user ${username}: ${data.error}`);
            return await fetchGFGFromProfilePage(username);
        }

        const easySolved = parseNumber(data.easySolved ?? data.Easy ?? data.easy ?? data.school);
        const mediumSolved = parseNumber(data.mediumSolved ?? data.Medium ?? data.medium ?? data.basic);
        const hardSolved = parseNumber(data.hardSolved ?? data.Hard ?? data.hard);

        let totalSolved = parseNumber(
            data.totalProblemsSolved ??
            data.total_problems_solved ??
            data.totalSolved ??
            data.problemSolved,
        );
        if (!totalSolved) totalSolved = easySolved + mediumSolved + hardSolved;

        const score = parseNumber(data.codingScore ?? data.score ?? data.coding_score);
        const instituteRank = data.instituteRank || data.institute_rank || 'N/A';
        const fetchedAt = new Date();

        return buildGFGResponse(username, {
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            score,
            instituteRank,
            fetchedAt,
        });
    } catch (err) {
        console.error(`[GFG fetch failed] ${err.message}`);
        return await fetchGFGFromProfilePage(username);
    }
}

export async function fetchAllPlatformData(user) {
    const results = await Promise.allSettled([
        fetchGitHubData(user.githubUsername || user.profiles?.github || ''),
        fetchLeetCodeData(user.leetcodeUsername || user.profiles?.leetcode || ''),
        fetchCodeforcesData(user.codeforcesHandle || user.profiles?.codeforces || ''),
        fetchCodeChefData(user.codechefUsername || user.profiles?.codechef || ''),
        fetchGFGData(user.profiles?.gfg || ''),
    ]);

    const [github, leetcode, codeforces, codechef, gfg] = results.map((result) =>
        result.status === 'fulfilled' ? result.value : null,
    );

    return { github, leetcode, codeforces, codechef, hackerrank: null, gfg };
}
