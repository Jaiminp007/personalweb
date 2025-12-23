"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
    const [lines, setLines] = useState<string[]>([]);

    const bootLines = [
        "> INITIALIZING KERNEL...",
        "> LOADING MEMORY MODULES...",
        "> OPTIMIZING NEURAL PATHWAYS...",
        "> ESTABLISHING SECURE UPLINK...",
        "> ACCESS GRANTED."
    ];

    useEffect(() => {
        let delay = 0;
        bootLines.forEach((line, index) => {
            delay += Math.random() * 300 + 100; // Random delay between 100-400ms
            setTimeout(() => {
                setLines(prev => [...prev, line]);
                // If it's the last line, trigger completion after a short pause
                if (index === bootLines.length - 1) {
                    setTimeout(onComplete, 800);
                }
            }, delay);
        });
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black text-accent font-mono p-10 flex flex-col justify-end pb-20"
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            <div className="max-w-xl">
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-2 text-sm md:text-base tracking-wider"
                    >
                        {line}
                    </motion.div>
                ))}
                <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-3 h-5 bg-accent inline-block ml-1 align-middle"
                />
            </div>

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-20" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-20" />
        </motion.div>
    );
}
