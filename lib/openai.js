import Groq from 'groq-sdk';

/**
 * Rule-based analytics engine that generates intelligent insights
 * from developer activity data without requiring external APIs.
 */
function generateRuleBasedInsights(activities) {
    const insights = [];

    if (!activities || activities.length === 0) {
        return "No activity data available yet. Start coding and come back to see personalized insights!";
    }

    // --- 1. Activity Volume Analysis ---
    const totalActivities = activities.length;
    if (totalActivities > 20) {
        insights.push("🔥 You've been incredibly active! Consistency is the key to mastery — keep this momentum going.");
    } else if (totalActivities > 10) {
        insights.push("👍 Good activity level. Try to push a few more commits or solve 1-2 more problems daily to accelerate growth.");
    } else {
        insights.push("📈 Your activity is on the lighter side. Aim for at least 1 commit or 1 problem solved per day to build a strong habit.");
    }

    // --- 2. Event Type Distribution ---
    const typeCounts = {};
    activities.forEach(a => {
        const t = a.type || 'Unknown';
        typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    const types = Object.keys(typeCounts);
    const pushCount = typeCounts['PushEvent'] || 0;
    const prCount = typeCounts['PullRequestEvent'] || 0;
    const issueCount = typeCounts['IssuesEvent'] || 0;
    const createCount = typeCounts['CreateEvent'] || 0;

    if (pushCount > 0 && prCount === 0) {
        insights.push("💡 You're pushing code but not opening Pull Requests. PRs are essential for code review skills — try contributing to open-source projects.");
    }
    if (prCount > 3) {
        insights.push("🤝 Great collaboration! You're actively participating in code reviews through Pull Requests.");
    }
    if (issueCount > 2) {
        insights.push("🐛 Active issue tracker — this shows strong project management awareness.");
    }
    if (createCount > 3) {
        insights.push("🚀 You're creating multiple repositories. Make sure to follow through and develop them rather than starting too many at once.");
    }

    // --- 3. Repository Diversity ---
    const repos = new Set();
    activities.forEach(a => {
        if (a.repoName && a.repoName !== 'Unknown') {
            repos.add(a.repoName);
        }
    });

    if (repos.size > 5) {
        insights.push("🌐 You work across " + repos.size + " repositories — great breadth! Consider deepening expertise in 2-3 key projects.");
    } else if (repos.size >= 2) {
        insights.push("📂 You're working on " + repos.size + " repos. This is a healthy balance between focus and exploration.");
    } else if (repos.size === 1) {
        insights.push("🎯 You're very focused on a single repository. Consider exploring other projects to broaden your skills.");
    }

    // --- 4. Consistency Check (timestamps) ---
    const dates = new Set();
    activities.forEach(a => {
        if (a.timestamp) {
            dates.add(new Date(a.timestamp).toLocaleDateString());
        }
    });

    if (dates.size >= 5) {
        insights.push("✅ Active on " + dates.size + " different days — excellent consistency! Daily coding practice is the #1 predictor of skill growth.");
    } else if (dates.size >= 2) {
        insights.push("📅 Active on " + dates.size + " days. Try to code every day, even if it's just 15 minutes, to build muscle memory.");
    }

    // --- 5. Practice Platform Analysis ---
    const practiceActivities = activities.filter(a => a.platform !== 'GitHub');
    const githubActivities = activities.filter(a => a.platform === 'GitHub');

    if (practiceActivities.length === 0 && githubActivities.length > 5) {
        insights.push("⚡ You're building projects but not solving algorithmic problems. Practice platforms like LeetCode or HackerRank can sharpen your problem-solving skills for interviews.");
    }
    if (practiceActivities.length > 5) {
        insights.push("🧠 Great problem-solving practice! Make sure to also apply these skills in real projects on GitHub.");
    }

    // --- 6. Personalized Recommendation ---
    const recommendations = [
        "📚 Recommendation: Try contributing to an open-source project this week — it's the fastest way to learn from experienced developers.",
        "🎯 Recommendation: Set a weekly goal of 5 commits and 3 problems solved to maintain steady growth.",
        "💻 Recommendation: Write a README.md for your most recent project — documentation skills are highly valued by employers.",
        "🔄 Recommendation: Review someone else's code on GitHub. Teaching and reviewing accelerates your own learning.",
        "🏗️ Recommendation: Try building a full-stack project with a technology you haven't used before to expand your skill set."
    ];

    insights.push(recommendations[Math.floor(Math.random() * recommendations.length)]);

    return insights.join("\n\n");
}

/**
 * Main insight generation function.
 * Uses Groq if a valid key is configured, otherwise falls back to rule-based analytics.
 */
export async function generateInsights(activities) {
    // Check if Groq key is configured
    const apiKey = process.env.GROQ_API_KEY;
    const hasValidKey = apiKey &&
        apiKey.length > 10 &&
        !apiKey.includes('your_') &&
        !apiKey.includes('placeholder');

    if (!hasValidKey) {
        return generateRuleBasedInsights(activities);
    }

    // Try Groq, fall back to rule-based on any error
    try {
        const groq = new Groq({ apiKey });

        const summary = activities
            .slice(0, 15)
            .map(a => `${a.type} on ${a.repoName || 'unknown'}`)
            .join(', ');

        const prompt = `You are a developer career coach. Analyze this developer's recent activity: "${summary}". 
    Provide 3 short, specific, actionable insights about:
    1. Their coding consistency
    2. Their skill areas (based on repo names/activity types)
    3. One recommendation for improvement
    Keep each point under 30 words. Use emojis.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            max_tokens: 200,
        });
        return chatCompletion.choices[0].message.content;
    } catch (err) {
        console.error("Groq Error (falling back to rule-based):", err.message);
        return generateRuleBasedInsights(activities);
    }
}
