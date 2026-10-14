# Android release workflow

When delivering each completed, user-facing Android APK release, also publish it to GitHub Releases in `fizcool-debug/sticker-in-motion`. This is the user's standing request. Intermediate development builds do not need publication.

- Build and complete relevant validation, then upload the corresponding source to GitHub before creating the release. Local and remote histories differ; inspect them before pushing and never force-push to reconcile them.
- Use `scripts/publish-android-release.ps1` with the exact remote source commit, APK, version, and a notes file. The script creates a draft, verifies the uploaded APK, then publishes it.
- The first GitHub release is `v0.1` (existing Android version 1.2/code 3). Increment subsequent release versions to `v0.2`, `v0.3`, etc., unless the user specifies another version. Align future Android versionName with the release version and always increase versionCode.
- Keep published releases and assets immutable. Include a short changelog, validation limits, APK SHA-256, and whether the APK is a debug or production-signed build. Never commit APKs or signing keys into Git.
- Verify publication and the asset hash/size, and include the GitHub release link in the delivery message. If publication fails, report that separately from successful local build completion.
