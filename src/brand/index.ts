import { staticFile, useVideoConfig } from "remotion";

export { theme } from "./theme";
export type { Theme } from "./theme";
export { Logo } from "./Logo";
export type { LogoProps } from "./Logo";

/** The PNG logo (1080×1080, round-crop safe). Use with <Img>. Prefer <Logo> in videos. */
export const LOGO_PNG = staticFile("brand/money-mechanism-logo.png");

/** All videos run at 30 fps. */
export const FPS = 30;

/** Output formats. Reels is the default for every video. */
export const FORMATS = {
  reels: { width: 1080, height: 1920 },
  feed: { width: 1920, height: 1080 },
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
} as const;
export type FormatName = keyof typeof FORMATS;

/** End card length. BrandedVideo appends it to every video. */
export const END_CARD_SECONDS = 3.5;
export const endCardFrames = (fps: number = FPS) => Math.round(END_CARD_SECONDS * fps);
/** Composition length for a video whose own content runs `contentFrames`. */
export const brandedDuration = (contentFrames: number, fps: number = FPS) =>
  contentFrames + endCardFrames(fps);
/** Seconds → frames at 30 fps. */
export const sec = (seconds: number, fps: number = FPS) => Math.round(seconds * fps);

/**
 * Every size in this project is designed on a 1080-wide frame.
 * Multiply design px by `s` so the same code works in every format.
 */
export const useScale = () => {
  const { width, height } = useVideoConfig();
  return Math.min(width, height) / 1080;
};

/**
 * Areas Facebook covers with its own buttons and text. Keep text and logos inside.
 * Reels: ~14% top, ~28% bottom, ~6% sides. Other formats: 5% all round.
 */
export const useSafeZone = () => {
  const { width, height } = useVideoConfig();
  const vertical = height / width > 1.5;
  const top = Math.round(height * (vertical ? 0.14 : 0.05));
  const bottom = Math.round(height * (vertical ? 0.28 : 0.05));
  const side = Math.round(width * (vertical ? 0.06 : 0.05));
  return { top, bottom, left: side, right: side, vertical, width, height };
};
