import type React from "react";
import type { FormatName } from "../brand";
import { CONTENT_FRAMES as TEMPLATE_FRAMES, TemplateVideo } from "./_template/Video";
import { CONTENT_FRAMES as EXAMPLE_FRAMES, ExampleCostcoHotDog } from "./_example-costco-hot-dog/Video";
import { CONTENT_FRAMES as STORY_TEMPLATE_FRAMES, StoryTemplate } from "./_story-template/Video";
import { CONTENT_FRAMES as WHY_999_FRAMES, Why999 } from "./why-999/Video";
import { CONTENT_FRAMES as GAS_FRAMES, GasDollarBreakdown } from "./gas-dollar-breakdown/Video";
import { CONTENT_FRAMES as COSTCO_MEMBERSHIPS_FRAMES, CostcoMemberships } from "./costco-memberships/Video";

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
  { id: "MM-StoryTemplate", component: StoryTemplate, contentFrames: STORY_TEMPLATE_FRAMES, format: "reels" },
  { id: "MM-Why999", component: Why999, contentFrames: WHY_999_FRAMES },
  { id: "MM-GasDollarBreakdown", component: GasDollarBreakdown, contentFrames: GAS_FRAMES },
  { id: "MM-CostcoMemberships", component: CostcoMemberships, contentFrames: COSTCO_MEMBERSHIPS_FRAMES },
  // { id: "MM-YourNewVideo", component: YourNewVideo, contentFrames: CONTENT_FRAMES },
];
