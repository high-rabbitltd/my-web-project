import os
import asyncio
import edge_tts
from moviepy import ImageClip, AudioFileClip, CompositeVideoClip, CompositeAudioClip
import moviepy.video.fx as fx

async def generate_tts(text, path):
    communicate = edge_tts.Communicate(text, "ko-KR-InJoonNeural")
    await communicate.save(path)

async def test_transition():
    # Slide 1 text and image
    text1 = "안녕하십니까. 현상의 이면을 읽어 당신의 삶에 살아있는 지혜를 더하는 '이슈와 상식'입니다."
    img1_path = r"d:\하이래빗컨텐츠\이슈와상식\첫째 영상\첫번 영상 이미지와 대본 합본\001. 안녕하십니까. 현상의 이면을 읽어 당신의 삶에 살아있는 지혜를 더하는 '이슈와 상식'입니다..jpeg"
    audio1_path = "scratch_tts_1.mp3"
    
    # Slide 2 text and image
    text2 = "여러분, 혹시 요즘 큰 맘 먹고 산 명품 가방이나 한 끼에 수십만 원 하는 오마카세가 예전만큼 짜릿하지 않으신가요."
    img2_path = r"d:\하이래빗컨텐츠\이슈와상식\첫째 영상\첫번 영상 이미지와 대본 합본\002. 여러분, 혹시 요즘 큰 맘 먹고 산 명품 가방이나 한 끼에 수십만 원 하는 오마카세가 예전만큼 짜릿하지 않으신가요.jpeg"
    audio2_path = "scratch_tts_2.mp3"
    
    print("Generating TTS audio files...")
    if not os.path.exists(audio1_path):
        await generate_tts(text1, audio1_path)
    if not os.path.exists(audio2_path):
        await generate_tts(text2, audio2_path)
    print("TTS generated!")
    
    # Load audio
    aud1 = AudioFileClip(audio1_path)
    aud2 = AudioFileClip(audio2_path)
    
    d1 = aud1.duration
    d2 = aud2.duration
    print(f"Audio 1 duration: {d1}s, Audio 2 duration: {d2}s")
    
    # Transition duration
    trans_dur = 1.0  # 1.0 second transition
    
    # Create image clips
    clip1 = ImageClip(img1_path).resized(new_size=(1920, 1080))
    clip2 = ImageClip(img2_path).resized(new_size=(1920, 1080))
    
    # Apply timing
    # Clip 1: starts at 0, lasts for d1 + trans_dur
    clip1 = clip1.with_start(0).with_duration(d1 + trans_dur)
    
    # Clip 2: starts at d1, lasts for d2
    clip2 = clip2.with_start(d1).with_duration(d2).with_effects([fx.CrossFadeIn(trans_dur)])
    
    # Audio alignment
    aud1 = aud1.with_start(0)
    aud2 = aud2.with_start(d1)
    
    # Composite
    video = CompositeVideoClip([clip1, clip2])
    audio = CompositeAudioClip([aud1, aud2])
    
    final_video = video.with_audio(audio)
    
    output_path = "scratch_test_transition.mp4"
    print("Writing composite video...")
    final_video.write_videofile(
        output_path,
        fps=24,
        codec="libx264",
        audio_codec="aac"
    )
    print(f"Success! Transition video written to {output_path}")

if __name__ == "__main__":
    asyncio.run(test_transition())
