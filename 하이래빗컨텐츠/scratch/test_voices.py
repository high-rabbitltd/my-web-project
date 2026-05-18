import asyncio
import edge_tts
import os

text = "안녕하십니까. 현상의 이면을 읽어 당신의 삶에 살아있는 지혜를 더하는 '이슈와 상식'입니다."
os.makedirs("scratch", exist_ok=True)

async def test_voice(voice_name, filename):
    print(f"Generating voice sample using {voice_name}...")
    communicate = edge_tts.Communicate(text, voice_name)
    await communicate.save(filename)

async def main():
    await test_voice("ko-KR-HyunsuMultilingualNeural", "scratch/voice_test_hyunsu.mp3")
    await test_voice("ko-KR-SunHiNeural", "scratch/voice_test_sunhi.mp3")
    print("Voice samples successfully created in scratch/ directory!")

if __name__ == "__main__":
    asyncio.run(main())
