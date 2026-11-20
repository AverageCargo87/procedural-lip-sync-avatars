# Release assets

Full-length videos are not tracked in git (`release-assets/` is ignored). They are meant to be uploaded as assets of a GitHub release. All of them are produced by `node tools/media.mjs` with the deterministic exporter (`tools/video.mjs`) from the code and data in this repository.

| file | content | format | size |
|---|---|---|---|
| `all-12-styles.mp4` | all 12 styles side by side, tempo B, the whole 42 s clip with sound | H.264 1920x1080, 30 fps, AAC | 17.9 MB |
| `stage-24-tempo-B.mp4` | style 24 "Slanted cube, simple adults", tempo B, full stage | H.264 1920x1080, 30 fps, AAC | 7.6 MB |
| `four-tempos-26.mp4` | style 26 "Facets, simple adults" in tempos A, B, C, D | H.264 1920x1080, 30 fps, AAC | 12.1 MB |
| `mouth-closeup.mp4` | both faces in close-up with the pose-track strip (mouth opening, rounding, spreading and letters) | H.264 1280x920, 30 fps, AAC | 10.6 MB |

Export time on the author's desktop (2026-11-20): 57 s for the 12-style grid, 32-40 s for the others, for 42 s of video each.

Voice: ElevenLabs (Russian dialogue; the text passed the copyright overlap check described in the README).
