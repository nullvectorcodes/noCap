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
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/worker_threads [external] (worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("worker_threads", () => require("worker_threads"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/src/lib/lm-studio.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONFIG",
    ()=>CONFIG,
    "analyzeText",
    ()=>analyzeText,
    "detectModelCapabilities",
    ()=>detectModelCapabilities
]);
const CONFIG = {
    baseUrl: process.env.LM_STUDIO_BASE_URL || "http://127.0.0.1:1234/v1",
    timeoutMs: 25000
};
async function detectModelCapabilities(baseUrl) {
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
async function analyzeText(text) {
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
Your task:
1. Analyze the user's message.
2. "sentence_meaning": Provide a VIBE-BASED translation. Capture the emotion and intent (e.g. "I'm shocked!" instead of literal words).
3. "terms": Identify specific slang phrases. 
   - CRITICAL: Treat multi-word slang as SINGLE units (e.g. "Oh hell naw", "dead ass", "for real"). Do NOT split them.
   - If a phrase like "Oh hell naw" is used, list it as ONE term.
   - Meaning: Explain the usage/context (e.g. "Used to express strong disbelief").
   - Example: A natural usage example.
4. Output STRICTLY a JSON object.

Structure:
{
  "sentence_meaning": "The overall translation/vibe.",
  "terms": [
    {
      "term": "phrase or word",
      "meaning": "contextual definition",
      "example": "usage example"
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
                content: text
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
            prompt: `${systemPrompt}\n\nUser: ${text}\n\nResponse:`,
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
}),
"[project]/src/app/api/analyze-image/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tesseract$2e$js$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tesseract.js/src/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$lm$2d$studio$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/lm-studio.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
;
async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('image');
        if (!file) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No image file provided"
            }, {
                status: 400
            });
        }
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Perform OCR - Optimized for speed & Local Execution
        // Explicitly defining path to local node_modules prevents Bun/Next.js from failing to find the worker
        // or trying to load it from a CDN (which is slow/broken).
        const workerPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js');
        const corePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'node_modules', 'tesseract.js-core', 'tesseract-core.wasm.js');
        console.log(`[OCR] Initializing worker...`);
        // Race condition timeout - if worker creation hangs, kill it.
        const workerPromise = (async ()=>{
            const worker = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tesseract$2e$js$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createWorker"])('eng', 1, {
                workerPath,
                corePath,
                logger: (m)=>{
                    if (m.status === 'recognizing text') console.log(`[OCR] Progress: ${(m.progress * 100).toFixed(0)}%`);
                },
                // Disable auto-downloading if possible, but 'eng' usually triggers a check.
                // We ensure 'workerPath' and 'corePath' are local to avoid remote Code execution.
                cachePath: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), '.tess-cache')
            });
            // 2. Set parameters for speed (LSTM only, Assume single uniform block)
            await worker.setParameters({
                tessedit_pageseg_mode: '6',
                tessedit_ocr_engine_mode: '2',
                tessjs_create_pdf: '0',
                tessjs_create_hocr: '0',
                tessjs_create_tsv: '0',
                tessjs_create_box: '0',
                tessjs_create_unlv: '0',
                tessjs_create_osd: '0'
            });
            const ret = await worker.recognize(buffer);
            const extractedText = ret.data.text.trim();
            await worker.terminate();
            return extractedText;
        })();
        // Hard timeout of 10 seconds for OCR
        const timeoutPromise = new Promise((_, reject)=>{
            setTimeout(()=>reject(new Error("OCR Timed Out")), 10000);
        });
        const extractedText = await Promise.race([
            workerPromise,
            timeoutPromise
        ]);
        if (!extractedText) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No text found in image"
            }, {
                status: 400
            });
        }
        // --- Aggressive Cleaning & Human Phrase Extraction ---
        // 1. Split into lines
        const lines = extractedText.split('\n');
        // 2. Filter & Normalize
        const humanPhrases = [];
        const ignoredPatterns = [
            /^\d{1,2}:\d{2}/,
            /^\d{1,2}\s*[ap]m/i,
            /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
            /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i,
            /^(youtube|instagram|tiktok|snapchat|twitter|x|facebook)/i,
            /^\d+(\.\d+)?[kmbt]?\s*(views|likes|comments|shares)/i,
            /^reply/i,
            /^translate/i,
            /^original/i
        ];
        for (const line of lines){
            let processed = line.trim();
            if (!processed) continue;
            // Remove noise chars
            processed = processed.replace(/[•|>>]/g, '').trim();
            // Skip if it matches ignored patterns
            if (ignoredPatterns.some((p)=>p.test(processed))) continue;
            // Prioritize short, conversational lines (likely slang)
            // Skip long paragraphs unless they look very slang-heavy
            if (processed.length > 2) {
                humanPhrases.push(processed);
            }
        }
        const cleanedText = humanPhrases.join(' ');
        const normalizeForCheck = cleanedText.toLowerCase();
        // --- Early Exit Logic ---
        // Expanded fuzzy list of common slang to check before calling AI
        // We match against the normalized "human" text
        const COMMON_SLANG = [
            /\b(cap|bet|fr|mid|rizz|sus|finna|yeet|simp|drip|cheugy|bussin|sheesh|vibe|gyat|skibidi|fanum|tax|sigma|chug|mog|mew|looksmax|goon|edg|aura|cooked|ate|serve)\b/i,
            /\b(no\s*cap|for\s*real|on\s*god|dead\s*ass|slay\s*queen|main\s*character|canon\s*event|hell\s*naw+|down\s*bad)\b/i
        ];
        const hasPotentialSlang = COMMON_SLANG.some((regex)=>regex.test(normalizeForCheck));
        if (!hasPotentialSlang) {
            console.log("[Early Exit] No slang detected in text:", normalizeForCheck);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                extractedText: cleanedText || extractedText,
                reply: JSON.stringify({
                    sentence_meaning: "No slang detected. This looks like: \"" + (cleanedText || "Unintelligible text") + "\"",
                    terms: []
                })
            });
        }
        // --- Text Reduction ---
        // Use the cleaned text for AI analysis
        const limitedText = cleanedText.length > 300 ? cleanedText.substring(0, 300) + "..." : cleanedText;
        // Analyze with AI
        const reply = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$lm$2d$studio$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analyzeText"])(limitedText);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            extractedText: cleanedText,
            reply
        });
    } catch (error) {
        console.error("[Image Analysis Error]", error);
        const errorMessage = error.message === "OCR Timed Out" ? "Image processing took too long. Please try a clearer or smaller image." : "Failed to process image (Server Error)";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: errorMessage
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4c2b45fd._.js.map