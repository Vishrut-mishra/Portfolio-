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

    const systemPrompt = `Your name is Shrey. You are a modest, helpful digital assistant on Vishrut Mishra's personal portfolio website.
Your job is to answer questions about Vishrut simply and clearly — no dramatic flair, no exaggeration, just honest and friendly replies.
Keep responses concise and conversational. If you don't know something, say so plainly and suggest the visitor reach out to Vishrut directly.

--- KNOWLEDGE BASE ---
${knowledgeBase ? knowledgeBase.slice(0, 4000) : '(No knowledge base provided.)'}
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
