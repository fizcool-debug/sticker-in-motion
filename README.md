# Sticker in Motion

I built Sticker in Motion to bring my printed stickers to life. Point your Android phone at a supported sticker and its animation plays above the print, following it as you move the camera.

The app opens straight into a full-screen camera. There's a small preview button to browse the collection, and a replay button appears when a sticker is recognised. I wanted the artwork to be the focus, with as little UI in the way as possible.

## Install it

Download the APK from [GitHub Releases](https://github.com/fizcool-debug/sticker-in-motion/releases). This repository is private, so you'll need access to download it.

1. Open the APK on your Android phone and allow installation from that source if Android asks.
2. Launch **Sticker in Motion** and allow camera access.
3. Point the camera at one of the supported prints. Keep the whole sticker visible, use even light, and hold steady while it finds the image.
4. Move the phone gently to see the animation above the sticker. Tap replay to start it again.

You can also open Preview to watch each animation and view its original artwork without scanning a print. If you leave the app, the camera stops; tap **Resume camera** when you return.

The current APK is a debug-signed build for sideload testing. It isn't on Google Play. The app targets Android 7.0 and later and needs camera access and an up-to-date Android System WebView; tracking performance still needs checking on real devices.

## The stickers

| Sticker | Animation | Playback |
| --- | --- | --- |
| Fizcool Garden | Garden scatter | 180 frames at 30 fps, 6 seconds |
| Red No Rush | Original animation | 8 frames at 6 fps, about 1.33 seconds |
| CET | Rainbow sweep and subtle pulse | 60 frames at 15 fps, 4 seconds |

All three are bundled in the APK, including their recognition targets and animations. The scanner recognises them automatically, tracks one at a time, and restarts playback when a target is found. Preview opens on Fizcool Garden by default.

This works with the registered artwork. It doesn't turn any random image into an animated sticker. CET's print is 4 × 4 inches; print dimensions for the other two haven't been set yet.

## How I built it

I use React and TypeScript for the interface, MindAR for image tracking, and Three.js for rendering the animation over the camera feed. Capacitor packages everything as an Android app, with the assets stored locally. Once installed, scanning doesn't need a hosted page or an internet connection.

Garden plays through a Three.js video texture. Red No Rush and CET use sprite atlases. The animation sits slightly above the print, and pose smoothing helps reduce shaking as the camera moves.

Camera frames are processed on the phone and aren't uploaded. The app doesn't ask for microphone or storage access. It uses Android System WebView for rendering and tracking, with no ARCore dependency.

## Build it locally

My build setup uses Windows/PowerShell, Node.js 24, JDK 21, and Android SDK 36 with its build tools. Set `JAVA_HOME` and `ANDROID_HOME` to your local installations, then run:

```powershell
npm install --ignore-scripts
npm run android:apk
```

That builds the frontend, syncs it into the Android project, and creates:

```text
artifacts/Sticker-in-Motion-debug.apk
```

To open the native project in Android Studio:

```powershell
npm run android:open
```

For a quick browser preview during development, use `npm run dev`. `npm run build` checks TypeScript and builds the frontend into `dist/`. Camera testing in a phone browser needs HTTPS; the Android APK bundles the app locally.

## Working on the artwork and animations

The main files are:

| Path | What it contains |
| --- | --- |
| `src/stickers.ts` | Sticker names, target indices, asset paths, and animation settings |
| `src/tracking.ts` | Image tracking and AR playback |
| `public/stickers/` | Bundled targets, print previews, and playback assets |
| `assets/source/` | Original artwork and animation sources |
| `animation/` | Remotion project for CET's animation |
| `android/` | Native Android project |
| `capacitor.config.ts` | App identity and Android runtime settings |

To edit CET's animation, install the dependencies in `animation/`, then run `npm run studio` from the project root. The composition is `CetRainbow`, in `animation/src/CetMotion.tsx`. Render its PNG sequence and pack it with `scripts/pack-atlas.py` before replacing the playback assets.

Garden's source is the full 180-frame PNG sequence. `scripts/prepare-garden.py` rebuilds its video and target assets using Python/Pillow and FFmpeg. Red No Rush's atlas is prepared with `scripts/prepare-red.py` from extracted video frames.

Adding a sticker means adding its artwork, animation assets, and entry in `src/stickers.ts`, then recompiling `public/stickers/collection.mind`. The current target order is Red No Rush (0), CET (1), and Fizcool Garden (2).

To rebuild the collection, keep `npm run dev` running on port 5173 and run `node scripts/compile-collection.mjs` in another terminal. The compiler and verification scripts currently include paths for my local Playwright/Edge setup, so those need adjusting on another machine.

## Testing so far

I've checked Android builds and APK signatures, and run emulator checks for camera permissions, preview playback, Back navigation, background/resume behaviour, landscape, and larger text. Synthetic camera tests inside Android WebView have also covered recognition, switching between the three stickers, target loss, reacquisition, replay, and cleanup.

Those checks don't tell me how well the latest build tracks a real print on a real phone. Manual testing on the Redmi Turbo 5 is still pending, especially alignment, shaking, glare, heat, and sustained performance. The full test history and known limits are in [VALIDATION.md](VALIDATION.md).

```

The script creates a draft release, verifies the uploaded APK's size and SHA-256, and then publishes it. Release notes include the changes, testing limits, APK hash, and signing type. Published releases and assets stay unchanged; intermediate development builds stay local. See [AGENTS.md](AGENTS.md) for the release workflow.
