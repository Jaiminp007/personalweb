"use client";

import { motion } from "framer-motion";

export default function AboutSection() {
    const skills = [
        "Next.js", "React", "TypeScript", "Node.js",
        "Python", "TensorFlow", "PyTorch", "LangChain",
        "AWS", "Docker", "PostgreSQL", "Tailwind CSS"
    ];

    return (
        <section className="py-24 bg-background relative overflow-hidden" id="about">
            <div className="container px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex items-center gap-4 mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading text-white">System Specifications</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6 text-lg text-text-primary/80 font-body">
                            <p>
                                I am an AI Engineer passionate about building systems that reason, learn, and interact naturally with humans.
                                My journey began with full-stack development, but the limitless potential of artificial intelligence quickly captivated me.
                            </p>
                            <p>
                                Today, I focus on integrating Large Language Models (LLMs) with robust engineering practices to create
                                agents that can autonomously solve complex problems. I believe in software effectively serving as an extension of human cognition.
                            </p>
                        </div>

                        <div className="bg-surface/30 p-8 rounded-xl border border-surface/50 hover:border-accent/30 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-6 font-heading flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-highlight" />
                                Core Capabilities
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                    <motion.span
                                        key={skill}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        viewport={{ once: true }}
                                        className="px-3 py-1 text-sm bg-surface rounded-full border border-surface/50 text-text-primary hover:text-accent hover:border-accent/50 transition-colors cursor-default"
                                    >
                                        {skill}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
