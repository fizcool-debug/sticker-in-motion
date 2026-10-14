# Product

<!-- impeccable:product-schema 1 -->

## Platform

android (Capacitor), with the existing web build retained

## Stack

User approved the recommended React + TypeScript stack. Vite serves the app; MindAR and Three.js provide image tracking and rendering. Remotion authors the animated assets.

## Product Purpose

Scan a supplied printed 2D sticker and display an animated version in the camera view. The proposed default is alignment to the physical sticker as the phone moves.

## Operating Context

Current target: Redmi Turbo 5 Android phone. The user switched from the web app to an Android app on October 14. First web test device was iPhone 16 Safari. CET remains a 4-inch square target; Red No Rush dimensions are unspecified. Physical Android tracking requires testing on the actual phone.

## Brand Commitments

Provisional app name: Sticker in Motion. CET is only the first test sticker, not the app identity. Scanner copy is generic; sticker names appear only when recognized or selected for preview. The prototype contains Fizcool Garden, Red No Rush and CET, with automatic recognition of either and one tracked sticker at a time.

Preserve the supplied CET test artwork, lettering, rainbow bar, and proportions. Approved animation for that sticker: rainbow sweep and subtle pulse. Do not change printed artwork to improve tracking without approval.

## Evidence on Hand

Original supplied image: assets/source/cet-logo.png, copied from the user-selected Google Drive file. Source resolution is 12500 by 12500 pixels. No tracking results or phone performance measurements are available yet.

User phone feedback after the first publication: recognition works; the popup needs greater surface separation and reduced shake. This is qualitative feedback, not a device performance measurement.

## Capabilities and Constraints

Current collection: CET uses its editable Remotion animation. Red No Rush uses the supplied MP4 unchanged in preview and an eight-frame atlas derived from it in AR, preserving its 6 fps timing and opaque scene. Its supplied recognition image is preserved without cropping; physical print dimensions were not specified. Camera access on a phone requires a secure origin. Target loss, permission refusal, replay, and leaving scanning must have predictable behavior. Sound, broader audience, additional devices, and public distribution remain undecided.

## Product Principles

- Keep the real artwork recognizable throughout animation.
- Validate recognition against the unchanged print before scaling the collection.
- Keep camera processing local.
- Distinguish an animation preview from verified AR tracking.

## Fizcool Garden asset

The user supplied frame_0118.png as the unchanged recognition image and garden-fizcool-scatter.webm. After inspecting the low-frame-rate WebM, the user approved the complete 180 PNG sequence at 30 fps (6 seconds). Original image, WebM and frame archive are preserved in assets/source/garden-fizcool. Garden uses an opaque H.264 video texture for AR and preview; existing CET/Red No Rush atlases remain unchanged. Target indices remain Red No Rush 0, CET 1, Garden 2.
