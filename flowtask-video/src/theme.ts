export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 450; // 15 seconds at 30 fps

export const colors = {
  bg: "#0B0F19",
  panel: "#121829",
  panelBorder: "#1F2740",
  card: "#171E33",
  text: "#FFFFFF",
  muted: "#8B94B1",
  accent: "#6366F1",
  accentSoft: "#818CF8",
  violet: "#A78BFA",
  success: "#34D399",
};

export const font =
  '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** Frame ranges for each scene (Sequence `from` + `durationInFrames`). */
export const scenes = {
  hook: { from: 0, duration: 90 },
  magic: { from: 90, duration: 150 },
  value: { from: 240, duration: 120 },
  cta: { from: 360, duration: 90 },
} as const;
