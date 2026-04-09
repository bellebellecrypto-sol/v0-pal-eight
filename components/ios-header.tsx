"use client";

import React from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface IosHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export function IosHeader({ title, subtitle, rightAction }: IosHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-40 pt-safe transition-all duration-200",
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/50"
          : "bg-gradient-to-b from-background via-background/90 to-transparent"
      )}
    >
      <div className="mx-auto max-w-lg px-5 py-3">
        <div className="flex min-h-[44px] items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1
              className={cn(
                "font-bold tracking-tight text-foreground transition-all duration-200",
                scrolled ? "text-[17px]" : "text-[22px]"
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p 
                className={cn(
                  "text-[13px] text-muted-foreground transition-all duration-200 overflow-hidden",
                  scrolled ? "max-h-0 opacity-0" : "max-h-6 opacity-100 mt-0.5"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          {rightAction && (
            <div className="ml-3 flex h-11 w-11 flex-shrink-0 items-center justify-center">
              {rightAction}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
