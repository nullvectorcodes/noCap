module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// --- Configuration ---
const CONFIG = {
    baseUrl: process.env.LM_STUDIO_BASE_URL || "http://127.0.0.1:1234/v1",
    timeoutMs: 25000
};
// --- Helpers ---
/**
 * Detects the loaded model and determines the best endpoint usage.
 */ async function detectModelCapabilities(baseUrl) {
    try {
        const res = await fetch(`${baseUrl}/models`, {
            signal: AbortSignal.timeout(2000),
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        // Prefer the first non-embedding model
        const model = data.data?.find((m)=>!m.id.includes("embedding"));
        if (!model) return null;
        return {
            id: model.id,
            isChat: model.id.toLowerCase().includes("instruct") || model.id.toLowerCase().includes("chat") || model.id.toLowerCase().includes("gpt")
        };
    } catch (error) {
        console.warn("[Capability Detection Failed]", error);
        return null;
    }
}
async function POST(req) {
    try {
        const body = await req.json();
        const userMessage = body.message?.trim();
        if (!userMessage) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Message cannot be empty"
            }, {
                status: 400
            });
        }
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
        // We strictly ask for JSON to support multiple terms
        const systemPrompt = `You are noCap, a multilingual slang explainer. 
Your task:
1. Analyze the user's message.
2. First, provide the "sentence_meaning": A clear, plain English translation of the WHOLE sentence, capturing the vibe.
3. Then, identify individual terms.
   - If SLANG: Identify ALL slang terms, provide a clear meaning and a simple example.
   - If STANDARD/GREETING: Treat key words as terms.
4. Output STRICTLY a JSON object. Do not explain.

Structure:
{
  "sentence_meaning": "The overall translation of the sentence.",
  "terms": [
    {
      "term": "term_1",
      "meaning": "definition",
      "example": "example sentence"
    }
  ]
}`;
        const payload = {
            model: modelId,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            temperature: 0.3,
            stream: false
        };
        console.log(`[Request] Sending to ${CONFIG.baseUrl}/${endpoint} with model ${modelId}`);
        // 3. Send Request
        let response = await fetch(`${CONFIG.baseUrl}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(CONFIG.timeoutMs)
        });
        // 4. Fallback for legacy endpoint
        if (!response.ok && (response.status === 404 || response.status === 400)) {
            console.warn(`[First Attempt Failed] ${response.status}. Retrying with legacy completion endpoint...`);
            const legacyPayload = {
                model: modelId,
                prompt: `${systemPrompt}\n\nUser: ${userMessage}\n\nResponse:`,
                temperature: 0.3,
                max_tokens: 500
            };
            response = await fetch(`${CONFIG.baseUrl}/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(legacyPayload),
                signal: AbortSignal.timeout(CONFIG.timeoutMs)
            });
        }
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[LM Studio Fatal Error] ${response.status}: ${errorBody}`);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Local AI engine rejected the request"
            }, {
                status: 502
            });
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
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            reply
        });
    } catch (error) {
        console.error("[Server Internal Error]", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal Server Error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__665493fd._.js.map