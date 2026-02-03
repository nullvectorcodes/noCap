"use client";

import Link from "next/link";
import {
    Terminal,
    Globe,
    Clock,
    ShieldCheck,
    LogOut,
    ArrowRight,
    ChevronRight,
    LayoutGrid
} from "lucide-react";

export default function DashboardUI({ user }: { user: any }) {

    return (
        <main className="min-h-screen w-full bg-[#050505] text-neutral-200 font-sans antialiased selection:bg-indigo-500/30">

            {/* Fixed Navigation: Professional & Minimal */}
            <nav className="fixed top-0 w-full z-50 bg-[#050505]/95 border-b border-white/[0.04] backdrop-blur-sm h-16">
                <div className="w-full max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-white text-black flex items-center justify-center rounded-[4px] font-bold text-xs shadow-sm">N</div>
                        <span className="text-sm font-semibold tracking-tight text-neutral-100">noCap.</span>
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-neutral-500 hidden sm:block">
                            {user.firstName || "Operative"}
                        </span>
                        <div className="h-8 w-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden">
                            {user.profilePictureUrl ? (
                                <img src={user.profilePictureUrl} alt="User" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-[10px] font-bold text-neutral-500">{user.firstName?.[0] || "U"}</span>
                            )}
                        </div>
                        <Link href="/auth/logout" className="text-neutral-500 hover:text-white transition-colors">
                            <LogOut className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content: Centered & Constrained */}
            <div className="relative z-10 pt-32 pb-20 px-6 max-w-[1100px] mx-auto flex flex-col gap-10">

                {/* Hero: Calm & Confident */}
                <header className="flex flex-col gap-3 pb-6 border-b border-white/[0.04]">
                    <h1 className="text-2xl font-semibold text-white tracking-tight">
                        Welcome back, {user.firstName || "Mohammad"}
                    </h1>
                    <p className="text-sm text-neutral-500 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80"></span>
                        System synchronized · Ready for operations
                    </p>
                </header>

                {/* Core Grid: Hierarchy First (2/3 + 1/3) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

                    {/* PRIMARY CARD (Most Important) - Col Span 8 */}
                    <div className="md:col-span-8 flex flex-col">
                        <Link href="/chat" className="group block h-full">
                            <article className="h-full min-h-[300px] p-8 rounded-xl bg-[#0A0A0A] border border-white/[0.06] shadow-sm hover:border-indigo-500/30 hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">

                                {/* Content */}
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="h-12 w-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <Terminal className="h-6 w-6" />
                                        </div>
                                        {/* Subtle Active Indicator */}
                                        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-2">Neural Interface</h2>
                                        <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                                            Real-time slang decoding, sentiment analysis, and contextual understanding.
                                        </p>
                                    </div>
                                </div>

                                {/* Primary CTA */}
                                <div className="relative z-10 mt-8">
                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 active:scale-[0.98] duration-100">
                                        Launch Interface <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Subtle Background Accent */}
                                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-b from-indigo-900/5 to-transparent blur-[60px] pointer-events-none" />
                            </article>
                        </Link>
                    </div>

                    {/* SECONDARY CARDS - Col Span 4 */}
                    <div className="md:col-span-4 flex flex-col gap-6 h-full">

                        {/* Data Manifest */}
                        <Link href="/submit-slang" className="group block flex-1">
                            <article className="h-full p-6 rounded-xl bg-[#0A0A0A] border border-white/[0.06] shadow-sm hover:border-white/[0.12] hover:-translate-y-[2px] transition-all duration-300 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-9 w-9 rounded-md bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-400">
                                        <Globe className="h-4 w-4" />
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white mb-1">Data Manifest</h3>
                                    <p className="text-xs text-neutral-500">
                                        Add, review, and validate new linguistic terms.
                                    </p>
                                </div>
                            </article>
                        </Link>

                        {/* History Logs */}
                        <Link href="/history" className="group block flex-1">
                            <article className="h-full p-6 rounded-xl bg-[#0A0A0A] border border-white/[0.06] shadow-sm hover:border-white/[0.12] hover:-translate-y-[2px] transition-all duration-300 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-9 w-9 rounded-md bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-400">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white mb-1">History Logs</h3>
                                    <p className="text-xs text-neutral-500">
                                        Review past system activity and usage.
                                    </p>
                                </div>
                            </article>
                        </Link>

                    </div>
                </div>

                {/* Footer: Status Only */}
                <footer className="mt-12 pt-6 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-neutral-600 font-medium">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Secure connection</span>
                    </div>
                    <div>
                        noCap v2.4.0 · Stable
                    </div>
                </footer>

            </div>
        </main>
    );
}
