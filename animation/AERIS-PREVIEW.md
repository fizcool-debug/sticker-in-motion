# Aeris animation - review draft

Open Remotion Studio with `npm run studio` from the repository root, then select `AerisWindow`. Local preview: http://localhost:3000/AerisWindow when Studio uses port 3000.

810 x 1170, 30 fps, 10 seconds. The supplied SVG's 162:234 aspect ratio is retained. The user approved this animation for mapping to the Aeris sticker on October 15, 2026. Android v0.2 includes it as target index 3.

- 0-2.1s: the head rises and grows from inside the blue window, breaking its boundary with an expanding shadow.
- 2.3-3.8s: left glance and a blink.
- 3.8-5.5s: opposite glance with a secondary horn twitch.
- 5.7-7.1s: another blink, center pose, breathing hold.
- 7.1-10s: retreat to the starting pose for looping.

The original SVG is preserved at `public/aeris/original.svg`. Its 1,665 Illustrator vector fragments are regrouped without rewriting path geometry into medallion, rear horn, face, front horn, nose/brow, eye, cheek, and three sparkle groups. The floral art is a single embedded raster layer in the source and remains one separately animated texture. The original text is retained and uses bundled Rozha One, licensed under OFL (see `public/aeris/OFL.txt`). The source only contains a goat/ram head, so this draft animates that head emerging rather than inventing a full body.

`src/AerisMotion.tsx` owns timing and transforms. `scripts/prepare-aeris.py` extracts the original texture and vector groups into `src/aeris-parts.json` and can be rerun from the repository root with Python. No additional Python packages are needed for that extraction.

For app assets, render `AerisWindow` to `../public/stickers/aeris/animation.mp4` as H.264, and render the `AerisSticker` still to `../public/stickers/aeris/print-preview.png` from the `animation` directory. The still uses the supplied SVG, not an animated frame. Then run `python scripts/prepare-aeris.py --app-assets` (requires Pillow) from the repository root and recompile the collection. Small backing fills cover areas newly revealed when the eyelid and head move; the original path geometry is preserved.
