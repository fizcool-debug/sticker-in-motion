$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot
if (-not $env:JAVA_HOME) {
    $localJdk = Get-ChildItem "$projectRoot/work/tools/jdk21" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($localJdk) { $env:JAVA_HOME = $localJdk.FullName }
}
if (-not $env:JAVA_HOME) { throw 'Set JAVA_HOME to a JDK 21 installation.' }
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = "$env:LOCALAPPDATA/Android/Sdk" }
& npm.cmd run android:sync
if ($LASTEXITCODE) { throw 'Android sync failed.' }
& "$projectRoot/android/gradlew.bat" -p android assembleDebug --console=plain
if ($LASTEXITCODE) { throw 'Android build failed.' }
New-Item -ItemType Directory -Force "$projectRoot/artifacts" | Out-Null
Copy-Item "$projectRoot/android/app/build/outputs/apk/debug/app-debug.apk" "$projectRoot/artifacts/Sticker-in-Motion-debug.apk" -Force
Write-Output "$projectRoot/artifacts/Sticker-in-Motion-debug.apk"
