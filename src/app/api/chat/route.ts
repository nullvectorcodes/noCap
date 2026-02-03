import { NextResponse } from 'next/server';
import { analyzeText } from '@/lib/lm-studio';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper to clean and tokenize text into candidates (bigrams + unigrams)
function extractCandidates(text: string): string[] {
    // 1. Normalize: lowercase, remove punctuation (keep only letters, numbers, spaces)
    const normalized = text.toLowerCase().replace(/[^\w\s]/g, '');

    // 2. Tokenize by whitespace
    const tokens = normalized.split(/\s+/).filter(t => t.length > 0);

    const candidates: string[] = [];

    // 3. Generate Bigrams (adjacent pairs) - Higher priority
    for (let i = 0; i < tokens.length - 1; i++) {
        candidates.push(`${tokens[i]} ${tokens[i + 1]}`);
    }

    // 4. Add Unigrams (single words)
    // Filter out very short common words to reduce noise/requests (optional, but good practice)
    // For now, we check everything as requested, or maybe skip < 2 chars?
    // User asked to check "each token".
    candidates.push(...tokens);

    // Remove duplicates
    return Array.from(new Set(candidates));
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const userMessage = body.message?.trim();
        const language = body.language || "English";

        if (!userMessage) {
            return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
        }

        // 1. Generate search candidates (Bigrams first, then Unigrams)
        const searchTerms = extractCandidates(userMessage);

        // 2. Query Convex DB for all candidates in parallel
        // We map each term to a promise that resolves to the term or null
        const lookupPromises = searchTerms.map(async (term) => {
            const result = await convex.query(api.slang.getSlang, { term });
            return result ? { ...result, matchedTerm: term } : null;
        });

        const results = await Promise.all(lookupPromises);

        // 3. Find the first valid match
        // Note: `results` order corresponds to `searchTerms` (Bigrams first), so we naturally prioritize phrases.
        const dbSlang = results.find(r => r !== null);

        if (dbSlang) {
            console.log(`[DB Match] Found slang: "${dbSlang.matchedTerm}"`);

            // Construct frontend-compatible JSON
            const responseData = {
                sentence_meaning: "Verified Database Result", // Or generic intent
                terms: [{
                    term: dbSlang.matchedTerm,
                    meaning: dbSlang.meaning,
                    example: dbSlang.examples[0]
                }]
            };

            return NextResponse.json({
                reply: JSON.stringify(responseData)
            });
        }

        console.log(`[Cache Miss] No DB match for: ${searchTerms.join(", ")}. Calling LLM...`);

        // 4. Fallback to LLM
        const rawLlmReply = await analyzeText(userMessage, language);

        // Attempt to parse and transform the LLM's new format to the frontend's old format
        // LLM outputs: { sentenceIntent, slang: [] }
        // Frontend wants: { sentence_meaning, terms: [] }
        let finalReply = rawLlmReply;
        try {
            const cleanJson = rawLlmReply.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);

            if (parsed.sentenceIntent || parsed.slang) {
                const transformed = {
                    sentence_meaning: parsed.sentenceIntent || "Analysis complete.",
                    terms: Array.isArray(parsed.slang) ? parsed.slang.map((s: any) => ({
                        term: s.term,
                        meaning: s.meaning,
                        example: s.example
                    })) : []
                };
                finalReply = JSON.stringify(transformed);
            }
        } catch (e) {
            console.warn("Failed to transform LLM JSON, returning raw:", e);
        }

        return NextResponse.json({ reply: finalReply });

    } catch (error) {
        console.error("[Server Internal Error]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
