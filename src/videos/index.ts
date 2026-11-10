import type React from "react";
import type { FormatName } from "../brand";
import { CONTENT_FRAMES as TEMPLATE_FRAMES, TemplateVideo } from "./_template/Video";
import { CONTENT_FRAMES as EXAMPLE_FRAMES, ExampleCostcoHotDog } from "./_example-costco-hot-dog/Video";
import { CONTENT_FRAMES as STORY_TEMPLATE_FRAMES, StoryTemplate } from "./_story-template/Video";
import { CONTENT_FRAMES as WHY_999_FRAMES, Why999 } from "./why-999/Video";
import { CONTENT_FRAMES as GAS_FRAMES, GasDollarBreakdown } from "./gas-dollar-breakdown/Video";
import { CONTENT_FRAMES as COSTCO_MEMBERSHIPS_FRAMES, CostcoMemberships } from "./costco-memberships/Video";
import { CONTENT_FRAMES as STORY_MILK_RUN_FRAMES, StoryMilkRun } from "./story-milk-run/Video";
import { CONTENT_FRAMES as STORY_COFFEE_BANK_FRAMES, StoryCoffeeBank } from "./story-coffee-bank/Video";
import { CONTENT_FRAMES as HOLIDAY_TRILLION_FRAMES, HolidayTrillion } from "./holiday-trillion/Video";
import { CONTENT_FRAMES as CPI_DAY_FRAMES, CpiDay } from "./cpi-day/Video";
import { CONTENT_FRAMES as VETERANS_DAY_FRAMES, VeteransDay } from "./veterans-day/Video";
import { CONTENT_FRAMES as BEEF_EGGS_FRAMES, BeefEggs } from "./beef-eggs/Video";
import { CONTENT_FRAMES as STORY_TABLE_FOR_ONE_FRAMES, StoryTableForOne } from "./story-table-for-one/Video";
import { CONTENT_FRAMES as STORY_SIX_DOLLAR_FRAMES, StorySixDollarProblem } from "./story-six-dollar-problem/Video";
import { CONTENT_FRAMES as STORY_FAMILY_SIZE_FRAMES, StoryFamilySize } from "./story-family-size/Video";
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
  { id: "MM-StoryMilkRun", component: StoryMilkRun, contentFrames: STORY_MILK_RUN_FRAMES, format: "reels" },
  { id: "MM-StoryCoffeeBank", component: StoryCoffeeBank, contentFrames: STORY_COFFEE_BANK_FRAMES, format: "reels" },
  { id: "MM-HolidayTrillion", component: HolidayTrillion, contentFrames: HOLIDAY_TRILLION_FRAMES },
  { id: "MM-CpiDay", component: CpiDay, contentFrames: CPI_DAY_FRAMES },
  { id: "MM-VeteransDay", component: VeteransDay, contentFrames: VETERANS_DAY_FRAMES },
  { id: "MM-BeefEggs", component: BeefEggs, contentFrames: BEEF_EGGS_FRAMES },
  { id: "MM-StoryTableForOne", component: StoryTableForOne, contentFrames: STORY_TABLE_FOR_ONE_FRAMES, format: "reels" },
  { id: "MM-StorySixDollarProblem", component: StorySixDollarProblem, contentFrames: STORY_SIX_DOLLAR_FRAMES, format: "reels" },
  { id: "MM-StoryFamilySize", component: StoryFamilySize, contentFrames: STORY_FAMILY_SIZE_FRAMES, format: "reels" },
  // { id: "MM-YourNewVideo", component: YourNewVideo, contentFrames: CONTENT_FRAMES },
];
