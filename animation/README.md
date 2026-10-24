# Sticker animations

This folder contains the CET and Aeris Remotion compositions used by Sticker in Motion.

## Setup and preview

From the repository root:

```sh
npm --prefix animation ci
npm run studio
```

Choose `CetRainbow`, `AerisWindow` or the `AerisSticker` still. Studio normally runs on port 3000.

## Render

Run these commands from `animation/`:

```sh
npx remotion render src/index.ts AerisWindow ../public/stickers/aeris/animation.mp4 --codec h264
npx remotion still src/index.ts AerisSticker ../public/stickers/aeris/print-preview.png
```

Aeris is 810 × 1170 at 30 fps for 10 seconds. Its recognition still preserves the supplied print artwork; see [AERIS-PREVIEW.md](AERIS-PREVIEW.md) for the rig and rebuild notes.

CET is a 384 × 384, four-second composition at 15 fps. Its deployed AR playback uses packed sprite atlases; rendering a new video alone does not regenerate those atlases.

Garden and Red No Rush use supplied media in the app's public assets rather than these compositions. See the root `scripts/prepare-*.py` tools for asset preparation.

## Licenses

Original composition code is covered by the repository's MIT license. Supplied artwork, generated artwork data, fonts and rendered media retain their separate terms; see [NOTICE.md](../NOTICE.md). Remotion has [its own license](https://www.remotion.dev/docs/license), which is not replaced by the code license.
