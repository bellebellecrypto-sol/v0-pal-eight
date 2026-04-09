"use client";

import { useState } from "react";
import Link from "next/link";
import { type Palette } from "@/lib/colors";
import { IosHeader } from "./ios-header";
import { SwipeablePaletteCard } from "./swipeable-palette-card";
import { Heart, Search, X, ArrowRight, Sparkles } from "lucide-react";

interface SavedViewProps {
  savedPalettes: Palette[];
  isLoading: boolean;
  onDelete: (palette: Palette) => void;
  onSelectForVisualizer?: (palette: Palette) => void;
}

export function SavedView({ 
  savedPalettes, 
  isLoading, 
  onDelete,
  onSelectForVisualizer 
}: SavedViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter palettes by search query
  const filteredPalettes = savedPalettes.filter((palette) =>
    palette.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    palette.colors.some((c) => c.hex.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-28">
      <IosHeader title="Saved" subtitle="Your favorite palettes" />

      <main className="mx-auto max-w-lg px-5 pt-24">
        {/* Search */}
        {savedPalettes.length > 0 && (
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-card py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-card p-4 ring-1 ring-border/50">
                <div className="mb-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-20 flex-1 rounded-lg bg-muted" />
                  ))}
                </div>
                <div className="h-4 w-32 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : savedPalettes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500/10 to-pink-500/10">
              <Heart className="h-12 w-12 text-rose-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No saved palettes yet</h3>
            <p className="mb-6 max-w-[260px] text-sm leading-relaxed text-muted-foreground">
              Tap the heart icon on any palette to save it here for quick access
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4" />
              Start Creating
            </Link>
          </div>
        ) : filteredPalettes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary/50">
              <Search className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <p className="font-medium text-foreground">No palettes match your search</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-sm font-semibold text-primary"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {filteredPalettes.length} palette{filteredPalettes.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Swipe left to delete
              </p>
            </div>
            <div className="space-y-3">
              {filteredPalettes.map((palette) => (
                <SwipeablePaletteCard
                  key={palette.id}
                  palette={palette}
                  onDelete={onDelete}
                  onSelect={onSelectForVisualizer}
                  showSelectButton={!!onSelectForVisualizer}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
