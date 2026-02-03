import { NextResponse } from 'next/server';
import { generateSmartReplies } from '@/lib/lm-studio';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sentence, intent, slang, tone } = body;

        console.log(`[Smart Reply API] Request: "${sentence.substring(0, 20)}..." | Intent: ${intent} | Tone: ${tone}`);

        if (!sentence || !intent) {
            console.warn("[Smart Reply API] Missing fields");
            return NextResponse.json({ suggestedReplies: [] });
        }

        const rawReply = await generateSmartReplies(sentence, intent, slang || [], tone || "Neutral");
        console.log(`[Smart Reply API] Raw LLM Reply: ${rawReply.substring(0, 50)}...`);

        // Parse JSON response
        let parsed: any = { suggestedReplies: [] };
        try {
            const cleanJson = rawReply.replace(/```json/g, "").replace(/```/g, "").trim();
            // Find first { and last }
            const jsonStart = cleanJson.indexOf('{');
            const jsonEnd = cleanJson.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                parsed = JSON.parse(cleanJson.substring(jsonStart, jsonEnd + 1));
            }
        } catch (e) {
            console.error("[Smart Reply API] JSON Parse Error:", e);
        }

        const result = {
            suggestedReplies: Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : []
        };

        console.log(`[Smart Reply API] Returning ${result.suggestedReplies.length} replies`);
        return NextResponse.json(result);

    } catch (error) {
        console.error("[Smart Reply Error]", error);
        return NextResponse.json(
            { suggestedReplies: [] },
            { status: 200 }
        );
    }
}
