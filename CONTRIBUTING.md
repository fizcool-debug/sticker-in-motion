# Contributing to Sticker in Motion

Thanks for helping improve the app. Start with a focused issue or pull request describing the problem, proposed behaviour and how to verify it.

## Setup

Use Node.js 24 and npm:

```sh
npm ci
npx playwright install chromium
npm run dev
```

The root package's `private: true` prevents accidental npm publication; it does not restrict this public GitHub repository.

For Android, also install JDK 21 and Android SDK/build-tools 36. Keep local SDK settings in ignored `android/local.properties` or environment variables.

## Checks

```sh
npm run build
npm test
```

For interface, permissions or preview changes, keep the app running and run `npm run test:browser`. Set `APP_URL` if it is not at `http://localhost:5173`. For an existing Chromium installation, set `PLAYWRIGHT_EXECUTABLE_PATH`; otherwise install Playwright Chromium.

Tracking changes also need the relevant synthetic-camera scripts in `scripts/verify-*.mjs`, followed by a real supported print on a physical phone. Document what you actually tested. Do not describe a browser fixture or emulator as a real-phone test.

Native scripts attach to an already-running debug app's WebView at `http://127.0.0.1:9222`. Forward that port with adb to the app's actual `webview_devtools_remote_<pid>` socket before running them. Use `ANDROID_TEST_DEVICE` for the device serial and `ADB_PATH`, `ANDROID_HOME` or an adb installation on PATH. The app needs camera permission and must start on its scanner screen. These are advanced local checks, not CI camera tests.

## Assets and animations

Use artwork you have permission to contribute. Do not assume the bundled demonstration stickers or branding are covered by the code's MIT license. Note the author, source and license of new assets.

Keep original artwork proportions. Recognition targets must use the original print, not a motion frame. Align `src/stickers.ts` indices with the order used by `scripts/compile-collection.mjs`. See `animation/README.md` for rendering.

## Pull requests

Keep changes focused, describe the user-visible result, list checks and limitations, and include screenshots for UI changes. Avoid unrelated lockfile updates. Preserve accessibility labels, camera cleanup, offline behaviour and existing target order.

Never commit APKs, signing keys, credentials, private camera captures, local SDK paths, `node_modules/`, or build outputs.

Contributions to original code are made under the MIT license. Separate third-party and artwork terms remain in effect.

## Releases

Only maintainers publish APK releases. Follow [AGENTS.md](AGENTS.md) and `scripts/publish-android-release.ps1`: upload the matching source first, increment Android versionCode and versionName for a new app build, validate the exact APK, include its SHA-256 and signing type, and keep published releases immutable.

The open-source documentation and tooling update does not replace or re-sign the existing v0.2 APK.
