"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, PenTool, User, AlertCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingUI({ user, error }: { user: any; error?: string }) {
    const [showError, setShowError] = useState(!!error);

    useEffect(() => {
        if (error) {
            setShowError(true);
            // Auto-hide error after 5 seconds
            const timer = setTimeout(() => setShowError(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <main className="flex h-screen w-full items-center justify-center bg-[#050505] text-white relative overflow-hidden font-sans selection:bg-violet-500/30">

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-900/10 rounded-full blur-[120px]" />
            </div>

            {/* Error Toast */}
            <AnimatePresence>
                {showError && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="fixed top-8 left-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl text-red-400 shadow-2xl shadow-red-900/20"
                    >
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">
                            {error === "unauthorized_admin"
                                ? "Unauthorized: Admin privileges required."
                                : "An authentication error occurred."}
                        </span>
                        <button
                            onClick={() => setShowError(false)}
                            className="ml-2 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navigation */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="fixed top-0 right-0 p-8 z-50 flex items-center gap-4"
            >
                {user ? (
                    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                        <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center overflow-hidden">
                            {user.profilePictureUrl ? (
                                <img src={user.profilePictureUrl} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-3.5 h-3.5 text-white" />
                            )}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">
                            {user.firstName || 'Admin'}
                        </span>
                    </div>
                ) : (
                    <Link
                        href="/api/auth/login"
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-neutral-500 hover:text-white hover:bg-white/[0.07] hover:border-white/20 transition-all backdrop-blur-md"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 group-hover:bg-violet-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Admin Login</span>
                    </Link>
                )}
            </motion.div>

            <div className="z-10 flex flex-col items-center gap-12 w-full max-w-4xl px-6">
                {/* Hero Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center space-y-4"
                >
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                        noCap.
                    </h1>
                    <p className="text-xl text-neutral-400 font-light tracking-wide">
                        The bridge between generations.
                    </p>
                </motion.div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    {/* Option 1: AI Chat */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <Link href="/chat" className="group block h-full">
                            <div className="h-full relative p-8 rounded-3xl bg-neutral-900/30 border border-white/5 hover:bg-neutral-800/50 hover:border-violet-500/30 transition-all duration-300 flex flex-col items-center text-center gap-4 backdrop-blur-sm group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-violet-900/20">
                                <div className="p-4 rounded-2xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors duration-300">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">No Cap AI</h3>
                                    <p className="text-neutral-500 group-hover:text-neutral-400 transition-colors">
                                        Decode slang instantly with our advanced AI model.
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Option 2: Submit Slang */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <Link href="/submit-slang" className="group block h-full">
                            <div className="h-full relative p-8 rounded-3xl bg-neutral-900/30 border border-white/5 hover:bg-neutral-800/50 hover:border-fuchsia-500/30 transition-all duration-300 flex flex-col items-center text-center gap-4 backdrop-blur-sm group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-fuchsia-900/20">
                                <div className="p-4 rounded-2xl bg-fuchsia-500/10 text-fuchsia-400 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors duration-300">
                                    <PenTool className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Submit Slang</h3>
                                    <p className="text-neutral-500 group-hover:text-neutral-400 transition-colors">
                                        Know something we don't? Add to the knowledge base.
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
