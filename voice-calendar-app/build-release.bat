# Voice Calendar - Release Build Script

:: This script builds the Android App Bundle (AAB) for the first release.
:: Prerequisites:
::   - Node.js (>=18) installed
::   - expo-cli and eas-cli installed globally (`npm i -g expo-cli eas-cli`)
::   - You are logged in to Expo (`eas login`)
::   - Android keystore is set up (run `eas credentials --platform android` if not).

@echo off
setlocal enabledelayedexpansion

:: Change to project directory
cd /d "%~dp0"

:: Install dependencies (if needed)
echo Installing npm dependencies...
npm ci

:: Build the AAB (non‑interactive, assumes you are already logged in)
echo Building Android App Bundle...
eas build --profile production --platform android --non-interactive

:: After the build finishes, the CLI prints a download URL.
:: Copy the URL and download the .aab file. Then upload it to Google Play Console.

echo.
echo Build completed. Please copy the download URL shown above and upload the .aab to Google Play Console.
pause
