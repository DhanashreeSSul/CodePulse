/**
 * Advanced Skill Analyzer with DSA topic analysis,
 * company recommendations, and improvement suggestions.
 */

// Company → DSA topic mapping
const COMPANY_DSA_MAP = {
    'Google': ['dynamic programming', 'graphs', 'binary search', 'trees', 'greedy', 'bfs and dfs', 'string', 'dp', 'graph', 'dfs and similar'],
    'Amazon': ['arrays', 'trees', 'dynamic programming', 'greedy', 'linked lists', 'string', 'sorting', 'hash table', 'two pointers', 'dp'],
    'Microsoft': ['arrays', 'dynamic programming', 'trees', 'graphs', 'string', 'binary search', 'linked lists', 'dp', 'math', 'sorting'],
    'Meta (Facebook)': ['arrays', 'string', 'dynamic programming', 'graphs', 'binary search', 'trees', 'dp', 'hash table', 'bfs and dfs', 'two pointers'],
    'Apple': ['arrays', 'trees', 'linked lists', 'dynamic programming', 'string', 'sorting', 'dp', 'binary search'],
    'Netflix': ['system design', 'dynamic programming', 'graphs', 'dp', 'greedy', 'trees', 'string'],
    'Adobe': ['dynamic programming', 'arrays', 'trees', 'greedy', 'sorting', 'string', 'dp', 'math'],
    'Flipkart': ['arrays', 'dynamic programming', 'greedy', 'trees', 'graphs', 'dp', 'sorting', 'string'],
    'Walmart': ['arrays', 'trees', 'dynamic programming', 'string', 'sorting', 'dp', 'greedy'],
    'Goldman Sachs': ['dynamic programming', 'math', 'arrays', 'number theory', 'dp', 'greedy', 'sorting'],
    'Morgan Stanley': ['math', 'dynamic programming', 'arrays', 'string', 'dp', 'number theory'],
    'Uber': ['graphs', 'dynamic programming', 'arrays', 'string', 'dp', 'greedy', 'binary search', 'bfs and dfs'],
    'Atlassian': ['arrays', 'dynamic programming', 'string', 'design', 'dp', 'greedy'],
    'Razorpay': ['arrays', 'dynamic programming', 'greedy', 'string', 'dp', 'trees'],
    'PhonePe': ['arrays', 'dynamic programming', 'trees', 'string', 'dp', 'sorting'],
};

// DSA topic importance tiers
const DSA_TOPICS_TIER = {
    critical: ['dynamic programming', 'dp', 'arrays', 'trees', 'graphs', 'graph', 'binary search', 'string'],
    important: ['greedy', 'linked lists', 'sorting', 'hash table', 'two pointers', 'bfs and dfs', 'dfs and similar', 'math', 'number theory', 'stack'],
    intermediate: ['backtracking', 'bit manipulation', 'heap', 'sliding window', 'recursion', 'divide and conquer', 'trie', 'segment tree', 'union find', 'combinatorics'],
    foundational: ['implementation', 'brute force', 'constructive algorithms', 'data structures', 'sortings', 'binary trees'],
};

export function analyzeSkills(platformData) {
    const analysis = {
        overallScore: 0,
        strengths: [],
        weaknesses: [],
        recommendations: [],
        skillDistribution: {},
        dsaSkills: {},
        companyMatches: [],
        dsaImprovements: [],
        consistencyScore: 0,
        problemSolvingScore: 0,
        projectBuildingScore: 0,
        collaborationScore: 0,
        totalProblemsSolved: 0,
        platformBreakdown: {},
    };

    // ========== Collect all DSA tags from all platforms ==========
    const allTags = {};

    // From LeetCode
    const lc = platformData?.leetcode;
    if (lc?.tags) {
        lc.tags.forEach(t => {
            const key = t.tagName.toLowerCase();
            allTags[key] = (allTags[key] || 0) + t.problemsSolved;
        });
    }

    // From Codeforces
    const cf = platformData?.codeforces;
    if (cf?.tags) {
        cf.tags.forEach(t => {
            const key = t.tagName.toLowerCase();
            allTags[key] = (allTags[key] || 0) + t.problemsSolved;
        });
    }

    // From GFG (estimate tags from difficulty distribution)
    const gfg = platformData?.gfg;
    if (gfg?.stats?.totalSolved > 0) {
        const gfgTotal = gfg.stats.totalSolved;
        allTags['arrays'] = (allTags['arrays'] || 0) + Math.floor(gfgTotal * 0.2);
        allTags['string'] = (allTags['string'] || 0) + Math.floor(gfgTotal * 0.1);
        allTags['trees'] = (allTags['trees'] || 0) + Math.floor(gfgTotal * 0.1);
        allTags['dynamic programming'] = (allTags['dynamic programming'] || 0) + Math.floor(gfgTotal * 0.08);
        allTags['sorting'] = (allTags['sorting'] || 0) + Math.floor(gfgTotal * 0.08);
        allTags['math'] = (allTags['math'] || 0) + Math.floor(gfgTotal * 0.07);
    }

    analysis.dsaSkills = { ...allTags };
    analysis.skillDistribution = { ...allTags };

    // Add programming languages from GitHub
    const gh = platformData?.github;
    if (gh?.stats?.topLanguages) {
        gh.stats.topLanguages.forEach(lang => {
            analysis.skillDistribution[lang] = (analysis.skillDistribution[lang] || 0) + 15;
        });
    }

    // ========== TOTAL PROBLEMS SOLVED ACROSS ALL PLATFORMS ==========
    const lcSolved = lc?.stats?.totalSolved || 0;
    const cfSolved = cf?.stats?.problemsSolved || 0;
    const gfgSolved = gfg?.stats?.totalSolved || 0;
    const ccSolved = platformData?.codechef?.stats?.problemsSolved || 0;

    analysis.totalProblemsSolved = lcSolved + cfSolved + gfgSolved + ccSolved;
    analysis.platformBreakdown = {};
    if (lcSolved > 0) analysis.platformBreakdown['LeetCode'] = lcSolved;
    if (cfSolved > 0) analysis.platformBreakdown['Codeforces'] = cfSolved;
    if (gfgSolved > 0) analysis.platformBreakdown['GeeksForGeeks'] = gfgSolved;
    if (ccSolved > 0) analysis.platformBreakdown['CodeChef'] = ccSolved;

    const totalSolved = analysis.totalProblemsSolved;

    // Total-based strengths
    if (totalSolved >= 500) {
        analysis.strengths.unshift('🔥 Elite problem-solver: ' + totalSolved + ' problems solved across all platforms');
        analysis.problemSolvingScore += 15;
    } else if (totalSolved >= 300) {
        analysis.strengths.unshift('💪 Excellent: ' + totalSolved + ' total problems solved across platforms');
        analysis.problemSolvingScore += 10;
    } else if (totalSolved >= 100) {
        analysis.strengths.unshift('📈 Solid: ' + totalSolved + ' total problems solved across platforms');
        analysis.problemSolvingScore += 5;
    } else if (totalSolved > 0) {
        analysis.weaknesses.unshift('Only ' + totalSolved + ' total problems solved across all platforms — aim for 100+ to be interview-ready');
    }

    // Platforms active count
    const activePlatforms = Object.keys(analysis.platformBreakdown).length + (gh ? 1 : 0);
    if (activePlatforms >= 4) {
        analysis.strengths.push('Active on ' + activePlatforms + ' coding platforms — shows well-rounded practice');
    } else if (activePlatforms <= 1 && activePlatforms > 0) {
        analysis.weaknesses.push('Only active on ' + activePlatforms + ' platform — diversify across LeetCode, Codeforces, and GFG');
    }

    // ========== GitHub Analysis ==========
    if (gh) {
        const stats = gh.stats || {};
        if (stats.totalRepos >= 10) {
            analysis.strengths.push('Strong project portfolio with ' + stats.totalRepos + ' repositories');
            analysis.projectBuildingScore += 40;
        } else if (stats.totalRepos >= 5) {
            analysis.strengths.push('Growing project portfolio');
            analysis.projectBuildingScore += 25;
        } else {
            analysis.weaknesses.push('Limited number of public GitHub projects');
            analysis.recommendations.push('Build more projects on GitHub — aim for 10+ repos to stand out to recruiters.');
        }

        if (stats.topLanguages?.length >= 3) {
            analysis.strengths.push('Multi-language developer: ' + stats.topLanguages.join(', '));
        }

        if (stats.recentActivity >= 20) {
            analysis.consistencyScore += 40;
            analysis.strengths.push('Highly active on GitHub recently');
        } else if (stats.recentActivity >= 10) {
            analysis.consistencyScore += 25;
        } else {
            analysis.weaknesses.push('Low recent GitHub activity');
        }

        if (gh.profile?.followers >= 10) {
            analysis.collaborationScore += 30;
        }
    }

    // ========== LeetCode Analysis ==========
    if (lc) {
        const stats = lc.stats || {};
        const total = stats.totalSolved || 0;

        if (total >= 200) {
            analysis.problemSolvingScore += 45;
            analysis.strengths.push('Exceptional: ' + total + ' LeetCode problems solved');
        } else if (total >= 100) {
            analysis.problemSolvingScore += 35;
            analysis.strengths.push('Strong: ' + total + ' LeetCode problems solved');
        } else if (total >= 30) {
            analysis.problemSolvingScore += 20;
        } else {
            analysis.weaknesses.push('Limited LeetCode practice (' + total + ' solved)');
        }

        if (stats.hardSolved >= 10) {
            analysis.strengths.push('Can solve Hard-level algorithmic problems');
            analysis.problemSolvingScore += 15;
        } else if (total > 20 && stats.hardSolved < 3) {
            analysis.dsaImprovements.push({ topic: 'Hard Problems', reason: 'Only ' + stats.hardSolved + ' hard problems solved. Attempt more for top-tier company interviews.', priority: 'high' });
        }
    }

    // ========== Codeforces Analysis ==========
    if (cf) {
        const stats = cf.stats || {};
        if (stats.rating >= 1600) {
            analysis.problemSolvingScore += 40;
            analysis.strengths.push('Expert competitive programmer (CF Rating: ' + stats.rating + ')');
        } else if (stats.rating >= 1200) {
            analysis.problemSolvingScore += 25;
            analysis.strengths.push('Intermediate competitive programmer (CF: ' + stats.rating + ')');
        } else if (stats.rating > 0) {
            analysis.problemSolvingScore += 10;
        }

        if (stats.contestsParticipated >= 20) {
            analysis.consistencyScore += 20;
        }
    }

    // ========== GFG Analysis ==========
    if (gfg) {
        const stats = gfg.stats || {};
        if (stats.totalSolved >= 100) {
            analysis.problemSolvingScore += 20;
            analysis.strengths.push('Strong GFG practice: ' + stats.totalSolved + ' problems solved');
        } else if (stats.totalSolved >= 30) {
            analysis.problemSolvingScore += 10;
        }

        if (stats.score >= 500) {
            analysis.strengths.push('High GFG coding score: ' + stats.score);
        }
    }

    // ========== DSA TOPIC ANALYSIS ==========
    const strongTopics = [];
    const weakTopics = [];

    DSA_TOPICS_TIER.critical.forEach(topic => {
        const count = allTags[topic] || 0;
        if (count >= 15) {
            strongTopics.push({ topic, count, tier: 'critical' });
        } else if (count < 5) {
            weakTopics.push({ topic, count, tier: 'critical' });
            analysis.dsaImprovements.push({
                topic: topic.charAt(0).toUpperCase() + topic.slice(1),
                reason: count === 0 ? 'No problems solved in this critical topic.' : 'Only ' + count + ' problems solved — needs significant improvement.',
                priority: 'high',
            });
        }
    });

    DSA_TOPICS_TIER.important.forEach(topic => {
        const count = allTags[topic] || 0;
        if (count >= 10) {
            strongTopics.push({ topic, count, tier: 'important' });
        } else if (count < 3) {
            weakTopics.push({ topic, count, tier: 'important' });
            analysis.dsaImprovements.push({
                topic: topic.charAt(0).toUpperCase() + topic.slice(1),
                reason: 'Underexplored topic (' + count + ' solved). Important for well-rounded DSA knowledge.',
                priority: 'medium',
            });
        }
    });

    if (strongTopics.length > 0) {
        analysis.strengths.push('Strong DSA topics: ' + strongTopics.slice(0, 5).map(t => t.topic).join(', '));
    }
    if (weakTopics.filter(t => t.tier === 'critical').length > 0) {
        analysis.weaknesses.push('Weak in critical DSA: ' + weakTopics.filter(t => t.tier === 'critical').slice(0, 4).map(t => t.topic).join(', '));
    }

    // ========== COMPANY MATCHING ==========
    const userStrongTopics = new Set(strongTopics.map(t => t.topic));
    const companyScores = [];

    for (const [company, topics] of Object.entries(COMPANY_DSA_MAP)) {
        let matchCount = 0;
        let totalWeight = 0;
        topics.forEach((topic, idx) => {
            const weight = topics.length - idx;
            totalWeight += weight;
            if (userStrongTopics.has(topic) || (allTags[topic] || 0) >= 8) {
                matchCount += weight;
            }
        });
        const score = Math.round((matchCount / totalWeight) * 100);
        if (score >= 30) {
            companyScores.push({ company, score, matchedTopics: topics.filter(t => userStrongTopics.has(t) || (allTags[t] || 0) >= 8) });
        }
    }

    analysis.companyMatches = companyScores.sort((a, b) => b.score - a.score).slice(0, 8);

    // ========== Calculate Overall Score ==========
    analysis.overallScore = Math.min(100, Math.round(
        (analysis.problemSolvingScore * 0.35) +
        (analysis.projectBuildingScore * 0.25) +
        (analysis.consistencyScore * 0.25) +
        (analysis.collaborationScore * 0.15) + 10
    ));

    // ========== RECOMMENDATIONS ==========
    if (analysis.problemSolvingScore < 20 && analysis.projectBuildingScore > 20) {
        analysis.recommendations.push('You build great projects but lack algorithmic skills. Companies like Google/Amazon heavily test DSA — invest time in LeetCode and Codeforces.');
    }
    if (analysis.problemSolvingScore > 30 && analysis.projectBuildingScore < 15) {
        analysis.recommendations.push('Strong problem-solver but few projects. Build real-world apps to showcase on your resume.');
    }
    if (analysis.consistencyScore < 20) {
        analysis.recommendations.push('Consistency matters! Aim for at least 1 problem + 1 commit daily. Use streaks to stay motivated.');
    }

    // DSA-specific recommendations
    if (weakTopics.some(t => t.topic === 'dynamic programming' || t.topic === 'dp')) {
        analysis.recommendations.push('🎯 Focus on Dynamic Programming — it appears in 40%+ of FAANG interviews. Start with: Fibonacci, Knapsack, LIS, Coin Change.');
    }
    if (weakTopics.some(t => t.topic === 'graphs' || t.topic === 'graph')) {
        analysis.recommendations.push('🎯 Strengthen Graph skills — practice BFS, DFS, Dijkstra, Topological Sort. Essential for Google, Uber, Meta.');
    }
    if (weakTopics.some(t => t.topic === 'trees')) {
        analysis.recommendations.push('🎯 Practice Tree problems — Binary Trees, BSTs, traversals are asked in almost every tech interview.');
    }

    // Company-specific recommendations
    if (analysis.companyMatches.length > 0) {
        const top = analysis.companyMatches[0];
        analysis.recommendations.push(`🏢 Best fit: ${top.company} (${top.score}% match). Focus on: ${top.matchedTopics.slice(0, 3).join(', ')}.`);
    }

    // Total-based recommendations
    if (totalSolved < 50) {
        analysis.recommendations.push('📌 You have ' + totalSolved + ' total problems solved. Target 50+ to clear basic coding rounds, 150+ for competitive placements.');
    } else if (totalSolved < 150) {
        analysis.recommendations.push('📌 ' + totalSolved + ' problems solved — good start! Push to 150+ and focus on medium/hard difficulty to crack product companies.');
    } else if (totalSolved >= 300) {
        analysis.recommendations.push('🌟 ' + totalSolved + ' problems solved — impressive! Now focus on contest performance and system design to reach the next level.');
    }

    if (analysis.recommendations.length === 0) {
        analysis.recommendations.push('🌟 Great progress! Keep solving problems and building projects to stay sharp.');
    }

    // Limit DSA improvements to top 6
    analysis.dsaImprovements = analysis.dsaImprovements
        .sort((a, b) => (a.priority === 'high' ? 0 : 1) - (b.priority === 'high' ? 0 : 1))
        .slice(0, 6);

    return analysis;
}
