# MAW Copilot — Chapter Discovery Agent
### Deploy Guide: Vercel & Netlify

---

## What This Is

An AI-powered discovery tool that conducts a natural conversation with your installer, extracts all ~55 chapter configuration values, and generates fully-customized system prompts for all 14 Copilot Studio agents — ready to paste directly into Power Platform.

---

## Prerequisites

- A **GitHub account** (free)
- A **Vercel or Netlify account** (free tier works)
- An **Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com) → API Keys

---

## Deploy to Vercel (Recommended — ~5 minutes)

### Step 1: Push to GitHub

```bash
# In your terminal, from this folder:
git init
git add .
git commit -m "Initial commit — MAW Discovery Agent"

# Create a new GitHub repo at github.com/new (name it maw-copilot-discovery)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/maw-copilot-discovery.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Click **Import** next to your `maw-copilot-discovery` repo
3. Leave all build settings as-is (Vercel auto-detects Vite)
4. Click **Deploy** — your first deploy runs (it will fail — that's OK, you need the env var first)

### Step 3: Add Your API Key

1. In your Vercel project → **Settings** → **Environment Variables**
2. Add:
   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-your-key-here` |
   | `SITE_PASSWORD` | `yourpassword` *(optional but recommended)* |
3. Click **Save**

### Step 4: Redeploy

1. Go to **Deployments** tab → click the three dots on your latest deploy → **Redeploy**
2. Your app is now live at `https://your-project.vercel.app`

### Step 5: Test It

Open the URL. The discovery agent should load. Start a conversation. If it doesn't respond, check:
- Vercel → Functions tab → look for errors in the `/api/chat` function logs
- Confirm your API key is correct at [console.anthropic.com](https://console.anthropic.com)

---

## Deploy to Netlify

Netlify uses a slightly different serverless function format.

### Step 1: Adapt the API function for Netlify

Create `netlify/functions/chat.js` with this content:

```js
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sitePassword = process.env.SITE_PASSWORD;
  if (sitePassword) {
    const provided = JSON.parse(event.headers['x-site-password'] || '""');
    if (provided !== sitePassword) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: event.body,
  });

  const data = await response.text();
  return {
    statusCode: response.status,
    headers: { 'Content-Type': 'application/json' },
    body: data,
  };
};
```

Then update `src/App.jsx` — change `/api/chat` to `/.netlify/functions/chat`.

### Step 2: Add netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

### Step 3: Deploy

1. Push to GitHub (same as Vercel Step 1)
2. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Connect your repo, leave build settings as-is, click **Deploy**
4. Site Settings → **Environment variables** → add `ANTHROPIC_API_KEY` and optionally `SITE_PASSWORD`
5. **Trigger deploy** → live at `https://your-site.netlify.app`

---

## Optional: Password Gate

If `SITE_PASSWORD` is set in your environment variables, the app shows a password screen before the discovery agent loads. This keeps the tool installer-only without needing full authentication infrastructure.

To enable: add `SITE_PASSWORD=yourpassword` to Vercel/Netlify env vars. Share the password with your installers out-of-band (don't put it in the repo).

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file and add your key
cp .env.example .env.local
# Edit .env.local — add your ANTHROPIC_API_KEY

# Start dev server (runs Vite + proxies /api to Vercel dev functions)
npm run dev
# → Open http://localhost:5173
```

> **Note:** For local dev with Vercel functions, install the Vercel CLI:
> `npm i -g vercel` then run `vercel dev` instead of `npm run dev`.
> This correctly runs the `/api/chat.js` serverless function locally.

---

## File Structure

```
maw-copilot-discovery/
├── api/
│   └── chat.js          ← Serverless proxy (keeps API key server-side)
├── src/
│   ├── main.jsx         ← React entry point
│   └── App.jsx          ← The full discovery agent application
├── public/              ← Static assets (empty)
├── index.html           ← HTML shell
├── vite.config.js       ← Vite config with dev proxy
├── vercel.json          ← Vercel deployment config
├── package.json
├── .env.example         ← Copy to .env.local, never commit
├── .gitignore           ← Excludes .env files and node_modules
└── README.md            ← This file
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page after deploy | Check browser console — likely a build error. Run `npm run build` locally first. |
| "Unauthorized" error | Check `SITE_PASSWORD` env var matches what you're entering |
| "500 Internal Server Error" | API key missing or invalid — check Vercel → Settings → Environment Variables |
| AI not responding | Check Vercel → Functions → `/api/chat` logs for the specific error |
| Works locally, fails on Vercel | Env vars not saved — check Vercel dashboard and redeploy after saving |

---

## Updating the App

Any push to your `main` branch auto-deploys on both Vercel and Netlify. No manual steps needed after initial setup.

```bash
git add .
git commit -m "Update agent prompts"
git push
# → Deployed in ~30 seconds
```

---

*MAW Copilot Solution · Chapter Technology Program · v1.0*
