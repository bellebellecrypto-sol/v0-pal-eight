"use client";

import React from "react";

import { useState, useRef, useEffect } from "react";
import { type Palette } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { Heart, Trash2, Share2 } from "lucide-react";
import { useHaptics, useShare, useClipboard } from "@/hooks/use-native";
import { useToast } from "./toast";

interface SwipeablePaletteCardProps {
  palette: Palette;
  onDelete: (palette: Palette) => void;
  onSelect?: (palette: Palette) => void;
  showSelectButton?: boolean;
}

export function SwipeablePaletteCard({
  palette,
  onDelete,
  onSelect,
  showSelectButton = false,
}: SwipeablePaletteCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { impact, notification, selection } = useHaptics();
  const { share, canShare } = useShare();
  const { copy } = useClipboard();
  const { showToast } = useToast();

  const SWIPE_THRESHOLD = 80;
  const MAX_SWIPE = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = translateX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX.current;
    const newTranslate = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, currentX.current + diff));
    setTranslateX(newTranslate);
  };

  const handleTouchEnd = async () => {
    setIsDragging(false);
    
    if (translateX < -SWIPE_THRESHOLD) {
      await notification("warning");
      setTranslateX(-MAX_SWIPE);
    } else if (translateX > SWIPE_THRESHOLD) {
      await impact("light");
      setTranslateX(MAX_SWIPE);
    } else {
      setTranslateX(0);
    }
  };

  const handleDelete = async () => {
    await notification("error");
    showToast("Palette removed", "info");
    onDelete(palette);
    setTranslateX(0);
  };

  const handleShare = async () => {
    await impact("light");
    const text = `Check out this palette: ${palette.name}\n${palette.colors.map((c) => c.hex).join(" ")}`;
    if (canShare) {
      await share({ title: palette.name, text });
    } else {
      await copy(text);
      showToast("Palette copied to clipboard!", "success");
    }
    setTranslateX(0);
  };

  const handleCardClick = async () => {
    if (Math.abs(translateX) < 10 && onSelect) {
      await selection();
      onSelect(palette);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setTranslateX(0);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={cardRef} className="relative overflow-hidden rounded-3xl">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        {/* Share action (left side, revealed on right swipe) */}
        <div
          className={cn(
            "flex w-1/2 items-center justify-start bg-sky-500 pl-5 transition-opacity duration-150",
            translateX > 20 ? "opacity-100" : "opacity-0"
          )}
        >
          <button 
            onClick={handleShare} 
            className="flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded-2xl text-white transition-transform duration-150 active:scale-95"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-[10px] font-medium">Share</span>
          </button>
        </div>

        {/* Delete action (right side, revealed on left swipe) */}
        <div
          className={cn(
            "flex w-1/2 items-center justify-end bg-rose-500 pr-5 transition-opacity duration-150",
            translateX < -20 ? "opacity-100" : "opacity-0"
          )}
        >
          <button 
            onClick={handleDelete} 
            className="flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded-2xl text-white transition-transform duration-150 active:scale-95"
          >
            <Trash2 className="h-5 w-5" />
            <span className="text-[10px] font-medium">Delete</span>
          </button>
        </div>
      </div>

      {/* Main card */}
      <div
        className={cn(
          "relative bg-card ring-1 ring-border/50",
          isDragging ? "transition-none" : "transition-transform duration-200"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
      >
        <div className="flex h-20">
          {palette.colors.map((color, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: color.hex }} />
          ))}
        </div>
        <div className="flex min-h-[44px] items-center justify-between px-4 py-2">
          <span className="text-[14px] font-semibold text-foreground">{palette.name}</span>
          {showSelectButton ? (
            <span className="flex h-9 items-center rounded-full bg-primary/10 px-3 text-[12px] font-semibold text-primary">
              Select
            </span>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50">
              <Heart className="h-4 w-4 fill-current text-rose-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
