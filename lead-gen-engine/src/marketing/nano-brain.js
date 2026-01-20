import axios from 'axios';

/**
 * Nano Brain - The Strategic Cortex
 * Uses Gemini 2.0 Flash to analyze viral content and rewrite it.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export class NanoBrain {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            console.warn('⚠️  Nano Brain: No API Key found (GEMINI_API_KEY). AI features will be disabled.');
        }
    }

    /**
     * Call Gemini API
     */
    async _callGemini(prompt) {
        if (!this.apiKey) return null;

        try {
            const response = await axios.post(
                `${GEMINI_API_URL}?key=${this.apiKey}`,
                {
                    contents: [{ parts: [{ text: prompt }] }]
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error(`   🧠 Nano Brain Freeze: ${error.message}`);
            return null;
        }
    }

    /**
     * Analyze viral content to extract its "DNA"
     */
    async extractViralDNA(content) {
        console.log('   🧬 Nano Brain: Sequencing Viral DNA...');
        const prompt = `
        Analyze the following high-performing social media post.
        Extract its "Viral DNA" - the structure, psychological hooks, and formatting patterns that made it work.
        
        Output JSON only:
        {
            "hookType": "string (e.g. 'negative_frame', 'how_to', 'listicle')",
            "structure": ["step1", "step2", ...],
            "pacing": "fast/slow",
            "tone": "string",
            "ctaType": "soft/hard"
        }

        POST:
        ${content.slice(0, 2000)}
        `;

        const result = await this._callGemini(prompt);
        try {
            const jsonStr = result.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.log('   ⚠️  Failed to parse DNA. Using raw analysis.');
            return { raw: result };
        }
    }

    /**
     * Rewrite content for a new niche using the Viral DNA
     */
    async mutateContent(dna, niche, voice = "professional") {
        console.log(`   🧪 Nano Brain: Mutating for ${niche}...`);

        const dnaString = JSON.stringify(dna);
        const prompt = `
        You are a master copywriter. Rewrite the concept of "Lead Generation" for the niche: "${niche}".
        
        CRITICAL: You MUST use the following "Viral DNA" structure for the new post:
        ${dnaString}

        Brand Voice: ${voice}
        
        Output the new post text only. No explanations.
        ensure formatting (newlines) is perfect for Twitter/Reddit.
        `;

        return await this._callGemini(prompt);
    }
}
