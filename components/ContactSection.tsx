"use client";

import { motion } from "framer-motion";
import { Mail, Linkedin, Github, Send } from "lucide-react";

export default function ContactSection() {
    return (
        <section className="py-24 bg-background relative" id="contact">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -right-1/4 bottom-0 w-1/2 h-1/2 bg-accent/5 rounded-full blur-[128px]" />
            </div>

            <div className="container px-6 mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">Initialize Uplink</h2>
                        <p className="text-lg text-text-primary/80 max-w-2xl mx-auto font-body">
                            Ready to collaborate on the next generation of intelligent systems?
                            Establish a connection channel below.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="bg-surface/30 p-6 rounded-xl border border-surface/50">
                                <h3 className="text-lg font-bold text-white mb-4 font-heading flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                    Uplink Frequencies
                                </h3>
                                <div className="space-y-4">
                                    <a href="mailto:hello@example.com" className="flex items-center gap-3 text-text-primary hover:text-accent transition-colors">
                                        <Mail size={20} />
                                        <span>jaimin@example.com</span>
                                    </a>
                                    <a href="#" className="flex items-center gap-3 text-text-primary hover:text-accent transition-colors">
                                        <Linkedin size={20} />
                                        <span>linkedin.com/in/jaimin</span>
                                    </a>
                                    <a href="#" className="flex items-center gap-3 text-text-primary hover:text-accent transition-colors">
                                        <Github size={20} />
                                        <span>github.com/jaimin</span>
                                    </a>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
                                <p className="text-sm text-accent font-mono">
                                    &gt; STATUS: OPEN FOR OPPORTUNITIES<br />
                                    &gt; LATENCY: LOW<br />
                                    &gt; AGENT: ONLINE
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-text-primary">Source ID</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="w-full px-4 py-3 rounded-lg bg-surface/50 border border-surface text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-gray-600"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-text-primary">Signal Origin</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full px-4 py-3 rounded-lg bg-surface/50 border border-surface text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-gray-600"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-text-primary">Data Packet</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg bg-surface/50 border border-surface text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-gray-600 resize-none"
                                    placeholder="Project details or inquiry..."
                                />
                            </div>

                            <button className="w-full py-4 bg-accent text-background font-bold rounded-lg hover:bg-highlight transition-all duration-300 flex items-center justify-center gap-2 group">
                                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                                Transmit Message
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
