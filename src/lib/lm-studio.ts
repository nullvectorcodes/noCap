export const CONFIG = {
    baseUrl: process.env.LM_STUDIO_BASE_URL || "http://127.0.0.1:1234/v1",
    timeoutMs: 25000,
};

export async function detectModelCapabilities(baseUrl: string) {
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
            isChat: model.id.toLowerCase().includes("instruct") || model.id.toLowerCase().includes("chat") || model.id.toLowerCase().includes("gpt"),
        };
    } catch (error) {
        console.warn("[Capability Detection Failed]", error);
        return null;
    }
}

export async function analyzeText(text: string, targetLanguage: string = "English") {
    // 1. Detect Capabilities
    let modelId = process.env.LM_STUDIO_MODEL;
    let endpoint = "chat/completions";

    if (!modelId) {
        const caps = await detectModelCapabilities(CONFIG.baseUrl);
        if (caps) {
            modelId = caps.id;
        } else {
            console.warn("Could not detect model, failing over to default.");
            modelId = "local-model";
        }
    }

    // 2. Prepare Payload (Sanitized)
    const systemPrompt = `You are noCap, a gen-z slang expert.
You must analyze the user's message and output the result in ${targetLanguage}.

Your task:
1. Analyze the user's message.
2. "sentence_meaning": Provide a VIBE-BASED translation in ${targetLanguage}. Capture the emotion and intent.
3. "terms": Identify specific slang phrases. 
   - CRITICAL: Treat multi-word slang as SINGLE units (e.g. "Oh hell naw").
   - Meaning: Explain the usage/context purely in ${targetLanguage}.
   - Example: A natural usage example (keep the slang in English, but you can translate the rest of the sentence to ${targetLanguage} if appropriate).
4. Output STRICTLY a valid JSON object.

Output Language: ${targetLanguage}
Output Language: ${targetLanguage}
Output Language: ${targetLanguage}

Structure:
{
  "sentence_meaning": "The overall translation/vibe written in ${targetLanguage}.",
  "terms": [
    {
      "term": "phrase or word",
      "meaning": "definition written in ${targetLanguage}",
      "example": "usage example"
    }
  ]
}`;

    const payload = {
        model: modelId,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `${text}\n\nIMPORTANT: Provide all definitions and translations in ${targetLanguage}.` }
        ],
        temperature: 0.3, // Lower temperature for more consistent JSON
        stream: false
    };

    console.log(`[Request] Sending to ${CONFIG.baseUrl}/${endpoint} with model ${modelId} | Language: ${targetLanguage}`);

    // 3. Send Request
    let response = await fetch(`${CONFIG.baseUrl}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(CONFIG.timeoutMs)
    });

    // 4. Fallback for legacy endpoint
    if (!response.ok && (response.status === 404 || response.status === 400)) {
        console.warn(`[First Attempt Failed] ${response.status}. Retrying with legacy completion endpoint...`);
        const legacyPayload = {
            model: modelId,
            prompt: `${systemPrompt}\n\nUser: ${text}\n\nIMPORTANT: Provide all definitions and translations in ${targetLanguage}.\n\nResponse:`,
            temperature: 0.3,
            max_tokens: 500
        };
        response = await fetch(`${CONFIG.baseUrl}/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(legacyPayload),
            signal: AbortSignal.timeout(CONFIG.timeoutMs)
        });
    }

    if (!response.ok) {
        throw new Error(`LM Studio error: ${response.statusText}`);
    }

    // 5. Parse Response
    const data = await response.json();
    let reply = "";

    if (data.choices?.[0]?.message?.content) {
        reply = data.choices[0].message.content;
    } else if (data.choices?.[0]?.text) {
        reply = data.choices[0].text;
    } else {
        reply = "No response generated.";
    }

    return reply;
}
