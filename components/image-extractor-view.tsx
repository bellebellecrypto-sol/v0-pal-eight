"use client";

import React from "react"

import { useState, useRef, useCallback } from "react";
import {
  type Color,
  type Palette,
  extractColorsFromImage,
  getContrastColor,
} from "@/lib/colors";
import { IosHeader } from "./ios-header";
import { cn } from "@/lib/utils";
import { useHaptics, useClipboard } from "@/hooks/use-native";
import {
  ImagePlus,
  Camera,
  Check,
  Copy,
  Heart,
  Loader2,
  X,
} from "lucide-react";

interface ImageExtractorViewProps {
  onSave: (palette: Palette) => void;
  savedPalettes: Palette[];
}

const sampleImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
];

export function ImageExtractorView({ onSave, savedPalettes }: ImageExtractorViewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<Color[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { impact, notification } = useHaptics();
  const { copy } = useClipboard();

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setIsExtracting(true);
    await impact("medium");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      setSelectedImage(imageUrl);

      const colors = await extractColorsFromImage(file, 5);
      setExtractedColors(colors);
      setIsSaved(false);
      setIsExtracting(false);
      await notification("success");
    };
    reader.readAsDataURL(file);
  }, [impact, notification]);

  const handleSampleSelect = useCallback(async (url: string) => {
    setIsExtracting(true);
    setSelectedImage(url);
    await impact("medium");

    const colors = await extractColorsFromImage(url, 5);
    setExtractedColors(colors);
    setIsSaved(false);
    setIsExtracting(false);
    await notification("success");
  }, [impact, notification]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const copyColor = async (hex: string, index: number) => {
    const success = await copy(hex);
    if (success) {
      await impact("light");
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  const handleSave = async () => {
    if (extractedColors.length === 0) return;

    const palette: Palette = {
      id: Math.random().toString(36).substring(2, 9),
      name: "Extracted Palette",
      colors: extractedColors,
      category: "nature",
    };

    onSave(palette);
    setIsSaved(true);
    await notification("success");
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setExtractedColors([]);
    setIsSaved(false);
  };

  const isPaletteSaved = () => {
    if (extractedColors.length === 0) return false;
    return savedPalettes.some(
      (p) => p.colors.map((c) => c.hex).join(",") === extractedColors.map((c) => c.hex).join(",")
    );
  };

  return (
    <div className="min-h-screen pb-28">
      <IosHeader title="Extract" subtitle="Colors from images" />

      <main className="mx-auto max-w-lg px-6 pt-24">
        {/* Upload Area */}
        {!selectedImage ? (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="mb-6 flex h-56 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-secondary/30 transition-colors hover:bg-secondary/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="font-medium text-foreground">Upload an image</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag & drop or tap to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>

            {/* Sample Images */}
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Or try a sample
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {sampleImages.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleSelect(url)}
                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
                  >
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Sample ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/20">
                      <Camera className="h-8 w-8 text-background opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Selected Image Preview */}
            <div className="relative mb-6 overflow-hidden rounded-3xl">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Selected"
                className="h-56 w-full object-cover"
              />
              <button
                onClick={clearSelection}
                className="absolute right-3 top-3 rounded-full bg-foreground/50 p-2 text-background backdrop-blur-sm transition-colors hover:bg-foreground/70"
              >
                <X className="h-4 w-4" />
              </button>

              {isExtracting && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-foreground">Extracting colors...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Colors */}
            {extractedColors.length > 0 && (
              <section className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Extracted Colors
                  </h3>
                  <button
                    onClick={handleSave}
                    disabled={isPaletteSaved()}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      isPaletteSaved() || isSaved
                        ? "bg-green-500/10 text-green-600"
                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                    )}
                  >
                    <Heart className={cn("h-3 w-3", (isPaletteSaved() || isSaved) && "fill-current")} />
                    {isPaletteSaved() || isSaved ? "Saved" : "Save"}
                  </button>
                </div>

                {/* Color Swatches */}
                <div className="mb-4 flex h-32 overflow-hidden rounded-2xl">
                  {extractedColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => copyColor(color.hex, index)}
                      className="relative flex-1 transition-all duration-200 hover:flex-[1.5] active:flex-[1.3]"
                      style={{ backgroundColor: color.hex }}
                    >
                      {copiedIndex === index && (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ color: getContrastColor(color.hex) }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Check className="h-5 w-5" />
                            <span className="text-xs font-medium">Copied!</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Color Details */}
                <div className="space-y-2">
                  {extractedColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => copyColor(color.hex, index)}
                      className="flex w-full items-center gap-3 rounded-xl bg-card p-3 transition-colors hover:bg-muted active:scale-[0.98]"
                    >
                      <div
                        className="h-10 w-10 rounded-xl border border-border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">{color.name}</p>
                        <p className="text-sm uppercase text-muted-foreground">
                          {color.hex}
                        </p>
                      </div>
                      {copiedIndex === index ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Try Another */}
            <button
              onClick={clearSelection}
              className="w-full rounded-2xl bg-secondary py-4 font-semibold text-secondary-foreground transition-colors hover:bg-muted"
            >
              Try Another Image
            </button>
          </>
        )}
      </main>
    </div>
  );
}
