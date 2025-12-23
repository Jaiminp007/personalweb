import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";

export default function FallbackPortfolio() {
    return (
        <div className="space-y-0">
            <HeroSection />
            <AboutSection />
            <ProjectsSection />
            <ContactSection />
        </div>
    );
}
