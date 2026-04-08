# CodePulse – Cursor Implementation Instructions

You are working on **CodePulse**, an AI-driven developer activity tracking platform built with Next.js (App Router), MongoDB/Mongoose, and custom JWT auth. The codebase already has:

- ✅ User schema (`User.js`) and Activity schema (`Activity.js`)
- ✅ JWT auth (`lib/auth.js`) with `signToken`, `getTokenFromRequest`, `getAuthUser`
- ✅ MongoDB cached connection (`lib/db.js`)
- ✅ GitHub data fetching via Octokit
- ✅ Groq insight generation (`lib/openai.js`) with rule-based fallback
- ✅ Skeleton components: `ActivityChart.js`, `SkillRadar.js`
- ✅ Docker setup for local dev

Do NOT rewrite working systems. Build only what is missing. Follow the task order exactly.

---

## SCRAPING STRATEGY — Read This Before Tasks 1–3

All platform data (LeetCode, Codeforces, CodeChef) is fetched by **web scraping the user's public profile page** using their username. We are NOT using APIs.

### Scraping Library: `cheerio` + `node-fetch`

Install if not present:

```bash
npm install cheerio node-fetch
```

Do NOT use Puppeteer or Playwright — they are too heavy for a serverless environment and will break on Vercel. Use `fetch` to get the raw HTML and `cheerio` to parse it, like jQuery on the server.

### Pattern every scraper must follow:

```js
import * as cheerio from "cheerio";

export async function fetchPlatformData(username) {
  try {
    const res = await fetch(`https://platform.com/u/${username}`, {
      headers: {
        // Always spoof a browser User-Agent or platforms will block the request
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout — don't hang forever
    });

    if (!res.ok) {
      console.error(`[Platform] HTTP ${res.status} for user: ${username}`);
      return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Parse what you need from $ here
    // Return the data object
  } catch (err) {
    console.error(`[Platform scrape failed] ${err.message}`);
    return null; // NEVER throw — always return null on failure
  }
}
```

**Critical rules for all scrapers:**

- Always return `null` on any failure — never throw
- Always set a 10s timeout via `AbortSignal.timeout(10000)`
- Always spoof the User-Agent header
- If the page structure changes and selectors return empty strings, return `null` gracefully
- Log every failure with a platform-prefixed message for easy debugging

---

## TASK 1 — LeetCode Scraper

### File: `lib/platforms.js`

Add `fetchLeetCodeData(username)`.

**Target URL:** `https://leetcode.com/u/${username}/`

LeetCode's profile page loads stats in the HTML. Use cheerio to find and extract:

**What to scrape:**

- Total problems solved — look for the element showing the cumulative count (a prominent number near "Solved")
- Easy / Medium / Hard breakdown — these appear as separate labeled counts on the profile
- Ranking — shown as a number with "Ranking" label

**Selector strategy:** Inspect `https://leetcode.com/u/anyuser/` in browser DevTools. The stats are in `<div>` elements with specific class names. Since LeetCode class names are obfuscated and change, use **text-based selection** as a fallback:

```js
// Example approach — find elements by their neighboring label text
// rather than relying on obfuscated class names
$("span").each((i, el) => {
  const text = $(el).text().trim();
  // Match patterns like "Easy\n120" or look for sibling/parent relationships
});
```

**Return shape:**

```js
{
  platform: 'leetcode',
  totalSolved: Number,
  easySolved: Number,
  mediumSolved: Number,
  hardSolved: Number,
  ranking: Number,
  fetchedAt: new Date(),
}
```

If any individual field can't be parsed, set it to `0` rather than returning `null` for the whole object — partial data is better than no data.

---

## TASK 2 — Codeforces Scraper

### File: `lib/platforms.js`

Add `fetchCodeforcesData(handle)`.

**Codeforces EXCEPTION — Use the official JSON API here:**

Codeforces actually has a clean, stable, public API that doesn't require a key and doesn't block requests. Use it instead of scraping:

```
GET https://codeforces.com/api/user.info?handles={handle}
GET https://codeforces.com/api/user.rating?handle={handle}
```

Both endpoints return JSON directly. No browser User-Agent spoofing needed.

```js
export async function fetchCodeforcesData(handle) {
  try {
    const [infoRes, ratingRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${handle}`, {
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`https://codeforces.com/api/user.rating?handle=${handle}`, {
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    const infoData = await infoRes.json();
    const ratingData = await ratingRes.json();

    if (infoData.status !== "OK") return null;

    const user = infoData.result[0];
    const contests = ratingData.status === "OK" ? ratingData.result : [];

    return {
      platform: "codeforces",
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || "unrated",
      totalContests: contests.length,
      fetchedAt: new Date(),
    };
  } catch (err) {
    console.error(`[Codeforces fetch failed] ${err.message}`);
    return null;
  }
}
```

---

## TASK 3 — CodeChef Scraper

### File: `lib/platforms.js`

Add `fetchCodeChefData(username)`.

**Target URL:** `https://www.codechef.com/users/${username}`

**What to scrape:**

- Current rating — shown prominently on the profile as a number
- Stars / division — shown as star icons or text like "3★"
- Problems solved count — shown in the profile stats section
- Global rank — shown in the ratings section

**Selector strategy:** CodeChef's profile page is server-rendered, so cheerio works well here.

```js
// Rating is usually inside a element with class "rating" or similar
// Stars appear as text content — count ★ characters or find the rating header
// Problems solved is in a <section> with a heading like "Problems Solved"
```

**Return shape:**

```js
{
  platform: 'codechef',
  rating: Number,
  stars: Number,        // integer 1-7
  problemsSolved: Number,
  globalRank: Number,
  fetchedAt: new Date(),
}
```

Same error handling as all other scrapers.

---

## TASK 4 — Update `fetchAllPlatformData` in `lib/platforms.js`

Replace any synchronous sequential calls with `Promise.allSettled()` so one platform failure doesn't block others.

```js
export async function fetchAllPlatformData(user) {
  const results = await Promise.allSettled([
    fetchGitHubData(user.githubUsername),
    fetchLeetCodeData(user.leetcodeUsername),
    fetchCodeforcesData(user.codeforcesHandle),
    fetchCodeChefData(user.codechefUsername),
  ]);

  const [github, leetcode, codeforces, codechef] = results.map((r) =>
    r.status === "fulfilled" ? r.value : null,
  );

  return { github, leetcode, codeforces, codechef };
}
```

In `POST /api/profile`, after calling `fetchAllPlatformData`, update **only the fields that are non-null**. Do not overwrite cached data with null if a fetch failed. Use MongoDB's `$set` with conditional spreading:

```js
const updateFields = {};
if (data.leetcode) updateFields.leetcodeStats = data.leetcode;
if (data.codeforces) updateFields.codeforcesStats = data.codeforces;
if (data.codechef) updateFields.codechefStats = data.codechef;
if (data.github) updateFields.githubStats = data.github;
updateFields.lastSyncedAt = new Date();

await User.findByIdAndUpdate(user._id, { $set: updateFields });
```

---

## TASK 4B — Update User Schema for New Platform Fields

### File: `models/User.js`

Add these fields to the User schema if they don't already exist:

```js
leetcodeUsername: { type: String, default: '' },
codeforcesHandle: { type: String, default: '' },
codechefUsername: { type: String, default: '' },

leetcodeStats: {
  totalSolved: { type: Number, default: 0 },
  easySolved: { type: Number, default: 0 },
  mediumSolved: { type: Number, default: 0 },
  hardSolved: { type: Number, default: 0 },
  ranking: { type: Number, default: 0 },
  fetchedAt: Date,
},

codeforcesStats: {
  rating: { type: Number, default: 0 },
  maxRating: { type: Number, default: 0 },
  rank: { type: String, default: 'unrated' },
  totalContests: { type: Number, default: 0 },
  fetchedAt: Date,
},

codechefStats: {
  rating: { type: Number, default: 0 },
  stars: { type: Number, default: 0 },
  problemsSolved: { type: Number, default: 0 },
  globalRank: { type: Number, default: 0 },
  fetchedAt: Date,
},
```

---

## TASK 5 — Manual DSA Problem Logging

### File: `app/api/dsa/route.js` (create this file)

**POST /api/dsa** — Log a manually solved problem

Authenticate using `getAuthUser(request)`. If no user, return 401.

Accept this request body:

```json
{
  "problemName": "Two Sum",
  "platform": "offline",
  "difficulty": "easy",
  "topic": "arrays",
  "notes": "Used hashmap approach"
}
```

Create a new `Activity` document:

```js
{
  userId: user._id,
  type: 'dsa_manual',
  platform: body.platform || 'offline',
  problemName: body.problemName,
  difficulty: body.difficulty,
  topic: body.topic,
  notes: body.notes,
  timestamp: new Date(),
}
```

Return the saved document with status 201.

**GET /api/dsa** — Fetch user's manually logged problems

Authenticate. Return all Activity documents where `userId = user._id` and `type = 'dsa_manual'`, sorted by `timestamp` descending. Limit to 50.

---

## TASK 6 — Update Activity Schema

### File: `models/Activity.js`

Add these fields if missing:

```js
problemName: { type: String },
difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'unknown'], default: 'unknown' },
topic: { type: String },
notes: { type: String },
```

---

## TASK 7 — Wire Up ActivityChart Component

### File: `components/ActivityChart.js`

This component must fetch from `GET /api/activities` and render a GitHub-style contribution heatmap using `react-calendar-heatmap`.

Install if not present: `npm install react-calendar-heatmap`

Implementation requirements:

1. On mount, fetch `/api/activities` with credentials included (cookie auth).
2. Transform the response into the format `react-calendar-heatmap` expects:
   ```js
   [{ date: '2025-04-01', count: 3 }, ...]
   ```
   Group activities by date (use `timestamp` field), count per day.
3. Show a loading skeleton while fetching.
4. Show an empty state message if no data: "No activity yet. Sync your profiles to get started."
5. Color scale: 0 = grey, 1-2 = light green, 3-5 = medium green, 6+ = dark green.
6. Tooltip on hover showing date and count.

---

## TASK 8 — Wire Up SkillRadar Component

### File: `components/SkillRadar.js`

This component renders a radar chart of skill distribution using `recharts`.

Install if not present: `npm install recharts` (likely already installed).

Implementation requirements:

1. Accept a `skills` prop with this shape:
   ```js
   [
     { subject: "Arrays", score: 70 },
     { subject: "Trees", score: 45 },
     { subject: "DP", score: 30 },
     { subject: "Graphs", score: 55 },
     { subject: "Strings", score: 80 },
   ];
   ```
2. If no `skills` prop is passed, derive it from the user's DSA activity log by counting problems per topic.
3. Use `recharts` `RadarChart` with `PolarGrid`, `PolarAngleAxis`, and `Radar` components.
4. Make it responsive using `ResponsiveContainer`.
5. Show a placeholder message if there's no data to display.

---

## TASK 9 — Profile Settings UI for Platform Usernames

### File: `components/ProfileSettings.js` (create or update)

Add input fields for:

- LeetCode username
- Codeforces handle
- CodeChef username

On save, send a `PUT /api/profile` request with the updated usernames. Show a success toast on save. Show validation: usernames should be alphanumeric with underscores/hyphens only, max 50 chars.

In `PUT /api/profile` API route, ensure `leetcodeUsername`, `codeforcesHandle`, and `codechefUsername` are accepted and saved to the User document.

---

## TASK 10 — Manual DSA Logging UI

### File: `components/DSALogger.js` (create this file)

A simple form component with these fields:

- Problem Name (text input, required)
- Platform (select: LeetCode, Codeforces, GeeksforGeeks, HackerRank, Offline, Other)
- Difficulty (select: Easy, Medium, Hard)
- Topic (select: Arrays, Strings, Trees, Graphs, DP, Recursion, Sorting, Hashing, Other)
- Notes (textarea, optional)
- Submit button

On submit:

1. POST to `/api/dsa` with the form data.
2. On success, show a success message and reset the form.
3. On error, show the error message.
4. Below the form, render a table of the last 10 manually logged problems fetched from `GET /api/dsa`.

---

## TASK 11 — Cloud Deployment Setup

### File: `.env.example` (create this file)

Document all required environment variables:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/codepulse
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_key_here
GITHUB_TOKEN=optional_for_higher_rate_limits
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### File: `README.md` (update or create)

Add a deployment section with these exact steps:

1. Create a free MongoDB Atlas cluster at mongodb.com/atlas
2. Whitelist all IPs (0.0.0.0/0) in Atlas Network Access for Vercel compatibility
3. Get the connection string and set as `MONGODB_URI`
4. Deploy to Vercel: connect GitHub repo, add all env vars from `.env.example`
5. Set `NEXT_PUBLIC_APP_URL` to the Vercel deployment URL

---

## TASK 12 — Basic Test Cases (Jest)

Install: `npm install --save-dev jest @testing-library/react @testing-library/jest-dom`

### File: `__tests__/auth.test.js`

Write unit tests for `lib/auth.js`:

```js
// Test 1: signToken returns a string
// Test 2: A token signed with signToken can be verified and contains correct userId
// Test 3: An expired or tampered token should fail verification
// Test 4: getAuthUser returns null if no token in request headers
```

### File: `__tests__/insights.test.js`

Write unit tests for the rule-based fallback in `lib/openai.js`:

```js
// Test 1: Returns a string when Groq key is missing
// Test 2: Output contains at least one recommendation when activity array is non-empty
// Test 3: Handles empty activity array without throwing
// Test 4: Output is different for a user with 0 activity vs 20 activities
```

Add to `package.json`:

```json
"scripts": {
  "test": "jest"
}
```

---

## GENERAL RULES FOR CURSOR

1. **Never touch working auth logic** in `lib/auth.js` unless a task explicitly says to.
2. **Never rewrite `lib/db.js`** — the cached connection pattern is correct.
3. **All new API routes** must call `getAuthUser(request)` first and return 401 if null.
4. **All platform fetchers** must be wrapped in try/catch and return null on failure — never throw.
5. **Use `Promise.allSettled`** not `Promise.all` for any concurrent platform fetching.
6. **Do not add new dependencies** without checking if an equivalent already exists in `package.json`.
7. When a task says "if not already present" — check the existing schema/file first before adding.
8. Maintain the existing standardized Activity document shape: `{ _id, type, platform, timestamp }` — only add fields, never remove or rename existing ones.
9. All dates must be stored as `Date` objects in MongoDB, not strings.
10. API responses must always be JSON. Use `NextResponse.json()` for all responses.

---

## TASK ORDER (Do in this sequence)

1. Task 4B — Schema updates (foundation for everything else)
2. Task 1 — LeetCode scraper
3. Task 2 — Codeforces fetcher (JSON API)
4. Task 3 — CodeChef scraper
5. Task 4 — `fetchAllPlatformData` with `Promise.allSettled`
6. Task 6 — Activity schema update
7. Task 5 — DSA manual logging API
8. Task 9 — Profile settings UI (platform usernames)
9. Task 10 — DSA Logger UI
10. Task 7 — Wire up ActivityChart
11. Task 8 — Wire up SkillRadar
12. Task 11 — Deployment setup files
13. Task 12 — Tests
