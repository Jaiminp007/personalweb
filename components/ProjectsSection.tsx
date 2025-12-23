"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";

export default function ProjectsSection() {
    const projects = [
        {
            title: "Algo Clash",
            description: "A competitive platform for algorithmic challenges. Real-time code execution and multiplayer battles.",
            tags: ["Next.js", "WebSockets", "Docker"],
            links: { demo: "#", github: "#" },
            image: "/projects/algo-clash.png"
        },
        {
            title: "MoodMate",
            description: "AI-powered emotional health assistant. Uses sentiment analysis to provide personalized wellbeing recommendations.",
            tags: ["Python", "TensorFlow", "NLP"],
            links: { demo: "#", github: "#" },
            image: "/projects/moodmate.png"
        },
        {
            title: "Quantum Trading Engine",
            description: "High-performance limit order book and matching engine built in C++17. Features real-time execution reporting and TUI.",
            tags: ["C++17", "Low Latency", "Systems"],
            links: { demo: "#", github: "#" },
            image: "/projects/quantum-trading.png"
        }
    ];

    return (
        <section className="py-24 bg-background relative" id="projects">
            <div className="container px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center gap-4 mb-16">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
                        <h2 className="text-4xl md:text-5xl font-bold font-heading text-white">Deployed Systems</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="group relative bg-surface/20 border border-surface/50 rounded-xl overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(102,252,241,0.1)] flex flex-col"
                            >
                                <div className="relative h-48 w-full overflow-hidden">
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                                        <a href={project.links.github} className="p-2 bg-surface rounded-full text-white hover:bg-accent hover:text-background transition-colors">
                                            <Github size={20} />
                                        </a>
                                        <a href={project.links.demo} className="p-2 bg-surface rounded-full text-white hover:bg-accent hover:text-background transition-colors">
                                            <ExternalLink size={20} />
                                        </a>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-white font-heading mb-2 group-hover:text-accent transition-colors">
                                        {project.title}
                                    </h3>

                                    <p className="text-text-primary/80 mb-6 text-sm flex-grow font-body">
                                        {project.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="text-xs font-medium px-2 py-1 rounded bg-surface/50 text-highlight border border-surface/50">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
