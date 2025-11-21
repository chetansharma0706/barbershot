"use client"
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "glass-card shadow-subtle"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl text-shimmer font-bold text-foreground">
              Barberbro.
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-muted-foreground hover:text-foreground transition-colors font-inter font-medium"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-muted-foreground hover:text-foreground transition-colors font-inter font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-muted-foreground hover:text-foreground transition-colors font-inter font-medium"
            >
              Testimonials
            </button>
            <Button size="default" className="gold-glow font-bold" onClick={() => router.push('/auth/signup')}>
              Get Started Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-card mt-2 p-6 space-y-4 animate-fade-in">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="block w-full text-left text-muted-foreground hover:text-foreground transition-colors font-inter font-medium py-2"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left text-muted-foreground hover:text-foreground transition-colors font-inter font-medium py-2"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="block w-full text-left text-muted-foreground hover:text-foreground transition-colors font-inter font-medium py-2"
            >
              Testimonials
            </button>
            <Button size="default" className="w-full gold-glow" onClick={() => router.push('/auth/signup')}>
              Get Started Free
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
