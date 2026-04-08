# CodePulse — Developer Analytics Platform

A unified coding analytics dashboard with role-based access for students, teachers, and admins.

## Features

- **3 Roles**: Admin, Teacher, Student with separate dashboards
- **Platform integrations**: GitHub, LeetCode, Codeforces, GeeksForGeeks
- **AI-powered insights**: Skill radar, DSA analysis, company match scores
- **Teacher remarks**: Teachers can post feedback on student profiles
- **Admin panel**: Full user management and platform overview
- **Dark developer theme**: JetBrains Mono, icon-first UI

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your MongoDB URI, JWT secret, etc.
```

### 3. Run in development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Roles

| Role | Can Do |
|------|--------|
| **Admin** | View all users, stats, platform activity |
| **Teacher** | View all students, their profiles, post/delete remarks |
| **Student** | View own dashboard, sync platform data, read remarks |

## Deployment

See [DEPLOY.md](./DEPLOY.md) for a full step-by-step deployment guide (MongoDB Atlas + Vercel).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT via HTTP-only cookies
- **UI**: Custom CSS, Lucide icons, JetBrains Mono font
- **Charts**: Recharts, Chart.js
