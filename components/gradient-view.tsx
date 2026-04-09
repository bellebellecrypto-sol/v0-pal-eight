"use client";

import { useState } from "react";
import {
  type Gradient,
  type GradientType,
  type GradientDirection,
  generateGradientCSS,
  generateRandomGradient,
  getContrastColor,
  type Palette,
} from "@/lib/colors";
import { IosHeader } from "./ios-header";
import { cn } from "@/lib/utils";
import { useHaptics, useClipboard, useShare } from "@/hooks/use-native";
import {
  RefreshCw,
  Copy,
  Check,
  Plus,
  Trash2,
  Share2,
  Palette as PaletteIcon,
  ChevronDown,
  X,
  Sparkles,
} from "lucide-react";

const gradientTypes: { id: GradientType; label: string }[] = [
  { id: "linear", label: "Linear" },
  { id: "radial", label: "Radial" },
  { id: "conic", label: "Conic" },
];

const directions: { id: GradientDirection; label: string; angle: string }[] = [
  { id: "to right", label: "Right", angle: "90deg" },
  { id: "to left", label: "Left", angle: "270deg" },
  { id: "to bottom", label: "Down", angle: "180deg" },
  { id: "to top", label: "Up", angle: "0deg" },
  { id: "to bottom right", label: "BR", angle: "135deg" },
  { id: "to bottom left", label: "BL", angle: "225deg" },
  { id: "to top right", label: "TR", angle: "45deg" },
  { id: "to top left", label: "TL", angle: "315deg" },
];

interface GradientViewProps {
  savedPalettes?: Palette[];
}

export function GradientView({ savedPalettes = [] }: GradientViewProps) {
  const [gradient, setGradient] = useState<Gradient>(generateRandomGradient);
  const [copied, setCopied] = useState(false);
  const [showPaletteSelector, setShowPaletteSelector] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const { impact, notification } = useHaptics();
  const { copy } = useClipboard();
  const { share, canShare } = useShare();

  // Generate gradient from a palette
  const generateFromPalette = async (palette: Palette) => {
    await impact("medium");
    setSelectedPalette(palette);
    
    // Create gradient stops from palette colors
    const stops = palette.colors.slice(0, 4).map((color, index, arr) => ({
      color: color.hex,
      position: (index / (arr.length - 1)) * 100,
    }));
    
    setGradient({
      type: "linear",
      direction: "to right",
      stops,
      name: `${palette.name} Gradient`,
    });
    setShowPaletteSelector(false);
  };

  const clearPaletteSelection = async () => {
    await impact("light");
    setSelectedPalette(null);
  };

  const handleGenerate = async () => {
    await impact("medium");
    
    // If a palette was selected, show reset animation
    if (selectedPalette) {
      setIsResetting(true);
      setSelectedPalette(null);
      // Brief delay for visual feedback before generating
      await new Promise(resolve => setTimeout(resolve, 150));
      setIsResetting(false);
    }
    
    setGradient(generateRandomGradient());
  };

  const handleTypeChange = async (type: GradientType) => {
    await impact("light");
    setGradient((prev) => ({ ...prev, type }));
  };

  const handleDirectionChange = async (direction: GradientDirection) => {
    await impact("light");
    setGradient((prev) => ({ ...prev, direction }));
  };

  const handleColorChange = (index: number, color: string) => {
    setGradient((prev) => ({
      ...prev,
      stops: prev.stops.map((stop, i) =>
        i === index ? { ...stop, color } : stop
      ),
    }));
  };

  const handlePositionChange = async (index: number, position: number) => {
    setGradient((prev) => ({
      ...prev,
      stops: prev.stops.map((stop, i) =>
        i === index ? { ...stop, position } : stop
      ),
    }));
  };

  const addStop = async () => {
    if (gradient.stops.length >= 5) return;
    await impact("light");
    const lastStop = gradient.stops[gradient.stops.length - 1];
    const newPosition = Math.min(lastStop.position + 20, 100);
    setGradient((prev) => ({
      ...prev,
      stops: [...prev.stops, { color: "#888888", position: newPosition }],
    }));
  };

  const removeStop = async (index: number) => {
    if (gradient.stops.length <= 2) return;
    await impact("light");
    setGradient((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }));
  };

  const cssCode = generateGradientCSS(gradient);

  const handleCopy = async () => {
    const success = await copy(`background: ${cssCode};`);
    if (success) {
      await notification("success");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (canShare) {
      await share({
        title: gradient.name,
        text: `Check out this gradient: ${cssCode}`,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen pb-28">
      <IosHeader
        title="Gradients"
        subtitle="Create beautiful gradients"
        rightAction={
          <button
            onClick={handleShare}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Share2 className="h-5 w-5" />
          </button>
        }
      />

      <main className="mx-auto max-w-lg px-6 pt-24">
        {/* Gradient Preview */}
        <div
          className="mb-6 h-56 overflow-hidden rounded-3xl shadow-lg transition-all duration-500"
          style={{ background: cssCode }}
        >
          <div className="flex h-full items-center justify-center">
            <h2
              className="text-2xl font-bold"
              style={{ color: getContrastColor(gradient.stops[0].color) }}
            >
              {gradient.name}
            </h2>
          </div>
        </div>

        {/* Palette Selection / Generate Section */}
        <div className="mb-6 space-y-3">
          {/* From Palette Button */}
          {savedPalettes.length > 0 && (
            <button
              onClick={() => setShowPaletteSelector(true)}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300",
                selectedPalette
                  ? "bg-primary/10 ring-2 ring-primary/30"
                  : "bg-card ring-1 ring-border hover:ring-primary/30",
                isResetting && "animate-pulse ring-2 ring-emerald-500/50 bg-emerald-500/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                  selectedPalette ? "bg-primary/20" : "bg-secondary",
                  isResetting && "bg-emerald-500/20 scale-110"
                )}>
                  <PaletteIcon className={cn(
                    "h-5 w-5 transition-all duration-300",
                    selectedPalette ? "text-primary" : "text-muted-foreground",
                    isResetting && "text-emerald-600 rotate-12"
                  )} />
                </div>
                <div className="text-left">
                  {selectedPalette ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">{selectedPalette.name}</p>
                      <div className="mt-1 flex gap-1">
                        {selectedPalette.colors.slice(0, 4).map((c, i) => (
                          <span
                            key={i}
                            className="h-3 w-3 rounded-full ring-1 ring-black/10 transition-transform duration-200"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        isResetting ? "text-emerald-600" : "text-foreground"
                      )}>
                        {isResetting ? "Switching to Random" : "Use Saved Palette"}
                      </p>
                      <p className={cn(
                        "text-xs transition-colors duration-300",
                        isResetting ? "text-emerald-500" : "text-muted-foreground"
                      )}>
                        {isResetting ? "Generating new gradient..." : "Create gradient from your colors"}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {selectedPalette ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearPaletteSelection();
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Clear palette selection"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <ChevronDown className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isResetting ? "text-emerald-500 rotate-180" : "text-muted-foreground"
                )} />
              )}
            </button>
          )}

          {/* Generate Random Button */}
          <button
            onClick={handleGenerate}
            disabled={isResetting}
            className={cn(
              "group flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold shadow-md transition-all duration-300 hover:shadow-lg active:scale-[0.98]",
              selectedPalette
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                : "bg-primary text-primary-foreground",
              isResetting && "opacity-80 cursor-wait"
            )}
            aria-label={selectedPalette ? "Switch to random gradient" : "Generate random gradient"}
          >
            {isResetting ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : selectedPalette ? (
              <>
                <Sparkles className="h-5 w-5 transition-transform group-hover:scale-110" />
                Generate Random Instead
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 transition-transform group-hover:rotate-90" />
                Generate Random Gradient
              </>
            )}
          </button>
        </div>

        {/* Type Selector */}
        <section className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Type
          </h3>
          <div className="flex gap-2">
            {gradientTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id)}
                className={cn(
                  "flex-1 rounded-xl py-3 text-sm font-medium transition-all duration-200",
                  gradient.type === type.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </section>

        {/* Direction Selector (only for linear) */}
        {gradient.type === "linear" && (
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Direction
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {directions.map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => handleDirectionChange(dir.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl py-3 text-xs font-medium transition-all duration-200",
                    gradient.direction === dir.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  )}
                >
                  <span
                    className="block h-4 w-4 rounded-full border-2"
                    style={{
                      borderColor: gradient.direction === dir.id ? "currentColor" : "#888",
                      transform: `rotate(${dir.angle})`,
                      background: `linear-gradient(${dir.angle}, currentColor 50%, transparent 50%)`,
                    }}
                  />
                  {dir.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Color Stops */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Color Stops
            </h3>
            {gradient.stops.length < 5 && (
              <button
                onClick={addStop}
                className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            )}
          </div>

          <div className="space-y-3">
            {gradient.stops.map((stop, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl bg-card p-3"
              >
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div
                    className="h-10 w-10 rounded-xl border border-border shadow-sm"
                    style={{ backgroundColor: stop.color }}
                  />
                </label>

                <div className="flex-1">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    Position: {Math.round(stop.position)}%
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={(e) => handlePositionChange(index, Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary"
                    style={{
                      accentColor: stop.color,
                    }}
                  />
                </div>

                <p className="w-16 text-xs font-mono text-muted-foreground uppercase">
                  {stop.color.replace("#", "")}
                </p>

                {gradient.stops.length > 2 && (
                  <button
                    onClick={() => removeStop(index)}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CSS Code */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            CSS Code
          </h3>
          <div className="relative overflow-hidden rounded-xl bg-card">
            <pre className="overflow-x-auto p-4 text-xs text-foreground">
              <code>{`background: ${cssCode};`}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute right-2 top-2 rounded-lg bg-secondary p-2 text-secondary-foreground transition-colors hover:bg-muted"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </section>
      </main>

      {/* Palette Selector Bottom Sheet */}
      {showPaletteSelector && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-foreground/25 backdrop-blur-md transition-opacity"
            onClick={() => setShowPaletteSelector(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-hidden rounded-t-[2rem] bg-background pb-safe shadow-2xl">
            {/* Handle bar */}
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            
            {/* Header */}
            <div className="border-b border-border/60 px-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">Select Palette</h2>
                  <p className="text-xs text-muted-foreground">Choose colors for your gradient</p>
                </div>
                <button
                  onClick={() => setShowPaletteSelector(false)}
                  className="rounded-xl bg-secondary/80 p-2 text-secondary-foreground transition-colors hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Palette List */}
            <div className="overflow-y-auto p-5" style={{ maxHeight: "calc(70vh - 120px)" }}>
              <div className="space-y-3">
                {savedPalettes.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => generateFromPalette(palette)}
                    className={cn(
                      "w-full rounded-2xl p-4 text-left transition-all duration-200",
                      selectedPalette?.id === palette.id
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "bg-card ring-1 ring-border hover:ring-primary/50"
                    )}
                  >
                    {/* Color Preview */}
                    <div className="mb-3 flex h-12 overflow-hidden rounded-xl">
                      {palette.colors.map((color, i) => (
                        <div
                          key={i}
                          className="flex-1 first:rounded-l-xl last:rounded-r-xl"
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                    
                    {/* Palette Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{palette.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {palette.colors.length} colors
                        </p>
                      </div>
                      {selectedPalette?.id === palette.id && (
                        <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                          <Check className="h-3 w-3" />
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
