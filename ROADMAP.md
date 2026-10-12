# AR Sticker app roadmap

Status: first web prototype implemented for the supplied CET artwork, 4 × 4 inch print, iPhone 16 Safari. Camera-first layout, React/TypeScript, and rainbow sweep plus subtle pulse are confirmed. Local software checks passed; physical phone validation remains pending. See VALIDATION.md.

## Product outcome

A person opens the app, allows the rear camera, points it at a supported printed sticker, and sees an animated version aligned with that sticker. Moving the phone changes the animation's position, scale, and perspective to match the print. Losing the sticker hides the animation after a short grace period; finding it restores playback.

Confirmed platform: mobile web app opened through a URL. Planning assumptions: animated 2D artwork anchored in AR; one visible sticker at a time; a curated collection supplied by the owner. True 3D characters, arbitrary unseen-sticker animation, accounts, payments, and a public upload editor are later scope decisions.

## Proposed architecture

- React, TypeScript, and Vite for the mobile web app.
- Impeccable for product discovery, interface direction, components, accessibility, and bounded visual review.
- MindAR for image recognition and tracking, with Three.js for anchored rendering. Validate actual mobile browsers before committing to this engine, and keep tracking behind an adapter. This camera-based image tracking approach does not depend on a native ARCore installation or WebXR image-tracking support.
- Remotion for editable animation compositions and Studio previews. Use its Player for collection previews where appropriate; the AR renderer consumes exported animation assets rather than embedding the HTML Player as a 3D object.
- A versioned sticker manifest mapping stable sticker IDs to tracking target indexes, artwork, animation assets, aspect ratio, anchor scale/offset, duration, and playback behavior.
- Serve compiled image targets, the sticker manifest, and animation assets from HTTPS static hosting. Add a database, object storage, and background rendering only when a publishing workflow is needed. Optional PWA caching is later scope; first-load offline operation is not assumed.

## Phase 1 — Define the first experience

Confirm audience, anchored behavior, target phones/browsers, and whether sound is wanted. Inspect the first supplied sticker and its intended print size. Check the Node development environment and arrange HTTPS access for physical-phone testing. Establish an artwork-led interface direction with Impeccable before UI implementation; persist confirmed decisions in PRODUCT.md and DESIGN.md.

Deliverables: confirmed scope, user flow, supported-device test matrix, asset inventory, and interface direction.

## Phase 2 — Prove tracking on real phones

Compile the first artwork into a MindAR image target and attach a static transparent plane. Test detection, alignment, stability, target loss, reacquisition, distance, tilt, print size, lighting, glare, and curvature. Start with a flat print; curved surfaces require separate validation. Sparse or repetitive artwork may need a user-approved border or richer print treatment to track reliably.

Deliverable: a browser prototype aligned to the actual print. Advance when agreed phones/browsers pass, starting with Android Chrome and evaluating iPhone Safari if iPhone support is wanted; narrow scope or change the tracking approach based on evidence.

## Phase 3 — Animate the first sticker in Remotion

Preserve the supplied design. Separate movable parts where the source allows; request layered artwork when independent movement requires unavailable pieces. Agree on a short motion treatment, build an editable composition, and review it in Studio. Include an entrance and seamless loop; sound remains optional and requires an explicit playback interaction.

For the AR integration, produce playback assets after preview approval. Evaluate transparent WebM on supporting browsers and bounded PNG sprite atlases or packed color/alpha video as a fallback. Test transparency through the actual Three.js renderer rather than relying only on codec detection. Budget texture memory, download size, and decoding against the target phones.

Deliverables: editable Remotion source, approved preview, and a tested playback asset strategy.

## Phase 4 — Connect recognition and animation

Map the detected image to its animation; preload the first asset, match the print's aspect ratio, and tune scale, offset, and depth. Smooth brief tracking interruptions without leaving content floating indefinitely. Define start, pause, replay, loss, reacquisition, and switching behavior. Handle page visibility changes, stop camera streams, and dispose renderer resources when leaving scanning.

Deliverable: one complete printed-sticker-to-animated-AR flow on a phone.

## Phase 5 — Build the app interface with Impeccable

Create a simple entry screen, camera permission explanation, full-screen scanner, subtle scanning guidance, detected-sticker feedback, replay/mute controls where applicable, and a small sticker collection with previews. The camera and artwork lead the scanning screen.

Handle permission refusal (including browser settings recovery), unavailable camera, unsupported playback/WebGL, loading, failed asset downloads, target loss, orientation changes, page backgrounding, and retry. Support mobile safe areas, clear touch targets, readable contrast, reduced UI motion, screen readers, and an accessible non-camera preview route. Test camera and playback restrictions in in-app browsers and offer guidance to open a supported browser where necessary.

Deliverable: a polished mobile app around the proven AR flow.

## Phase 6 — Make additional stickers repeatable

Create a reusable sticker onboarding process: artwork intake, tracking suitability check, Remotion composition, preview approval, export, target compilation, manifest update, and real-print validation. Version compiled targets and manifests together so target indexes cannot resolve to the wrong sticker. Recognize several registered designs while showing one at a time in the MVP.

Deliverable: a second sticker added without changing core scanning code, plus documented onboarding steps.

## Phase 7 — Verify and prepare release

Test actual print scans on agreed devices. Cover permissions, looping, transparency, reacquisition, switching, interruptions, long scanning sessions, heat, memory, slow networks, and loading failures. Measure detection time, frame rate, and jitter before setting release thresholds. Automated checks cover manifest consistency and app state transitions; physical tracking needs device testing.

Use Impeccable's bounded visual review: inspect mobile and desktop layouts, fix findings together, then confirm once. Prepare an HTTPS preview and verify camera access from phones; an ordinary HTTP LAN address is insufficient. Confirm licensing and attribution requirements, document privacy behavior, and ensure camera frames stay local unless a later feature explicitly needs upload. Publish after the working build is reviewed and hosting details are supplied.

Deliverables: tested web build, HTTPS preview when hosting is configured, validation record, editable animation source, and local setup/deployment instructions.

## MVP completion criteria

- The supplied printed sticker is recognized on agreed devices.
- Its animation stays aligned as the phone moves and loops with the intended transparency.
- Loss and reacquisition produce predictable behavior.
- Permission and loading failures have usable recovery paths.
- A second registered sticker can be onboarded through the same pipeline.
- Editable animation source and documented app setup are delivered.

## Later phases

Owner upload/publishing tools; larger sticker packs; PWA installation and offline caching; capture/share if device support permits; tap interactions; richer layered depth or true 3D assets; native apps if needed. Each requires its own scoped validation rather than being assumed part of the first release.

## Immediate next step

Supply the first sticker as PNG, SVG, or layered artwork, indicate its approximate printed width, and identify the phone/browser available for testing. Anchoring to the physical sticker is the default unless changed. Start with the real-phone tracking prototype and one Remotion animation before expanding the interface.

## Technical references

- MindAR image tracking: https://hiukim.github.io/mind-ar-js-doc/
- Remotion Player: https://www.remotion.dev/docs/player
- Camera secure-context requirements: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- Remotion transparent rendering: https://www.remotion.dev/docs/transparent-videos
