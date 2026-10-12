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

