"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    PenTool,
    User,
    LogOut,
    ArrowUpRight,
    Zap,
    Globe,
    ShieldCheck,
    Cpu,
    Compass
} from "lucide-react";
import { useState } from "react";

export default function DashboardUI({ user }: { user: any }) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    return (
        <main className="min-h-screen w-full bg-[#020202] text-white selection:bg-violet-500/30 font-sans tracking-tight">

            {/* Background Architecture */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-violet-600/10 via-transparent to-transparent rounded-full blur-[160px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-fuchsia-600/10 via-transparent to-transparent rounded-full blur-[140px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
            </div>

            {/* Seamless Header */}
            <nav className="fixed top-0 w-full z-50 px-10 py-8">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        <div className="w-10 h-10 flex items-center justify-center bg-white text-black font-black text-xl rounded-full">N</div>
                        <span className="text-2xl font-black tracking-tighter">noCap.</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-6"
                    >
                        <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 mr-8">
                            <Link href="/chat" className="hover:text-white transition-colors">Neural</Link>
                            <Link href="/history" className="hover:text-white transition-colors">Archive</Link>
                            <Link href="/settings" className="hover:text-white transition-colors">Config</Link>
                        </div>

                        <div className="flex items-center gap-4 p-1.5 pl-5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-2xl">
                            <div className="text-right">
                                <p className="text-[11px] font-black uppercase tracking-widest leading-none">{user.firstName || "Human"}</p>
                                <span className="text-[9px] text-neutral-500 font-bold uppercase">Authorized Access</span>
                            </div>
                            <div className="relative group">
                                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 group-hover:border-violet-500 transition-colors">
                                    {user.profilePictureUrl ? (
                                        <img src={user.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                            <User className="w-4 h-4 text-neutral-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#020202] rounded-full" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </nav>

            {/* Cinematic Hero */}
            <section className="relative z-10 pt-44 pb-24 px-10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                        <div className="max-w-3xl space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                    Control Center v2.0
                                </span>
                                <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-[-0.04em]">
                                    Manifest <br />
                                    <span className="text-neutral-600">The Future.</span>
                                </h1>
                            </motion.div>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.8 }}
                                className="text-xl text-neutral-400 font-light max-w-xl leading-relaxed"
                            >
                                Welcome back, {user.firstName}. Your neural bridge tokens are synchronized. Select a core operation to proceed.
                            </motion.p>
                        </div>

                        {/* Quick Stats Ticker */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="hidden xl:grid grid-cols-2 gap-8 border-l border-white/10 pl-12"
                        >
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-neutral-600 tracking-widest">Latency</p>
                                <p className="text-2xl font-black tabular-nums">14ms</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-neutral-600 tracking-widest">Accuracy</p>
                                <p className="text-2xl font-black tabular-nums">99.8%</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Industrial Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-20">

                        {/* Core Module: AI */}
                        <Card
                            id="ai"
                            href="/chat"
                            title="Neural Interface"
                            label="Action Center"
                            description="Deep semantic analysis of cross-generational linguistics."
                            icon={<Cpu className="w-6 h-6" />}
                            theme="violet"
                            isHovered={hoveredCard === 'ai'}
                            onHover={() => setHoveredCard('ai')}
                            onLeave={() => setHoveredCard(null)}
                        />

                        {/* Core Module: Knowledge */}
                        <Card
                            id="knowledge"
                            href="/submit-slang"
                            title="Semantic Input"
                            label="Contribution"
                            description="Expand the core manifestation engine with new data."
                            icon={<Globe className="w-6 h-6" />}
                            theme="fuchsia"
                            isHovered={hoveredCard === 'knowledge'}
                            onHover={() => setHoveredCard('knowledge')}
                            onLeave={() => setHoveredCard(null)}
                        />

                        {/* Module: History */}
                        <div className="col-span-1 lg:col-span-2 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col h-full gap-8">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Active Logs</p>
                                        <h3 className="text-2xl font-black">Archive Feed</h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-white/40">
                                        <Compass className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="space-y-3 mt-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center gap-4">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                                <span className="text-sm font-medium">Linguistic analysis: "Skibidi"</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-neutral-600">03:4{i} PM</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Industrial Footer */}
            <footer className="fixed bottom-0 w-full z-20 px-10 py-8 pointer-events-none">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex gap-4 pointer-events-auto">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3" /> Secure Node
                        </div>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-700">
                        Copyright © 2026 noCap Neural Systems. All rights reserved.
                    </div>
                </div>
            </footer>

        </main>
    );
}

function Card({ id, href, title, label, description, icon, theme, isHovered, onHover, onLeave }: any) {
    const colors: any = {
        violet: "bg-violet-500",
        fuchsia: "bg-fuchsia-500",
        emerald: "bg-emerald-500"
    };

    return (
        <Link
            href={href}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className="group block relative"
        >
            <motion.div
                whileHover={{ y: -5 }}
                className="h-[400px] p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between overflow-hidden relative group"
            >
                {/* Visual Depth Decoration */}
                <div className={`absolute top-0 right-0 w-40 h-40 ${colors[theme]} opacity-[0.03] blur-[60px] group-hover:opacity-[0.1] transition-opacity duration-700`} />

                <div className="relative z-10 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 transition-colors group-hover:text-white/40">
                        {label}
                    </p>
                    <h3 className="text-3xl font-black tracking-tight">{title}</h3>
                </div>

                <div className={`relative z-10 w-14 h-14 rounded-2xl ${colors[theme]} flex items-center justify-center text-white shadow-2xl shadow-${theme}-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    {icon}
                </div>

                <div className="relative z-10 space-y-6">
                    <p className="text-neutral-500 leading-relaxed font-medium group-hover:text-neutral-300 transition-colors">
                        {description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className={`w-8 h-[1px] ${colors[theme]} opacity-40 group-hover:w-12 transition-all`} />
                        Launch Operator
                    </div>
                </div>

                {/* Subtle Grain Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />

                {/* Interaction Glow */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute -inset-1 z-0 bg-gradient-to-br from-white/10 to-transparent blur-md rounded-[2.6rem]"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </Link>
    );
}
