# Releases

## v0.2

- Added Aeris as the fourth automatically recognized sticker, using the supplied SVG as its target.
- Included the approved 10-second, 30-fps Remotion animation: goat emerges from the window, looks around, and blinks; horns, sparkles, lettering, and floral art move independently.
- Preserved the portrait artwork's proportions in AR and added Aeris to Preview and artwork viewing.
- Retained CET, Red No Rush, Fizcool Garden, and the minimal camera interface.

Debug-signed APK for sideload testing; Android version 0.2, versionCode 4. Build/signature verification and Android WebView checks passed for portrait preview, synthetic detection of all four stickers, autoplay/replay, pause on loss, and decoder cleanup. Physical Aeris print recognition, alignment, and stability on the Redmi Turbo 5 still require manual testing.

## v0.1

First GitHub APK release of Sticker in Motion.

- Camera-first Android scanner with a minimal fullscreen interface.
- Automatically recognizes CET, Red No Rush, and Fizcool Garden.
- Garden plays the complete 180-frame animation at 30 fps in a six-second loop.
- Raised animated artwork, pose smoothing, replay, and sticker previews.
- Camera permission recovery, Android Back handling, and background/resume cleanup.

Debug-signed APK for sideload testing; internal Android version 1.2, versionCode 3. Build, APK signature, emulator playback/lifecycle checks, and synthetic recognition checks passed. Recognition and alignment of the new Garden print on the Redmi Turbo 5 still require a physical test.
