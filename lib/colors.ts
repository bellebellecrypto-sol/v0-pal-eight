export interface Color {
  hex: string;
  name: string;
}

export interface Palette {
  id: string;
  name: string;
  colors: Color[];
  category: string;
}

export type UseCase =
  | "branding"
  | "ui-design"
  | "interior"
  | "fashion"
  | "digital-art"
  | "photography";

export const useCases: { id: UseCase; name: string; icon: string; description: string; gradient: [string, string] }[] = [
  { id: "branding", name: "Branding", icon: "✦", description: "Corporate identity", gradient: ["#6366F1", "#8B5CF6"] },
  { id: "ui-design", name: "UI Design", icon: "◐", description: "Apps & interfaces", gradient: ["#06B6D4", "#3B82F6"] },
  { id: "interior", name: "Interiors", icon: "⬡", description: "Spaces & decor", gradient: ["#D97706", "#F59E0B"] },
  { id: "fashion", name: "Fashion", icon: "◇", description: "Style & apparel", gradient: ["#EC4899", "#F472B6"] },
  { id: "digital-art", name: "Digital Art", icon: "◈", description: "Creative & NFTs", gradient: ["#8B5CF6", "#D946EF"] },
  { id: "photography", name: "Photography", icon: "◉", description: "Editing & filters", gradient: ["#10B981", "#34D399"] },
];

const colorNames: Record<string, string[]> = {
  red: ["Crimson", "Ruby", "Scarlet", "Coral", "Rose", "Cherry", "Vermillion", "Carmine"],
  orange: ["Amber", "Tangerine", "Peach", "Apricot", "Copper", "Rust", "Terracotta", "Sienna"],
  yellow: ["Gold", "Honey", "Lemon", "Canary", "Saffron", "Mustard", "Sunflower", "Buttercup"],
  green: ["Sage", "Olive", "Forest", "Mint", "Emerald", "Jade", "Moss", "Fern"],
  cyan: ["Teal", "Aqua", "Turquoise", "Seafoam", "Cyan", "Caribbean", "Lagoon", "Marine"],
  blue: ["Azure", "Cobalt", "Navy", "Sapphire", "Sky", "Ocean", "Denim", "Indigo"],
  purple: ["Lavender", "Violet", "Plum", "Amethyst", "Grape", "Mauve", "Orchid", "Iris"],
  pink: ["Blush", "Salmon", "Fuchsia", "Magenta", "Rose", "Peony", "Flamingo", "Bubblegum"],
  neutral: ["Charcoal", "Slate", "Stone", "Cloud", "Ivory", "Sand", "Pearl", "Smoke"],
};

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

function getColorCategory(h: number): string {
  if (h < 15 || h >= 345) return "red";
  if (h < 45) return "orange";
  if (h < 70) return "yellow";
  if (h < 160) return "green";
  if (h < 200) return "cyan";
  if (h < 260) return "blue";
  if (h < 300) return "purple";
  return "pink";
}

function getColorName(h: number, s: number, l: number): string {
  if (s < 10) {
    const names = colorNames.neutral;
    return names[Math.floor(Math.random() * names.length)];
  }
  const category = getColorCategory(h);
  const names = colorNames[category];
  return names[Math.floor(Math.random() * names.length)];
}

function generateHarmoniousColors(baseHue: number, count: number, harmony: string): number[] {
  const hues: number[] = [];
  switch (harmony) {
    case "analogous":
      for (let i = 0; i < count; i++) {
        hues.push((baseHue + (i - Math.floor(count / 2)) * 25 + 360) % 360);
      }
      break;
    case "complementary":
      hues.push(baseHue);
      hues.push((baseHue + 180) % 360);
      for (let i = 2; i < count; i++) {
        hues.push((baseHue + (i % 2 === 0 ? 15 : -15) * Math.floor(i / 2) + 360) % 360);
      }
      break;
    case "triadic":
      for (let i = 0; i < count; i++) {
        hues.push((baseHue + (i % 3) * 120 + Math.floor(i / 3) * 15 + 360) % 360);
      }
      break;
    case "split-complementary":
      hues.push(baseHue);
      hues.push((baseHue + 150) % 360);
      hues.push((baseHue + 210) % 360);
      for (let i = 3; i < count; i++) {
        hues.push((baseHue + i * 30 + 360) % 360);
      }
      break;
    default:
      for (let i = 0; i < count; i++) {
        hues.push(Math.floor(Math.random() * 360));
      }
  }
  return hues.slice(0, count);
}

export function generatePalette(useCase: UseCase): Palette {
  const baseHue = Math.floor(Math.random() * 360);
  const colors: Color[] = [];
  let harmony: string;
  let saturationRange: [number, number];
  let lightnessRange: [number, number];
  const paletteName = generatePaletteName();

  switch (useCase) {
    case "branding":
      harmony = Math.random() > 0.5 ? "complementary" : "analogous";
      saturationRange = [50, 80];
      lightnessRange = [35, 65];
      break;
    case "ui-design":
      harmony = "analogous";
      saturationRange = [40, 70];
      lightnessRange = [40, 85];
      break;
    case "interior":
      harmony = "analogous";
      saturationRange = [20, 50];
      lightnessRange = [45, 75];
      break;
    case "fashion":
      harmony = Math.random() > 0.5 ? "triadic" : "split-complementary";
      saturationRange = [45, 85];
      lightnessRange = [35, 70];
      break;
    case "nature":
      harmony = "analogous";
      saturationRange = [30, 60];
      lightnessRange = [40, 70];
      break;
    case "minimal":
      harmony = "analogous";
      saturationRange = [5, 25];
      lightnessRange = [50, 95];
      break;
    case "vibrant":
      harmony = "triadic";
      saturationRange = [75, 100];
      lightnessRange = [45, 60];
      break;
    case "digital-art":
      harmony = Math.random() > 0.5 ? "triadic" : "split-complementary";
      saturationRange = [65, 95];
      lightnessRange = [40, 65];
      break;
    case "photography":
      harmony = "analogous";
      saturationRange = [35, 65];
      lightnessRange = [35, 75];
      break;
    default:
      harmony = "analogous";
      saturationRange = [40, 70];
      lightnessRange = [40, 70];
  }

  const hues = generateHarmoniousColors(baseHue, 5, harmony);

  for (let i = 0; i < 5; i++) {
    const h = hues[i];
    const s = saturationRange[0] + Math.random() * (saturationRange[1] - saturationRange[0]);
    const l = lightnessRange[0] + Math.random() * (lightnessRange[1] - lightnessRange[0]);
    const hex = hslToHex(h, s, l);
    const name = getColorName(h, s, l);

    colors.push({ hex, name });
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    name: paletteName,
    colors,
    category: useCase,
  };
}

function generatePaletteName(): string {
  const adjectives = [
    "Serene", "Bold", "Dreamy", "Crisp", "Warm", "Cool", "Mystic", "Sunset",
    "Ocean", "Forest", "Urban", "Nordic", "Tropical", "Desert", "Midnight",
    "Dawn", "Autumn", "Spring", "Winter", "Summer", "Cosmic", "Earthen",
  ];
  const nouns = [
    "Horizon", "Whisper", "Echo", "Wave", "Breeze", "Glow", "Shadow", "Light",
    "Mood", "Vibe", "Essence", "Spirit", "Soul", "Dream", "Vision", "Aura",
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function getContrastColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

// Calculate relative luminance for WCAG contrast
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Get contrast ratio between two colors
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Check WCAG compliance level
export function getWCAGLevel(ratio: number): "AAA" | "AA" | "Fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "Fail";
}

// RGB to HSL conversion
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Extract dominant colors from image using canvas
export async function extractColorsFromImage(
  imageSource: string | File,
  colorCount: number = 5
): Promise<Color[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve([]);
        return;
      }

      // Scale down for performance
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Color quantization using median cut algorithm (simplified)
      const colorMap: Map<string, number> = new Map();

      for (let i = 0; i < pixels.length; i += 4) {
        const r = Math.round(pixels[i] / 32) * 32;
        const g = Math.round(pixels[i + 1] / 32) * 32;
        const b = Math.round(pixels[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }

      // Sort by frequency and get top colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, colorCount * 3); // Get more to filter similar colors

      // Filter out similar colors
      const finalColors: Color[] = [];
      const usedHues: number[] = [];

      for (const [key] of sortedColors) {
        if (finalColors.length >= colorCount) break;

        const [r, g, b] = key.split(",").map(Number);
        const { h, s, l } = rgbToHsl(r, g, b);

        // Skip very similar hues (unless it's a neutral)
        if (s > 10) {
          const isSimilar = usedHues.some((usedH) => Math.abs(usedH - h) < 30);
          if (isSimilar) continue;
          usedHues.push(h);
        }

        const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        const name = getColorNameFromHsl(h, s, l);
        finalColors.push({ hex, name });
      }

      // Fill remaining slots if needed
      while (finalColors.length < colorCount) {
        const randomColor = sortedColors[Math.floor(Math.random() * sortedColors.length)];
        if (randomColor) {
          const [r, g, b] = randomColor[0].split(",").map(Number);
          const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
          const { h, s, l } = rgbToHsl(r, g, b);
          finalColors.push({ hex, name: getColorNameFromHsl(h, s, l) });
        }
      }

      resolve(finalColors.slice(0, colorCount));
    };

    img.onerror = () => resolve([]);

    if (typeof imageSource === "string") {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imageSource);
    }
  });
}

function getColorNameFromHsl(h: number, s: number, l: number): string {
  if (s < 10) {
    const names = colorNames.neutral;
    return names[Math.floor(Math.random() * names.length)];
  }
  const category = getColorCategory(h);
  const names = colorNames[category];
  return names[Math.floor(Math.random() * names.length)];
}

// Gradient types
export type GradientType = "linear" | "radial" | "conic";
export type GradientDirection = "to right" | "to left" | "to bottom" | "to top" | "to bottom right" | "to bottom left" | "to top right" | "to top left";

export interface GradientStop {
  color: string;
  position: number;
}

export interface Gradient {
  id: string;
  name: string;
  type: GradientType;
  direction: GradientDirection;
  stops: GradientStop[];
}

export function generateGradientCSS(gradient: Gradient): string {
  const stopsCSS = gradient.stops
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ");

  switch (gradient.type) {
    case "linear":
      return `linear-gradient(${gradient.direction}, ${stopsCSS})`;
    case "radial":
      return `radial-gradient(circle, ${stopsCSS})`;
    case "conic":
      return `conic-gradient(from 0deg, ${stopsCSS})`;
    default:
      return `linear-gradient(${gradient.direction}, ${stopsCSS})`;
  }
}

export function generateRandomGradient(): Gradient {
  const baseHue = Math.floor(Math.random() * 360);
  const harmony = Math.random() > 0.5 ? "analogous" : "complementary";
  
  const hues = generateHarmoniousColors(baseHue, 3, harmony);
  const stops: GradientStop[] = hues.map((h, i) => ({
    color: hslToHex(h, 60 + Math.random() * 30, 50 + Math.random() * 20),
    position: (i / (hues.length - 1)) * 100,
  }));

  const directions: GradientDirection[] = [
    "to right", "to bottom", "to bottom right", "to top right"
  ];

  return {
    id: Math.random().toString(36).substring(2, 9),
    name: generatePaletteName(),
    type: "linear",
    direction: directions[Math.floor(Math.random() * directions.length)],
    stops,
  };
}

// Pre-made popular palettes
export const premadePalettes: Palette[] = [
  {
    id: "sunset-vibes",
    name: "Sunset Vibes",
    category: "vibrant",
    colors: [
      { hex: "#FF6B6B", name: "Coral" },
      { hex: "#FEC89A", name: "Peach" },
      { hex: "#FFD93D", name: "Gold" },
      { hex: "#6BCB77", name: "Mint" },
      { hex: "#4D96FF", name: "Sky" },
    ],
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    category: "nature",
    colors: [
      { hex: "#0A2647", name: "Deep Navy" },
      { hex: "#144272", name: "Ocean" },
      { hex: "#205295", name: "Azure" },
      { hex: "#2C74B3", name: "Cerulean" },
      { hex: "#36AEE0", name: "Sky Blue" },
    ],
  },
  {
    id: "forest-morning",
    name: "Forest Morning",
    category: "nature",
    colors: [
      { hex: "#1A4D2E", name: "Forest" },
      { hex: "#4F6F52", name: "Sage" },
      { hex: "#739072", name: "Moss" },
      { hex: "#A3B899", name: "Lichen" },
      { hex: "#E9F5DB", name: "Morning Dew" },
    ],
  },
  {
    id: "berry-bliss",
    name: "Berry Bliss",
    category: "vibrant",
    colors: [
      { hex: "#9B2335", name: "Raspberry" },
      { hex: "#C41E3A", name: "Cardinal" },
      { hex: "#E75480", name: "Pink" },
      { hex: "#FF85A2", name: "Blush" },
      { hex: "#FFB6C1", name: "Rose" },
    ],
  },
  {
    id: "midnight-luxe",
    name: "Midnight Luxe",
    category: "branding",
    colors: [
      { hex: "#1A1A2E", name: "Midnight" },
      { hex: "#16213E", name: "Navy" },
      { hex: "#0F3460", name: "Indigo" },
      { hex: "#E94560", name: "Ruby" },
      { hex: "#F5F5F5", name: "Pearl" },
    ],
  },
  {
    id: "earthy-tones",
    name: "Earthy Tones",
    category: "interior",
    colors: [
      { hex: "#5C4033", name: "Espresso" },
      { hex: "#8B7355", name: "Taupe" },
      { hex: "#C4A77D", name: "Sand" },
      { hex: "#DDD5B7", name: "Cream" },
      { hex: "#F5F1E3", name: "Ivory" },
    ],
  },
  {
    id: "cotton-candy",
    name: "Cotton Candy",
    category: "pastel",
    colors: [
      { hex: "#FFD1DC", name: "Pink" },
      { hex: "#E2CFF4", name: "Lavender" },
      { hex: "#BFEFFF", name: "Sky" },
      { hex: "#C1FFD7", name: "Mint" },
      { hex: "#FFF5BA", name: "Butter" },
    ],
  },
  {
    id: "neon-nights",
    name: "Neon Nights",
    category: "vibrant",
    colors: [
      { hex: "#FF00FF", name: "Magenta" },
      { hex: "#00FFFF", name: "Cyan" },
      { hex: "#FF6EC7", name: "Hot Pink" },
      { hex: "#7DF9FF", name: "Electric Blue" },
      { hex: "#39FF14", name: "Neon Green" },
    ],
  },
  {
    id: "minimalist-mono",
    name: "Minimalist Mono",
    category: "minimal",
    colors: [
      { hex: "#111111", name: "Onyx" },
      { hex: "#444444", name: "Charcoal" },
      { hex: "#888888", name: "Gray" },
      { hex: "#CCCCCC", name: "Silver" },
      { hex: "#F8F8F8", name: "Snow" },
    ],
  },
  {
    id: "autumn-harvest",
    name: "Autumn Harvest",
    category: "nature",
    colors: [
      { hex: "#8B4513", name: "Saddle" },
      { hex: "#CD853F", name: "Peru" },
      { hex: "#DAA520", name: "Goldenrod" },
      { hex: "#D2691E", name: "Chocolate" },
      { hex: "#F4A460", name: "Sandy" },
    ],
  },
  {
    id: "tech-startup",
    name: "Tech Startup",
    category: "ui-design",
    colors: [
      { hex: "#6366F1", name: "Indigo" },
      { hex: "#8B5CF6", name: "Violet" },
      { hex: "#A855F7", name: "Purple" },
      { hex: "#1E293B", name: "Slate" },
      { hex: "#F8FAFC", name: "Ghost" },
    ],
  },
  {
    id: "vintage-rose",
    name: "Vintage Rose",
    category: "fashion",
    colors: [
      { hex: "#8E6B5E", name: "Mocha" },
      { hex: "#C9ADA7", name: "Dusty Rose" },
      { hex: "#E8D5D1", name: "Blush" },
      { hex: "#F2E9E4", name: "Cream" },
      { hex: "#9A8C98", name: "Lavender Gray" },
    ],
  },
];
