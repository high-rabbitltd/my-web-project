import os
import re
import asyncio
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont
import edge_tts

# Try MoviePy 2.x imports
from moviepy import ImageClip, AudioFileClip, CompositeVideoClip, CompositeAudioClip
import moviepy.video.fx as fx
import moviepy.audio.fx as afx

# Directories
IMAGE_DIR = r"d:\하이래빗컨텐츠\이슈와상식\첫째 영상\첫번 영상 이미지와 대본 합본"
SCRATCH_DIR = r"d:\하이래빗컨텐츠\scratch"
AUDIO_DIR = os.path.join(SCRATCH_DIR, "split_audio_segments")
OUTPUT_PATH = r"d:\하이래빗컨텐츠\이슈와상식_첫번영상_분할자막.mp4"
BGM_PATH = os.path.join(SCRATCH_DIR, "bedroom_clean.mp3")
FONT_PATH = os.path.join(SCRATCH_DIR, "NanumGothic-Bold.ttf")

# Video settings
VOICE = "ko-KR-HyunsuMultilingualNeural"  # Premium Articulate Voice
BGM_VOLUME = 0.06                         # Subtle 6% volume scale
FPS = 24                                  # Smooth 24fps rendering

# Load subtitle font (Size 64px is highly readable on mobile/desktop screens)
font = ImageFont.truetype(FONT_PATH, 64)

async def generate_tts(text, dest_path):
    """Generates a high-quality voiceover for a text segment using Edge TTS."""
    print(f"Generating TTS segment: '{text}' -> {dest_path}")
    communicate = edge_tts.Communicate(text, VOICE, rate="+8%")
    await communicate.save(dest_path)

def draw_subtitle(frame, text):
    """Renders high-quality white subtitles with a 4px black outline (stroked) centered at the bottom."""
    # frame is a numpy array of shape (1080, 1920, 3)
    img = Image.fromarray(frame)
    draw = ImageDraw.Draw(img)
    
    # Calculate text size using bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    
    # Position: centered horizontally, placed at y = 880 (near bottom)
    x = (1920 - tw) // 2
    y = 880
    
    # Draw premium stroked text (white text with 4px black outline)
    draw.text((x, y), text, font=font, fill="white", stroke_width=4, stroke_fill="black")
    
    return np.array(img)

def apply_ken_burns(image_path, duration, zoom_ratio=0.04):
    """Loads the image, resizes it to 1920x1080, and applies a smooth slow zoom-in."""
    img = Image.open(image_path)
    img_np = np.array(img)
    
    # Initialize MoviePy clip and resize to Full HD
    clip = ImageClip(img_np).resized(new_size=(1920, 1080)).with_duration(duration)
    
    w, h = 1920, 1080
    
    # Fast OpenCV bilinear zoom effect function
    def effect(get_frame, t):
        frame = get_frame(t)
        scale = 1.0 + zoom_ratio * (t / duration)
        
        crop_w = int(w / scale)
        crop_h = int(h / scale)
        
        dx = (w - crop_w) // 2
        dy = (h - crop_h) // 2
        
        cropped = frame[dy:dy+crop_h, dx:dx+crop_w]
        resized = cv2.resize(cropped, (w, h), interpolation=cv2.INTER_LINEAR)
        return resized
        
    return clip.transform(effect)

async def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    
    print("Step 1: Parsing image assets and mapping slide indices...")
    # Map index integers to absolute file paths
    image_paths = {}
    for filename in os.listdir(IMAGE_DIR):
        match = re.match(r"^(\d+)\..*$", filename)
        if match:
            idx = int(match.group(1))
            image_paths[idx] = os.path.join(IMAGE_DIR, filename)
            
    # Define splits and keyword image mapping for Slide 1, 2, and 3
    slide_splits = {
        1: [
            {"text": "안녕하십니까.", "img_idx": 1},
            {"text": "현상의 이면을 읽어", "img_idx": 4},   # Hidden reality illustration
            {"text": "당신의 삶에", "img_idx": 5},          # Wisdom illustration
            {"text": "살아있는 지혜를 더하는", "img_idx": 5},  # Wisdom illustration
            {"text": "'이슈와 상식'입니다.", "img_idx": 1}   # Title emblem
        ],
        2: [
            {"text": "여러분,", "img_idx": 2},
            {"text": "혹시 요즘 큰 맘 먹고 산 명품 가방이나", "img_idx": 2},   # Luxury handbag illustration
            {"text": "한 끼에 수십만 원 하는 오마카세가", "img_idx": 7},       # Fancy omakase illustration
            {"text": "예전만큼 짜릿하지", "img_idx": 3},                       # Empty bank account illustration
            {"text": "않으신가요.", "img_idx": 9}                               # Lonely feeling illustration
        ],
        3: [
            {"text": "남들이 부러워할 만한 건", "img_idx": 8},              # Flexing luxury lifestyle illustration
            {"text": "다 하고 사는데,", "img_idx": 8},                     # Flexing luxury lifestyle illustration
            {"text": "왜 내 통장은 비어가고", "img_idx": 3},                # Empty bank account illustration
            {"text": "마음은", "img_idx": 9},                               # Lonely feeling illustration
            {"text": "더 공허해질까요.", "img_idx": 9}                       # Lonely feeling illustration
        ]
    }
    
    # Step 2: Generate TTS files for all sub-segments
    print("\nStep 2: Checking and generating neural TTS audio for split segments...")
    timeline_data = []
    
    for slide_idx in sorted(slide_splits.keys()):
        segments = slide_splits[slide_idx]
        slide_timeline = []
        for seg_idx, seg in enumerate(segments):
            text = seg["text"]
            img_idx = seg["img_idx"]
            
            # Verify image exists in mapping
            if img_idx not in image_paths:
                print(f"Warning: Image index {img_idx} not found in folder. Falling back to index {slide_idx}.")
                img_path = image_paths.get(slide_idx, list(image_paths.values())[0])
            else:
                img_path = image_paths[img_idx]
                
            # Create a unique filename for each cached segment
            audio_filename = f"tts_split_{slide_idx:03d}_{seg_idx+1}.mp3"
            audio_path = os.path.join(AUDIO_DIR, audio_filename)
            
            if not os.path.exists(audio_path):
                await generate_tts(text, audio_path)
                
            slide_timeline.append({
                "text": text,
                "audio_path": audio_path,
                "image_path": img_path
            })
            
        timeline_data.append({
            "slide_idx": slide_idx,
            "segments": slide_timeline
        })

    print("\nStep 3: Loading clips, applying Ken Burns, and drawing subtitles on a snappy timeline...")
    visual_clips = []
    audio_clips = []
    current_time = 0.0
    
    # Process slides and segment sequences back-to-back
    for slide in timeline_data:
        for j, seg in enumerate(slide["segments"]):
            # Load audio and get duration
            aud = AudioFileClip(seg["audio_path"])
            duration = aud.duration
            print(f"  Slide {slide['slide_idx']} Segment {j+1}: Duration = {duration:.2f}s | Image = {os.path.basename(seg['image_path'])} | Text = '{seg['text']}'")
            
            # Position audio clip at current timeline to create a 100% natural, gapless flowing voiceover
            aud = aud.with_start(current_time)
            audio_clips.append(aud)
            
            # Load and apply a slow zoom-in on the relevant keyword image
            seg_clip = apply_ken_burns(seg["image_path"], duration, zoom_ratio=0.04)
            seg_clip = seg_clip.with_start(current_time)
            
            # Apply clean, premium styled subtitle overlay
            seg_clip = seg_clip.transform(lambda get_frame, t, text=seg["text"]: draw_subtitle(get_frame(t), text))
            
            visual_clips.append(seg_clip)
            current_time += duration
            
    final_video_duration = current_time + 1.5  # Add a 1.5s tail buffer for an elegant end
    
    # Set the last visual segment to stay 1.5s longer so the video doesn't end abruptly
    last_visual = visual_clips[-1]
    visual_clips[-1] = last_visual.with_duration(last_visual.duration + 1.5)
    
    print(f"\nNarration timeline compiled. Total narration duration: {current_time:.2f}s | Final Video: {final_video_duration:.2f}s")
    
    print("\nStep 4: Mixing background music (BGM)...")
    if os.path.exists(BGM_PATH):
        print(f"  Loading BGM track: {BGM_PATH}")
        bgm = AudioFileClip(BGM_PATH)
        bgm = bgm.subclipped(0, final_video_duration)
        bgm = bgm.with_volume_scaled(BGM_VOLUME)
        bgm = bgm.with_effects([afx.AudioFadeOut(duration=2.0)])
        audio_clips.append(bgm)
        print("  BGM successfully mixed.")
    else:
        print("  Warning: BGM not found. Compiling voice-only video.")
        
    print("\nStep 5: Compositing visual and audio channels...")
    video_track = CompositeVideoClip(visual_clips)
    audio_track = CompositeAudioClip(audio_clips)
    audio_track = audio_track.with_effects([afx.AudioFadeOut(duration=1.5)])
    
    final_video = video_track.with_audio(audio_track)
    
    print(f"\nStep 6: Rendering final YouTube-styled split video to {OUTPUT_PATH}...")
    final_video.write_videofile(
        OUTPUT_PATH,
        fps=FPS,
        codec="libx264",
        audio_codec="aac"
    )
    print(f"\n[Success] Final split-subtitled video successfully written to: {OUTPUT_PATH}")

if __name__ == "__main__":
    asyncio.run(main())
