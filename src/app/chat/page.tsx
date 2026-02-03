"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Terminal, ArrowUp, Quote, MessageSquareText, Paperclip, X, Image as ImageIcon, ScanText, Mic, MicOff, Globe, Check, Sun, Moon, Clipboard } from "lucide-react";
import clsx from "clsx";
import Link from "next/link"; // Added Link

interface SlangDef {
    term: string;
    meaning: string;
    example: string;
}

interface ParsedResult {
    sentence_meaning?: string;
    terms?: SlangDef[];
}

interface Message {
    id: string;
    role: "user" | "ai";
    content: string; // Raw content string
    image?: string;
    extractedText?: string;
    parsed?: ParsedResult; // Structured data if parsing succeeds
    isError?: boolean;
}

const Typewriter = ({ words, className }: { words: string[], className?: string }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const word = words[currentWordIndex];

        // Typing speeds
        const typeSpeed = 100;
        const deleteSpeed = 50;
        const pauseTime = 2000;

        const handleTyping = () => {
            if (!isDeleting) {
                // Typing
                setCurrentText(word.substring(0, currentText.length + 1));

                // Finished typing
                if (currentText.length === word.length) {
                    setTimeout(() => setIsDeleting(true), pauseTime);
                }
            } else {
                // Deleting
                setCurrentText(word.substring(0, currentText.length - 1));

                // Finished deleting
                if (currentText.length === 0) {
                    setIsDeleting(false);
                    setCurrentWordIndex((prev) => (prev + 1) % words.length);
                }
            }
        };

        const timer = setTimeout(handleTyping, isDeleting ? deleteSpeed : typeSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentWordIndex, words]);

    return (
        <span className={className}>
            {currentText}
            <span className="w-[2px] h-[1em] bg-violet-400 inline-block ml-0.5 animate-pulse align-middle" />
        </span>
    );
};

export default function ChatPage() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("Analyzing...");
    const [messages, setMessages] = useState<Message[]>([]);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [targetLanguage, setTargetLanguage] = useState("English");
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const LANGUAGES = [
        { code: "EN", name: "English (Default)", value: "English" },
        { code: "HI", name: "Hindi", value: "Hindi" },
        { code: "BN", name: "Bengali", value: "Bengali" },
        { code: "TE", name: "Telugu", value: "Telugu" },
        { code: "MR", name: "Marathi", value: "Marathi" },
        { code: "TA", name: "Tamil", value: "Tamil" },
        { code: "UR", name: "Urdu", value: "Urdu" },
        { code: "GU", name: "Gujarati", value: "Gujarati" },
        { code: "KN", name: "Kannada", value: "Kannada" },
        { code: "ML", name: "Malayalam", value: "Malayalam" },
        { code: "OR", name: "Odia", value: "Odia" },
        { code: "PA", name: "Punjabi", value: "Punjabi" },
        { code: "AS", name: "Assamese", value: "Assamese" },
        { code: "MZ", name: "Mizo", value: "Mizo" },
        { code: "ES", name: "Spanish", value: "Spanish" },
        { code: "FR", name: "French", value: "French" },
        { code: "DE", name: "German", value: "German" },
        { code: "JP", name: "Japanese", value: "Japanese" },
        { code: "STD", name: "Formal English", value: "Standard Formal English" },
    ];
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading, imagePreview]);

    // Handle Global Paste
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (items) {
                for (const item of items) {
                    if (item.type.indexOf("image") !== -1) {
                        const blob = item.getAsFile();
                        if (blob) {
                            handleImageSelect(blob);
                            e.preventDefault();
                        }
                    }
                }
            }
        };
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, []);

    const handleImageSelect = (file: File) => {
        if (file.type.startsWith("image/")) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // LLM Warm-up
    useEffect(() => {
        // Send a minimal request to ensure model is loaded
        fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "ping" }),
        }).catch(() => { }); // Ignore errors, just want to trigger load
    }, []);






    const processImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) return reject("Canvas error");

                // Resize: Max width 1000px
                const MAX_WIDTH = 1000;
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Grayscale conversion
                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg;     // R
                    data[i + 1] = avg; // G
                    data[i + 2] = avg; // B
                    // A is unchanged
                }
                ctx.putImageData(imageData, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject("Blob conversion failed");
                }, "image/jpeg", 0.8);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    const handleAnalyze = async () => {
        if ((!input.trim() && !image) || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            image: imagePreview || undefined,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setImage(null);
        setImagePreview(null);
        setLoading(true);
        setLoadingText("Thinking...");

        try {
            let data;

            if (image) {
                setLoadingText("Optimizing image...");
                const processedBlob = await processImage(image);

                const formData = new FormData();
                formData.append("image", processedBlob, "image.jpg");
                formData.append("language", targetLanguage);

                setLoadingText("Reading text...");
                const res = await fetch("/api/analyze-image", {
                    method: "POST",
                    body: formData,
                });

                setLoadingText("Decyphering slang...");
                data = await res.json();
            } else {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: userMsg.content, language: targetLanguage }),
                });
                data = await res.json();
            }

            // Update user message with extracted text if available
            if (data.extractedText) {
                setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, extractedText: data.extractedText } : m));
            }

            let aiContent = "";
            let parsedResult: ParsedResult | undefined = undefined;

            if (data.error) {
                aiContent = `⚠️ Error: ${data.error}`;
            } else {
                aiContent = data.reply;

                // Attempt JSON parsing
                try {
                    const cleanJson = aiContent.replace(/```json/g, "").replace(/```/g, "").trim();
                    const jsonStart = cleanJson.indexOf('{');

                    if (jsonStart !== -1) {
                        let braceCount = 0;
                        let jsonEnd = -1;

                        // robustly find the matching closing brace
                        for (let i = jsonStart; i < cleanJson.length; i++) {
                            if (cleanJson[i] === '{') braceCount++;
                            else if (cleanJson[i] === '}') {
                                braceCount--;
                                if (braceCount === 0) {
                                    jsonEnd = i;
                                    break;
                                }
                            }
                        }

                        if (jsonEnd !== -1) {
                            const jsonObj = JSON.parse(cleanJson.substring(jsonStart, jsonEnd + 1));

                            // Validate structure
                            if (jsonObj.terms || jsonObj.sentence_meaning) {
                                parsedResult = {
                                    sentence_meaning: jsonObj.sentence_meaning,
                                    terms: Array.isArray(jsonObj.terms) ? jsonObj.terms : []
                                };
                            }
                        }
                    }
                } catch (e) {
                    console.log("Failed to parse AI JSON, falling back to raw text", e);
                }
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: aiContent,
                parsed: parsedResult,
                isError: !!data.error
            };

            setMessages((prev) => [...prev, aiMsg]);

        } catch (err) {
            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: "⚠️ Failed to connect to the server. Is LM Studio running?",
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAnalyze();
        }
    };

    return (
        <main className={clsx(
            "flex flex-col h-screen overflow-hidden relative font-sans selection:bg-violet-500/20 transition-colors duration-500",
            theme === 'dark' ? "bg-[#050505] text-white" : "bg-[#fafafa] text-neutral-900"
        )}>

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className={clsx(
                    "absolute top-[-10%] left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse transition-colors duration-500",
                    theme === 'dark' ? "bg-violet-600/20" : "bg-violet-400/10"
                )} />
                <div className={clsx(
                    "absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse delay-1000 transition-colors duration-500",
                    theme === 'dark' ? "bg-fuchsia-600/20" : "bg-fuchsia-400/10"
                )} />
                <div className={clsx(
                    "absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full blur-[100px] transition-colors duration-500",
                    theme === 'dark' ? "bg-indigo-600/10" : "bg-indigo-400/10"
                )} />
            </div>

            {/* Header */}
            <header className={clsx(
                "fixed top-0 w-full z-50 backdrop-blur-2xl border-b h-16 flex items-center justify-between px-6 transition-all duration-300",
                theme === 'dark' ? "bg-[#050505]/80 border-white/5" : "bg-[#fafafa]/80 border-black/5"
            )}>
                <div className="w-8" /> {/* Spacer for centering */}

                <Link href="/" className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">.nocap</span>
                </Link>

                <button
                    onClick={toggleTheme}
                    className={clsx(
                        "p-2 rounded-full transition-colors w-8 h-8 flex items-center justify-center",
                        theme === 'dark' ? "text-neutral-400 hover:text-white hover:bg-white/10" : "text-neutral-500 hover:text-black hover:bg-black/5"
                    )}
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto z-10 pt-24 scroll-smooth custom-scrollbar relative">
                <div className={clsx(
                    "min-h-full pb-32 px-4 max-w-2xl mx-auto flex flex-col justify-end gap-6",
                    messages.length === 0 && "justify-center"
                )}>

                    {/* Empty State */}
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center justify-center text-center space-y-6 pb-20"
                        >
                            <div className={clsx(
                                "w-24 h-24 rounded-[2rem] flex items-center justify-center border ring-4 shadow-2xl relative overflow-hidden group transition-all duration-300",
                                theme === 'dark'
                                    ? "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-white/5 ring-white/5"
                                    : "bg-white border-violet-100 ring-violet-50"
                            )}>
                                <div className={clsx(
                                    "absolute inset-0 bg-gradient-to-tr to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                    theme === 'dark' ? "from-violet-500/20" : "from-violet-500/5"
                                )} />
                                <Sparkles className={clsx(
                                    "w-12 h-12 animate-[pulse_3s_ease-in-out_infinite]",
                                    theme === 'dark' ? "text-fuchsia-400 fill-fuchsia-400/20" : "text-fuchsia-500 fill-fuchsia-500/10"
                                )} />
                            </div>
                            <div className="space-y-3">
                                <h2 className={clsx(
                                    "text-4xl font-bold tracking-tight bg-clip-text text-transparent",
                                    theme === 'dark' ? "bg-gradient-to-b from-white to-white/60" : "bg-gradient-to-b from-neutral-900 to-neutral-600"
                                )}>
                                    Decode the streets.
                                </h2>
                                <div className="h-6 flex items-center justify-center gap-1">
                                    <span className={clsx("text-base transition-colors", theme === 'dark' ? "text-neutral-400" : "text-neutral-500")}>Try searching:</span>
                                    <Typewriter
                                        words={["\"no cap\"", "\"run it back\"", "\"bet\"", "\"it's giving\"", "\"finna\"", "\"rizz\"", "\"simpin\"", "\"slay\""]}
                                        className={clsx("text-base font-mono font-medium", theme === 'dark' ? "text-violet-400" : "text-violet-600")}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Messages */}
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={clsx(
                                    "flex w-full group",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={clsx(
                                    "max-w-[90%] sm:max-w-[85%] p-4 sm:p-5 relative overflow-hidden transition-all duration-300",
                                    msg.role === "user"
                                        ? (theme === 'dark' ? "rounded-2xl rounded-tr-sm bg-neutral-800 text-white border border-white/5 shadow-sm" : "rounded-2xl rounded-tr-sm bg-neutral-900 text-white shadow-md")
                                        : (theme === 'dark' ? "rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 w-full" : "rounded-2xl bg-white border border-neutral-100 shadow-sm w-full")
                                )}>

                                    {/* User Image */}
                                    {msg.image && (
                                        <div className={clsx("mb-3 rounded-lg overflow-hidden border", theme === 'dark' ? "border-white/10" : "border-neutral-200")}>
                                            <img src={msg.image} alt="User upload" className="w-auto h-auto max-h-48 max-w-full object-contain bg-black/50" />
                                        </div>
                                    )}

                                    {/* Extracted Text Indicator */}
                                    {msg.extractedText && (
                                        <div className={clsx("mb-3 pl-3 border-l-2", theme === 'dark' ? "border-violet-500/50" : "border-violet-500")}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <ScanText className={clsx("w-3 h-3", theme === 'dark' ? "text-violet-400" : "text-violet-600")} />
                                                <span className={clsx("text-[10px] uppercase tracking-widest font-semibold", theme === 'dark' ? "text-violet-300/70" : "text-violet-600/70")}>Detected Text</span>
                                            </div>
                                            <p className={clsx("text-xs font-mono italic leading-relaxed line-clamp-4 hover:line-clamp-none transition-all", theme === 'dark' ? "text-neutral-400" : "text-neutral-500")}>
                                                {msg.extractedText}
                                            </p>
                                        </div>
                                    )}

                                    {/* AI Icon */}
                                    {msg.role === "ai" && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className={clsx(
                                                "w-6 h-6 rounded-full flex items-center justify-center shadow-lg",
                                                theme === 'dark' ? "bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-purple-500/20" : "bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-violet-500/20"
                                            )}>
                                                <Sparkles className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <span className={clsx("text-xs font-bold tracking-wider uppercase", theme === 'dark' ? "text-neutral-400" : "text-neutral-500")}>Analysis</span>
                                        </div>
                                    )}

                                    <div className={clsx(msg.role === "ai" ? "pl-0" : "")}>

                                        {/* Structured Result */}
                                        {msg.role === "ai" && msg.parsed ? (
                                            <div className="flex flex-col gap-6">

                                                {/* Overall Sentence Meaning */}
                                                {msg.parsed.sentence_meaning && (
                                                    <div className={clsx(
                                                        "rounded-xl p-5 border shadow-lg transition-colors",
                                                        theme === 'dark' ? "bg-gradient-to-br from-white/10 to-white/5 border-white/10" : "bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 border-violet-100"
                                                    )}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <MessageSquareText className={clsx("w-4 h-4 opacity-80", theme === 'dark' ? "text-purple-300" : "text-violet-600")} />
                                                            <h3 className={clsx("text-xs font-bold uppercase tracking-widest", theme === 'dark' ? "text-neutral-400" : "text-violet-900/60")}>Translation</h3>
                                                        </div>
                                                        <p className={clsx("text-lg font-medium leading-relaxed", theme === 'dark' ? "text-white" : "text-neutral-900")}>
                                                            {msg.parsed.sentence_meaning}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Term Breakdown */}
                                                {msg.parsed.terms && msg.parsed.terms.length > 0 && (
                                                    <div className="flex flex-col gap-4">
                                                        <div className="px-1">
                                                            <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Breakdown</h4>
                                                        </div>
                                                        {msg.parsed.terms.map((item, idx) => (
                                                            <div key={idx} className={clsx(
                                                                "border rounded-xl p-4 sm:p-5 transition-colors",
                                                                theme === 'dark' ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-neutral-200 hover:border-violet-200 hover:shadow-md"
                                                            )}>
                                                                <div className="flex items-baseline gap-2 mb-2">
                                                                    <h3 className={clsx("text-lg font-bold tracking-tight capitalize", theme === 'dark' ? "text-white" : "text-neutral-900")}>
                                                                        {item.term}
                                                                    </h3>
                                                                    <span className="text-xs text-neutral-500 font-medium uppercase tracking-widest">Slang</span>
                                                                </div>

                                                                <p className={clsx("text-[15px] leading-relaxed mb-4 font-light", theme === 'dark' ? "text-neutral-300" : "text-neutral-700")}>
                                                                    {item.meaning}
                                                                </p>

                                                                <div className={clsx(
                                                                    "rounded-lg p-3 border-l-2 flex gap-3",
                                                                    theme === 'dark' ? "bg-black/30 border-purple-500/50" : "bg-neutral-50 border-violet-500"
                                                                )}>
                                                                    <Quote className={clsx("w-4 h-4 flex-shrink-0 mt-0.5 opacity-70", theme === 'dark' ? "text-purple-400" : "text-violet-600")} />
                                                                    <p className={clsx("font-mono text-xs sm:text-sm italic leading-relaxed", theme === 'dark' ? "text-neutral-400" : "text-neutral-600")}>
                                                                        "{item.example}"
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // Fallback / Raw Text
                                            <p className={clsx(
                                                "text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap",
                                                msg.role === "user" ? "font-normal text-white" : (theme === 'dark' ? "text-neutral-300" : "text-neutral-700"),
                                                msg.isError && "text-red-400"
                                            )}>
                                                {msg.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Loading Indicator */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start w-full pl-1"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 h-8">
                                    <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-pulse" />
                                    <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-pulse delay-75" />
                                    <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-pulse delay-150" />
                                </div>
                                <span className="text-xs font-mono text-neutral-500 animate-pulse">{loadingText}</span>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} className="h-0" />
                </div>
            </div>

            {/* Input Footer */}
            <div className="fixed bottom-0 w-full z-40 px-4 pb-6 sm:pb-8 pt-4">
                <div className="max-w-2xl mx-auto">
                    <div className="relative">
                        <div className={clsx(
                            "absolute inset-0 backdrop-blur-xl rounded-full -m-2 opacity-90 transition-colors",
                            theme === 'dark' ? "bg-[#050505]/50" : "bg-[#fafafa]/50"
                        )} />
                        <div className={clsx(
                            "relative flex items-center backdrop-blur-md rounded-full border p-2 pr-3 transition-all duration-300 shadow-2xl",
                            theme === 'dark'
                                ? "bg-[#18181b]/80 border-white/10 focus-within:border-violet-500/50 focus-within:ring-violet-500/10 shadow-violet-900/20"
                                : "bg-white/80 border-neutral-200 focus-within:border-violet-500/50 focus-within:ring-violet-500/10 shadow-black/5"
                        )}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageSelect(file);
                                }}
                            />

                            {imagePreview && (
                                <div className="absolute bottom-full left-0 mb-3 ml-2">
                                    <div className="relative group">
                                        <img src={imagePreview} alt="Preview" className={clsx("h-16 w-auto rounded-lg border shadow-xl object-cover", theme === 'dark' ? "border-white/10 bg-neutral-900" : "border-neutral-200 bg-white")} />
                                        <button onClick={removeImage} className={clsx("absolute -top-1.5 -right-1.5 rounded-full p-0.5 border shadow-sm transition-colors", theme === 'dark' ? "bg-neutral-800 text-white border-white/20 hover:bg-neutral-700" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50")}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={image ? "Add a caption (optional)..." : "Type a slang phrase or paste an image..."}
                                className={clsx(
                                    "flex-1 bg-transparent border-none outline-none placeholder-neutral-500 h-[44px] px-4 text-[15px]",
                                    theme === 'dark' ? "text-white" : "text-neutral-900"
                                )}
                                disabled={loading}
                                autoFocus
                                onPaste={(e) => {
                                    // Let the global listener handle it, or preventDefault if preferred
                                }}
                            />

                            <button
                                onClick={async () => {
                                    try {
                                        const text = await navigator.clipboard.readText();
                                        if (text) setInput(prev => prev + text);
                                    } catch (err) {
                                        console.error('Failed to read clipboard', err);
                                    }
                                }}
                                className={clsx(
                                    "p-2 transition-colors rounded-full mr-1",
                                    theme === 'dark' ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-400 hover:text-neutral-900 hover:bg-black/5"
                                )}
                                title="Paste from Clipboard"
                            >
                                <Clipboard className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className={clsx(
                                    "p-2 transition-colors rounded-full mr-1",
                                    theme === 'dark' ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-400 hover:text-neutral-900 hover:bg-black/5"
                                )}
                                title="Upload Image"
                            >
                                <Paperclip className="w-4 h-4" />
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                    className={clsx(
                                        "p-2 transition-colors rounded-full mr-1 flex items-center gap-1",
                                        showLanguageMenu
                                            ? (theme === 'dark' ? "text-white bg-white/10" : "text-black bg-black/5")
                                            : (theme === 'dark' ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-400 hover:text-black hover:bg-black/5")
                                    )}
                                    title="Select Output Language"
                                >
                                    <Globe className="w-4 h-4" />
                                    {targetLanguage !== "English" && (
                                        <span className="text-[10px] font-bold bg-violet-600 text-white px-1 py-0.5 rounded-sm">
                                            {LANGUAGES.find(l => l.value === targetLanguage)?.code}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showLanguageMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowLanguageMenu(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                className={clsx(
                                                    "absolute bottom-full mb-3 left-0 w-48 border rounded-xl shadow-2xl overflow-hidden z-50 p-1",
                                                    theme === 'dark' ? "bg-[#18181b] border-white/10" : "bg-white border-neutral-200"
                                                )}
                                            >
                                                <div className={clsx("px-2 py-1.5 border-b mb-1", theme === 'dark' ? "border-white/5" : "border-neutral-100")}>
                                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Translate to</span>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                    {LANGUAGES.map((lang) => (
                                                        <button
                                                            key={lang.code}
                                                            onClick={() => {
                                                                setTargetLanguage(lang.value);
                                                                setShowLanguageMenu(false);
                                                            }}
                                                            className={clsx(
                                                                "w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors",
                                                                targetLanguage === lang.value
                                                                    ? "bg-violet-500/10 text-violet-500 font-medium"
                                                                    : (theme === 'dark' ? "text-neutral-300 hover:bg-white/5 hover:text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900")
                                                            )}
                                                        >
                                                            {lang.name}
                                                            {targetLanguage === lang.value && <Check className="w-3.5 h-3.5" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={(!input && !image) || loading}
                                className={clsx(
                                    "ml-1 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                                    (input.trim() || image) && !loading
                                        ? (theme === 'dark' ? "bg-white text-black hover:scale-110 active:scale-95 shadow-lg shadow-white/20" : "bg-neutral-900 text-white hover:scale-110 active:scale-95 shadow-lg shadow-black/20")
                                        : (theme === 'dark' ? "bg-neutral-800 text-neutral-600 cursor-not-allowed" : "bg-neutral-200 text-neutral-400 cursor-not-allowed")
                                )}
                            >
                                {loading ? (
                                    <div className={clsx("w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin", theme === 'dark' ? "border-neutral-400" : "border-neutral-500")} />
                                ) : (
                                    <ArrowUp className="w-4 h-4 stroke-[3]" />
                                )}
                            </button>
                        </div>
                    </div>
                    <p className={clsx("text-center text-[10px] mt-3 font-medium tracking-wide", theme === 'dark' ? "text-neutral-700" : "text-neutral-400")}>
                        Powered by Local LM Studio
                    </p>
                </div>
            </div>



        </main>
    );
}
