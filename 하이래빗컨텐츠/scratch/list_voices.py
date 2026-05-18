import asyncio
import edge_tts

async def main():
    voices = await edge_tts.list_voices()
    ko_voices = [v for v in voices if "ko-KR" in v["Name"]]
    for v in ko_voices:
        print(f"Name: {v['Name']} | Gender: {v['Gender']} | FriendlyName: {v['FriendlyName']}")

if __name__ == "__main__":
    asyncio.run(main())
