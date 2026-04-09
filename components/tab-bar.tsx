"use client";

import { cn } from "@/lib/utils";
import {
  Palette,
  Sparkles,
  Eye,
  Blend,
  Heart,
} from "lucide-react";
import { useHaptics } from "@/hooks/use-native";

type Tab =
  | "generate"
  | "explore"
  | "visualizer"
  | "gradient"
  | "saved";

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  savedCount?: number;
}

const tabs: { id: Tab; label: string; icon: typeof Palette }[] = [
  { id: "generate", label: "Create", icon: Sparkles },
  { id: "explore", label: "Explore", icon: Palette },
  { id: "visualizer", label: "Preview", icon: Eye },
  { id: "gradient", label: "Gradient", icon: Blend },
  { id: "saved", label: "Saved", icon: Heart },
];

export function TabBar({ activeTab, onTabChange, savedCount = 0 }: TabBarProps) {
  const { selection } = useHaptics();

  const handleTabPress = async (tab: Tab) => {
    await selection();
    onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 pb-safe backdrop-blur-xl">
      <div className="mx-auto max-w-lg">
        <div className="flex h-14 items-stretch justify-around px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const showBadge = tab.id === "saved" && savedCount > 0;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab.id)}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5",
                  "transition-opacity duration-150 active:opacity-70",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {/* Subtle active pill background */}
                {isActive && (
                  <span className="absolute inset-x-2 inset-y-1 rounded-xl bg-primary/8" />
                )}
                
                <span className="relative flex h-6 items-center justify-center">
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px]",
                      tab.id === "saved" && isActive && "fill-current"
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  {showBadge && (
                    <span className="absolute -right-1.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[8px] font-bold text-white ring-2 ring-background">
                      {savedCount > 9 ? "9+" : savedCount}
                    </span>
                  )}
                </span>
                
                <span 
                  className={cn(
                    "relative text-[10px] font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export type { Tab };
