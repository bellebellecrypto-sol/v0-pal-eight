"use client";

import { useEffect, useState, useCallback } from "react";

// Type definitions for Capacitor plugins
interface HapticsPlugin {
  impact: (options: { style: string }) => Promise<void>;
  notification: (options: { type: string }) => Promise<void>;
  selectionStart: () => Promise<void>;
  selectionChanged: () => Promise<void>;
  selectionEnd: () => Promise<void>;
}

interface ClipboardPlugin {
  write: (options: { string: string }) => Promise<void>;
  read: () => Promise<{ value: string }>;
}

interface SharePlugin {
  share: (options: { title?: string; text?: string; url?: string }) => Promise<void>;
  canShare: () => Promise<{ value: boolean }>;
}

interface PreferencesPlugin {
  get: (options: { key: string }) => Promise<{ value: string | null }>;
  set: (options: { key: string; value: string }) => Promise<void>;
  remove: (options: { key: string }) => Promise<void>;
  clear: () => Promise<void>;
}

interface StatusBarPlugin {
  setStyle: (options: { style: string }) => Promise<void>;
  setBackgroundColor: (options: { color: string }) => Promise<void>;
}

// Check if running in Capacitor
export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
}

// Haptics hook
export function useHaptics() {
  const [Haptics, setHaptics] = useState<HapticsPlugin | null>(null);

  useEffect(() => {
    if (isNative()) {
      import("@capacitor/haptics").then((mod) => {
        setHaptics(mod.Haptics as unknown as HapticsPlugin);
      });
    }
  }, []);

  const impact = useCallback(
    async (style: "light" | "medium" | "heavy" = "medium") => {
      if (Haptics) {
        try {
          await Haptics.impact({ style: style.toUpperCase() });
        } catch (e) {
          console.error("Haptics error:", e);
        }
      }
    },
    [Haptics]
  );

  const notification = useCallback(
    async (type: "success" | "warning" | "error" = "success") => {
      if (Haptics) {
        try {
          await Haptics.notification({ type: type.toUpperCase() });
        } catch (e) {
          console.error("Haptics error:", e);
        }
      }
    },
    [Haptics]
  );

  const selection = useCallback(async () => {
    if (Haptics) {
      try {
        await Haptics.selectionStart();
        await Haptics.selectionChanged();
        await Haptics.selectionEnd();
      } catch (e) {
        console.error("Haptics error:", e);
      }
    }
  }, [Haptics]);

  return { impact, notification, selection, isAvailable: !!Haptics };
}

// Clipboard hook
export function useClipboard() {
  const [Clipboard, setClipboard] = useState<ClipboardPlugin | null>(null);

  useEffect(() => {
    if (isNative()) {
      import("@capacitor/clipboard").then((mod) => {
        setClipboard(mod.Clipboard as unknown as ClipboardPlugin);
      });
    }
  }, []);

  const copy = useCallback(
    async (text: string) => {
      if (Clipboard) {
        try {
          await Clipboard.write({ string: text });
          return true;
        } catch (e) {
          console.error("Clipboard error:", e);
        }
      }
      // Fallback to web API
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        console.error("Clipboard error:", e);
        return false;
      }
    },
    [Clipboard]
  );

  const read = useCallback(async () => {
    if (Clipboard) {
      try {
        const result = await Clipboard.read();
        return result.value;
      } catch (e) {
        console.error("Clipboard error:", e);
      }
    }
    // Fallback to web API
    try {
      return await navigator.clipboard.readText();
    } catch (e) {
      console.error("Clipboard error:", e);
      return null;
    }
  }, [Clipboard]);

  return { copy, read };
}

// Share hook
export function useShare() {
  const [Share, setShare] = useState<SharePlugin | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (isNative()) {
      import("@capacitor/share").then((mod) => {
        const share = mod.Share as unknown as SharePlugin;
        setShare(share);
        share.canShare().then((result) => setCanShare(result.value));
      });
    } else if (typeof navigator !== "undefined" && navigator.share) {
      setCanShare(true);
    }
  }, []);

  const share = useCallback(
    async (options: { title?: string; text?: string; url?: string }) => {
      if (Share) {
        try {
          await Share.share(options);
          return true;
        } catch (e) {
          console.error("Share error:", e);
          return false;
        }
      }
      // Fallback to web share API
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share(options);
          return true;
        } catch (e) {
          console.error("Share error:", e);
          return false;
        }
      }
      return false;
    },
    [Share]
  );

  return { share, canShare };
}

// Native storage hook (uses Preferences plugin or localStorage)
// Using a simple approach that works in both web and native
export function useNativeStorage() {
  const get = useCallback(async (key: string): Promise<string | null> => {
    // Always use localStorage for web - Capacitor handles native
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  }, []);

  const set = useCallback(async (key: string, value: string): Promise<boolean> => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
      return true;
    }
    return false;
  }, []);

  const remove = useCallback(async (key: string): Promise<boolean> => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
      return true;
    }
    return false;
  }, []);

  const clear = useCallback(async (): Promise<boolean> => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      return true;
    }
    return false;
  }, []);

  return { get, set, remove, clear };
}

// Status bar hook
export function useStatusBar() {
  const [StatusBar, setStatusBar] = useState<StatusBarPlugin | null>(null);

  useEffect(() => {
    if (isNative()) {
      import("@capacitor/status-bar").then((mod) => {
        setStatusBar(mod.StatusBar as unknown as StatusBarPlugin);
      });
    }
  }, []);

  const setStyle = useCallback(
    async (style: "dark" | "light") => {
      if (StatusBar) {
        try {
          await StatusBar.setStyle({ style: style.toUpperCase() });
        } catch (e) {
          console.error("StatusBar error:", e);
        }
      }
    },
    [StatusBar]
  );

  const setBackgroundColor = useCallback(
    async (color: string) => {
      if (StatusBar) {
        try {
          await StatusBar.setBackgroundColor({ color });
        } catch (e) {
          console.error("StatusBar error:", e);
        }
      }
    },
    [StatusBar]
  );

  return { setStyle, setBackgroundColor, isAvailable: !!StatusBar };
}
