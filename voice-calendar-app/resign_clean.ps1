keytool -export -rfc -keystore android\app\release.keystore -alias release -file out\upload_cert.pem -storepass highrabbit123
[Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem") | Out-Null
$zipPath = "$PWD\out\voice-calendar.aab"
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, "Update")
for($i=$zip.Entries.Count-1; $i -ge 0; $i--) {
    if($zip.Entries[$i].FullName.StartsWith("META-INF/")) {
        $zip.Entries[$i].Delete()
    }
}
$zip.Dispose()
jarsigner -sigalg SHA256withRSA -digestalg SHA-256 -keystore android\app\release.keystore -storepass highrabbit123 out\voice-calendar.aab release
