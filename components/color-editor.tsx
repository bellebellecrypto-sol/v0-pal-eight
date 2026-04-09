"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Lock, Unlock, RotateCcw } from "lucide-react";
import { type Color, hexToRgb, rgbToHsl, getContrastColor } from "@/lib/colors";
import { useHaptics } from "@/hooks/use-native";

interface ColorEditorProps {
  color: Color;
  index: number;
  isLocked: boolean;
  onColorChange: (index: number, newHex: string) => void;
  onLockToggle: (index: number) => void;
  onClose: () => void;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function ColorEditor({
  color,
  index,
  isLocked,
  onColorChange,
  onLockToggle,
  onClose,
}: ColorEditorProps) {
  const rgb = hexToRgb(color.hex);
  const initialHsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const [hue, setHue] = useState(initialHsl.h);
  const [saturation, setSaturation] = useState(initialHsl.s);
  const [lightness, setLightness] = useState(initialHsl.l);
  const [hexInput, setHexInput] = useState(color.hex);
  const { impact, selection } = useHaptics();

  const currentHex = hslToHex(hue, saturation, lightness);
  const contrastColor = getContrastColor(currentHex);

  useEffect(() => {
    setHexInput(currentHex);
  }, [currentHex]);

  const handleHexInput = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const newRgb = hexToRgb(value);
      const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
      setHue(newHsl.h);
      setSaturation(newHsl.s);
      setLightness(newHsl.l);
    }
  };

  const handleApply = async () => {
    await impact("medium");
    onColorChange(index, currentHex);
    onClose();
  };

  const handleReset = async () => {
    await selection();
    const originalRgb = hexToRgb(color.hex);
    const originalHsl = rgbToHsl(originalRgb.r, originalRgb.g, originalRgb.b);
    setHue(originalHsl.h);
    setSaturation(originalHsl.s);
    setLightness(originalHsl.l);
  };

  const handleLock = async () => {
    await selection();
    onLockToggle(index);
  };

  return (
    <div className="fixed inset-0 z-[150]">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-background pb-safe">
        {/* Color Preview Header */}
        <div
          className="flex h-32 items-end justify-between rounded-t-3xl p-4"
          style={{ backgroundColor: currentHex }}
        >
          <div style={{ color: contrastColor }}>
            <p className="text-sm font-medium opacity-70">{color.name}</p>
            <p className="text-2xl font-bold uppercase">{currentHex}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors"
            style={{ backgroundColor: `${contrastColor}20`, color: contrastColor }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Action buttons */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={handleLock}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors",
                isLocked
                  ? "bg-amber-100 text-amber-700"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              {isLocked ? "Locked" : "Lock Color"}
            </button>
            <button
              onClick={handleReset}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-medium text-secondary-foreground transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          {/* Hex input */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Hex Color
            </label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm uppercase text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="#000000"
            />
          </div>

          {/* Hue slider */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Hue
              </label>
              <span className="text-sm font-medium text-foreground">{hue}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="h-3 w-full cursor-pointer appearance-none rounded-full"
              style={{
                background: `linear-gradient(to right, 
                  hsl(0, 100%, 50%), 
                  hsl(60, 100%, 50%), 
                  hsl(120, 100%, 50%), 
                  hsl(180, 100%, 50%), 
                  hsl(240, 100%, 50%), 
                  hsl(300, 100%, 50%), 
                  hsl(360, 100%, 50%))`,
              }}
            />
          </div>

          {/* Saturation slider */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Saturation
              </label>
              <span className="text-sm font-medium text-foreground">{saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="h-3 w-full cursor-pointer appearance-none rounded-full"
              style={{
                background: `linear-gradient(to right, 
                  hsl(${hue}, 0%, ${lightness}%), 
                  hsl(${hue}, 100%, ${lightness}%))`,
              }}
            />
          </div>

          {/* Lightness slider */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Lightness
              </label>
              <span className="text-sm font-medium text-foreground">{lightness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={lightness}
              onChange={(e) => setLightness(Number(e.target.value))}
              className="h-3 w-full cursor-pointer appearance-none rounded-full"
              style={{
                background: `linear-gradient(to right, 
                  hsl(${hue}, ${saturation}%, 0%), 
                  hsl(${hue}, ${saturation}%, 50%), 
                  hsl(${hue}, ${saturation}%, 100%))`,
              }}
            />
          </div>

          {/* Apply button */}
          <button
            onClick={handleApply}
            className="w-full rounded-2xl bg-foreground py-4 text-base font-semibold text-background transition-all active:scale-[0.98]"
          >
            Apply Color
          </button>
        </div>
      </div>
    </div>
  );
}
