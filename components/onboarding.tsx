"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Palette, Eye, ImageIcon, ArrowRight, ChevronRight } from "lucide-react";
import { useHaptics } from "@/hooks/use-native";

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Sparkles,
    title: "Generate Palettes",
    description: "Create harmonious color combinations for any purpose - branding, UI design, interiors, and more.",
    colors: ["#FF6B6B", "#FEC89A", "#FFD93D", "#6BCB77", "#4D96FF"],
  },
  {
    icon: Palette,
    title: "Explore Curated Colors",
    description: "Browse hand-picked palettes and discover trending color schemes from our collection.",
    colors: ["#1A4D2E", "#4F6F52", "#739072", "#A3B899", "#E9F5DB"],
  },
  {
    icon: Eye,
    title: "Visualize in Context",
    description: "See how your palettes look applied to real UI mockups - apps, dashboards, and websites.",
    colors: ["#6366F1", "#8B5CF6", "#A855F7", "#1E293B", "#F8FAFC"],
  },
  {
    icon: ImageIcon,
    title: "Extract from Images",
    description: "Upload any photo and automatically extract the dominant colors to create unique palettes.",
    colors: ["#8E6B5E", "#C9ADA7", "#E8D5D1", "#F2E9E4", "#9A8C98"],
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const { impact, selection } = useHaptics();
  const skipRef = useRef<HTMLButtonElement>(null);

  const handleNext = async () => {
    if (isTransitioning) return;
    await impact("light");
    
    if (currentSlide < slides.length - 1) {
      setDirection("forward");
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsTransitioning(false);
      }, 50);
    } else {
      await impact("medium");
      onComplete();
    }
  };

  const handleSkip = async () => {
    await selection();
    // Add brief highlight effect
    skipRef.current?.classList.add("bg-secondary/80");
    setTimeout(() => {
      skipRef.current?.classList.remove("bg-secondary/80");
      onComplete();
    }, 100);
  };

  const handleDotClick = async (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    await selection();
    setDirection(index > currentSlide ? "forward" : "back");
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 50);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 pt-safe">
        <span className="text-xl font-bold tracking-tight text-foreground">pal</span>
        <button
          ref={skipRef}
          onClick={handleSkip}
          className="flex items-center gap-0.5 rounded-xl px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-all duration-150 active:scale-95"
        >
          Skip
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Content with parallax motion */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        {/* Icon tile - parallax slower */}
        <div 
          key={`icon-${currentSlide}`}
          className={cn(
            "mb-8 flex h-20 w-20 items-center justify-center rounded-2xl shadow-md",
            isTransitioning ? "opacity-0" : "animate-parallax-slow"
          )}
          style={{ 
            backgroundColor: `${slide.colors[2]}12`,
            animationDirection: direction === "back" ? "reverse" : "normal"
          }}
        >
          <Icon 
            className="h-10 w-10" 
            style={{ color: slide.colors[2] }} 
          />
        </div>

        {/* Color bar - parallax slower */}
        <div 
          key={`colors-${currentSlide}`}
          className={cn(
            "mb-10 flex h-16 w-full max-w-[280px] overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5",
            isTransitioning ? "opacity-0" : "animate-parallax-slow"
          )}
          style={{ 
            animationDelay: "30ms",
            animationDirection: direction === "back" ? "reverse" : "normal"
          }}
        >
          {slide.colors.map((color, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Text - parallax faster */}
        <div
          key={`text-${currentSlide}`}
          className={cn(
            isTransitioning ? "opacity-0" : "animate-parallax-fast"
          )}
          style={{ animationDirection: direction === "back" ? "reverse" : "normal" }}
        >
          <h1 className="mb-2 text-center text-xl font-bold tracking-tight text-foreground">
            {slide.title}
          </h1>
          <p className="max-w-[300px] text-center text-[15px] leading-relaxed text-muted-foreground">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-8 pb-safe">
        {/* Progress dots with expand animation */}
        <div className="mb-5 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentSlide 
                  ? "w-8 bg-primary animate-dot-expand" 
                  : "w-1.5 bg-border active:scale-125"
              )}
            />
          ))}
        </div>

        {/* Next button with press scale + spring return */}
        <button
          onClick={handleNext}
          disabled={isTransitioning}
          className={cn(
            "relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground shadow-sm",
            "transition-transform duration-150 active:scale-[0.98]",
            "disabled:opacity-90"
          )}
        >
          {/* Highlight sweep on hover/focus */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-200 hover:opacity-100" />
          <span className="relative flex items-center gap-2">
            {isLastSlide ? "Get Started" : "Continue"}
            <ArrowRight className="h-5 w-5 transition-transform duration-200" />
          </span>
        </button>
      </div>
    </div>
  );
}
