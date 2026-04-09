"use client";

import { useState, useEffect, useRef } from "react";
import { type Palette, type Color, getContrastColor, generatePalette, type UseCase } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { Check, Copy, Heart, Lock, RefreshCw, Share2, Download, Pencil, Sparkles } from "lucide-react";
import { useHaptics, useClipboard, useShare } from "@/hooks/use-native";
import { ColorEditor } from "./color-editor";
import { ExportModal } from "./export-modal";
import { useToast } from "./toast";

interface EditablePaletteProps {
  palette: Palette;
  useCase: UseCase;
  onSave?: (palette: Palette) => void;
  onPaletteChange?: (palette: Palette) => void;
  isSaved?: boolean;
}

export function EditablePalette({
  palette,
  useCase,
  onSave,
  onPaletteChange,
  isSaved = false,
}: EditablePaletteProps) {
  const [currentPalette, setCurrentPalette] = useState(palette);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [brightenIndex, setBrightenIndex] = useState<number | null>(null);
  const [liked, setLiked] = useState(isSaved);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [lockedColors, setLockedColors] = useState<boolean[]>([false, false, false, false, false]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [lastEditedIndex, setLastEditedIndex] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [regenerateKey, setRegenerateKey] = useState(0);
  
  const { impact, notification, selection } = useHaptics();
  const { copy } = useClipboard();
  const { share, canShare } = useShare();
  const { showToast } = useToast();

  useEffect(() => {
    setCurrentPalette(palette);
    setLiked(isSaved);
  }, [palette, isSaved]);

  const copyToClipboard = async (hex: string, index: number) => {
    const success = await copy(hex);
    if (success) {
      await selection(); // Light tick haptic
      
      // Brighten effect
      setBrightenIndex(index);
      setTimeout(() => setBrightenIndex(null), 300);
      
      // Show checkmark
      setCopiedIndex(index);
      showToast(`Copied ${hex}`, "success");
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  const copyAllColors = async () => {
    const allHex = currentPalette.colors.map((c) => c.hex).join(", ");
    const success = await copy(allHex);
    if (success) {
      await impact("medium");
      showToast("All colors copied!", "success");
    }
  };

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    
    // Trigger heart animation
    if (newLiked) {
      setHeartAnimating(true);
      setTimeout(() => setHeartAnimating(false), 400);
    }
    
    await notification(newLiked ? "success" : "warning");
    showToast(newLiked ? "Palette saved!" : "Palette removed", newLiked ? "success" : "info");
    if (onSave) {
      onSave(currentPalette);
    }
  };

  const handleShare = async () => {
    await impact("light");
    const text = `Check out this palette: ${currentPalette.name}\n${currentPalette.colors.map((c) => c.hex).join(" ")}`;
    if (canShare) {
      await share({ title: currentPalette.name, text });
    } else {
      await copy(text);
      showToast("Palette copied to clipboard!", "success");
    }
  };

  const toggleLock = async (index: number) => {
    await selection();
    setLockedColors((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
    showToast(lockedColors[index] ? "Color unlocked" : "Color locked", "info");
  };

  const handleColorChange = (index: number, newHex: string) => {
    const newColors = [...currentPalette.colors];
    newColors[index] = { ...newColors[index], hex: newHex };
    const newPalette = { ...currentPalette, colors: newColors };
    setCurrentPalette(newPalette);
    onPaletteChange?.(newPalette);
    showToast("Color updated", "success");
  };

  const handleEditSwatch = async (index: number) => {
    await selection();
    setEditingIndex(index);
    setLastEditedIndex(index);
  };

  const regenerateUnlocked = async () => {
    setIsRegenerating(true);
    await impact("medium");
    
    setTimeout(() => {
      const newPalette = generatePalette(useCase);
      const mergedColors = currentPalette.colors.map((color, i) =>
        lockedColors[i] ? color : newPalette.colors[i]
      );
      const updatedPalette = {
        ...newPalette,
        id: currentPalette.id,
        colors: mergedColors,
      };
      setCurrentPalette(updatedPalette);
      onPaletteChange?.(updatedPalette);
      setRegenerateKey((k) => k + 1); // Trigger stagger animation
      setIsRegenerating(false);
      
      const lockedCount = lockedColors.filter(Boolean).length;
      if (lockedCount > 0) {
        showToast(`Regenerated ${5 - lockedCount} colors`, "success");
      } else {
        showToast("Palette regenerated!", "success");
      }
    }, 400);
  };

  return (
    <>
      <div className={cn(
        "overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/50",
        isRegenerating && "animate-crossfade-blur"
      )}>
        {/* Color swatches */}
        <div className="relative">
          <div className="flex h-44">
            {currentPalette.colors.map((color, index) => (
              <button
                key={index}
                onClick={() => handleEditSwatch(index)}
                className={cn(
                  "relative flex-1 transition-all duration-150",
                  "active:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                  brightenIndex === index && "animate-swatch-brighten"
                )}
                style={{ backgroundColor: color.hex }}
              >
                {/* Lock indicator */}
                {lockedColors[index] && (
                  <div
                    className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/10 p-1.5 animate-spring-pop"
                    style={{ color: getContrastColor(color.hex) }}
                  >
                    <Lock className="h-3 w-3" />
                  </div>
                )}

                {/* Copied indicator with sparkle */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all duration-200",
                    copiedIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  )}
                  style={{ color: getContrastColor(color.hex) }}
                >
                  <div className="relative flex flex-col items-center gap-0.5">
                    <Check className={cn("h-5 w-5", copiedIndex === index && "animate-spring-pop")} />
                    {/* Mini sparkle particles */}
                    {copiedIndex === index && (
                      <>
                        <Sparkles 
                          className="absolute -right-2 -top-2 h-3 w-3 animate-sparkle" 
                          style={{ animationDelay: "0ms" }}
                        />
                        <Sparkles 
                          className="absolute -left-1 top-0 h-2 w-2 animate-sparkle" 
                          style={{ animationDelay: "100ms" }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Pencil edit affordance */}
          <button
            onClick={() => handleEditSwatch(lastEditedIndex)}
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-black/20 text-white backdrop-blur-sm transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Pencil className="h-[18px] w-[18px]" />
          </button>
        </div>
        
        {/* Edit hint */}
        <div className="px-4 pt-3">
          <p className="text-center text-[11px] text-muted-foreground/70">Tap a color to edit</p>
        </div>

        {/* Info and actions */}
        <div className="p-4 pt-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{currentPalette.name}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={regenerateUnlocked}
                disabled={isRegenerating}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/60 text-muted-foreground transition-transform duration-150 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <RefreshCw className={cn("h-[18px] w-[18px]", isRegenerating && "animate-spin")} />
              </button>
              <button
                onClick={() => setShowExport(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/60 text-muted-foreground transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Download className="h-[18px] w-[18px]" />
              </button>
              <button
                onClick={handleShare}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/60 text-muted-foreground transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Share2 className="h-[18px] w-[18px]" />
              </button>
              <button
                onClick={handleLike}
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  liked ? "bg-rose-50 text-rose-500" : "bg-secondary/60 text-muted-foreground"
                )}
              >
                <Heart className={cn(
                  "h-[18px] w-[18px]", 
                  liked && "fill-current",
                  heartAnimating && "animate-heart-burst"
                )} />
                {/* Micro burst glow */}
                {heartAnimating && (
                  <span className="absolute inset-0 rounded-2xl bg-rose-400/20 animate-scale-in" />
                )}
              </button>
            </div>
          </div>

          {/* Color chips - iOS style pills with stagger animation */}
          <div className="flex flex-wrap gap-2">
            {currentPalette.colors.map((color, index) => (
              <button
                key={`${regenerateKey}-${index}`}
                onClick={() => copyToClipboard(color.hex, index)}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-full px-3 text-[12px] font-medium",
                  "transition-transform duration-150 active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  "animate-stagger-fade-in",
                  lockedColors[index]
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                    : "bg-secondary/70 text-secondary-foreground"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {lockedColors[index] && <Lock className="h-3 w-3" />}
                <span
                  className="h-3 w-3 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="font-mono uppercase">{color.hex.replace("#", "")}</span>
              </button>
            ))}
          </div>

          {/* Copy All button */}
          <div className="mt-4">
            <button
              onClick={copyAllColors}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-secondary/60 text-[13px] font-medium text-secondary-foreground transition-transform duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Copy className="h-4 w-4" />
              Copy All
            </button>
          </div>
        </div>
      </div>

      {/* Color Editor Modal */}
      {editingIndex !== null && (
        <ColorEditor
          color={currentPalette.colors[editingIndex]}
          index={editingIndex}
          isLocked={lockedColors[editingIndex]}
          onColorChange={handleColorChange}
          onLockToggle={toggleLock}
          onClose={() => setEditingIndex(null)}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <ExportModal palette={currentPalette} onClose={() => setShowExport(false)} />
      )}
    </>
  );
}
