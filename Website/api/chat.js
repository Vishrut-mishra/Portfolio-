/**
 * api/chat.js — Vercel Serverless Function
 *
 * Vercel automatically maps this file to the /api/chat endpoint.
 * This handles OpenAI calls in production while server.js continues
 * to work for local development.
 *
 * Required env variable in Vercel Dashboard:
 *   OPENAI_API_KEY = your OpenAI key
 */

const { OpenAI } = require('openai');

// Simple in-memory rate limit (per-lambda, resets on cold start)
const ipRequestCounts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 20;

function isRateLimited(ip) {
    const now = Date.now();
    const entry = ipRequestCounts.get(ip);

    if (!entry || now - entry.start > WINDOW_MS) {
        ipRequestCounts.set(ip, { count: 1, start: now });
        return false;
    }

    if (entry.count >= MAX_REQUESTS) return true;

    entry.count++;
    return false;
}

module.exports = async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    // ── Security headers ────────────────────────────────────────────────────
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // ── Rate limiting ───────────────────────────────────────────────────────
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    if (isRateLimited(ip)) {
        return res.status(429).json({
            error: 'Too many requests. Please wait a few minutes and try again.',
        });
    }

    // ── Input validation ────────────────────────────────────────────────────
    const { message, knowledgeBase } = req.body || {};

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'A valid message is required.' });
    }
    if (message.length > 500) {
        return res.status(400).json({ error: 'Message is too long (max 500 characters).' });
    }

    // ── Check API key ───────────────────────────────────────────────────────
    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY is not set in Vercel environment variables.');
        return res.status(500).json({ error: 'Server configuration error. Please contact Vishrut.' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `Your name is Shrey. You are Vishrut Mishra's digital assistant on his personal portfolio website.

PERSONALITY & TONE RULES:
- Be professional, warm, and conversational at all times.
- Keep every answer under 50 words by default — save tokens. Only go into more detail if the visitor explicitly asks for more.
- Never exceed 200 words in a single reply, even if asked for detail.
- If someone asks about Vishrut's skills in general, don't list everything — instead redirect them to the specific project they might be most interested in.
- If someone is being playful, sarcastic, or teasing (e.g. asking how many girlfriends Vishrut has), respond with light, dry wit and humour — for example: "Hard to count." Keep it brief and move on professionally.
- If someone says something inappropriate or disrespectful, respond with a clever, composed retort and redirect to professional topics.
- If someone asks for personal details that are not in the knowledge base, say: "I'm not authorised to share that — but feel free to reach out to Vishrut directly."
- If you don't know something, say so plainly and suggest the visitor contact Vishrut.
- Never exaggerate, never be dramatic. Just honest, sharp, and helpful.

--- KNOWLEDGE BASE ---
${knowledgeBase ? knowledgeBase.slice(0, 8000) : '(No knowledge base provided.)'}
--- END OF KNOWLEDGE BASE ---`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message },
            ],
            max_tokens: 400,
            temperature: 0.7,
        });

        const reply = completion.choices[0].message.content.trim();
        return res.status(200).json({ reply });

    } catch (error) {
        console.error('[OpenAI Error]', error.message);
        return res.status(error.status || 500).json({
            error: 'The AI service encountered an error. Please try again in a moment.',
        });
    }
};
