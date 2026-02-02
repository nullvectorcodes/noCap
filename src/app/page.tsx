"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Terminal, ArrowUp, Quote, MessageSquareText, Paperclip, X, Image as ImageIcon, ScanText, Mic, MicOff, Globe, Check } from "lucide-react";
import clsx from "clsx";

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

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing...");
  const [messages, setMessages] = useState<Message[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

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
    <main className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden relative font-sans selection:bg-white/20">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 h-16 flex items-center justify-center transition-all duration-300">
        <div className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition-opacity cursor-default">
          <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">.nocap</span>
        </div>
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
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center border border-white/5 ring-4 ring-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Sparkles className="w-12 h-12 text-fuchsia-400 fill-fuchsia-400/20 animate-[pulse_3s_ease-in-out_infinite]" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                  Decode the streets.
                </h2>
                <div className="h-6 flex items-center justify-center gap-1">
                  <span className="text-neutral-400 text-base">Try searching:</span>
                  <Typewriter
                    words={["\"no cap\"", "\"run it back\"", "\"bet\"", "\"it's giving\"", "\"finna\"", "\"rizz\"", "\"simpin\"", "\"slay\""]}
                    className="text-violet-400 text-base font-mono font-medium"
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
                    ? "rounded-2xl rounded-tr-sm bg-neutral-800 text-white border border-white/5 shadow-sm"
                    : "rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 w-full"
                )}>

                  {/* User Image */}
                  {msg.image && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
                      <img src={msg.image} alt="User upload" className="w-auto h-auto max-h-48 max-w-full object-contain bg-black/50" />
                    </div>
                  )}

                  {/* Extracted Text Indicator */}
                  {msg.extractedText && (
                    <div className="mb-3 pl-3 border-l-2 border-violet-500/50">
                      <div className="flex items-center gap-2 mb-1">
                        <ScanText className="w-3 h-3 text-violet-400" />
                        <span className="text-[10px] uppercase tracking-widest text-violet-300/70 font-semibold">Detected Text</span>
                      </div>
                      <p className="text-xs text-neutral-400 font-mono italic leading-relaxed line-clamp-4 hover:line-clamp-none transition-all">
                        {msg.extractedText}
                      </p>
                    </div>
                  )}

                  {/* AI Icon */}
                  {msg.role === "ai" && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Analysis</span>
                    </div>
                  )}

                  <div className={clsx(msg.role === "ai" ? "pl-0" : "")}>

                    {/* Structured Result */}
                    {msg.role === "ai" && msg.parsed ? (
                      <div className="flex flex-col gap-6">

                        {/* Overall Sentence Meaning */}
                        {msg.parsed.sentence_meaning && (
                          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-5 border border-white/10 shadow-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquareText className="w-4 h-4 text-purple-300 opacity-80" />
                              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Translation</h3>
                            </div>
                            <p className="text-lg text-white font-medium leading-relaxed">
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
                              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/10 transition-colors">
                                <div className="flex items-baseline gap-2 mb-2">
                                  <h3 className="text-lg font-bold text-white tracking-tight capitalize">
                                    {item.term}
                                  </h3>
                                  <span className="text-xs text-neutral-500 font-medium uppercase tracking-widest">Slang</span>
                                </div>

                                <p className="text-neutral-300 text-[15px] leading-relaxed mb-4 font-light">
                                  {item.meaning}
                                </p>

                                <div className="bg-black/30 rounded-lg p-3 border-l-2 border-purple-500/50 flex gap-3">
                                  <Quote className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5 opacity-70" />
                                  <p className="font-mono text-xs sm:text-sm text-neutral-400 italic leading-relaxed">
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
                        msg.role === "user" ? "font-normal text-white" : "text-neutral-300",
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
            <div className="absolute inset-0 bg-[#050505]/50 backdrop-blur-xl rounded-full -m-2 opacity-90" />
            <div className="relative flex items-center bg-[#18181b]/80 backdrop-blur-md rounded-full border border-white/10 p-2 pr-3 focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all duration-300 shadow-2xl shadow-violet-900/20">
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
                    <img src={imagePreview} alt="Preview" className="h-16 w-auto rounded-lg border border-white/10 shadow-xl bg-neutral-900 object-cover" />
                    <button onClick={removeImage} className="absolute -top-1.5 -right-1.5 bg-neutral-800 text-white rounded-full p-0.5 border border-white/20 shadow-sm hover:bg-neutral-700 transition-colors">
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
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-500 h-[44px] px-4 text-[15px]"
                disabled={loading}
                autoFocus
                onPaste={(e) => {
                  // Let the global listener handle it, or preventDefault if preferred
                }}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-neutral-400 hover:text-white transition-colors hover:bg-white/5 rounded-full mr-1"
                title="Upload Image"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className={clsx(
                    "p-2 transition-colors hover:bg-white/5 rounded-full mr-1 flex items-center gap-1",
                    showLanguageMenu ? "text-white bg-white/10" : "text-neutral-400 hover:text-white"
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
                        className="absolute bottom-full mb-3 left-0 w-48 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-1"
                      >
                        <div className="px-2 py-1.5 border-b border-white/5 mb-1">
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
                                  ? "bg-violet-500/10 text-violet-300"
                                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
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
                    ? "bg-white text-black hover:scale-110 active:scale-95 shadow-lg shadow-white/20"
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
