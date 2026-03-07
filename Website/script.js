document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatboxContainer = document.getElementById('ai-chatbox');
    const navChatTrigger = document.getElementById('nav-chat-trigger');
    const closeChatBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');

    // State
    let knowledgeBase = {};
    let isChatOpen = false;

    // 1. Fetch and Parse Knowledge Base
    async function initKnowledgeBase() {
        try {
            const response = await fetch('vishrut_knowledge.txt');
            if (!response.ok) throw new Error('Failed to load knowledge base');
            const text = await response.text();
            parseKnowledge(text);
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            addMessage('System', 'Error: Could not load Vishrut\'s knowledge base. Please try again later.');
        }
    }

    function parseKnowledge(text) {
        // Split by section headers roughly
        const sections = text.split('[');
        sections.forEach(section => {
            if (!section.trim()) return;

            const closeBracketIndex = section.indexOf(']');
            if (closeBracketIndex === -1) return;

            const title = section.substring(0, closeBracketIndex).trim().toUpperCase();
            const content = section.substring(closeBracketIndex + 1).trim();

            knowledgeBase[title] = content;
        });
        console.log('Knowledge Base Loaded:', Object.keys(knowledgeBase));
    }

    // 2. Chatbox UI Logic
    function toggleChat(e) {
        if (e) e.preventDefault();
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatboxContainer.classList.remove('hidden');
            userInput.focus();
        } else {
            chatboxContainer.classList.add('hidden');
        }
    }

    navChatTrigger.addEventListener('click', toggleChat);
    closeChatBtn.addEventListener('click', toggleChat);

    // 3. Messaging Logic
    function addMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.classList.add(sender === 'User' ? 'user-message' : 'ai-message');
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function processUserMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage('User', text);
        userInput.value = '';

        // Show a loading indicator while we wait for the AI
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'ai-message', 'loading-msg');
        loadingDiv.textContent = '...';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    knowledgeBase: getKnowledgeBaseText(),
                }),
            });

            const data = await response.json();
            loadingDiv.remove();

            if (data.reply) {
                addMessage('AI', data.reply);
            } else {
                addMessage('AI', data.error || 'Sorry, something went wrong. Please try again.');
            }
        } catch (err) {
            loadingDiv.remove();
            console.error('Chat error:', err);
            addMessage('AI', 'Could not reach the server. Make sure server.js is running.');
        }
    }

    // Returns the full knowledge base as a single string for the AI system prompt
    function getKnowledgeBaseText() {
        return Object.entries(knowledgeBase)
            .map(([key, value]) => `[${key}]\n${value}`)
            .join('\n\n');
    }

    // generateResponse() has been replaced by the async /api/chat backend call above.
    // The server (server.js) handles all OpenAI communication securely.

    // Event Listeners for Input
    sendBtn.addEventListener('click', processUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processUserMessage();
    });

    // 4. Scroll Reveal Animation
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, {
            root: null,
            threshold: 0.15, // Trigger when 15% of element is visible
            rootMargin: "0px"
        });

        reveals.forEach(reveal => revealObserver.observe(reveal));
    }

    // 5. Modal Logic
    const modal = document.getElementById('project-modal');
    const modalContent = document.querySelector('.modal-content');
    const modalBody = document.querySelector('.modal-body');
    const closeModal = document.querySelector('.close-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCategory = document.getElementById('modal-category');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');

    // Data for the specific blog post
    const prisonersText = `"Reading Prisoners of Geography is like finally obtaining the schematic diagram for the world's most complex machine. For a mind driven by the "how" and "why" of global systems, the experience feels less like reading a history book and more like a high-level diagnostic briefing on the fundamental engine of the global market. Coming from an engineering background, there is a profound intellectual satisfaction in seeing how physical constraints—mountains, rivers, and sea lanes—dictate the "flow" of power and trade with almost mathematical predictability. It feels empowering to look at a standard map and suddenly see the invisible walls and corridors that have guided human ambition for centuries. While my studies at emlyon focus on digital strategy, this book provides the heavy, physical anchor those markets sit upon. It validates my approach as an "AI-native" learner: I am not just studying subjects, I am decoding the physical mechanics of the 21st-century world."`;

    const vibeText = `Vibe Coding — Building This Portfolio

Vibe Coding is not about writing code from scratch. It is about knowing what to build, why it matters, and directing AI to build it well.

My Industrial Design background from NIT Rourkela gave me the foundation: visual hierarchy, colour theory, grid systems, and user-centred thinking. I brought that as the creative director — deciding what the site should feel like and how each section should communicate.

File Structure & Architecture:
Understood how a web project is organised — how modules connect, how static and dynamic files relate, and how a Node.js backend serves frontend assets.

GitHub Synchronisation:
Learned version control through consistent commits — staging changes, pushing to remote, and maintaining a clean project history.

Vercel Deployment:
Connected the GitHub repository to Vercel for automated deployment. Configured environment variables, serverless functions (api/chat.js), and routing so the live site matches local development.

AI Chatbox (Shrey):
Directed the build of a secure backend using Node.js and the OpenAI API — protected by Helmet headers, rate-limited, and trained via a custom knowledge base.

The Logo & Design:
Created in Figma using four years of Industrial Design training as the foundation — minimal, editorial, intentional.

The Lesson:
The most valuable skill is not syntax. It is knowing what to build and guiding AI to build it well. That is Vibe Coding.`;

    const storeSalesText = `Store Sales Time Series Forecasting (2025)

Goal: Forecast daily sales across 54 store locations to maximise supply chain efficiency for Corporación Favorita, a major Ecuadorian retailer. This Time-Series challenge involves predicting demand for thousands of product families by integrating multiple external variables.

Technical Methodology

Data Integration: Used Pandas left-joins to merge the primary transaction ledger with secondary datasets (holidays, stores, and oil prices), ensuring data integrity across temporal and geographical keys.

Feature Engineering: Created "Temporal Features" to capture behavioural patterns — including Lag Features and a Payday Effect encoding to account for autocorrelation in retail sales.

Missing Value Strategy: Applied forward-fill imputation for the Oil Price index, bridging the gap between the 5-day stock market cycle and the 7-day retail cycle to prevent data leaks.

Model & Approach: Used gradient-boosted decision trees (XGBoost) to capture non-linear relationships between economic changes and consumer spending. Validated with a Time-Series Split to ensure the model learned genuine predictive patterns rather than memorising historical noise.

Business Impact: The finished model delivers a data-driven inventory management framework — reducing stockouts and waste. The analysis pinpoints the precise effect of oil price volatility on purchasing power, providing actionable insights for strategic planning in emerging markets.`;

    const recoveryText = `Assistant Manager: Patriot Schools, Unnao, India · July 2024 - Present

Growth Strategy & Design:
Orchestrated regional marketing and outreach by leveraging demographic mapping to identify high-potential residential zones, while managing the creative design of all school prospectuses and branding materials.

Stakeholder & Data Management:
Directed branch operations and guardian communications to ensure high responsiveness, while developing recovery strategies for fee-structure defaults based on internal data trend analysis.

Academic and operations Coordinator: Patriot Schools, Unnao, India · July 2023 - June 2024

Instructional Delivery:
Applied quantitative reasoning to deliver Mathematics and Physics instruction for secondary students, maintaining high academic standards during the branch’s foundational year.

Process Optimization:
Managed daily administrative workflows and optimized classroom scheduling to increase internal resource utilization and streamline foundational operations.`;

    const aeroText = `Vice - President, Udaan Technical Club — NIT Rourkela
July 2021 – June 2022

The Beginning:
Udaan has been one of the most adorable experiences of Vishrut's life. He started as a member in 2019 when the club had fewer than 10 active members. They were new, enthusiastic, and figuring things out — until COVID hit.

Learning Through the Lockdown:
They didn't stop. During COVID, Vishrut taught himself 3D printing and started making aircraft components and DIY planes at home. When they returned to campus, they came back stronger.

    Competitions & Wins:
The club went on to win aeromodelling competitions at IIT Kanpur and IIT BHU — two of India's most prestigious engineering institutions. They also organised RC plane events at NIT Rourkela's Innovision tech fest, drawing 100 + participants.

Leading the Club:
Vishrut rose to Vice - President.By then, the club had grown from under 10 to over 30 active members.They introduced 3D printing to cut production costs by ~80 %, ran workshops, and established a knowledge - sharing partnership with IIT Bhubaneswar.

The Lasting Impact:
The trajectory they built hasn't come down since. The club is still growing — bigger and more successful with time. Vishrut is proud of what they built together: not just planes, but a community.`;

    // ── Helper: render text with section headings bold ────────────────────
    function renderText(text) {
        return text.split('\n').map(line => {
            if (line.match(/^[A-Z][^a-z]*:$/) || line.match(/^[A-Z].+:$/)) {
                return `<p style="font-weight:700;color:#f8f8f8;margin:16px 0 4px;">${line}</p>`;
            }
            return line === '' ? '<br>' : `<p style="margin:0 0 6px;color:#ccc;font-size:1rem;line-height:1.7;">${line}</p>`;
        }).join('');
    }

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const dataType = card.getAttribute('data-type');
            const title = card.querySelector('.project-title').innerText;
            const category = card.querySelector('.project-category').innerText;

            modalTitle.innerText = title;
            modalCategory.innerText = category;

            // Always clean up layout first
            modalBody.classList.remove('blog-layout');
            modalImg.src = '';

            if (dataType === 'blog') {
                // Prisoners — book cover works great as a sidebar
                modalBody.classList.add('blog-layout');
                modalImg.src = 'Prisoners.jpg';
                modalDesc.innerText = prisonersText;

            } else if (dataType === 'ml') {
                // Store Sales — text only
                modalDesc.innerHTML = renderText(storeSalesText);

            } else if (dataType === 'recovery') {
                // Assistant Manager — text only
                modalDesc.innerHTML = renderText(recoveryText);

            } else if (dataType === 'aero') {
                // Aeromodelling — Udaan1.png floats right, text wraps, caption below image
                modalDesc.innerHTML = `
                    <figure style="float:right;width:44%;margin:4px 0 16px 20px;text-align:center;">
                        <img src="Udaan1.png" alt="Custom-built RC Aircraft"
                             style="width:100%;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.4);">
                        <figcaption style="font-size:0.72rem;color:#7B7B7B;font-style:italic;margin-top:6px;">
                            Project Showcase: Custom-built RC Aircraft
                        </figcaption>
                    </figure>
                    ${renderText(aeroText)}
                    <div style="clear:both;"></div>`;

            } else if (dataType === 'vibe') {
                // Vibe Coding — text only
                modalDesc.innerHTML = renderText(vibeText);

            } else {
                modalDesc.innerHTML = '';
            }

            // Show Modal — requestAnimationFrame for zero-lag paint
            modal.style.display = 'flex';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => modal.classList.add('show'));
            });
        });
    });


    // Close Modal
    function closeModalFunc() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Wait for transition
    }

    closeModal.addEventListener('click', closeModalFunc);

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModalFunc();
        }
    });

    // Initialize
    initKnowledgeBase();
    initScrollReveal();
});
