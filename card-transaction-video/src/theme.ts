export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION = 9000; // 5 minutes at 30 fps

/** Absolute start frame and length of each scene. They tile 0-9000 exactly. */
export const scenes = {
  tap: { from: 0, duration: 1350 },
  architecture: { from: 1350, duration: 2250 },
  relay: { from: 3600, duration: 3600 },
  settlement: { from: 7200, duration: 1800 },
} as const;

/** Frame (inside the whole video) where the YouTube end screen starts to fade in. */
export const END_SCREEN_FRAME = 8400;

export const colors = {
  bg: "#05070B",
  text: "#F3F4F6",
  muted: "#8B95A9",
  merchant: "#10B981", // emerald
  acquirer: "#06B6D4", // cyan
  network: "#2563EB", // deep blue
  issuer: "#F59E0B", // amber
  glass: "rgba(255,255,255,0.055)",
  glassBorder: "rgba(255,255,255,0.14)",
};

export const font =
  '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const mono = '"SF Mono", "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace';
