/**
 * MAW Copilot — Serverless API Proxy
 * Vercel: deploys automatically as /api/chat
 * Netlify: place this file in /netlify/functions/chat.js instead
 *          (see README for Netlify-specific instructions)
 *
 * This file keeps your ANTHROPIC_API_KEY server-side.
 * It NEVER appears in the browser bundle.
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Optional: password gate — set SITE_PASSWORD env var to enable
  const sitePassword = process.env.SITE_PASSWORD
  if (sitePassword) {
    const authHeader = req.headers['x-site-password']
    if (authHeader !== sitePassword) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('Proxy error:', err)
    return res.status(500).json({ error: 'Proxy request failed', detail: err.message })
  }
}
