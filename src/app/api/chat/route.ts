import { NextResponse } from 'next/server';
import { analyzeText } from '@/lib/lm-studio';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const userMessage = body.message?.trim();
        const language = body.language || "English";

        if (!userMessage) {
            return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
        }

        const reply = await analyzeText(userMessage, language);

        return NextResponse.json({ reply });

    } catch (error) {
        console.error("[Server Internal Error]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
