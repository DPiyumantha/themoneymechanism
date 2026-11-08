import React from "react";
import { Composition, Folder } from "remotion";
import { brandedDuration, endCardFrames, FORMATS, FPS } from "./brand";
import { EndCard } from "./components";
import { videos } from "./videos";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Videos">
        {videos.map((v) => {
          // Story episodes ("MM-Story…") are always vertical Reels (1080×1920, 9:16) for mobile.
          const { width, height } = FORMATS[v.id.startsWith("MM-Story") ? "reels" : (v.format ?? "reels")];
          return (
            <Composition
              key={v.id}
              id={v.id}
              component={v.component}
              durationInFrames={brandedDuration(v.contentFrames, FPS)}
              fps={FPS}
              width={width}
              height={height}
            />
          );
        })}
      </Folder>
      <Folder name="Brand">
        <Composition id="EndCard-Reels" component={EndCard} durationInFrames={endCardFrames()} fps={FPS} {...FORMATS.reels} />
        <Composition id="EndCard-Feed" component={EndCard} durationInFrames={endCardFrames()} fps={FPS} {...FORMATS.feed} />
        <Composition id="EndCard-Square" component={EndCard} durationInFrames={endCardFrames()} fps={FPS} {...FORMATS.square} />
      </Folder>
    </>
  );
};
