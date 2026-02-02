import { NextResponse } from 'next/server';

// --- Configuration ---
const CONFIG = {
    baseUrl: process.env.LM_STUDIO_BASE_URL || "http://127.0.0.1:1234/v1",
    timeoutMs: 15000, // 15s timeout
};

// --- Helpers ---

/**
 * Detects the loaded model and determines the best endpoint usage.
 */
async function detectModelCapabilities(baseUrl: string) {
    try {
        const res = await fetch(`${baseUrl}/models`, {
            signal: AbortSignal.timeout(2000),
            headers: { "Content-Type": "application/json" }
        });

        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data = await res.json();
        // Prefer the first non-embedding model
        const model = data.data?.find((m: any) => !m.id.includes("embedding"));

        if (!model) return null;

        return {
            id: model.id,
            // Heuristic: Does it look like an instruct/chat model?
            isChat: model.id.toLowerCase().includes("instruct") || model.id.toLowerCase().includes("chat") || model.id.toLowerCase().includes("gpt"),
        };
    } catch (error) {
        console.warn("[Capability Detection Failed]", error);
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const userMessage = body.message?.trim();

        if (!userMessage) {
            return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
        }

        // 1. Detect Capabilities
        let modelId = process.env.LM_STUDIO_MODEL;
        let endpoint = "chat/completions";
        let useChatFormat = true;

        if (!modelId) {
            const caps = await detectModelCapabilities(CONFIG.baseUrl);
            if (caps) {
                modelId = caps.id;
                // If it doesn't look like a chat model, we might consider legacy completions,
                // but modern LM Studio mostly supports chat/completions for everything.
                // We will stick to chat/completions as primary but default to a safe model ID if detection fails.
            } else {
                console.warn("Could not detect model, failing over to default.");
                modelId = "local-model"; // Generic fallback
            }
        }

        // 2. Prepare Payload (Sanitized)
        // We combine the system prompt into the user message to be safe against models 
        // that don't support 'system' role or separate messages well.
        const systemPrompt = "You are noCap, a multilingual slang explainer. Identify slang, explain meaning, and provide an example. Format:\nMeaning: [explanation]\nExample: [sentence]";
        const combinedPrompt = `${systemPrompt}\n\nUser Message: "${userMessage}"\n\nResponse:`;

        const payload = {
            model: modelId,
            messages: [
                { role: "user", content: combinedPrompt }
            ],
            temperature: 0.7,
            stream: false
            // Explicitly excluding 'max_tokens', 'top_p', etc to avoid rejection
        };

        console.log(`[Request] Sending to ${CONFIG.baseUrl}/${endpoint} with model ${modelId}`);

        // 3. Send Request with Retry Logic
        let response = await fetch(`${CONFIG.baseUrl}/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(CONFIG.timeoutMs)
        });

        // 4. Fallback: If 404 (wrong endpoint) or 400 (bad format), try legacy completions
        if (!response.ok && (response.status === 404 || response.status === 400)) {
            console.warn(`[First Attempt Failed] ${response.status}. Retrying with legacy completion endpoint...`);

            const legacyPayload = {
                model: modelId,
                prompt: combinedPrompt,
                temperature: 0.7,
                max_tokens: 200
            };

            response = await fetch(`${CONFIG.baseUrl}/completions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(legacyPayload),
                signal: AbortSignal.timeout(CONFIG.timeoutMs)
            });
        }

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[LM Studio Fatal Error] ${response.status}: ${errorBody}`);
            return NextResponse.json(
                { error: "Local AI engine rejected the request" },
                { status: 502 }
            );
        }

        // 5. Parse Response
        const data = await response.json();
        let reply = "";

        // Handle both Chat and Legacy formats
        if (data.choices?.[0]?.message?.content) {
            reply = data.choices[0].message.content;
        } else if (data.choices?.[0]?.text) {
            reply = data.choices[0].text;
        } else {
            reply = "No response generated.";
        }

        return NextResponse.json({ reply });

    } catch (error) {
        console.error("[Server Internal Error]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
