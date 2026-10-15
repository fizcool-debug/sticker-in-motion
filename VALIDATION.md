# Prototype validation — 12 October 2026

- Production build: TypeScript and Vite passed. The exact dist build also passed the permission/preview and synthetic tracking checks below via a local production-preview server.
- Remotion: CetRainbow loaded in Studio and sixty transparent frames exported successfully. Atlas packing verified size, frame count, and transparent corner pixels.
- Unchanged target compiled: 191,069 bytes. Matching features per scale: 69, 73, 56, 63, 53, 58, 56, 42, 46, 31, 26, 24. Tracking points per scale: 9, 7. Counts are not a reliability score.
- Headless Edge at 393 × 852 and 1440 × 900: permission recovery, scanning tips, preview play/pause, returning to scanner, no horizontal overflow, and no uncaught page errors passed.
- Synthetic canvas camera in Edge: actual MindAR detection, target loss, reacquisition, replay control, and camera teardown passed. This fixture used the supplied target in a digital stream; it is not a physical print, Safari, or an iPhone test.
- Impeccable visual reviewer found no material UI changes necessary; its sole documentation finding was resolved and scored ship for that fix. Launcher failure and skipped concept roll remain explicitly documented workflow exceptions; no full concept-roll gate is claimed.
- Dependency check: patched the fixable tar chain. Four moderate advisories remain in the MindAR/TensorFlow development dependency tree, originating in an upstream sprintf-js advisory with no published compatible fix. The tracker consumes prebuilt MindAR browser distribution files; no sprintf formatting input is exposed by this app. Re-evaluate upstream versions before a broader release.

Still required: iPhone 16 Safari camera permission, transparent texture rendering, physical 4-inch print recognition, angle/distance/glare tolerance, background/resume, memory/heat, and sustained frame-rate measurements.

## Depth and stabilization update

The user reports recognition works on the iPhone test, but the popup is too close to the print and shaky. Raised the animation from 0.004 to 0.18 image-relative widths. Added adaptive rigid-pose smoothing and reduced MindAR filter beta to 20. A deterministic noisy-pose test reduced injected translation RMS to 0.115 of input and rotation RMS to 0.096 of input, preserved rigid transforms, snapped on reacquisition, and followed the test movement within 300 ms. These are software-fixture results, not measured phone jitter. Production build and synthetic detection/loss/reacquisition/replay/cleanup checks passed again. Actual phone comfort, alignment, and lag need confirmation after refresh.

Local test scripts: scripts/verify-browser.mjs and scripts/verify-tracking.mjs. They currently use this desktop's bundled Playwright and Edge paths; adapt those paths for another development machine. QA captures/reports remain in the ignored work/qa directory.

## Generic identity update

Changed app identity and page title to Sticker in Motion. Generic scanner states contain no CET label before recognition. Sticker name, print dimensions, target paths, and motion metadata now come from src/stickers.ts; the selected CET preview retains its own name. Production build, mobile/desktop permission recovery and preview playback, no-overflow check, and synthetic detection/loss/reacquisition/replay/cleanup passed. Browser checks also assert a generic page title and no CET copy in the unrecognized scanner state. Visual captures were inspected at the same two viewports. At that stage only CET was registered; the subsequent collection update below adds a second sticker.

## Red No Rush collection update

Added the supplied image unchanged as target index 0 and retained CET as index 1 in collection.mind. Red No Rush matching feature counts: 333,326,317,288,260,237,199,162,139,92,55,41; tracking points: 20,18. Counts alone do not establish physical tracking quality.

Production build passed. scripts/verify-collection.mjs passed at 393 by 852 and 1440 by 900: original video dimensions/duration, inline muted looping playback, selection of both previews, camera recovery, and no horizontal overflow/page errors. Synthetic canvas camera checks passed actual detection of both images, switching back and forth, loss, reacquisition, replay and camera cleanup. AR screenshots half a second apart show changing artwork pixels; preview and AR captures were inspected. The 0.18 image-relative popup depth and rigid pose smoothing remain applied independently per target. Physical recognition and performance on iPhone 16 Safari still require testing with the new print.


## Android APK — October 14

Built the Capacitor Android debug APK with JDK 21, Gradle 8.14.3, Android SDK 36 and AGP 8.13. The app packages both sticker targets and animations locally. API 37 Android emulator: camera permission denial/recovery, live 480 by 640 camera stream, video playback, CET preview, original artwork viewing, native Back navigation, background camera teardown/resume, 1.3 font scale, and landscape passed. Screenshots were inspected; landscape was changed to side-by-side guide and controls after the first inspection showed cramped controls. Final native checks produced no page errors.

A synthetic canvas camera inside the actual Android WebView also passed detection of both targets, switching, loss/reacquisition and replay. This is software/emulator evidence, not measured tracking on Redmi Turbo 5 hardware. Physical sticker alignment, jitter, heat and sustained camera performance on that phone remain to be checked. Runtime npm audit retains the four previously documented moderate upstream MindAR/TensorFlow issues; no high or critical runtime advisories. Debug APK is for sideload testing; release signing and Play Store distribution are not configured.

Run scripts/verify-android.mjs and scripts/verify-android-tracking.mjs after forwarding tcp:9222 to the installed debug app's webview_devtools_remote_<pid> socket. The scripts use the workspace's bundled Playwright/Edge dependency paths and an emulator by default, and restore emulator font/orientation settings. QA images are in ignored work/qa/android.

## Camera-only UI — October 14

Removed scanner header, bottom panel, visible print metadata and permanent privacy/tips copy. Kept a small preview button, conditional replay, faint search guide and four-second hints; retained screen-reader announcements and centered permission/pause recovery. Preview contains tips and privacy guidance. Native build/signature verification passed. Android emulator checks passed live camera, absence of scanner header/panel, disappearing hint, both previews, artwork/back, background cleanup/resume, 1.3 font scale and landscape. Both-target synthetic recognition/switching/loss/reacquisition/replay passed inside Android WebView. Physical Redmi testing is left to manual installation at the user’s request. APK version 1.1 (code 2), artifacts/Sticker-in-Motion-camera.apk.

## Fizcool Garden

Encoded exactly 180 source PNG frames into a 1080 by 1080 H.264 MP4, 30 fps, 6.0 seconds; ffprobe confirmed frame count, dimensions, fps and duration. Garden recognition features per matching scale: 121,124,122,118,111,104,95,83,72,61,46,40; tracking points 12,8. Native Android emulator fixture passed Garden preview playback, VideoTexture autoplay, replay/reset, pause on target loss, decoder/source cleanup when leaving scanning, and switching among all three registered targets, with no page errors. Preview and bloom-stage AR screenshots were inspected. The retained full-camera UI and previous targets are unchanged. Real Redmi/print tracking remains to be tested manually. Signed debug APK build/verification passed.

## Aeris - October 15, 2026 / v0.2

User approved the Remotion animation and requested mapping it to the supplied SVG. The original SVG is retained byte-for-byte (SHA-256 6216946b02c48b5d39797f4fbd741b14a854720c267eb25edafab66c38914a2d). The recognition target is a rasterization of that original artwork with its specified Rozha One font; it is not an animation frame. The target and animation preserve the 162:234 portrait proportions. Remotion rendered 300 frames at 30 fps, 810 by 1170; ffprobe confirmed H.264, 10.000 seconds, 300 frames, and those dimensions/rate.

Target index 3 is Aeris; earlier indices remain unchanged. Matching features: 447,453,441,430,408,365,263,188,130,71; tracking points 34,30. These counts are compiler diagnostics, not a measurement of real-print reliability.

`scripts/verify-aeris-android.mjs` passed in the actual Android emulator WebView: portrait preview dimensions and layout ratio, original-artwork view, detection of Aeris using a synthetic camera, VideoTexture autoplay, replay, pause on loss, reacquisition, switching to each of the other three stickers and back, video source/decoder cleanup, and no page errors. Preview and tracked-animation screenshots were inspected. The first test was interrupted by an emulator System WebView package update; the test passed after reopening the app against the updated WebView.

Android build and debug APK signature verification passed, versionName 0.2 / versionCode 4. APK SHA-256: e6f5fd19172ac317c0bfcfae0c30a973a43dfa4dddc8e21f6facd36296fd6ed6. Physical Redmi Turbo 5 recognition, alignment, stability, and sustained performance remain to be tested manually.

The standard Android regression script also passed on this APK: live 480 by 640 camera, preview playback, artwork/native Back, background camera cleanup/resume, 1.3 font scale, landscape, and no page errors. Its initial invocation started on the previous test's Preview route and timed out waiting for scanning; resetting the test route resolved that harness precondition.
