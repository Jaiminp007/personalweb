"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Background Neural Grid */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1f2833_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Neural Core Animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] z-0 pointer-events-none opacity-40 md:opacity-100">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-accent/20 rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-10 border border-white/10 rounded-full border-dashed"
                />
                <motion.div
                    animate={{ rotate: 180 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-20 border border-accent/10 rounded-full"
                />
                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-32 bg-accent/5 rounded-full blur-3xl"
                />
                {/* Core Particles */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-2 h-2 bg-accent rounded-full"
                        animate={{
                            x: [0, Math.cos(i * 2) * 200, 0],
                            y: [0, Math.sin(i * 2) * 200, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0]
                        }}
                        transition={{
                            duration: 5 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5
                        }}
                    />
                ))}
            </div>

            <div className="container relative z-10 px-6 mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    <div className="glass inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-mono tracking-widest text-accent uppercase rounded-full border border-accent/20 shadow-[0_0_15px_rgba(102,252,241,0.3)]">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
                        </span>
                        Neural Interface Active
                    </div>

                    <h1 className="mb-8 text-6xl font-bold tracking-tighter md:text-9xl font-heading text-white leading-[1] mix-blend-screen">
                        <span className="block relative">
                            Jaimin
                            <span className="absolute -top-4 -right-4 text-sm font-mono text-accent opacity-50 tracking-widest hidden md:block">V 2.0</span>
                        </span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-accent to-white text-glow animate-text-shimmer bg-[length:200%_auto]">
                            Patel
                        </span>
                    </h1>

                    <p className="max-w-2xl mb-12 text-lg text-text-primary/70 md:text-xl font-mono leading-relaxed">
                        &gt; ARCHITECTING <span className="text-white">INTELLIGENT SYSTEMS</span>
                        <br className="hidden md:block" />
                        &gt; BRIDGING <span className="text-accent">HUMAN COGNITION</span> & MACHINE EXECUTION
                    </p>

                    <div className="flex flex-col gap-6 sm:flex-row items-center">
                        <button
                            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                            className="group relative inline-flex items-center justify-center h-14 px-10 overflow-hidden font-bold tracking-wider font-mono text-background transition-all duration-300 bg-accent rounded-none hover:bg-white hover:shadow-[0_0_40px_rgba(102,252,241,0.6)] clip-path-slant"
                        >
                            <span className="mr-2">EXECUTE_PROJECTS()</span>
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                        </button>
                        <button
                            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                            className="group inline-flex items-center justify-center h-14 px-10 font-bold tracking-wider font-mono transition-all duration-300 border border-white/20 bg-black/50 text-white hover:border-accent hover:text-accent backdrop-blur-md"
                        >
                            <Terminal className="w-5 h-5 mr-3" />
                            ESTABLISH_UPLINK
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Grid Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
        </section>
    );
}
