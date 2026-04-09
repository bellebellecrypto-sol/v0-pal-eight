"use client";

import { useState } from "react";
import { type Palette } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { X, Copy, Check, Code, FileJson, Palette as PaletteIcon, Braces } from "lucide-react";
import { useClipboard, useHaptics } from "@/hooks/use-native";
import { useToast } from "./toast";

interface ExportModalProps {
  palette: Palette;
  onClose: () => void;
}

type ExportFormat = "css" | "scss" | "tailwind" | "json" | "swift" | "hex";

const exportFormats: { id: ExportFormat; name: string; icon: typeof Code }[] = [
  { id: "css", name: "CSS Variables", icon: Code },
  { id: "scss", name: "SCSS Variables", icon: Code },
  { id: "tailwind", name: "Tailwind Config", icon: Braces },
  { id: "json", name: "JSON", icon: FileJson },
  { id: "swift", name: "Swift/iOS", icon: PaletteIcon },
  { id: "hex", name: "HEX List", icon: PaletteIcon },
];

function generateExportCode(palette: Palette, format: ExportFormat): string {
  const colors = palette.colors;
  const safeName = palette.name.toLowerCase().replace(/\s+/g, "-");

  switch (format) {
    case "css":
      return `:root {
  /* ${palette.name} */
${colors.map((c, i) => `  --${safeName}-${i + 1}: ${c.hex};`).join("\n")}
}`;

    case "scss":
      return `// ${palette.name}
${colors.map((c, i) => `$${safeName}-${i + 1}: ${c.hex};`).join("\n")}

$${safeName}: (
${colors.map((c, i) => `  "${i + 1}": $${safeName}-${i + 1}${i < colors.length - 1 ? "," : ""}`).join("\n")}
);`;

    case "tailwind":
      return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        '${safeName}': {
${colors.map((c, i) => `          ${(i + 1) * 100}: '${c.hex}',`).join("\n")}
        }
      }
    }
  }
}`;

    case "json":
      return JSON.stringify(
        {
          name: palette.name,
          colors: colors.map((c, i) => ({
            name: c.name,
            hex: c.hex,
            position: i + 1,
          })),
        },
        null,
        2
      );

    case "swift":
      return `// ${palette.name}
import SwiftUI

extension Color {
${colors
  .map((c, i) => {
    const hex = c.hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const name = c.name.replace(/\s+/g, "");
    return `    static let ${safeName.replace(/-/g, "")}${name} = Color(red: ${(r / 255).toFixed(3)}, green: ${(g / 255).toFixed(3)}, blue: ${(b / 255).toFixed(3)})`;
  })
  .join("\n")}
}`;

    case "hex":
      return colors.map((c) => c.hex).join("\n");

    default:
      return "";
  }
}

export function ExportModal({ palette, onClose }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("css");
  const [copied, setCopied] = useState(false);
  const { copy } = useClipboard();
  const { impact } = useHaptics();
  const { showToast } = useToast();

  const code = generateExportCode(palette, selectedFormat);

  const handleCopy = async () => {
    const success = await copy(code);
    if (success) {
      await impact("medium");
      setCopied(true);
      showToast("Code copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[150]">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background pb-safe">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background p-4">
          <div>
            <h2 className="font-bold text-foreground">Export Palette</h2>
            <p className="text-sm text-muted-foreground">{palette.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-secondary p-2 text-secondary-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Format selector */}
          <div className="mb-4 flex flex-wrap gap-2">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              return (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    selectedFormat === format.id
                      ? "bg-foreground text-background"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {format.name}
                </button>
              );
            })}
          </div>

          {/* Code preview */}
          <div className="relative mb-4 overflow-hidden rounded-2xl bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {exportFormats.find((f) => f.id === selectedFormat)?.name}
              </span>
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  copied ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-secondary-foreground"
                )}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="max-h-64 overflow-auto p-4 text-xs leading-relaxed text-foreground">
              <code>{code}</code>
            </pre>
          </div>

          {/* Palette preview */}
          <div className="overflow-hidden rounded-2xl shadow">
            <div className="flex h-16">
              {palette.colors.map((color, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: color.hex }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
