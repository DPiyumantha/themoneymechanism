# The Money Mechanism — Remotion videos

Branded video project for **The Money Mechanism** (a DVYNE page). Every video gets the brand colors, fonts, captions, a corner watermark and an animated logo end card automatically.

## First run

```console
npm i --loglevel=error
npm run dev
```

Studio opens with:
- **Videos › MM-Example-CostcoHotDog**: a sample using every component
- **Videos › MM-Template**: the starting point for new videos
- **Brand › EndCard-***: the end card in each format

## Making a video with an AI assistant

Ask it in plain words, for example:

> Make a Money Mechanism video about why gas prices end in 9/10 of a cent.

The `money-mechanism-video` skill (in `.agents/skills/`, also visible to Claude Code through `.claude/skills/`) tells the assistant how to script, build, preview and render it in the house style. `AGENTS.md` and `CLAUDE.md` point every assistant to it.

## Making a video by hand

1. Copy `src/videos/_template/` to `src/videos/<your-slug>/`.
2. Edit the scenes in `Video.tsx`.
3. Add a line to `src/videos/index.ts`.
4. Preview with `npm run dev`; render with `npx remotion render MM-<Name> out/<name>.mp4`.

## Commands

| Command | What |
| --- | --- |
| `npm run dev` | Remotion Studio |
| `npm run lint` | ESLint + type-check |
| `npx remotion render <id> out/<file>.mp4` | Render a video |
| `npx remotion upgrade` | Upgrade Remotion |

Remotion license: free for individuals and small teams; some companies need a company license. See https://remotion.dev/license.
