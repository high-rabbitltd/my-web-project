$appJson = "app.json"
(Get-Content $appJson) -replace 'com.high_rabbitltd.voicecalendar', 'com.highrabbit.voicecalendar' | Set-Content $appJson

$buildGradle = "android\app\build.gradle"
(Get-Content $buildGradle) -replace 'com.hirabbit.voicecalendar', 'com.highrabbit.voicecalendar' | Set-Content $buildGradle

$manifest = "android\app\src\main\AndroidManifest.xml"
(Get-Content $manifest) -replace 'com.hirabbit.voicecalendar', 'com.highrabbit.voicecalendar' | Set-Content $manifest

New-Item -ItemType Directory -Force -Path "android\app\src\main\java\com\highrabbit"
Move-Item -Path "android\app\src\main\java\com\hirabbit\voicecalendar" -Destination "android\app\src\main\java\com\highrabbit\voicecalendar"

$mainActivity = "android\app\src\main\java\com\highrabbit\voicecalendar\MainActivity.kt"
(Get-Content $mainActivity) -replace 'com.hirabbit.voicecalendar', 'com.highrabbit.voicecalendar' | Set-Content $mainActivity

$mainApplication = "android\app\src\main\java\com\highrabbit\voicecalendar\MainApplication.kt"
(Get-Content $mainApplication) -replace 'com.hirabbit.voicecalendar', 'com.highrabbit.voicecalendar' | Set-Content $mainApplication

Remove-Item -Path "android\app\src\main\java\com\hirabbit" -Recurse -Force
