import os
import sys
from moviepy import ImageClip, AudioFileClip

image_path = r"d:\하이래빗컨텐츠\이슈와상식\첫째 영상\첫번 영상 이미지와 대본 합본\001. 안녕하십니까. 현상의 이면을 읽어 당신의 삶에 살아있는 지혜를 더하는 '이슈와 상식'입니다..jpeg"
audio_path = "scratch_test_tts.mp3"
output_path = "scratch_test_video.mp4"

print("Checking files...")
print(f"Image exists: {os.path.exists(image_path)}")
print(f"Audio exists: {os.path.exists(audio_path)}")

try:
    # Load audio
    audio = AudioFileClip(audio_path)
    duration = audio.duration
    print(f"Audio loaded! Duration: {duration}s")
    
    # Load image and set duration
    # In MoviePy 2.x, we can use either set_duration or with_duration. Let's try to check both.
    clip = ImageClip(image_path)
    
    # Let's test which method works (set_duration or with_duration)
    if hasattr(clip, "with_duration"):
        print("Using with_duration (MoviePy 2.x API)")
        clip = clip.with_duration(duration)
    else:
        print("Using set_duration (MoviePy 1.x API)")
        clip = clip.set_duration(duration)
        
    # Resize to 1920x1080.
    # In moviepy, we can use clip.resized(width=1920, height=1080) or clip.resize((1920, 1080)).
    # Let's check which is available.
    if hasattr(clip, "resized"):
        print("Using clip.resized (MoviePy 2.x API)")
        clip = clip.resized(new_size=(1920, 1080))
    else:
        print("Using clip.resize (MoviePy 1.x API)")
        clip = clip.resize(new_size=(1920, 1080))
        
    # Set audio
    if hasattr(clip, "with_audio"):
        clip = clip.with_audio(audio)
    else:
        clip = clip.set_audio(audio)
        
    print("Writing video file...")
    # Write to file
    clip.write_videofile(
        output_path,
        fps=24,
        codec="libx264",
        audio_codec="aac"
    )
    print(f"Success! Video written to {output_path}")
    
except Exception as e:
    print(f"Error during video generation: {e}")
    import traceback
    traceback.print_exc()
