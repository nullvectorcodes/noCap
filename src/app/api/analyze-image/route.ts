import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import { analyzeText } from '@/lib/lm-studio';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Perform OCR - Optimized for speed & Local Execution
        // Explicitly defining path to local node_modules prevents Bun/Next.js from failing to find the worker
        // or trying to load it from a CDN (which is slow/broken).
        const workerPath = path.join(process.cwd(), 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js');
        const corePath = path.join(process.cwd(), 'node_modules', 'tesseract.js-core', 'tesseract-core.wasm.js');

        console.log(`[OCR] Initializing worker...`);

        // Race condition timeout - if worker creation hangs, kill it.
        const workerPromise = (async () => {
            const worker = await createWorker('eng', 1, {
                workerPath,
                corePath,
                logger: m => {
                    if (m.status === 'recognizing text') console.log(`[OCR] Progress: ${(m.progress * 100).toFixed(0)}%`);
                },
                // Disable auto-downloading if possible, but 'eng' usually triggers a check.
                // We ensure 'workerPath' and 'corePath' are local to avoid remote Code execution.
                cachePath: path.join(process.cwd(), '.tess-cache'), // Cache trained data locally
            });

            // 2. Set parameters for speed (LSTM only, Assume single uniform block)
            await worker.setParameters({
                tessedit_pageseg_mode: '6' as any, // PSM_SINGLE_BLOCK
                tessedit_ocr_engine_mode: '2' as any, // OEM_LSTM_ONLY
                tessjs_create_pdf: '0',
                tessjs_create_hocr: '0',
                tessjs_create_tsv: '0',
                tessjs_create_box: '0',
                tessjs_create_unlv: '0',
                tessjs_create_osd: '0',
            });

            const ret = await worker.recognize(buffer);
            const extractedText = ret.data.text.trim();
            await worker.terminate();
            return extractedText;
        })();

        // Hard timeout of 10 seconds for OCR
        const timeoutPromise = new Promise<string>((_, reject) => {
            setTimeout(() => reject(new Error("OCR Timed Out")), 10000);
        });

        const extractedText = await Promise.race([workerPromise, timeoutPromise]);

        if (!extractedText) {
            return NextResponse.json({ error: "No text found in image" }, { status: 400 });
        }

        // --- Aggressive Cleaning & Human Phrase Extraction ---
        // 1. Split into lines
        const lines = extractedText.split('\n');

        // 2. Filter & Normalize
        const humanPhrases: string[] = [];
        const ignoredPatterns = [
            /^\d{1,2}:\d{2}/,       // Timestamps like 12:45
            /^\d{1,2}\s*[ap]m/i,    // 12 PM
            /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i, // Dates
            /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i, // Days
            /^(youtube|instagram|tiktok|snapchat|twitter|x|facebook)/i, // Platforms
            /^\d+(\.\d+)?[kmbt]?\s*(views|likes|comments|shares)/i, // Metrics
            /^reply/i,              // UI actions
            /^translate/i,
            /^original/i,
        ];

        for (const line of lines) {
            let processed = line.trim();
            if (!processed) continue;

            // Remove noise chars
            processed = processed.replace(/[•|>>]/g, '').trim();

            // Skip if it matches ignored patterns
            if (ignoredPatterns.some(p => p.test(processed))) continue;

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

        const hasPotentialSlang = COMMON_SLANG.some(regex => regex.test(normalizeForCheck));

        if (!hasPotentialSlang) {
            console.log("[Early Exit] No slang detected in text:", normalizeForCheck);
            return NextResponse.json({
                extractedText: cleanedText || extractedText, // Use cleaned if available
                reply: JSON.stringify({
                    sentence_meaning: "No slang detected. This looks like: \"" + (cleanedText || "Unintelligible text") + "\"",
                    terms: []
                })
            });
        }

        // --- Text Reduction ---
        // Use the cleaned text for AI analysis
        const limitedText = cleanedText.length > 300
            ? cleanedText.substring(0, 300) + "..."
            : cleanedText;

        // Check for language in FormData
        const language = formData.get('language') as string || "English";

        // Analyze with AI
        const reply = await analyzeText(limitedText, language);

        return NextResponse.json({
            extractedText: cleanedText, // Return full text for UI
            reply
        });

    } catch (error: any) {
        console.error("[Image Analysis Error]", error);

        const errorMessage = error.message === "OCR Timed Out"
            ? "Image processing took too long. Please try a clearer or smaller image."
            : "Failed to process image (Server Error)";

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
