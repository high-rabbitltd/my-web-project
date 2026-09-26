$oldPackage = "com.high_rabbitltd.voicecalendar"
$newPackage = "com.highrabbit.voicecalendar"
$oldPath = "com\high_rabbitltd\voicecalendar"
$newPath = "com\highrabbit\voicecalendar"

# Update app.json
(Get-Content "app.json") -replace $oldPackage, $newPackage | Set-Content "app.json"

# Update build.gradle
(Get-Content "android\app\build.gradle") -replace $oldPackage, $newPackage | Set-Content "android\app\build.gradle"

# Update AndroidManifest.xml
(Get-Content "android\app\src\main\AndroidManifest.xml") -replace $oldPackage, $newPackage | Set-Content "android\app\src\main\AndroidManifest.xml"

# Move java directory
New-Item -ItemType Directory -Force -Path "android\app\src\main\java\com\highrabbit"
Move-Item -Path "android\app\src\main\java\com\high_rabbitltd\voicecalendar" -Destination "android\app\src\main\java\com\highrabbit\voicecalendar"
Remove-Item -Path "android\app\src\main\java\com\high_rabbitltd" -Recurse -Force

# Update Java files
$mainActivity = "android\app\src\main\java\com\highrabbit\voicecalendar\MainActivity.java"
$mainApplication = "android\app\src\main\java\com\highrabbit\voicecalendar\MainApplication.java"
(Get-Content $mainActivity) -replace $oldPackage, $newPackage | Set-Content $mainActivity
(Get-Content $mainApplication) -replace $oldPackage, $newPackage | Set-Content $mainApplication

Write-Output "Package name changed successfully!"
