import type React from "react";
import type { FormatName } from "../brand";
import { CONTENT_FRAMES as TEMPLATE_FRAMES, TemplateVideo } from "./_template/Video";
import { CONTENT_FRAMES as EXAMPLE_FRAMES, ExampleCostcoHotDog } from "./_example-costco-hot-dog/Video";

export type VideoEntry = {
  /** Composition id shown in Studio: "MM-<Slug>" in PascalCase words, e.g. "MM-CostcoHotDog". */
  id: string;
  component: React.FC;
  /** Content length without the end card. */
  contentFrames: number;
  /** Default "reels" (1080×1920). */
  format?: FormatName;
};

/**
 * Every video in the project. Add one line per new video; Root.tsx creates
 * the composition and adds the end card length automatically.
 */
export const videos: VideoEntry[] = [
  { id: "MM-Example-CostcoHotDog", component: ExampleCostcoHotDog, contentFrames: EXAMPLE_FRAMES },
  { id: "MM-Template", component: TemplateVideo, contentFrames: TEMPLATE_FRAMES },
  // { id: "MM-YourNewVideo", component: YourNewVideo, contentFrames: CONTENT_FRAMES },
];
