"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Terminal, User, Bot, Copy, Check, Info, ArrowUp } from "lucide-react";
import clsx from "clsx";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  meta?: {
    meaning?: string;
    example?: string;
  };
  timestamp: number;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleAnalyze = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });

      const data = await res.json();

      let aiContent = "";
      let meta = {};

      if (data.error) {
        aiContent = `⚠️ Error: ${data.error}`;
      } else {
        const rawContent = data.reply;
        // Basic parsing for the structured format we requested
        const meaningMatch = rawContent.match(/Meaning:\s*(.*?)(?=\n|Example:|$)/);
        const exampleMatch = rawContent.match(/Example:\s*(.*?)(?=$)/);

        if (meaningMatch) {
          meta = {
            meaning: meaningMatch ? meaningMatch[1].trim() : undefined,
            example: exampleMatch ? exampleMatch[1].trim() : undefined,
          };
          aiContent = rawContent; // Keeping raw for fallback
        } else {
          aiContent = rawContent;
        }
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiContent,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);

    } catch (err) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "⚠️ Failed to connect to the server. Is LM Studio running?",
        timestamp: Date.now(),
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
    <main className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden relative font-sans selection:bg-white/20">

      {/* Background Ambience - Subtle and Premium */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-purple-900/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[20%] w-[60%] h-[60%] bg-blue-900/5 rounded-full blur-[150px]" />
      </div>

      {/* Header - Minimalist */}
      <header className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 h-16 flex items-center justify-center transition-all duration-300">
        <div className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition-opacity cursor-default">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-semibold tracking-wide text-sm text-neutral-200">noCap AI</span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto z-10 pt-24 scroll-smooth custom-scrollbar relative">
        <div className={clsx(
          "min-h-full pb-32 px-4 max-w-2xl mx-auto flex flex-col justify-end gap-6",
          messages.length === 0 && "justify-center"
        )}>

          {/* Empty State - Elegant */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center text-center space-y-6 pb-20"
            >
              <div className="w-20 h-20 rounded-3xl bg-neutral-900/50 flex items-center justify-center border border-white/5 ring-1 ring-white/5 shadow-2xl shadow-purple-900/10">
                <Terminal className="w-10 h-10 text-neutral-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-white tracking-tight">
                  Decode the streets.
                </h2>
                <p className="text-neutral-500 text-sm max-w-xs mx-auto leading-relaxed">
                  Your personal AI interpreter for modern slang. <br /> Private, offline, and instant.
                </p>
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
                  "max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm",
                  msg.role === "user"
                    ? "bg-[#333333] text-white" // Sophisticated dark grey for user
                    : "bg-transparent border border-white/10" // Clean transparent for AI
                )}>

                  {/* AI Icon */}
                  {msg.role === "ai" && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-400">noCap</span>
                    </div>
                  )}

                  <div className={clsx(msg.role === "ai" ? "pl-0" : "")}>
                    {msg.role === "ai" && msg.meta ? (
                      // Premium Structured Result
                      <div className="space-y-5">
                        <div className="group/meaning">
                          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1.5 ml-0.5">Meaning</p>
                          <p className="text-lg leading-7 font-normal text-neutral-100 selection:bg-purple-500/30">
                            {msg.meta.meaning}
                          </p>
                        </div>
                        {msg.meta.example && (
                          <div className="relative pl-4 border-l-2 border-purple-500/30 py-1">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1.5">Example</p>
                            <p className="font-mono text-[13px] md:text-sm text-neutral-300 italic leading-relaxed">
                              "{msg.meta.example}"
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Raw Text / User Message
                      <p className={clsx(
                        "text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap",
                        msg.role === "user" ? "font-normal text-white" : "text-neutral-300"
                      )}>
                        {msg.content}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator - Subtle */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start w-full pl-1"
            >
              <div className="flex items-center gap-1.5 h-8">
                <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-pulse delay-150" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} className="h-0" />
        </div>
      </div>

      {/* Input Footer - Apple Style */}
      <div className="fixed bottom-0 w-full z-40 px-4 pb-6 sm:pb-8 pt-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Blur backdrop for input */}
            <div className="absolute inset-0 bg-[#050505]/50 backdrop-blur-xl rounded-[32px] -m-2 opacity-90" />

            <div className="relative flex items-center bg-[#18181b] rounded-[26px] border border-white/10 p-1.5 pr-2 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/5 transition-all shadow-2xl shadow-purple-900/20">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a slang phrase..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-500 h-[44px] px-4 text-[15px]"
                disabled={loading}
                autoFocus
              />
              <button
                onClick={handleAnalyze}
                disabled={!input || loading}
                className={clsx(
                  "ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                  input.trim() && !loading
                    ? "bg-white text-black hover:scale-105 active:scale-95"
                    : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-neutral-800 rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4 stroke-[3]" />
                )}
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-neutral-700 mt-3 font-medium tracking-wide">
            Powered by Local LM Studio
          </p>
        </div>
      </div>

    </main>
  );
}
