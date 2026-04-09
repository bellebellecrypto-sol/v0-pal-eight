"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { type Palette, hexToRgb, getContrastColor } from "@/lib/colors";
import { IosHeader } from "./ios-header";
import { Check, X, ArrowLeftRight } from "lucide-react";

interface ContrastCheckerProps {
  savedPalettes: Palette[];
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getWCAGRating(ratio: number): { aa: boolean; aaLarge: boolean; aaa: boolean; aaaLarge: boolean } {
  return {
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

export function ContrastChecker({ savedPalettes }: ContrastCheckerProps) {
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#FFFFFF");
  const [showPalettePicker, setShowPalettePicker] = useState<"foreground" | "background" | null>(null);

  const contrastRatio = getContrastRatio(foreground, background);
  const wcag = getWCAGRating(contrastRatio);

  const swapColors = () => {
    setForeground(background);
    setBackground(foreground);
  };

  const selectColor = (hex: string) => {
    if (showPalettePicker === "foreground") {
      setForeground(hex);
    } else {
      setBackground(hex);
    }
    setShowPalettePicker(null);
  };

  const allColors = savedPalettes.flatMap((p) => p.colors.map((c) => c.hex));
  const uniqueColors = [...new Set(allColors)];

  return (
    <div className="min-h-screen pb-28">
      <IosHeader title="Contrast" subtitle="Check accessibility" />

      <main className="mx-auto max-w-lg px-6 pt-24">
        {/* Preview */}
        <div
          className="mb-6 overflow-hidden rounded-3xl shadow-lg"
          style={{ backgroundColor: background }}
        >
          <div className="p-8">
            <p className="mb-2 text-4xl font-bold" style={{ color: foreground }}>
              Aa
            </p>
            <p className="text-lg font-medium" style={{ color: foreground }}>
              The quick brown fox jumps over the lazy dog.
            </p>
            <p className="mt-2 text-sm" style={{ color: foreground, opacity: 0.8 }}>
              Sample body text to preview readability.
            </p>
          </div>
        </div>

        {/* Contrast Ratio */}
        <div className="mb-6 rounded-2xl bg-card p-6 shadow">
          <div className="mb-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">Contrast Ratio</p>
            <p className="text-5xl font-bold text-foreground">{contrastRatio.toFixed(2)}:1</p>
          </div>

          {/* WCAG Ratings */}
          <div className="grid grid-cols-2 gap-3">
            <RatingBadge label="AA Normal" passed={wcag.aa} />
            <RatingBadge label="AA Large" passed={wcag.aaLarge} />
            <RatingBadge label="AAA Normal" passed={wcag.aaa} />
            <RatingBadge label="AAA Large" passed={wcag.aaaLarge} />
          </div>
        </div>

        {/* Color Selectors */}
        <div className="mb-6 flex items-center gap-3">
          <ColorSelector
            label="Foreground"
            color={foreground}
            onChange={setForeground}
            onPickFromPalette={() => setShowPalettePicker("foreground")}
          />
          
          <button
            onClick={swapColors}
            className="mt-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-all active:scale-90"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <ColorSelector
            label="Background"
            color={background}
            onChange={setBackground}
            onPickFromPalette={() => setShowPalettePicker("background")}
          />
        </div>

        {/* Quick presets */}
        <div className="rounded-2xl bg-card p-4 shadow">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Common Combinations
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { fg: "#000000", bg: "#FFFFFF" },
              { fg: "#FFFFFF", bg: "#000000" },
              { fg: "#1E293B", bg: "#F8FAFC" },
              { fg: "#FFFFFF", bg: "#3B82F6" },
              { fg: "#FFFFFF", bg: "#EF4444" },
              { fg: "#000000", bg: "#FCD34D" },
            ].map((combo, i) => (
              <button
                key={i}
                onClick={() => {
                  setForeground(combo.fg);
                  setBackground(combo.bg);
                }}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-border transition-all active:scale-95"
                style={{ backgroundColor: combo.bg }}
              >
                <span className="text-xs font-bold" style={{ color: combo.fg }}>
                  Aa
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Palette Picker Modal */}
      {showPalettePicker && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowPalettePicker(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-3xl bg-background pb-safe">
            <div className="sticky top-0 border-b border-border bg-background p-4">
              <h3 className="text-center font-semibold text-foreground">
                Select {showPalettePicker === "foreground" ? "Foreground" : "Background"} Color
              </h3>
            </div>
            <div className="p-4">
              {uniqueColors.length > 0 ? (
                <div className="grid grid-cols-6 gap-3">
                  {uniqueColors.map((hex, i) => (
                    <button
                      key={i}
                      onClick={() => selectColor(hex)}
                      className="aspect-square rounded-xl border border-border transition-all active:scale-95"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Save some palettes to pick colors from them
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RatingBadge({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl px-3 py-2",
        passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      {passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
    </div>
  );
}

function ColorSelector({
  label,
  color,
  onChange,
  onPickFromPalette,
}: {
  label: string;
  color: string;
  onChange: (color: string) => void;
  onPickFromPalette: () => void;
}) {
  return (
    <div className="flex-1">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onPickFromPalette}
          className="h-12 w-12 shrink-0 rounded-xl border-2 border-border transition-all active:scale-95"
          style={{ backgroundColor: color }}
        />
        <input
          type="text"
          value={color}
          onChange={(e) => {
            if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) || e.target.value === "") {
              onChange(e.target.value || "#");
            }
          }}
          className="w-full rounded-xl border border-border bg-card px-3 py-2 font-mono text-sm uppercase text-foreground"
        />
      </div>
    </div>
  );
}
