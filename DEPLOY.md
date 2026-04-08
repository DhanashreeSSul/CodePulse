# CodePulse — Deployment Guide

This guide walks you through deploying CodePulse (Next.js + MongoDB) from scratch.
No prior deployment experience required.

---

## What You'll Need

- A [MongoDB Atlas](https://cloud.mongodb.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- Your project files (this folder)
- A [GitHub](https://github.com) account (to connect with Vercel)

---

## Step 1 — Set Up MongoDB Atlas (your database)

1. Go to **https://cloud.mongodb.com** and sign up or log in.
2. Click **"Build a Database"** → choose **Free (M0)** tier → choose a region close to you.
3. Set up a username and password (save these somewhere safe!).
4. Under **"Network Access"**, click **"Add IP Address"** → choose **"Allow access from anywhere"** (0.0.0.0/0) for now.
5. Go to **"Database"** → click **"Connect"** on your cluster → choose **"Drivers"**.
6. Copy the connection string, it looks like:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password, and add your database name:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/codepulse?retryWrites=true&w=majority
   ```
   Save this — you'll need it as `MONGODB_URI`.

---

## Step 2 — Push Your Code to GitHub

1. Create a new repository on GitHub (https://github.com/new).
   - Name it `codepulse` or whatever you prefer.
   - Keep it **Private** if you don't want it public.
   - Do **not** add a README (your project already has one).

2. Open a terminal in your project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

---

## Step 3 — Deploy on Vercel

1. Go to **https://vercel.com** and sign up with your GitHub account.
2. Click **"Add New Project"**.
3. Click **"Import"** next to your GitHub repo.
4. Vercel will detect it as a Next.js project automatically.
5. **Before clicking Deploy**, click **"Environment Variables"** and add these:

   | Name | Value |
   |------|-------|
   | `MONGODB_URI` | Your Atlas connection string from Step 1 |
   | `JWT_SECRET` | Any long random string, e.g. `my-super-secret-key-2026-codepulse` |
   | `GITHUB_TOKEN` | (Optional) GitHub personal access token for better API rate limits |
   | `OPENAI_API_KEY` | (Optional) Your OpenAI or Groq API key for AI insights |
   | `NEXT_PUBLIC_APP_URL` | Leave blank for now — Vercel will set the URL |

6. Click **Deploy**.
7. Wait ~2 minutes. Vercel will give you a live URL like `codepulse-xxxx.vercel.app`.

---

## Step 4 — Test Your Live Deployment

1. Visit your Vercel URL.
2. Click **Get Started** → Register as **Admin** first (so you have one admin account).
3. Register another account as **Teacher**.
4. Register another as **Student**.
5. Log in as Student → go to **Profile** → add your GitHub/LeetCode usernames → Save.
6. Go to **Dashboard** → click **Sync**.
7. Log in as Teacher → see the student, view stats, post a remark.
8. Log in as Admin → see all users on the admin panel.

---

## Step 5 — (Optional) Custom Domain

1. In Vercel dashboard → go to your project → **Settings → Domains**.
2. Add your custom domain (e.g. `codepulse.yourdomain.com`).
3. Follow Vercel's DNS instructions.

---

## Creating the First Admin

The registration page lets anyone register as admin by selecting the "Admin" tab.
In production, you may want to lock this down. To do so:

1. Register your admin account now.
2. In `app/api/auth/register/route.js`, change the role validation to only allow `teacher` and `student` from the form:
   ```js
   const userRole = role === 'teacher' ? 'teacher' : 'student';
   ```
3. To promote someone to admin, do it directly in MongoDB Atlas → browse your `users` collection → update their `role` field to `"admin"`.

---

## Re-Deploying After Changes

If you make code changes:

```bash
git add .
git commit -m "your change message"
git push
```

Vercel automatically detects the push and re-deploys. Takes about 1-2 minutes.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongooseServerSelectionError` | Check your `MONGODB_URI` is correct and IP access is allowed in Atlas |
| Blank page after login | Check browser console for errors, verify `JWT_SECRET` is set |
| Sync doesn't work | Add your `GITHUB_TOKEN` and `OPENAI_API_KEY` env variables |
| 500 errors | Check Vercel → Functions tab for error logs |

