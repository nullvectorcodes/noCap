"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import { X, Minus, Square, Send, RotateCcw, MessageSquare, Monitor, Smartphone, Globe, Cpu } from "lucide-react";

// --- Components ---

const Header = () => {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        return scrollY.on("change", (latest) => {
            const previous = scrollY.getPrevious() ?? 0;
            if (latest > previous && latest > 50) {
                setHidden(true);
            } else {
                setHidden(false);
            }
        });
    }, [scrollY]);

    return (
        <motion.header
            variants={{
                visible: { y: 0, opacity: 1 },
                hidden: { y: -100, opacity: 0 },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/10"
        >
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#bd00ff] to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(189,0,255,0.5)]">
                    <span className="font-bold text-white text-lg">n</span>
                </div>
                <span className="text-2xl font-bold tracking-tighter text-white">
                    noCap
                </span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
                {["Features", "About", "Contact"].map((item) => (
                    <Link
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        className="text-sm font-medium text-gray-400 hover:text-[#bd00ff] transition-colors"
                    >
                        {item}
                    </Link>
                ))}
            </nav>

            <Link
                href="/chat"
                className="px-5 py-2 rounded-full bg-[#bd00ff] text-white text-sm font-bold shadow-[0_0_20px_rgba(189,0,255,0.3)] hover:shadow-[0_0_30px_rgba(189,0,255,0.6)] hover:scale-105 transition-all"
            >
                Launch App
            </Link>
        </motion.header>
    );
};

const ChatMessage = ({ text, isUser }: { text: React.ReactNode | string; isUser: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex w-full mb-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
        <div
            className={`max-w-[80%] p-2 rounded-lg text-xs leading-relaxed ${isUser
                ? "bg-[#bd00ff] text-white rounded-br-none"
                : "bg-gray-800 text-gray-200 rounded-bl-none"
                }`}
        >
            {text}
        </div>
    </motion.div>
);

interface ChatWindowProps {
    title: string;
    type: "mobile" | "desktop";
    isActive: boolean;
    onClick: () => void;
    messages: Array<{ text: React.ReactNode | string; isUser: boolean }>;
    isProcessing: boolean;
    inputValue: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onReset: () => void;
    dragConstraints: React.RefObject<Element | null>;
}

const ChatWindow = ({
    title,
    type,
    isActive,
    onClick,
    messages,
    isProcessing,
    inputValue,
    onInputChange,
    onSubmit,
    onReset,
    dragConstraints,
}: ChatWindowProps) => {
    const isMobile = type === "mobile";

    return (
        <motion.div
            onClick={onClick}
            className={`absolute ${isMobile
                ? "w-[280px] h-[550px] right-[10%] top-[10%]"
                : "w-[600px] h-[400px] left-[10%] top-[20%]"
                } bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden shadow-2xl cursor-pointer transition-[box-shadow,border-color,filter] duration-300 ${isActive
                    ? "z-20 border-[#bd00ff] shadow-[0_0_30px_rgba(189,0,255,0.2)]"
                    : "z-10 opacity-80 hover:opacity-100 grayscale hover:grayscale-0"
                }`}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={dragConstraints}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isActive ? 1 : 0.8, scale: isActive ? 1.05 : 1 }}
            whileHover={{ scale: isActive ? 1.05 : 1.02 }}
        >
            {/* Window Header */}
            <div className="h-8 bg-[#121212] flex items-center justify-between px-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-[10px] items-center gap-1 font-mono text-gray-400 flex">
                        {isMobile ? <Smartphone size={10} /> : <Monitor size={10} />}
                        {title}
                    </span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col h-[calc(100%-2rem)] bg-black/80 relative">
                <div className="flex-1 p-4 overflow-hidden flex flex-col justify-end">
                    {/* Faux Background Elements */}
                    <div className="absolute inset-0 pointer-events-none opacity-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#bd00ff] blur-3xl" />
                    </div>

                    {messages.map((msg, idx) => (
                        <ChatMessage key={idx} text={msg.text} isUser={msg.isUser} />
                    ))}
                    {isProcessing && (
                        <motion.div className="flex gap-1 mt-2">
                            <span className="w-1.5 h-1.5 bg-[#bd00ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-[#bd00ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-[#bd00ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </motion.div>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={onSubmit} className="p-3 bg-[#121212] border-t border-white/10 flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={onInputChange}
                        placeholder={isActive ? "Type a message..." : "Click to activate"}
                        disabled={!isActive}
                        className="flex-1 bg-black/50 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#bd00ff] focus:ring-1 focus:ring-[#bd00ff] transition-all"
                        autoFocus={isActive}
                    />
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onReset(); }}
                            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                            title="Reset Chat"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <button
                            type="submit"
                            disabled={!isActive || !inputValue.trim()}
                            className="p-1.5 rounded-md bg-[#bd00ff] hover:bg-[#a000db] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default function LandingPage() {
    const [activeWindow, setActiveWindow] = useState<"desktop" | "mobile">("desktop");
    const [messagesDesktop, setMessagesDesktop] = useState<Array<{ text: React.ReactNode | string; isUser: boolean }>>([
        { text: "Yo, this slang translator is highkey fire 🔥", isUser: true },
        { text: "No cap, it's actually changing the game for real.", isUser: false },
    ]);
    const [messagesMobile, setMessagesMobile] = useState<Array<{ text: React.ReactNode | string; isUser: boolean }>>([
        { text: "What does 'rizz' mean again?", isUser: true },
        { text: "It's basically charisma, charm, or ability to attract.", isUser: false },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);


    // Random background "stuff"
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
    const desktopRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Generate static particles once
        const newParticles = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
        }));
        setParticles(newParticles);
    }, []);

    const handleReset = () => {
        setMessagesDesktop([
            { text: "Yo, this slang translator is highkey fire 🔥", isUser: true },
            { text: "No cap, it's actually changing the game for real.", isUser: false },
        ]);
        setMessagesMobile([
            { text: "What does 'rizz' mean again?", isUser: true },
            { text: "It's basically charisma, charm, or ability to attract.", isUser: false },
        ]);
        setInputValue("");
        setIsProcessing(false);

        setActiveWindow("desktop");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { text: inputValue, isUser: true };
        if (activeWindow === "desktop") {
            setMessagesDesktop((prev) => [...prev, userMsg]);
        } else {
            setMessagesMobile((prev) => [...prev, userMsg]);
        }

        setInputValue("");
        setIsProcessing(true);

        // Fake processing delay -> Auto Reply
        setTimeout(() => {
            setIsProcessing(false);
            const systemMsg = {
                text: (
                    <span>
                        Yo fam 🛑, this just a demo. <Link href="/chat" className="underline font-bold hover:text-white text-blue-200">Slide to the real app</Link> to get cooked properly! 🍳
                    </span>
                ),
                isUser: false
            };

            if (activeWindow === "desktop") {
                setMessagesDesktop((prev) => [...prev, systemMsg]);
            } else {
                setMessagesMobile((prev) => [...prev, systemMsg]);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-[#bd00ff] selection:text-white">
            <Header />

            <main className="relative pt-20 min-h-screen flex flex-col items-center justify-center overflow-hidden">
                {/* Background Grid & Particles */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.5)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-30 pointer-events-none" />

                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full bg-[#bd00ff] opacity-20 pointer-events-none"
                        style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}

                {/* Hero Text */}
                <div className="relative z-10 text-center mb-12 max-w-4xl px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 drop-shadow-[0_0_30px_rgba(189,0,255,0.5)]"
                    >
                        Beat the Gap <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bd00ff] to-blue-600">
                            with noCap
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-xl md:text-2xl text-gray-400 font-light"
                    >
                        Understand slang, screenshots, and internet language — instantly.
                    </motion.p>
                </div>


                {/* Fake Desktop Container */}
                <motion.div
                    ref={desktopRef}
                    initial={{ y: 50, opacity: 0, rotateX: 10 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-full max-w-6xl aspect-[16/10] bg-black rounded-xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    {/* Screen Background / Wallpaper */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                        style={{ backgroundImage: "url('/dummy_wallpaper.webp')" }}
                    />

                    {/* Overlay Gradient for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

                    {/* Reset Button (Positioned comfortably inside the "screen") */}
                    <div className="absolute top-6 right-6 z-40">
                        <button
                            onClick={handleReset}
                            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/60 hover:scale-110 transition-all shadow-lg"
                            title="Reset Demo"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>

                    {/* Desktop Window */}
                    <ChatWindow
                        title="noCap Desktop v2.0"
                        type="desktop"
                        isActive={activeWindow === "desktop"}
                        onClick={() => setActiveWindow("desktop")}
                        messages={messagesDesktop}
                        isProcessing={isProcessing && activeWindow === "desktop"}
                        inputValue={activeWindow === "desktop" ? inputValue : ""}
                        onInputChange={(e) => {
                            if (activeWindow === "desktop") setInputValue(e.target.value);
                        }}
                        onSubmit={handleSubmit}
                        onReset={handleReset}
                        dragConstraints={desktopRef}
                    />

                    {/* Mobile Window */}
                    <ChatWindow
                        title="noCap Mobile"
                        type="mobile"
                        isActive={activeWindow === "mobile"}
                        onClick={() => setActiveWindow("mobile")}
                        messages={messagesMobile}
                        isProcessing={isProcessing && activeWindow === "mobile"}
                        inputValue={activeWindow === "mobile" ? inputValue : ""}
                        onInputChange={(e) => {
                            if (activeWindow === "mobile") setInputValue(e.target.value);
                        }}
                        onSubmit={handleSubmit}
                        onReset={handleReset}
                        dragConstraints={desktopRef}
                    />
                </motion.div>

                {/* Bottom Text / Processing Status */}
                <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                    <motion.div
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="flex items-center justify-center gap-3 text-xs font-mono text-[#bd00ff]"
                    >
                        <Cpu size={14} />
                        <span>SYSTEM STATUS: ONLINE</span>
                        <span className="mx-2">|</span>
                        <span>LATENCY: 12ms</span>
                        <span className="mx-2">|</span>
                        <span>MODELS: LOADED</span>
                    </motion.div>
                </div>

            </main>

            {/* SECTION 2: SCROLL-BASED TEXT ANIMATION */}
            <section className="relative bg-[#050505]">
                {/* Background Ambient Glow */}
                <div className="fixed top-0 left-0 right-0 h-screen pointer-events-none z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#bd00ff] opacity-5 blur-[120px]" />
                </div>

                {/* Sticky Container for Stacked Text */}
                <div className="sticky top-0 h-screen flex items-center justify-center pointer-events-none z-10">
                    <div className="relative w-full max-w-5xl px-6">
                        <div className="flex flex-col items-center gap-4">
                            <ScrollTextStack />
                        </div>
                    </div>
                </div>

                {/* Scroll Spacers - Each text gets scroll space */}
                <div className="h-[100vh]" />
                <div className="h-[100vh]" />
                <div className="h-[100vh]" />
                <div className="h-[100vh]" />
            </section>
        </div >
    );
}

// Scroll Text Stack Component
const ScrollTextStack = () => {
    const texts = [
        "The internet moves fast.",
        "Language changes even faster.",
        "Slang. Screenshots. Context you don't have.",
        "That's the gap.\nnoCap closes it."
    ];

    const { scrollY } = useScroll();

    return (
        <>
            {texts.map((text, index) => (
                <ScrollTextLine
                    key={index}
                    text={text}
                    index={index}
                    totalLines={texts.length}
                    scrollY={scrollY}
                />
            ))}
        </>
    );
};

const ScrollTextLine = ({
    text,
    index,
    totalLines,
    scrollY
}: {
    text: string;
    index: number;
    totalLines: number;
    scrollY: any;
}) => {
    // Each line gets its own scroll trigger
    // Line appears from bottom, reaches its stacked position, and stays there
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1000;

    // Scroll positions for this line
    const startScroll = vh * (1 + index * 0.8);      // When line starts appearing
    const arrivedScroll = vh * (1.4 + index * 0.8);  // When line reaches its position
    const settledScroll = vh * (1.6 + index * 0.8);  // When line is settled

    // Line spacing - each line has a fixed vertical position in the stack
    const lineHeight = 100; // pixels between lines
    const totalHeight = (totalLines - 1) * lineHeight / 2;
    const targetY = (index * lineHeight) - totalHeight; // Center the stack

    // Opacity: fade in and stay visible
    const opacity = useTransform(
        scrollY,
        [startScroll, arrivedScroll, settledScroll, settledScroll + 2000],
        [0, 1, 1, 1]
    );

    // Y position: come from bottom, reach stack position, stay there
    const y = useTransform(
        scrollY,
        [startScroll, arrivedScroll, settledScroll],
        [150, targetY, targetY]
    );

    // Scale: subtle entrance effect
    const scale = useTransform(
        scrollY,
        [startScroll, arrivedScroll],
        [0.95, 1]
    );

    return (
        <motion.div
            style={{
                opacity,
                y,
                scale,
                position: 'absolute',
                left: '50%',
                top: '50%',
                translateX: '-50%',
                translateY: '-50%',
            }}
            className="will-change-transform"
        >
            <p className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white text-center leading-tight whitespace-pre-line px-6">
                {text}
            </p>
        </motion.div>
    );
};
