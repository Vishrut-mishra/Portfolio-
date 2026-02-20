/**
 * server.js — Secure backend bridge for VM AI Chatbox
 *
 * Security layers:
 *   1. API key in .env only — never sent to the browser
 *   2. Helmet — sets hardened HTTP security headers
 *   3. Rate limiter — 20 requests / 15 min per IP (blocks quota drain attacks)
 *   4. Input validation — rejects missing/oversized messages before hitting OpenAI
 *   5. Static file serving — browser talks only to this server, never OpenAI directly
 *
 * Run:  node server.js
 * URL:  http://localhost:3000
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');

// ── Validate that the key is actually loaded ────────────────────────────────
if (!process.env.OPENAI_API_KEY) {
    console.error('❌  OPENAI_API_KEY is missing from .env. Exiting.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Security: HTTP headers ─────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Disabled so CDN fonts/Google Fonts still load
}));

// ── Security: Rate limiting ────────────────────────────────────────────────
// Each IP gets a maximum of 20 chat requests per 15-minute window.
// This prevents quota drain even if someone finds your URL.
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 20,                    // max 20 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a few minutes and try again.' },
});

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '16kb' }));   // Hard cap on request body size
app.use(express.static(path.join(__dirname)));  // Serve index.html, css, images…

// ── POST /api/chat ──────────────────────────────────────────────────────────
app.post('/api/chat', chatLimiter, async (req, res) => {
    const { message, knowledgeBase } = req.body;

    // ── Input validation ────────────────────────────────────────────────────
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'A valid message is required.' });
    }
    if (message.length > 500) {
        return res.status(400).json({ error: 'Message is too long (max 500 characters).' });
    }

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
        res.json({ reply });

    } catch (error) {
        console.error('[OpenAI Error]', error.message);
        res.status(error.status || 500).json({
            error: 'The AI service encountered an error. Please try again in a moment.',
        });
    }
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n✅  VM AI Chatbox server → http://localhost:${PORT}`);
    console.log(`🔒  API key loaded from .env`);
    console.log(`🛡️  Rate limit: 20 requests / 15 min per IP`);
    console.log(`🪖  Helmet security headers active\n`);
});
