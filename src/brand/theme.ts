import { FONTS, loadBrandFonts } from "./fonts";

loadBrandFonts();

/**
 * The Money Mechanism design tokens. Use these everywhere.
 * Never hard-code another color or font in a video.
 */
export const theme = {
  pageName: "The Money Mechanism",
  nameLines: ["The Money", "Mechanism"] as const,
  tagline: "Understand how money really works.",
  handle: "@themoneymechanism",
  cta: "Follow for daily money breakdowns",
  network: "A DVYNE PAGE",

  colors: {
    /** Main background. */
    bg: "#0B0B0D",
    /** Gradient top, alternate panels. */
    bgAlt: "#18181C",
    /** Cards, chart panels. */
    surface: "#1F1F24",
    /** Headlines, captions. */
    ink: "#FFFFFF",
    /** Labels, secondary text. */
    inkMuted: "#B9B9C2",
    /** Gold: underlines, bars, pills, outlines. */
    accent: "#F2B824",
    /** Light gold: highlighted words, big numbers, active caption word. */
    accentLight: "#FFD866",
    /** Deep gold: gradient bottoms, inactive bars. */
    accentDeep: "#9A6A00",
    /** Text on gold. */
    onAccent: "#0B0B0D",
    /** Gains, up arrows. */
    positive: "#3DDC84",
    /** Losses, down arrows. */
    negative: "#FF5A4F",
    /** Hairlines, gridlines, baselines. */
    line: "rgba(242, 184, 36, 0.28)",
  },

  fonts: FONTS,

  /** Type scale in design px on a 1080-wide frame. Multiply by useScale(). */
  type: {
    hook: 96,
    bigNumber: 190,
    headline: 72,
    caption: 66,
    body: 42,
    kicker: 28,
    source: 26,
  },

  motion: {
    /** Default entrance: fast, firm, no wobble (a machine clicking into place). */
    spring: { damping: 200, stiffness: 180, mass: 0.9 },
    /** Small items: pills, words, numbers. */
    springSnappy: { damping: 18, stiffness: 220, mass: 0.6 },
    /** Frames between staggered items (at 30 fps). */
    stagger: 4,
    /** Scene transition length in frames. */
    transitionFrames: 8,
  },
} as const;

export type Theme = typeof theme;
