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

To create this website, I went back to first principles. I revised everything I knew about design from my bachelors — colour theory, visual hierarchy, grid systems — and combined it with a hands-on crash course in web development: HTML, CSS, JavaScript, and Node.js.

The Logo:
Designed from scratch in Figma. I chose a dark palette anchored by #222222 with a single accent red (#E50914) — minimal, editorial, intentional.

The AI Chatbox (Shrey):
Built a secure backend with Node.js and the OpenAI API, protected by Helmet headers and rate-limiting. Trained Shrey to respond in a specific tone — professional with a dry wit when the conversation calls for it.

Deployment & Security:
Connected multiple platforms to make the site live and hardened against basic attacks — environment variables, gitignored keys, serverless functions on Vercel.

The Bigger Lesson:
This project confirmed something I strongly believe: in this changing world, the most valuable skill is knowing how to use the tools AI provides and making them collaborate with each other. The website is built to grow — new blogs, new projects, new experiences. It is a living document, not a static PDF.

What I walked away with is not just a website. It is clarity on what is worth learning next.`;

    const storeSalesText = `Store Sales Time Series Forecasting (2025)

Goal: Forecast daily sales across 54 store locations to maximise supply chain efficiency for Corporación Favorita, a major Ecuadorian retailer. This Time-Series challenge involves predicting demand for thousands of product families by integrating multiple external variables.

Technical Methodology

Data Integration: Used Pandas left-joins to merge the primary transaction ledger with secondary datasets (holidays, stores, and oil prices), ensuring data integrity across temporal and geographical keys.

Feature Engineering: Created "Temporal Features" to capture behavioural patterns — including Lag Features and a Payday Effect encoding to account for autocorrelation in retail sales.

Missing Value Strategy: Applied forward-fill imputation for the Oil Price index, bridging the gap between the 5-day stock market cycle and the 7-day retail cycle to prevent data leaks.

Model & Approach: Used gradient-boosted decision trees (XGBoost) to capture non-linear relationships between economic changes and consumer spending. Validated with a Time-Series Split to ensure the model learned genuine predictive patterns rather than memorising historical noise.

Business Impact: The finished model delivers a data-driven inventory management framework — reducing stockouts and waste. The analysis pinpoints the precise effect of oil price volatility on purchasing power, providing actionable insights for strategic planning in emerging markets.`;

    const recoveryText = `Default Recovery Strategy

The Problem:
Payment defaults in an educational institution are rarely about money alone — they are almost always a signal of disengagement.That was the insight that changed everything.

The Analysis:
Using Python and Excel, I mapped fee - payment patterns across the student body.The data revealed a counterintuitive finding: lower - income families with daily wage earners were often more consistent with payments than middle - class families with steady incomes.The defaults were not explained by income — they were explained by relationship.

Further analysis confirmed the hypothesis: families with weaker bonds to the school — fewer parent - teacher interactions, less visibility into their child's progress — were the ones most likely to delay or default. The school was a transaction to them, not a community.

The Intervention:
I designed a targeted programme of structured parent - teacher interactions: scheduled mentoring sessions, personalised progress updates, and proactive outreach to high - risk families before defaults occurred rather than after.

The Outcome:
Payment defaults dropped by approximately 15 %, recovering around 300,000 INR in outstanding fees — without a single legal notice or punitive measure.The lever was engagement, not enforcement.

The Lesson:
Data does not replace empathy — it directs it.The numbers told us where to look; the conversations did the rest.This experience is at the core of how I approach analytical work: not as a way to reduce people to data points, but as a way to understand them well enough to actually help.`;

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

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const dataType = card.getAttribute('data-type');
            const isBlog = dataType === 'blog';
            const isML = dataType === 'ml';
            const isRecovery = dataType === 'recovery';
            const isAero = dataType === 'aero';
            const title = card.querySelector('.project-title').innerText;
            const category = card.querySelector('.project-category').innerText;

            // Set Content
            modalTitle.innerText = title;
            modalCategory.innerText = category;

            if (isBlog) {
                modalBody.classList.add('blog-layout');
                modalImg.src = 'Prisoners.jpg';
                modalDesc.innerText = prisonersText;
            } else if (isML) {
                modalBody.classList.add('blog-layout');
                modalImg.src = 'Store.png';
                modalDesc.innerText = storeSalesText;
            } else if (isRecovery) {
                modalBody.classList.add('blog-layout');
                modalImg.src = 'data.jpeg';
                modalDesc.innerText = recoveryText;
            } else if (isAero) {
                modalBody.classList.add('blog-layout');
                modalImg.src = 'Udaan1.png';
                modalDesc.innerText = aeroText;
            } else if (dataType === 'vibe') {
                modalBody.classList.add('blog-layout');
                modalImg.src = 'Vibe.jpeg';
                modalDesc.innerText = vibeText;
            } else {
                modalBody.classList.remove('blog-layout');
                modalImg.src = '';
                modalDesc.innerText = '';
            }

            // Show Modal
            modal.style.display = 'flex';
            setTimeout(() => { modal.classList.add('show'); }, 10);
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
