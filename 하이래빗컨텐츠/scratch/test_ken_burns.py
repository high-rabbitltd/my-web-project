import os
import numpy as np
from PIL import Image
from moviepy import ImageClip, AudioFileClip

def apply_ken_burns(clip, zoom_ratio=0.08):
    duration = clip.duration
    w, h = clip.size
    
    def effect(get_frame, t):
        frame = get_frame(t)
        img = Image.fromarray(frame)
        
        # Scale slowly from 1.0 (start) to 1.08 (end)
        scale = 1.0 + zoom_ratio * (t / duration)
        
        crop_w = int(w / scale)
        crop_h = int(h / scale)
        
        dx = (w - crop_w) // 2
        dy = (h - crop_h) // 2
        
        img_cropped = img.crop((dx, dy, dx + crop_w, dy + crop_h))
        img_resized = img_cropped.resize((w, h), Image.Resampling.LANCZOS)
        
        return np.array(img_resized)
        
    return clip.transform(effect)

def test_kb():
    image_path = r"d:\하이래빗컨텐츠\이슈와상식\첫째 영상\첫번 영상 이미지와 대본 합본\001. 안녕하십니까. 현상의 이면을 읽어 당신의 삶에 살아있는 지혜를 더하는 '이슈와 상식'입니다..jpeg"
    audio_path = "scratch_tts_1.mp3"
    
    aud = AudioFileClip(audio_path)
    # Let's render just the first 3 seconds of Ken Burns to test compilation speed
    clip = ImageClip(image_path).resized(new_size=(1920, 1080)).with_duration(3.0)
    
    print("Applying Ken Burns effect...")
    clip_kb = apply_ken_burns(clip)
    clip_kb = clip_kb.with_audio(aud.subclipped(0, 3.0))
    
    output_path = "scratch_test_kb.mp4"
    print("Rendering 3s Ken Burns video...")
    clip_kb.write_videofile(
        output_path,
        fps=24,
        codec="libx264",
        audio_codec="aac"
    )
    print(f"Success! Ken Burns video saved to {output_path}")

if __name__ == "__main__":
    test_kb()
