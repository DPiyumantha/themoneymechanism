import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Brand fonts ship in public/fonts, so renders never depend on the network.
 * Loaded once when this module is imported (src/brand/index.ts does that).
 */
const load = (family: string, file: string, weight: string) =>
  loadFont({
    family,
    url: staticFile(`fonts/${file}.woff2`),
    weight,
    format: "woff2",
  });

let loaded = false;
export const loadBrandFonts = () => {
  if (loaded) return;
  loaded = true;
  for (const w of ["600", "700", "800"]) load("Sora", `sora-latin-${w}-normal`, w);
  for (const w of ["400", "500", "600", "700", "800"]) load("Inter", `inter-latin-${w}-normal`, w);
};

export const FONTS = {
  /** Headlines, big numbers, captions, the wordmark. */
  display: '"Sora", "Inter", system-ui, sans-serif',
  /** Labels, body text, kickers, sources. */
  body: '"Inter", system-ui, sans-serif',
};
