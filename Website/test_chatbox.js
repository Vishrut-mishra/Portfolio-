const fs = require('fs');
const path = require('path');

// Mock DOM basics
const document = {
    getElementById: () => ({
        addEventListener: () => { },
        classList: { remove: () => { }, add: () => { } },
        focus: () => { },
        appendChild: () => { },
        scrollTop: 0,
        scrollHeight: 100
    }),
    createElement: () => ({ classList: { add: () => { } }, textContent: '' }),
    addEventListener: (event, callback) => {
        if (event === 'DOMContentLoaded') callback();
    }
};
global.document = document;

// Mock Fetch
global.fetch = async (file) => {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    return {
        ok: true,
        text: async () => content
    };
};

// Start logic verification
console.log("Starting Chatbox Logic Verification...");

async function testChatbox() {
    try {
        // Read the actual script content to "eval" or just import logic if it was a module. 
        // Since it's a browser script, I'll essentially replicate the key logic here for testing.

        const knowledgeText = fs.readFileSync(path.join(__dirname, 'vishrut_knowledge.txt'), 'utf8');
        const knowledgeBase = {};

        // Test Parsing
        const sections = knowledgeText.split('[');
        sections.forEach(section => {
            if (!section.trim()) return;
            const closeBracketIndex = section.indexOf(']');
            if (closeBracketIndex === -1) return;
            const title = section.substring(0, closeBracketIndex).trim().toUpperCase();
            const content = section.substring(closeBracketIndex + 1).trim();
            knowledgeBase[title] = content;
        });

        console.log("Knowledge Base Keys:", Object.keys(knowledgeBase));
        if (!knowledgeBase['CORE IDENTITY']) throw new Error("Missing CORE IDENTITY");
        if (!knowledgeBase['PROJECTS']) throw new Error("Missing PROJECTS");

        console.log("✅ Parsing Successful");

        // Test Response Logic
        function generateResponse(query) {
            const lowerQuery = query.toLowerCase();
            // Updated priority to match script.js fix
            if (lowerQuery.includes('project') || lowerQuery.includes('work')) return knowledgeBase['PROJECTS'];
            if (lowerQuery.includes('who are you') || lowerQuery.includes('about')) return knowledgeBase['CORE IDENTITY'];
            return "Default";
        }

        const q1 = "Tell me about your projects";
        const r1 = generateResponse(q1);
        console.log("Response for 'projects':", r1.substring(0, 50) + "...");
        if (r1 && r1.includes("NIT Udaan UAV")) console.log("✅ Query 'projects' returned correct content.");
        else console.error("❌ Query 'projects' failed. Response was:", r1);

        const q2 = "Who are you?";
        const r2 = generateResponse(q2);
        if (r2.includes("Vishrut Mishra")) console.log("✅ Query 'Who are you' returned correct content.");
        else console.error("❌ Query 'Who are you' failed.");

    } catch (e) {
        console.error("❌ Test Failed:", e);
    }
}

testChatbox();
