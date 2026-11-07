# Per-video assets

One folder per video, matching its slug in `src/videos/`:

```
public/videos/<slug>/voiceover.mp3
public/videos/<slug>/photo-1.jpg
```

Reference them with `staticFile("videos/<slug>/voiceover.mp3")`.
