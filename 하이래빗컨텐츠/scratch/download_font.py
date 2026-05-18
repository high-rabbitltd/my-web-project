import requests
import os

font_url = "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Bold.ttf"
os.makedirs("scratch", exist_ok=True)
dest = "scratch/NanumGothic-Bold.ttf"

print(f"Downloading NanumGothic-Bold from {font_url}...")
try:
    response = requests.get(font_url, timeout=15)
    if response.status_code == 200:
        with open(dest, "wb") as f:
            f.write(response.content)
        print(f"Success! Saved to {dest} ({os.path.getsize(dest)} bytes)")
    else:
        print(f"Failed! HTTP status: {response.status_code}")
except Exception as e:
    print(f"Error downloading font: {e}")
