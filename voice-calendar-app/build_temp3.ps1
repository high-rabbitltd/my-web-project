robocopy D:\하이래빗\voice-calendar-app D:\voice-temp-build3 /E /NFL /NDL /NJH /NJS /nc /ns /np
cd D:\voice-temp-build3\android
.\gradlew bundleRelease
Copy-Item -Path app\build\outputs\bundle\release\app-release.aab -Destination D:\하이래빗\voice-calendar-app\출시용파일\voice-calendar.aab -Force
cd D:\하이래빗\voice-calendar-app
powershell -ExecutionPolicy Bypass -File .\resign_clean.ps1
