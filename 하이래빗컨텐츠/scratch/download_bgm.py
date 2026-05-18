import requests
import os

urls = {
    "gymnopedie_1": "https://upload.wikimedia.org/wikipedia/commons/b/b5/Gymnopedie_No._1_%28ISRC_USUAN1100787%29.mp3",
    "gymnopedie_1_alt": "https://upload.wikimedia.org/wikipedia/commons/2/26/Gymnop%C3%A9die_No._1.mp3"
}

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

os.makedirs("scratch", exist_ok=True)

print("Starting BGM downloads with headers...")
for name, url in urls.items():
    dest = f"scratch/{name}.mp3"
    print(f"Trying to download {name} from {url}...")
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            with open(dest, "wb") as f:
                f.write(response.content)
            print(f"Success! Saved to {dest} ({os.path.getsize(dest)} bytes)")
        else:
            print(f"Failed! HTTP status: {response.status_code}")
    except Exception as e:
        print(f"Error downloading {name}: {e}")
