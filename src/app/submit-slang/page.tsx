"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Send, Check, Link as LinkIcon, Globe, Quote, BookOpen, Sparkles, Languages, Info, ExternalLink } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const Confetti = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        opacity: 1,
                        scale: 0,
                        x: "50%",
                        y: "50%"
                    }}
                    animate={{
                        opacity: 0,
                        scale: Math.random() * 1.5 + 0.5,
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        rotate: Math.random() * 360
                    }}
                    transition={{
                        duration: 1.5,
                        ease: "easeOut",
                        delay: Math.random() * 0.2
                    }}
                    className={clsx(
                        "absolute w-2 h-2 rounded-sm",
                        ["bg-violet-500", "bg-fuchsia-500", "bg-blue-500"][Math.floor(Math.random() * 3)]
                    )}
                />
            ))}
        </div>
    );
};

export default function SubmitSlang() {
    const [term, setTerm] = useState("");
    const [pronunciation, setPronunciation] = useState("");
    const [languageGroup, setLanguageGroup] = useState("");
    const [meaning, setMeaning] = useState("");
    const [examples, setExamples] = useState<string[]>(["", "", ""]);
    const [references, setReferences] = useState<string[]>([""]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const submitSlang = useMutation(api.slang.submitSlang);
    const formRef = useRef<HTMLFormElement>(null);

    const handleExampleChange = (index: number, value: string) => {
        const newExamples = [...examples];
        newExamples[index] = value;
        setExamples(newExamples);
    };

    const addExample = () => {
        if (examples.length < 5) {
            setExamples([...examples, ""]);
        }
    };

    const removeExample = (index: number) => {
        if (examples.length > 3) {
            const newExamples = examples.filter((_, i) => i !== index);
            setExamples(newExamples);
        }
    };

    const handleReferenceChange = (index: number, value: string) => {
        const newRefs = [...references];
        newRefs[index] = value;
        setReferences(newRefs);
    };

    const addReference = () => {
        if (references.length < 3) {
            setReferences([...references, ""]);
        }
    };

    const removeReference = (index: number) => {
        if (references.length > 1) {
            const newRefs = references.filter((_, i) => i !== index);
            setReferences(newRefs);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        try {
            await submitSlang({
                term,
                meaning,
                examples: examples.filter(e => e.trim() !== ""),
                origin: references.length > 0 ? references.join("; ") : undefined,
                socialCircle: languageGroup,
            });

            setLoading(false);
            setSuccess(true);

            // Scroll to success message
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Reset after delay
            setTimeout(() => {
                setSuccess(false);
                setTerm("");
                setPronunciation("");
                setLanguageGroup("");
                setMeaning("");
                setExamples(["", "", ""]);
                setReferences([""]);
            }, 6000);
        } catch (error) {
            console.error("Failed to submit slang:", error);
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#020202] text-white font-sans selection:bg-violet-500/30 relative overflow-hidden flex flex-col">

            {/* Noise Texture */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />

            {/* Deep Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-violet-800/20 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] bg-fuchsia-800/20 rounded-full blur-[160px] animate-pulse delay-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-900/5 rounded-full blur-[180px]" />
            </div>

            {/* Header */}
            <header className="relative z-50 flex items-center justify-between px-8 py-10 max-w-7xl mx-auto w-full">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Link
                        href="/"
                        className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.07] hover:border-white/[0.15] transition-all shadow-xl backdrop-blur-2xl group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-tight">Return Home</span>
                    </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Link href="/" className="text-3xl font-black tracking-tighter hover:opacity-80 transition-opacity">
                        <span className="bg-gradient-to-r from-violet-400 via-white to-fuchsia-400 bg-clip-text text-transparent">.nocap</span>
                    </Link>
                </motion.div>

                <div className="w-40 hidden md:block" />
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-40 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="mb-20 text-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-violet-500/[0.08] border border-violet-500/20 text-[11px] font-black uppercase tracking-[0.25em] text-violet-300 mb-4"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Manifesting the Future
                        </motion.div>

                        <motion.h1
                            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/30"
                            initial={{ opacity: 0, filter: "blur(10px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            transition={{ delay: 0.5, duration: 1 }}
                        >
                            Define the <br className="hidden md:block" /> Culture.
                        </motion.h1>

                        <motion.p
                            className="text-neutral-500 text-lg md:text-2xl font-medium tracking-tight max-w-2xl mx-auto leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            Language is fluid. Help us bridge the gap between generation gaps by documenting the latest slang entries.
                        </motion.p>
                    </div>

                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="relative overflow-hidden bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[4rem] p-20 text-center flex flex-col items-center gap-10 shadow-[0_0_100px_-20px_rgba(139,92,246,0.1)]"
                            >
                                <Confetti />

                                <div className="relative">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                                        className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center relative z-10 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)]"
                                    >
                                        <Check className="w-16 h-16 text-white stroke-[4]" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150"
                                    />
                                </div>

                                <div className="space-y-4 max-w-lg">
                                    <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Manifestation Successful</h3>
                                    <p className="text-neutral-400 text-xl font-medium leading-relaxed">Your contribution has been beamed to our curators. Expect it live soon.</p>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSuccess(false)}
                                    className="px-10 py-4 bg-white text-black rounded-[2rem] text-lg font-black shadow-2xl hover:bg-neutral-100 transition-all"
                                >
                                    Post Another Manifestation
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                ref={formRef}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-16"
                            >
                                {/* Section 1: Core Information */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative group/card"
                                >
                                    <div className="absolute top-0 right-10 -translate-y-1/2">
                                        <div className="p-4 rounded-[1.5rem] bg-violet-600 shadow-[0_15px_30px_-10px_rgba(124,58,237,0.5)] text-white">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                                Identity & Origin
                                            </h2>
                                            <p className="text-neutral-500 font-medium text-sm">Every word has a home.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                                            <div className="md:col-span-4 group/input space-y-3">
                                                <label className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-500 group-focus-within/input:text-violet-400 transition-colors px-1">Slang Term</label>
                                                <div className="relative">
                                                    <input
                                                        required
                                                        value={term}
                                                        onChange={(e) => setTerm(e.target.value)}
                                                        placeholder="e.g. Rizz"
                                                        className="w-full bg-white/[0.02] border border-white/[0.06] rounded-[1.5rem] px-8 py-6 text-white placeholder:text-neutral-800 focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.04] focus:ring-[12px] focus:ring-violet-500/[0.03] transition-all font-black text-2xl tracking-tight"
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 group/input space-y-3">
                                                <label className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-500 group-focus-within/input:text-fuchsia-400 transition-colors px-1">Social Circle</label>
                                                <div className="relative">
                                                    <input
                                                        required
                                                        value={languageGroup}
                                                        onChange={(e) => setLanguageGroup(e.target.value)}
                                                        placeholder="e.g. Gen-Alpha"
                                                        className="w-full bg-white/[0.02] border border-white/[0.06] rounded-[1.5rem] pl-14 pr-8 py-6 text-white placeholder:text-neutral-800 focus:outline-none focus:border-fuchsia-500/40 focus:bg-white/[0.04] focus:ring-[12px] focus:ring-fuchsia-500/[0.03] transition-all font-bold text-lg"
                                                    />
                                                    <Languages className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-700 group-focus-within/input:text-fuchsia-400 transition-colors" />
                                                </div>
                                            </div>

                                            <div className="md:col-span-6 group/input space-y-3">
                                                <label className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-500 group-focus-within/input:text-blue-400 transition-colors px-1">Vocal Expression</label>
                                                <div className="relative">
                                                    <input
                                                        required
                                                        value={pronunciation}
                                                        onChange={(e) => setPronunciation(e.target.value)}
                                                        placeholder="e.g. /rɪz/"
                                                        className="w-full bg-white/[0.02] border border-white/[0.06] rounded-[1.5rem] pl-14 pr-8 py-5 text-white placeholder:text-neutral-800 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.04] focus:ring-[12px] focus:ring-blue-500/[0.03] transition-all font-medium text-xl italic tracking-wider"
                                                    />
                                                    <Quote className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-700 group-focus-within/input:text-blue-400 transition-colors rotate-180" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Section 2: Definition */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative group/card"
                                >
                                    <div className="absolute top-0 right-10 -translate-y-1/2">
                                        <div className="p-4 rounded-[1.5rem] bg-orange-600 shadow-[0_15px_30px_-10px_rgba(234,88,12,0.5)] text-white">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                                The Definition
                                            </h2>
                                            <p className="text-neutral-500 font-medium text-sm">Detail matters. What's the true vibe?</p>
                                        </div>

                                        <div className="group/input space-y-4">
                                            <label className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-500 group-focus-within/input:text-orange-400 transition-colors px-1">Meaning</label>
                                            <div className="relative">
                                                <textarea
                                                    required
                                                    rows={4}
                                                    value={meaning}
                                                    onChange={(e) => setMeaning(e.target.value)}
                                                    placeholder="Break it down. Context is everything..."
                                                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-[2rem] px-10 py-8 text-white placeholder:text-neutral-800 focus:outline-none focus:border-orange-500/40 focus:bg-white/[0.04] focus:ring-[16px] focus:ring-orange-500/[0.02] transition-all resize-none text-xl leading-relaxed font-medium"
                                                />
                                                <div className="absolute right-6 bottom-6 flex items-center gap-2 text-neutral-700">
                                                    <Info className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Specifics only</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Section 3: Examples & References */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                                    {/* Examples */}
                                    <motion.section
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-10 rounded-[3rem] space-y-10"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h2 className="text-xl font-black tracking-tight">Usage Context</h2>
                                                <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-widest">Reality Check</p>
                                            </div>
                                            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tabular-nums">
                                                {examples.length} / 5
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {examples.map((ex, idx) => (
                                                <motion.div key={idx} className="group/item flex gap-3">
                                                    <div className="relative flex-1 group/input">
                                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-neutral-700 group-focus-within/input:text-white transition-colors">{idx + 1}</span>
                                                        <input
                                                            required={idx < 3}
                                                            value={ex}
                                                            onChange={(e) => handleExampleChange(idx, e.target.value)}
                                                            placeholder={`A classic example...`}
                                                            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl pl-12 pr-6 py-5 text-sm text-white placeholder:text-neutral-800 focus:outline-none focus:border-white/20 transition-all font-medium"
                                                        />
                                                    </div>
                                                    {examples.length > 3 && (
                                                        <button type="button" onClick={() => removeExample(idx)} className="p-4 rounded-2xl bg-red-500/5 text-red-400/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            ))}
                                            {examples.length < 5 && (
                                                <button type="button" onClick={addExample} className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-white hover:border-white/20 transition-all bg-white/[0.01] hover:bg-white/[0.03] flex items-center justify-center gap-2">
                                                    <Plus className="w-3 h-3" />
                                                    Expand Context
                                                </button>
                                            )}
                                        </div>
                                    </motion.section>

                                    {/* References */}
                                    <motion.section
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-10 rounded-[3rem] space-y-10"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h2 className="text-xl font-black tracking-tight">Evidence</h2>
                                                <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-widest">Verify Sources</p>
                                            </div>
                                            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tabular-nums">
                                                {references.length} / 3
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {references.map((ref, idx) => (
                                                <motion.div key={idx} className="group/item flex gap-3">
                                                    <div className="relative flex-1 group/input">
                                                        <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700 group-focus-within/input:text-emerald-400 transition-colors" />
                                                        <input
                                                            value={ref}
                                                            onChange={(e) => handleReferenceChange(idx, e.target.value)}
                                                            placeholder="TikTok, Tweet, or Paper"
                                                            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl pl-14 pr-6 py-5 text-sm text-white placeholder:text-neutral-800 focus:outline-none focus:border-emerald-500/30 transition-all font-medium"
                                                        />
                                                        {ref.includes("http") && (
                                                            <ExternalLink className="absolute right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500/40" />
                                                        )}
                                                    </div>
                                                    {references.length > 1 && (
                                                        <button type="button" onClick={() => removeReference(idx)} className="p-4 rounded-2xl bg-red-500/5 text-red-400/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            ))}
                                            {references.length < 3 && (
                                                <button type="button" onClick={addReference} className="w-full py-4 rounded-2xl border border-dashed border-emerald-500/10 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/40 hover:text-emerald-400 hover:border-emerald-500/30 transition-all bg-emerald-500/[0.01] hover:bg-emerald-500/[0.03] flex items-center justify-center gap-2">
                                                    <Plus className="w-3 h-3" />
                                                    Link Evidence
                                                </button>
                                            )}
                                        </div>
                                    </motion.section>
                                </div>

                                {/* Final Submission Card */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="pt-10 space-y-10"
                                >
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="relative w-full group overflow-hidden h-24 rounded-[2.5rem] bg-white text-black transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] disabled:opacity-50"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-200 via-white to-fuchsia-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10 flex items-center justify-center gap-4">
                                            {loading ? (
                                                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <span className="text-3xl font-black tracking-tighter">Manifest Entry</span>
                                                    <Send className="w-6 h-6 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2" />
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    <div className="flex flex-col items-center gap-4">
                                        <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">
                                            noCap network • Core Submission Protocol v2.5
                                        </p>
                                        <div className="h-1 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    </div>
                                </motion.div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </main>
    );
}
