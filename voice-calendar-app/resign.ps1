$ProjectDir = $PSScriptRoot
keytool -export -rfc -keystore "$ProjectDir\android\app\release.keystore" -alias release -file "$ProjectDir\출시용파일\upload_cert.pem" -storepass highrabbit123
[Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem") | Out-Null
$zip = [System.IO.Compression.ZipFile]::Open("$ProjectDir\출시용파일\voice-calendar.aab", "Update")
for($i=$zip.Entries.Count-1; $i -ge 0; $i--) {
    if($zip.Entries[$i].FullName.StartsWith("META-INF/")) {
        $zip.Entries[$i].Delete()
    }
}
$zip.Dispose()
jarsigner -sigalg SHA256withRSA -digestalg SHA-256 -keystore "$ProjectDir\android\app\release.keystore" -storepass highrabbit123 "$ProjectDir\출시용파일\voice-calendar.aab" release
