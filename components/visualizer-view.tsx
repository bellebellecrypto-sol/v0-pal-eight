"use client";

import { useState } from "react";
import { type Palette, getContrastColor, getContrastRatio, getWCAGLevel } from "@/lib/colors";
import { IosHeader } from "./ios-header";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-native";
import {
  Smartphone,
  Monitor,
  CreditCard,
  Mail,
  LayoutDashboard,
  Check,
  X,
  Palette as PaletteIcon,
  ChevronDown,
} from "lucide-react";

type VisualizerMode = "mobile" | "dashboard" | "card" | "email" | "website";

interface VisualizerViewProps {
  palette: Palette | null;
  onSelectPalette: () => void;
}

const modes: { id: VisualizerMode; label: string; icon: typeof Smartphone }[] = [
  { id: "mobile", label: "Mobile App", icon: Smartphone },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "email", label: "Email", icon: Mail },
  { id: "website", label: "Website", icon: Monitor },
];

export function VisualizerView({ palette, onSelectPalette }: VisualizerViewProps) {
  const [mode, setMode] = useState<VisualizerMode>("mobile");
  const { selection } = useHaptics();

  const handleModeChange = async (newMode: VisualizerMode) => {
    await selection();
    setMode(newMode);
  };

  const colors = palette?.colors || [
    { hex: "#6366F1", name: "Primary" },
    { hex: "#8B5CF6", name: "Secondary" },
    { hex: "#1E293B", name: "Dark" },
    { hex: "#64748B", name: "Muted" },
    { hex: "#F8FAFC", name: "Light" },
  ];

  const [primary, secondary, dark, muted, light] = colors;

  return (
    <div className="min-h-screen pb-28">
      <IosHeader title="Visualizer" subtitle="See your palette in action" />

      <main className="mx-auto max-w-lg px-5 pt-24">
        {/* Mode Selector */}
        <div className="mb-4 -mx-5 px-5 overflow-x-auto">
          <div className="flex gap-1.5 pb-2">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
                    mode === m.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary/80 text-secondary-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Select Palette Button - Consistent with Gradient view */}
        <button
          onClick={onSelectPalette}
          className={cn(
            "mb-5 flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-200",
            palette
              ? "bg-primary/10 ring-2 ring-primary/30 hover:bg-primary/15"
              : "bg-card ring-1 ring-border hover:ring-primary/30"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              palette ? "bg-primary/20" : "bg-secondary"
            )}>
              <PaletteIcon className={cn(
                "h-5 w-5",
                palette ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="text-left">
              {palette ? (
                <>
                  <p className="text-sm font-semibold text-foreground">{palette.name}</p>
                  <div className="mt-1 flex gap-1">
                    {palette.colors.map((c, i) => (
                      <span
                        key={i}
                        className="h-3 w-3 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Use Saved Palette</p>
                  <p className="text-xs text-muted-foreground">Select colors to preview</p>
                </>
              )}
            </div>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Visualizer Preview */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
          {mode === "mobile" && (
            <MobileAppPreview primary={primary} secondary={secondary} dark={dark} muted={muted} light={light} />
          )}
          {mode === "dashboard" && (
            <DashboardPreview primary={primary} secondary={secondary} dark={dark} muted={muted} light={light} />
          )}
          {mode === "card" && (
            <CardPreview primary={primary} secondary={secondary} dark={dark} muted={muted} light={light} />
          )}
          {mode === "email" && (
            <EmailPreview primary={primary} secondary={secondary} dark={dark} muted={muted} light={light} />
          )}
          {mode === "website" && (
            <WebsitePreview primary={primary} secondary={secondary} dark={dark} muted={muted} light={light} />
          )}
        </div>

        {/* Color Legend - Compact inline display */}
        <div className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-secondary/50 px-4 py-2.5">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="h-5 w-5 rounded-md ring-1 ring-black/10"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-[10px] font-medium text-muted-foreground">
                {["Pri", "Sec", "Dark", "Mut", "Light"][i]}
              </span>
            </div>
          ))}
        </div>

        {/* Contrast Checker Panel */}
        {palette && (
          <div className="mt-4 rounded-xl bg-card p-3 ring-1 ring-border/50">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contrast</h3>
            <div className="grid grid-cols-2 gap-2">
              <ContrastRow 
                label="Primary/Light" 
                fg={primary.hex} 
                bg={light.hex}
              />
              <ContrastRow 
                label="Dark/Light" 
                fg={dark.hex} 
                bg={light.hex}
              />
              <ContrastRow 
                label="Light/Primary" 
                fg={light.hex} 
                bg={primary.hex}
              />
              <ContrastRow 
                label="Light/Dark" 
                fg={light.hex} 
                bg={dark.hex}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ContrastRow({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  const ratio = getContrastRatio(fg, bg);
  const level = getWCAGLevel(ratio);
  
  return (
    <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-2.5 py-1.5">
      <div className="flex items-center gap-1.5">
        <div className="relative flex h-5 w-7 items-center justify-center overflow-hidden rounded" style={{ backgroundColor: bg }}>
          <span className="text-[8px] font-bold" style={{ color: fg }}>Aa</span>
        </div>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <span className={cn(
        "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold",
        level === "AAA" && "bg-emerald-100 text-emerald-700",
        level === "AA" && "bg-amber-100 text-amber-700",
        level === "Fail" && "bg-red-100 text-red-600"
      )}>
        {level === "Fail" ? <X className="h-2.5 w-2.5" /> : <Check className="h-2.5 w-2.5" />}
        {ratio.toFixed(1)}
      </span>
    </div>
  );
}

interface PreviewProps {
  primary: { hex: string };
  secondary: { hex: string };
  dark: { hex: string };
  muted: { hex: string };
  light: { hex: string };
}

function MobileAppPreview({ primary, secondary, dark, muted, light }: PreviewProps) {
  return (
    <div className="p-6">
      <div className="relative mx-auto w-[220px] overflow-hidden rounded-[28px] border-[6px] shadow-xl" style={{ borderColor: dark.hex }}>
        <div className="h-[420px]" style={{ backgroundColor: light.hex }}>
          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: primary.hex }}>
            <span className="text-[10px] font-medium" style={{ color: getContrastColor(primary.hex) }}>9:41</span>
            <div className="flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getContrastColor(primary.hex) }} />
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getContrastColor(primary.hex) }} />
            </div>
          </div>

          {/* Header */}
          <div className="px-4 pb-4 pt-3" style={{ backgroundColor: primary.hex }}>
            <h3 className="text-base font-bold" style={{ color: getContrastColor(primary.hex) }}>Welcome Back</h3>
            <p className="text-xs opacity-80" style={{ color: getContrastColor(primary.hex) }}>Here is your dashboard</p>
          </div>

          {/* Content */}
          <div className="space-y-2.5 p-3">
            <div className="rounded-xl p-3" style={{ backgroundColor: secondary.hex }}>
              <p className="text-xs font-medium" style={{ color: getContrastColor(secondary.hex) }}>Total Balance</p>
              <p className="text-xl font-bold" style={{ color: getContrastColor(secondary.hex) }}>$12,450</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-2.5" style={{ backgroundColor: dark.hex }}>
                <p className="text-[10px]" style={{ color: getContrastColor(dark.hex) }}>Income</p>
                <p className="text-sm font-bold" style={{ color: getContrastColor(dark.hex) }}>$8,200</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ backgroundColor: muted.hex }}>
                <p className="text-[10px]" style={{ color: getContrastColor(muted.hex) }}>Expenses</p>
                <p className="text-sm font-bold" style={{ color: getContrastColor(muted.hex) }}>$4,100</p>
              </div>
            </div>

            <div className="space-y-1.5">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg border p-2.5" style={{ borderColor: muted.hex }}>
                  <div className="h-7 w-7 rounded-full" style={{ backgroundColor: primary.hex }} />
                  <div className="flex-1">
                    <div className="h-1.5 w-16 rounded" style={{ backgroundColor: dark.hex }} />
                    <div className="mt-1 h-1.5 w-10 rounded" style={{ backgroundColor: muted.hex }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-around border-t px-4 py-3" style={{ backgroundColor: light.hex, borderColor: muted.hex }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 w-5 rounded-full" style={{ backgroundColor: i === 1 ? primary.hex : muted.hex }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPreview({ primary, secondary, dark, muted, light }: PreviewProps) {
  return (
    <div className="p-6">
      <div className="h-[320px] overflow-hidden rounded-xl p-4 shadow-sm" style={{ backgroundColor: light.hex, border: `1px solid ${muted.hex}30` }}>
        {/* Sidebar indicator */}
        <div className="flex gap-3 h-full">
          <div className="w-10 rounded-lg" style={{ backgroundColor: dark.hex }}>
            <div className="space-y-2.5 p-1.5 pt-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-5 w-5 mx-auto rounded-md" style={{ backgroundColor: i === 1 ? primary.hex : muted.hex }} />
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 w-20 rounded" style={{ backgroundColor: dark.hex }} />
                <div className="mt-1 h-2 w-14 rounded" style={{ backgroundColor: muted.hex }} />
              </div>
              <div className="h-7 w-7 rounded-full" style={{ backgroundColor: secondary.hex }} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[primary, secondary, dark].map((color, i) => (
                <div key={i} className="rounded-lg p-2.5" style={{ backgroundColor: color.hex }}>
                  <div className="h-2 w-10 rounded" style={{ backgroundColor: getContrastColor(color.hex), opacity: 0.7 }} />
                  <div className="mt-1.5 h-4 w-12 rounded" style={{ backgroundColor: getContrastColor(color.hex) }} />
                </div>
              ))}
            </div>

            {/* Chart placeholder */}
            <div className="flex-1 min-h-0 rounded-lg p-3" style={{ backgroundColor: "#ffffff", border: `1px solid ${muted.hex}` }}>
              <div className="flex h-full items-end justify-around gap-1.5">
                {[60, 80, 45, 90, 70, 85, 55].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{ height: `${h}%`, backgroundColor: i % 2 === 0 ? primary.hex : secondary.hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardPreview({ primary, secondary, dark, muted, light }: PreviewProps) {
  return (
    <div className="flex items-center justify-center p-6" style={{ backgroundColor: light.hex }}>
      <div className="w-full max-w-[260px] space-y-4">
        {/* Credit Card Style */}
        <div
          className="relative h-[140px] rounded-xl p-3.5 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${primary.hex} 0%, ${secondary.hex} 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="h-6 w-8 rounded" style={{ backgroundColor: getContrastColor(primary.hex), opacity: 0.3 }} />
            <div className="text-xs font-bold" style={{ color: getContrastColor(primary.hex) }}>VISA</div>
          </div>
          <div className="absolute bottom-3.5 left-3.5 right-3.5">
            <p className="font-mono text-sm tracking-wider" style={{ color: getContrastColor(primary.hex) }}>
              **** **** **** 4589
            </p>
            <div className="mt-1.5 flex justify-between text-[10px]" style={{ color: getContrastColor(primary.hex), opacity: 0.8 }}>
              <span>JOHN DOE</span>
              <span>12/28</span>
            </div>
          </div>
        </div>

        {/* Product Card */}
        <div className="overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: muted.hex, backgroundColor: "#ffffff" }}>
          <div className="h-20" style={{ backgroundColor: secondary.hex }} />
          <div className="p-3">
            <div className="h-2.5 w-16 rounded" style={{ backgroundColor: dark.hex }} />
            <div className="mt-1.5 h-2 w-28 rounded" style={{ backgroundColor: muted.hex }} />
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-sm font-bold" style={{ color: primary.hex }}>$49.00</span>
              <button className="rounded-md px-2.5 py-1 text-xs" style={{ backgroundColor: primary.hex, color: getContrastColor(primary.hex) }}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailPreview({ primary, secondary, dark, muted, light }: PreviewProps) {
  return (
    <div className="p-6" style={{ backgroundColor: muted.hex }}>
      <div className="mx-auto max-w-[280px] overflow-hidden rounded-xl shadow-sm" style={{ backgroundColor: light.hex }}>
        {/* Email Header */}
        <div className="px-5 py-5 text-center" style={{ backgroundColor: primary.hex }}>
          <div className="mx-auto mb-2.5 h-10 w-10 rounded-full" style={{ backgroundColor: getContrastColor(primary.hex), opacity: 0.2 }} />
          <h3 className="text-base font-bold" style={{ color: getContrastColor(primary.hex) }}>Welcome!</h3>
          <p className="mt-0.5 text-xs opacity-80" style={{ color: getContrastColor(primary.hex) }}>Thanks for signing up</p>
        </div>

        {/* Email Body */}
        <div className="p-5">
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded" style={{ backgroundColor: dark.hex }} />
            <div className="h-1.5 w-4/5 rounded" style={{ backgroundColor: muted.hex }} />
            <div className="h-1.5 w-full rounded" style={{ backgroundColor: muted.hex }} />
            <div className="h-1.5 w-3/4 rounded" style={{ backgroundColor: muted.hex }} />
          </div>

          <button
            className="mt-5 w-full rounded-lg py-2.5 text-center text-sm font-semibold"
            style={{ backgroundColor: secondary.hex, color: getContrastColor(secondary.hex) }}
          >
            Get Started
          </button>

          <div className="mt-5 space-y-1.5">
            <div className="h-1.5 w-full rounded" style={{ backgroundColor: muted.hex }} />
            <div className="h-1.5 w-2/3 rounded" style={{ backgroundColor: muted.hex }} />
          </div>
        </div>

        {/* Email Footer */}
        <div className="border-t px-4 py-3 text-center" style={{ borderColor: muted.hex }}>
          <p className="text-[10px]" style={{ color: muted.hex }}>Unsubscribe | Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

function WebsitePreview({ primary, secondary, dark, muted, light }: PreviewProps) {
  return (
    <div className="p-6">
      <div className="overflow-hidden rounded-xl shadow-sm" style={{ backgroundColor: light.hex, border: `1px solid ${muted.hex}30` }}>
        {/* Nav */}
        <div className="flex items-center justify-between border-b px-3 py-2.5" style={{ borderColor: muted.hex }}>
          <div className="h-3 w-12 rounded" style={{ backgroundColor: primary.hex }} />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-1.5 w-8 rounded" style={{ backgroundColor: dark.hex }} />
            ))}
          </div>
          <button className="rounded px-2 py-0.5 text-[10px]" style={{ backgroundColor: primary.hex, color: getContrastColor(primary.hex) }}>
            Sign Up
          </button>
        </div>

        {/* Hero */}
        <div className="px-5 py-6 text-center">
          <div className="mx-auto h-3 w-32 rounded" style={{ backgroundColor: dark.hex }} />
          <div className="mx-auto mt-1.5 h-2 w-44 rounded" style={{ backgroundColor: muted.hex }} />
          <div className="mx-auto mt-3 flex justify-center gap-2">
            <button className="rounded-md px-3 py-1.5 text-[10px] font-medium" style={{ backgroundColor: primary.hex, color: getContrastColor(primary.hex) }}>
              Get Started
            </button>
            <button className="rounded-md px-3 py-1.5 text-[10px] font-medium" style={{ backgroundColor: secondary.hex, color: getContrastColor(secondary.hex) }}>
              Learn More
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2 px-4 pb-4">
          {[primary, secondary, dark].map((color, i) => (
            <div key={i} className="rounded-lg p-2.5 text-center" style={{ backgroundColor: `${color.hex}15` }}>
              <div className="mx-auto mb-1.5 h-6 w-6 rounded-full" style={{ backgroundColor: color.hex }} />
              <div className="mx-auto h-1.5 w-10 rounded" style={{ backgroundColor: dark.hex }} />
              <div className="mx-auto mt-1 h-1.5 w-12 rounded" style={{ backgroundColor: muted.hex }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
