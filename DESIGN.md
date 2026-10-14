---
name: Sticker in Motion
description: Quiet camera controls for a collection of animated stickers.
colors:
  ink: "#080605"
  foreground: "#ffffff"
  secondary: "#c7c1bb"
  divider: "#514c47"
  success: "#8df7b5"
  primary-hover: "#e6e0da"
  icon-hover: "#28231e"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(30px, 5vw, 44px)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  identity:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  caption:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "12px"
    fontWeight: 400
rounded:
  control: "14px"
  guide-corner: "8px"
  status-dot: "50%"
spacing:
  small: "8px"
  compact: "12px"
  medium: "16px"
  large: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "54px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-active:
    backgroundColor: "{colors.secondary}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    padding: "12px 0"
    height: "48px"
  button-text-hover:
    textColor: "{colors.success}"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    size: "48px"
  button-icon-hover:
    backgroundColor: "{colors.icon-hover}"
  preview-frame:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.control}"
---

# Design System: Sticker in Motion

## Overview

**Creative North Star: "The camera and sticker lead"**

The confirmed camera-first concept lets each sticker artwork lead. Sticker in Motion is the provisional app identity; CET is only the first test asset. Near-black ink, white controls, and self-hosted Space Grotesk keep the interface quiet and readable around changing camera frames. Preserve each supplied artwork and show sticker-specific names only after recognition or in its selected preview.

Scanning uses a full-height camera surface; the separate animation preview uses a square Player and explanatory caption. These describe the current surfaces, not a mandatory composition for every future page. Recovery remains actionable within the scanner canvas.

**Key Characteristics:**
- Camera-led composition with quiet controls.
- Solid ink surfaces and high-contrast actions.
- Rainbow belongs to the supplied artwork.
- Preview is explicitly distinguished from AR tracking.

## Colors

White actions and warm gray supporting text sit on near-black ink; mint indicates recognition or interactive response.

### Primary
- **Solid White:** primary action surfaces, main text, focus outlines, and aiming corners.
- **Recognition Mint:** found-state indicator and guide corners; text-action hover.

### Neutral
- **Near-black Ink:** page fallback, top bar, status surface, and preview frame.
- **Warm Gray:** supporting text, metadata, and resting status dot.
- **Stone Divider:** borders around outlined controls and Player, plus metadata separators.
- **Pale Stone:** primary-button hover surface.
- **Warm Charcoal:** outlined icon-button hover surface.

### Named Rules
**The Artwork Rainbow Rule.** Keep rainbow color inside the supplied artwork; do not spread it into a blanket interface gradient.

## Typography

**Display Font:** Space Grotesk (sans-serif fallback).
**Body Font:** Space Grotesk (sans-serif fallback).

**Character:** Compact geometric lettering supports direct status and actions. The root inherits a 16px browser body size; supporting paragraphs deliberately use the smaller body token.

### Hierarchy
- **Display:** fluid preview heading with tight line height.
- **Headline:** scanner status; reduced to 24px on narrow screens at most 650px tall.
- **Identity:** semibold top-bar app identity with the tightest tracking.
- **Body:** status and preview explanation; status copy is limited to 52ch.
- **Label:** text actions, metadata, tips, and preview notes; tips use line height 1.55.
- **Caption:** privacy line and Player caption. The top-bar descriptor is a separate 13px supporting label.

### Named Rules
**The Tight-but-readable Rule.** The current type system never tracks tighter than -0.03em.

## Layout

The scanner fills 100dvh, with a flexible aiming area between a solid top bar and bottom status panel. The top bar is in normal flex flow, not fixed; its padding includes the top safe area. The panel includes the bottom safe area, has a maximum height of 65dvh, and scrolls when recovery content grows.

Mobile horizontal padding is 24px. At 700px, top-bar padding becomes 40px; the scanner panel becomes a centered container capped at 520px, with 28px padding and a 24px bottom margin. The guide is min(64vw, 310px), becoming 310px on desktop. On narrow screens at most 650px tall, the guide is 150px and vertical spacing contracts.

The preview content is min(100% - 48px, 480px), centered with a 36px top margin, increasing to 40px on desktop. Its square Player expands 8px beyond either content edge. Reused spacing steps are listed in frontmatter; component-specific 10px, 20px, 28px, 36px, and 40px measurements remain local rules rather than a fabricated uniform scale.

## Elevation & Depth

The interface uses no box shadows. Solid ink layers separate controls from the camera; thin divider strokes separate metadata and the Player frame. No blurred or translucent surfaces are implemented.

### Named Rules
**The Solid Surface Rule.** Place readable controls on solid ink surfaces when the camera background can vary.

## Shapes

Controls, placeholder, desktop scanner panel, and Player frame share gently curved control corners. The open-corner square guide uses smaller rounded corners with 2px white strokes, turning mint when found. A small circular dot carries status. No reusable pill or chip component is implemented.

## Components

### Buttons
Confident, spare controls give recovery and replay a clear action.
- **Primary:** full-width white surface, ink text, medium weight, minimum height 54px, and 12px icon gap; 24px top margin, reduced to 16px in compact-height mobile layouts. Pale-stone hover and warm-gray active state.
- **Text:** transparent surface, white label, minimum height 48px; mint hover.
- **Icon:** 48px square, divider stroke, rounded control corners; warm-charcoal hover. Icons are inline stroked SVG.
- **Focus / Disabled:** 2px white focus outline with 4px offset. Disabled buttons use opacity 0.5 and a wait cursor. No custom transitions are implemented.

### Cards / Containers
The status surface and Player frame are solid and flat. The desktop status surface uses rounded control corners; its mobile form spans the width. The Player clips its square content within a 1px divider border.

### Navigation
The preview-only top bar holds the app identity and a camera icon returning to the scanner. The scanner has no top bar. Preview is a separate hash state. The artwork link is a centered underlined text link with 12px padding.

### Recognition Guide and Status
Open corners frame the sticker without a closed box. Mint guide corners and a mint dot accompany the found state. Status announces changes through a polite live region. Loading, refusal, and pause show a camera placeholder; refusal and pause add a primary retry or resume control. Tips expand in place.

### Motion Preview
The square Remotion Player has explicit playback controls and starts paused. Approved content uses rainbow sweep and subtle pulse. There are no decorative UI loops; reduced-motion preferences remove UI transitions and smooth scrolling. Player controls are library-owned rather than an extracted house style.

## Do's and Don'ts

### Do:
- **Do** preserve supplied CET lettering, rainbow bar, and proportions.
- **Do** keep controls on solid surfaces around the changing camera image.
- **Do** retain visible focus outlines and at least 48px button targets.
- **Do** label the animation preview distinctly from verified AR tracking.

### Don't:
- **Don't** apply the artwork's rainbow as a blanket UI gradient.
- **Don't** use decorative looping motion in scanner controls.
- **Don't** claim physical tracking is verified from a preview or synthetic camera recovery capture.

Current evidence: source inspection plus the reported 393×852 and 1440×900 scanner-recovery and preview captures (`work/qa/mobile-camera.png`, `desktop-camera.png`, `mobile-preview.png`, `desktop-preview.png`). Camera recovery was synthetic denied-permission testing; physical iPhone 16 Safari tracking remains pending. The failed Impeccable context launcher and skipped concept roll remain unresolved workflow exceptions; no seed is claimed.

## Collection preview extension

The preview now has a labeled native sticker selector with two options. Red No Rush uses native inline video controls and starts paused, preserving the supplied animation. CET retains its Remotion Player. Both frames follow their animation aspect ratio. Scanning remains generic until recognition and chooses the matching animation automatically.

## Android adaptation

Preserve the camera-led artwork and generic app identity. Android permission copy replaces Safari instructions inside the native runtime. Native system Back handles Preview and tips while the scanner root retains system behavior. Capacitor SystemBars injects safe-area variables used by the interface, including cutouts in landscape. Android font scale is applied through WebView text zoom. The launcher and splash use a generic outlined sticker/scanning mark, not the CET logo. Android QA must come from the emulator or hardware; browser captures alone do not establish native behavior.

## Camera-only refinement — October 14

The user requested mostly camera with no unnecessary top/bottom UI. This scanner specification supersedes the earlier panel-based scanner description. Recovery controls remain available only when needed; tips and persistent privacy information are in Preview. No tracking or animation assets were changed. Native emulator screenshots at normal/1.3 text scale and landscape were inspected; both animation previews and tracking fixtures passed.
