"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Cpu, Loader2, User } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content:
                "Hey! I'm Jaimin's Brain 🧠 Ask me anything about my projects, skills, or experience!",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const suggestedQuestions = [
        "What projects have you built?",
        "What's your tech stack?",
        "Tell me about your experience",
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent, value?: string) => {
        if (e) e.preventDefault();
        const messageToSend = value || input;
        if (!messageToSend.trim() || isLoading) return;

        setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, { role: "user", content: messageToSend }] }),
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.message,
                },
            ]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I encountered an error connecting to my brain. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto p-4 md:p-8">
            <div className="flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent pr-4" ref={scrollRef}>
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx(
                            "flex gap-4",
                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                    >
                        <div
                            className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                msg.role === "assistant" ? "bg-accent/10 text-accent" : "bg-white/10 text-white"
                            )}
                        >
                            {msg.role === "assistant" ? <Cpu size={18} /> : <User size={18} />}
                        </div>
                        <div
                            className={clsx(
                                "p-4 rounded-2xl max-w-[80%] text-sm md:text-base leading-relaxed whitespace-pre-wrap",
                                msg.role === "assistant"
                                    ? "bg-surface/50 border border-accent/10 text-text-primary rounded-tl-none"
                                    : "bg-accent text-background rounded-tr-none"
                            )}
                        >
                            {msg.role === "assistant" ? (
                                <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4"
                    >
                        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <Cpu size={18} />
                        </div>
                        <div className="bg-surface/50 border border-accent/10 text-text-primary rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-mono opacity-70">Thinking...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mt-6 space-y-4">
                {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                        {suggestedQuestions.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleSubmit(undefined, q)}
                                className="px-4 py-2 rounded-full bg-accent/5 border border-accent/20 text-accent hover:bg-accent/10 hover:scale-105 transition-all text-sm"
                                disabled={isLoading}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="w-full pl-6 pr-14 py-4 bg-surface/50 border border-white/10 text-text-primary placeholder:text-gray-500 rounded-full focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all shadow-lg"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-accent text-background rounded-full hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
