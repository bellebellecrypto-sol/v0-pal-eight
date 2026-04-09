"use client";

import { useState, useEffect } from "react";
import { type Palette, getContrastColor } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { Check, Heart } from "lucide-react";
import { useHaptics, useClipboard } from "@/hooks/use-native";

interface PaletteCardProps {
  palette: Palette;
  onSave?: (palette: Palette) => void;
  isSaved?: boolean;
}

export function PaletteCard({ palette, onSave, isSaved = false }: PaletteCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [liked, setLiked] = useState(isSaved);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const { impact, notification, selection } = useHaptics();
  const { copy } = useClipboard();

  useEffect(() => {
    setLiked(isSaved);
  }, [isSaved]);

  const copyToClipboard = async (hex: string, index: number) => {
    const success = await copy(hex);
    if (success) {
      await selection();
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1200);
    }
  };

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    if (newLiked) {
      setHeartAnimating(true);
      setTimeout(() => setHeartAnimating(false), 400);
    }
    await notification(newLiked ? "success" : "warning");
    if (onSave) {
      onSave(palette);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/50">
      {/* Color swatches - no flex reflow, stable layout */}
      <div className="flex h-40">
        {palette.colors.map((color, index) => (
          <button
            key={index}
            onClick={() => copyToClipboard(color.hex, index)}
            className="relative flex-1 transition-opacity duration-150 active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            style={{ backgroundColor: color.hex }}
          >
            {/* Copied overlay with smooth fade */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-200",
                copiedIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}
              style={{ color: getContrastColor(color.hex) }}
            >
              <div className="flex flex-col items-center gap-0.5">
                <Check className={cn("h-5 w-5", copiedIndex === index && "animate-spring-pop")} />
                <span className="text-[10px] font-semibold">Copied</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{palette.name}</h3>
          {/* 44x44 touch target for like button */}
          <button
            onClick={handleLike}
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-150 active:scale-95",
              liked ? "bg-rose-50 text-rose-500" : "bg-secondary/60 text-muted-foreground"
            )}
          >
            <Heart className={cn(
              "h-[18px] w-[18px]",
              liked && "fill-current",
              heartAnimating && "animate-heart-burst"
            )} />
          </button>
        </div>

        {/* iOS-style hex chips */}
        <div className="flex flex-wrap gap-2">
          {palette.colors.map((color, index) => (
            <button
              key={index}
              onClick={() => copyToClipboard(color.hex, index)}
              className="flex h-9 items-center gap-2 rounded-full bg-secondary/70 px-3 text-[12px] font-medium text-secondary-foreground transition-transform duration-150 active:scale-95"
            >
              <span
                className="h-3 w-3 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: color.hex }}
              />
              <span className="font-mono uppercase">{color.hex.replace("#", "")}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
