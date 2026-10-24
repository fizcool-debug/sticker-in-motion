# Licensing scope and third-party notices

## Original code

The MIT license in LICENSE covers the original application, animation composition and tooling source code authored for Sticker in Motion, and original project documentation. It does not relicense third-party dependencies or supplied artwork.

## Artwork and branding

Files under assets/source/, public/stickers/ (including rendered videos, atlases, recognition targets and artwork previews), animation/public/ (except fonts with their own license), and the artwork data in animation/src/aeris-original.json and animation/src/aeris-parts.json contain supplied artwork or derivatives of it. Their creators retain copyright. No artwork or trademark rights are granted by this project's MIT license. Use your own licensed assets when creating another collection or redistributing a rebranded app.

The screenshots in docs/screenshots/ depict that demonstration artwork and the application interface; they do not expand the artwork license.

## Dependencies and fonts

React, Three.js, MindAR, Capacitor and other packages retain their upstream license notices. Inspect the installed packages for the exact versions and terms.

Remotion and @remotion/player have their own license, with eligibility and use terms independent of this project's MIT license. See https://www.remotion.dev/docs/license and the packages' LICENSE.md files. This project does not include a Remotion Editor Starter codebase.

Space Grotesk is distributed through @fontsource/space-grotesk under the SIL Open Font License. Rozha One is bundled with its OFL notice at animation/public/aeris/OFL.txt. Preserve font copyright and license notices when redistributing.

No Android signing key is included. Existing GitHub APK releases use a development debug signature.
