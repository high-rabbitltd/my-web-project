import os
from PIL import Image
import asyncio
import edge_tts

image_dir = r"d:\하이래빗컨텐츠\이슈와상식\첫째 영상\첫번 영상 이미지와 대본 합본"
files = sorted([f for f in os.listdir(image_dir) if f.endswith(('.png', '.jpeg', '.jpg'))])

print("Image Files in directory:")
for f in files[:6]:
    path = os.path.join(image_dir, f)
    with Image.open(path) as img:
        print(f"File: {f} | Size: {img.size} | Format: {img.format}")

async def test_tts():
    text = "안녕하십니까. 현상의 이면을 읽어 당신의 삶에 살아있는 지혜를 더하는 '이슈와 상식'입니다."
    # List of possible Korean voices:
    # ko-KR-SunHiNeural (Female)
    # ko-KR-InJoonNeural (Male)
    voice = "ko-KR-InJoonNeural" # Standard professional male voice for documentary/essay style
    output = "scratch_test_tts.mp3"
    
    print(f"\nTesting edge-tts with voice '{voice}'...")
    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output)
        print(f"Success! Audio saved to {output}, size: {os.path.getsize(output)} bytes")
    except Exception as e:
        print(f"Error during TTS generation: {e}")

if __name__ == "__main__":
    asyncio.run(test_tts())
