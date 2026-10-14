# Sticker in Motion

Camera-first React/TypeScript web prototype for the supplied 4 × 4 inch CET sticker. First physical test device: iPhone 16, Safari.

CET is the first test sticker, not the app identity. App copy and metadata are generic. `src/stickers.ts` owns sticker-specific names, dimensions, asset paths, tracking target settings, and motion metadata. The scanner displays a sticker name only after recognition; the preview displays the selected asset's name. Two stickers are registered; the scanner recognizes either automatically, and the preview selector offers both. Future additions need supplied artwork, animation assets, a registry entry, and recompilation of the collection target.

## Run locally

Node 24 is used in this workspace. Install with `npm install --ignore-scripts`, then run `npm run dev`. Open the printed localhost URL on this computer. Phone camera testing requires the deployed HTTPS URL; an ordinary HTTP Wi-Fi address does not grant camera access.

Run `npm run build` for the static production build in `dist`. Source is in `src`; the sticker target and animation assets are in `public/stickers/cet`.

## Edit the animation

Run `npm install` inside `animation` on a fresh checkout, then `npm run studio` from the root. Composition: `CetRainbow`, editable in `animation/src/CetMotion.tsx`. Approved motion is a rainbow reveal with subtle pulse, 4 seconds at 15 fps.

AR playback uses transparent PNG sprite atlases rather than relying on transparent-video decoding in Safari. Four 1536 × 1536 RGBA sheets contain sixty 384 × 384 frames. The sheets total about 0.5 MB compressed and about 36 MiB of base texture storage on the GPU; mipmaps are disabled. This is a prototype budget, to be measured on the actual phone.

To regenerate: render `npx remotion render src/index.ts CetRainbow out/frames --sequence --image-format=png` from `animation`, then run `scripts/pack-atlas.py` with Python/Pillow. Preview motion before replacing playback assets.

## First phone test

1. Open the HTTPS Site directly in Safari, signed into the owner account if the Site is private.
2. Allow Camera. Place the unchanged 4-inch square print flat in even light.
3. Keep all four edges visible; move closer and hold steady until CET is detected.
4. Move the phone gently. Verify alignment, rainbow sweep, pulse, and replay.
5. Move away from the sticker and back to test loss and reacquisition. Open Preview to confirm the camera stops.

The unchanged artwork has broad flat regions. Its compiled target contains modest feature counts (9 and 7 tracking points at the two tracking scales); physical recognition quality remains unverified. Do not alter the print without approval. Supplied original is preserved in `assets/source/cet-logo.png`. `print-preview.png` is a 1200-pixel square at 300 dpi, matching 4 inches when printed at actual size.

## Implementation notes

The collection has Red No Rush at index 0 and CET at index 1, with one tracked at a time. The source manifest records physical width as 0.1016 meters; MindAR's image-relative rendering uses a unit-width plane, so this metadata does not imply measured world scale. Detection resets playback; losing the target hides the plane. Backgrounding stops scanning and requires Resume. The camera is never uploaded.

The animated plane is raised by 0.18 sticker widths along the sticker normal, approximately 18 mm for a 4-inch print, rather than the initial almost-flush 0.004 offset. Pose stabilization interpolates position, quaternion rotation, and scale independently with elapsed-time-based smoothing. It adapts to deliberate movement and resets on reacquisition; matrix entries are not interpolated, avoiding shear. MindAR's filter beta is reduced from its default 1000 to 20. These are initial tuning values to evaluate on the phone.

The Vite adapter preserves MindAR's resize handler reference so it can be removed on teardown. The tracker also terminates its worker, stops stream tracks, releases textures, and guards late camera-start completion. Review this adapter when changing MindAR versions.

## Validation and limits

See VALIDATION.md. A successful build and synthetic camera test do not establish Safari or real-print reliability. Public upload tools, arbitrary-sticker animation, sound, and true 3D assets are outside this first prototype.

## Red No Rush collection update

The collection now includes Red No Rush (index 0) and CET (index 1), with automatic recognition and one tracked target at a time. Preview defaults to Red No Rush and offers a sticker selector. The supplied MP4 is preserved unchanged: 2048 square, eight frames at 6 fps, 1.33 seconds, no audio or alpha. AR uses its original frames at the original timing, packed as 512px tiles in one 2048 by 1024 JPEG atlas (8 MiB base GPU storage, mipmaps disabled). The full 1179 by 1184 PNG is preserved for recognition; no crop or feature edits. New physical print dimensions were not supplied.

Run node scripts/compile-collection.mjs with npm run dev on port 5173 to regenerate collection.mind. To regenerate the Red No Rush atlas, extract its video to work/red-frames/01.png through 08.png at 512 square using FFmpeg, then run scripts/prepare-red.py with Python/Pillow. src/stickers.ts owns the collection and target indices.


## Android app

Android is now the primary target. The existing React/MindAR app is bundled inside a Capacitor Android runtime, with both sticker targets and animations included locally. It uses the Android camera permission and Android System WebView; it does not depend on the hosted Site or use ARCore. App ID: com.fizcool.stickerinmotion. First test phone: Redmi Turbo 5.

Requirements: Node 24, JDK 21, Android SDK 36 with build tools, and an up-to-date Android System WebView on the phone. Set JAVA_HOME and ANDROID_HOME for your machine, then run npm install --ignore-scripts and npm run android:apk. The APK is copied to artifacts/Sticker-in-Motion-debug.apk. npm run android:open opens the native project in Android Studio. Capacitor configuration is capacitor.config.ts; native source is android/.

The debug APK is for sideload testing. Google Play distribution will require a release signing key, an app bundle, store details and device validation. The application keeps image processing on-device. Camera access is required; audio/storage permissions are not requested. System Back returns from Preview or closes tips, then delegates to the Android system at the scanner root. Backgrounding stops the camera; Resume reopens it. Native safe-area CSS variables and Android font scale are respected.

## Camera-only update

Version 1.1 removes the scanner header/footer. The camera fills the screen with a small preview button; replay appears only while recognized. The faint guide disappears after recognition and guidance clears after four seconds. Error/pause recovery remains actionable. Tips and privacy information are available in Preview. Manual-test APK: artifacts/Sticker-in-Motion-camera.apk.

## Fizcool Garden — Android 1.2

The third sticker uses the full supplied PNG sequence: 180 frames at the user-approved 30 fps, six seconds at 1080 square. Its original frame_0118.png is the print/recognition target, and target index 2 joins Red No Rush (0) and CET (1). Preview defaults to Fizcool Garden. Garden uses a Three.js VideoTexture instead of retaining 180 full frames as atlases; it starts/replays on detection, pauses on loss, and releases the video decoder/frame callbacks on cleanup. Other stickers retain their existing atlas playback.

Original files and a complete frames.zip are in assets/source/garden-fizcool. Run scripts/prepare-garden.py with Python/Pillow and FFmpeg to regenerate animation.mp4 and target assets; then run scripts/compile-collection.mjs against npm run dev on port 5173 to regenerate the three-image collection. The standalone supplied WebM contained six frames at 1 fps and was preserved but not used as playback. Test APK: artifacts/Sticker-in-Motion-garden.apk, version 1.2/code 3.
