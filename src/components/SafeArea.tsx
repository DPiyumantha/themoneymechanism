import React from "react";
import { useSafeZone, useScale } from "../brand";

export type SafeAreaProps = {
  children: React.ReactNode;
  /** Keep the band above Facebook's bottom UI free for captions. Default true. */
  reserveCaptions?: boolean;
  /** Horizontal alignment of the content. */
  align?: "start" | "center";
  /** Vertical placement. */
  justify?: "start" | "center" | "end";
};

/**
 * Where every scene's text and graphics go: inside Facebook's safe zone,
 * below the watermark and above the caption band.
 */
export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  reserveCaptions = true,
  align = "start",
  justify = "center",
}) => {
  const safe = useSafeZone();
  const s = useScale();
  return (
    <div
      style={{
        position: "absolute",
        top: safe.top + 120 * s,
        bottom: safe.bottom + (reserveCaptions ? 220 : 0) * s,
        left: safe.left,
        right: safe.right,
        display: "flex",
        flexDirection: "column",
        justifyContent: justify === "center" ? "center" : justify === "end" ? "flex-end" : "flex-start",
        alignItems: align === "center" ? "center" : "stretch",
        gap: 32 * s,
      }}
    >
      {children}
    </div>
  );
};
