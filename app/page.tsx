"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TabBar, type Tab } from "@/components/tab-bar";
import { GenerateView } from "@/components/generate-view";
import { ExploreView } from "@/components/explore-view";
import { VisualizerView } from "@/components/visualizer-view";
import { GradientView } from "@/components/gradient-view";
import { SavedView } from "@/components/saved-view";
import { type Palette } from "@/lib/colors";
import { useNativeStorage } from "@/hooks/use-native";
import { ToastProvider, useToast } from "@/components/toast";
import { Onboarding } from "@/components/onboarding";
import { SwipeablePaletteCard } from "@/components/swipeable-palette-card";
import { Heart, Settings, X, Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function HomeContent() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");
  const [localPalettes, setLocalPalettes] = useState<Palette[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [visualizerPalette, setVisualizerPalette] = useState<Palette | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const storage = useNativeStorage();
  const { showToast } = useToast();

  // Use local palettes
  const savedPalettes = localPalettes;
  const isLoading = isLocalLoading;

  // Load local data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await storage.get("paletta-saved");
        if (stored) {
          setLocalPalettes(JSON.parse(stored));
        }
        
        // Check if onboarding was completed
        const onboardingComplete = await storage.get("paletta-onboarding-complete");
        if (!onboardingComplete) {
          setShowOnboarding(true);
        }
      } catch {
        // Handle error silently
      } finally {
        setIsLocalLoading(false);
      }
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save local palettes when changed
  useEffect(() => {
    if (!isLocalLoading) {
      storage.set("paletta-saved", JSON.stringify(localPalettes));
    }
  }, [localPalettes, isLocalLoading]);

  const handleSavePalette = (palette: Palette) => {
    setLocalPalettes((prev) => {
      const exists = prev.some((p) => p.id === palette.id);
      if (exists) {
        return prev.filter((p) => p.id !== palette.id);
      }
      return [...prev, palette];
    });
  };

  const handleClearSaved = () => {
    if (confirm("Are you sure you want to clear all saved palettes?")) {
      setLocalPalettes([]); // Updated line
    }
  };

  const selectPaletteForVisualizer = () => {
    if (savedPalettes.length > 0) {
      setShowSaved(true);
    } else {
      setActiveTab("saved");
    }
  };

  const handleSelectForVisualizer = (palette: Palette) => {
    setVisualizerPalette(palette);
    setShowSaved(false);
    setActiveTab("visualizer");
  };

  const handleOnboardingComplete = async () => {
    await storage.set("paletta-onboarding-complete", "true");
    setShowOnboarding(false);
  };

  const handleDeletePalette = (palette: Palette) => {
    setLocalPalettes((prev) => prev.filter((p) => p.id !== palette.id));
    showToast("Palette removed", "info");
  };

  // Filter palettes by search query
  const filteredPalettes = savedPalettes.filter((palette) =>
    palette.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    palette.colors.some((c) => c.hex.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding */}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      
      {/* Top Settings Button */}
      <div className="fixed right-4 top-4 z-50 pt-safe">
        <button
          onClick={() => setShowSettings(true)}
          className={cn(
            "group flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-all duration-200 ease-out",
            "active:scale-90",
            showSettings
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card/95 text-foreground ring-1 ring-border/60 backdrop-blur-xl hover:bg-card hover:shadow-md"
          )}
        >
          <Settings className={cn(
            "h-[18px] w-[18px] transition-transform duration-200",
            showSettings ? "rotate-90" : "group-hover:rotate-45"
          )} />
        </button>
      </div>

      {/* Main Views */}
      {activeTab === "generate" && (
        <GenerateView onSave={handleSavePalette} savedPalettes={savedPalettes} />
      )}
      {activeTab === "explore" && (
        <ExploreView onSave={handleSavePalette} savedPalettes={savedPalettes} />
      )}
      {activeTab === "visualizer" && (
        <VisualizerView
          palette={visualizerPalette}
          onSelectPalette={selectPaletteForVisualizer}
        />
      )}
      {activeTab === "gradient" && <GradientView savedPalettes={savedPalettes} />}
      {activeTab === "saved" && (
        <SavedView
          savedPalettes={savedPalettes}
          isLoading={isLoading}
          onDelete={handleDeletePalette}
          onSelectForVisualizer={handleSelectForVisualizer}
        />
      )}

      {/* Bottom Sheet: Saved Palettes */}
      {showSaved && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-foreground/25 backdrop-blur-md transition-opacity"
            onClick={() => setShowSaved(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-background pb-safe shadow-2xl">
            {/* Handle bar */}
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-border/60 bg-background/95 px-5 pb-4 backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-foreground">Saved Palettes</h2>
                <button
                  onClick={() => setShowSaved(false)}
                  className="rounded-xl bg-secondary/80 p-2 text-secondary-foreground transition-colors hover:bg-secondary"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search */}
              {savedPalettes.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search palettes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-secondary/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="p-5">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse rounded-2xl bg-secondary/50 p-4">
                      <div className="mb-3 flex gap-1">
                        {[1, 2, 3, 4, 5].map((j) => (
                          <div key={j} className="h-16 flex-1 rounded-lg bg-muted" />
                        ))}
                      </div>
                      <div className="h-4 w-32 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : savedPalettes.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50">
                    <Heart className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium text-foreground">No saved palettes yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tap the heart icon on any palette to save it
                  </p>
                  <Link
                    href="/"
                    onClick={() => setShowSaved(false)}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
                  >
                    Start generating palettes
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : filteredPalettes.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50">
                    <Search className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium text-foreground">No palettes match your search</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-sm font-semibold text-primary"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Swipe left to delete, right to share
                  </p>
                  <div className="space-y-3">
                    {filteredPalettes.map((palette) => (
                      <SwipeablePaletteCard
                        key={palette.id}
                        palette={palette}
                        onDelete={handleDeletePalette}
                        onSelect={activeTab === "visualizer" ? handleSelectForVisualizer : undefined}
                        showSelectButton={activeTab === "visualizer"}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet: Settings */}
      {showSettings && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-foreground/25 backdrop-blur-md transition-opacity"
            onClick={() => setShowSettings(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[2rem] bg-background pb-safe shadow-2xl">
            {/* Handle bar */}
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            
            <div className="border-b border-border/60 px-5 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-foreground">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="rounded-xl bg-secondary/80 p-2 text-secondary-foreground transition-colors hover:bg-secondary"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-5">
              {/* Data Section */}
              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                  Data
                </h3>
                <button
                  onClick={handleClearSaved}
                  disabled={savedPalettes.length === 0}
                  className="w-full rounded-xl bg-destructive/10 py-3 text-[13px] font-medium text-destructive transition-all duration-200 hover:bg-destructive/15 disabled:opacity-40"
                >
                  Clear All Saved Palettes ({savedPalettes.length})
                </button>
              </div>

              {/* App Info */}
              <div className="pt-2 text-center">
                <p className="text-sm font-semibold tracking-tight text-foreground">pal</p>
                <p className="text-[11px] text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} savedCount={savedPalettes.length} />
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  );
}
