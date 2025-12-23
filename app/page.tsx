"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Chat from "@/components/Chat";
import BootSequence from "@/components/BootSequence";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import { Laptop, MessageSquare } from "lucide-react";
import clsx from "clsx";

export default function Home() {
  const [view, setView] = useState<"portfolio" | "chat">("portfolio");
  const [booted, setBooted] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      </AnimatePresence>

      <main className={`min-h-screen bg-background text-text-primary selection:bg-accent selection:text-background pt-20 transition-opacity duration-1000 ${booted ? "opacity-100" : "opacity-0"}`}>
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#0B0C10]/80 backdrop-blur-md border border-white/10 p-1.5 rounded-full flex gap-1 shadow-2xl">
          <button
            onClick={() => setView("portfolio")}
            className={clsx(
              "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
              view === "portfolio"
                ? "bg-accent text-background shadow-lg"
                : "text-text-primary/70 hover:text-white hover:bg-white/5"
            )}
          >
            <Laptop size={16} />
            Portfolio
          </button>
          <button
            onClick={() => setView("chat")}
            className={clsx(
              "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
              view === "chat"
                ? "bg-accent text-background shadow-lg"
                : "text-text-primary/70 hover:text-white hover:bg-white/5"
            )}
          >
            <MessageSquare size={16} />
            Jaimin's Brain
          </button>
        </div>

        <div className="relative w-full min-h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            {view === "portfolio" ? (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <HeroSection />
                <AboutSection />
                <ProjectsSection />
                <ContactSection />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Chat />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
