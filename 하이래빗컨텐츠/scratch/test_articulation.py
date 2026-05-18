import asyncio
import edge_tts
import os

text = "안녕하십니까. 현상의 이면을 읽어 당신의 삶에 살아있는 지혜를 더하는 '이슈와 상식'입니다."
os.makedirs("scratch", exist_ok=True)

async def generate_sample(voice, rate, dest):
    print(f"Generating sample with {voice} at {rate} speed...")
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(dest)

async def main():
    # Test InJoon at +8%
    await generate_sample("ko-KR-InJoonNeural", "+8%", "scratch/voice_injoon_fast.mp3")
    # Test Hyunsu at +8%
    await generate_sample("ko-KR-HyunsuMultilingualNeural", "+8%", "scratch/voice_hyunsu_fast.mp3")
    print("Articulation test samples successfully created in scratch/ directory!")

if __name__ == "__main__":
    asyncio.run(main())
