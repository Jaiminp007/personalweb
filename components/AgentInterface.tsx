"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, Send, Cpu, Loader2, Maximize2, Minimize2 } from "lucide-react";
import clsx from "clsx";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function AgentInterface() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Identity verified. I am the system agent. Accessing project database... Ready for queries." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            setMessages(prev => [...prev, {
                role: "assistant",
                content: data.content
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Error: Connection to Agent Network failed."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 p-4 bg-accent text-background rounded-full shadow-lg hover:shadow-accent/25 hover:scale-110 transition-all duration-300 group"
                    >
                        <Terminal className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className={clsx(
                            "fixed z-50 glass-card overflow-hidden flex flex-col transition-all duration-300",
                            isExpanded
                                ? "inset-4 rounded-2xl"
                                : "bottom-6 right-6 w-[90vw] md:w-[450px] h-[600px] rounded-2xl"
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-3xl">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
                                    <Cpu className="w-4 h-4 text-accent" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-mono font-bold text-sm text-white tracking-wider">SYSTEM_CORE</span>
                                    <span className="text-[10px] text-accent/70 uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                        Online
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-2 text-text-primary/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-text-primary/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={clsx(
                                        "flex flex-col gap-2 max-w-[85%]",
                                        msg.role === "assistant" ? "self-start" : "self-end items-end"
                                    )}
                                >
                                    <div className={clsx(
                                        "p-4 text-sm leading-relaxed shadow-lg backdrop-blur-sm",
                                        msg.role === "assistant"
                                            ? "bg-[#1F2833]/80 text-text-primary border border-white/5 rounded-2xl rounded-tl-sm"
                                            : "bg-accent/90 text-background font-medium rounded-2xl rounded-tr-sm"
                                    )}>
                                        {msg.role === "assistant" ? (
                                            <div className="flex gap-3">
                                                <div className="mt-1 shrink-0 w-1 h-full bg-accent/20 rounded-full" />
                                                <span>{msg.content}</span>
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                    <span className="text-[10px] text-white/30 tracking-wider uppercase font-mono px-1">
                                        {msg.role === "assistant" ? "AI_AGENT" : "USER"}
                                    </span>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="self-start max-w-[85%]"
                                >
                                    <div className="bg-[#1F2833]/80 text-accent border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 shadow-lg">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-xs font-mono tracking-widest animate-pulse">PROCESSING_REQUEST...</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-highlight/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur" />
                                <div className="relative flex items-center bg-[#0B0C10] border border-white/10 rounded-lg overflow-hidden transition-colors group-focus-within:border-accent/50">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Enter command or query..."
                                        className="w-full pl-4 pr-12 py-4 bg-transparent text-white placeholder:text-white/30 focus:outline-none font-mono text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="absolute right-2 p-2 text-accent hover:bg-accent/10 rounded-md transition-all disabled:opacity-50 disabled:hover:bg-transparent"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 text-[10px] text-white/20 text-center font-mono tracking-widest uppercase">
                                Secure Connection Established
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
