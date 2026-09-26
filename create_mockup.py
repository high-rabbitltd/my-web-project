from PIL import Image, ImageDraw
from rembg import remove
import os
import random

# Paths
thumb_path = r"D:\하이래빗컨텐츠\유튜브-알고리듬 카페\알고리듬카페 유튜브 업로드 영상\비오는날 카페음악 썸네일.png"
rabbit_path = r"D:\하이래빗컨텐츠\유튜브-알고리듬\캐릭터 모음\하이래빗 음악감상.png"
out_path = r"C:\Users\USER\.gemini\antigravity-ide\brain\8e8ce254-f1c4-4e61-93ac-cab37cdb0f28\mockup_v13.png"

def main():
    bg = Image.open(thumb_path).convert("RGBA")

    try:
        input_rabbit = Image.open(rabbit_path)
        rabbit = remove(input_rabbit).convert("RGBA")

        w, h = rabbit.size
        target_h = 450
        target_w = int(w * (target_h / h))
        rabbit = rabbit.resize((target_w, target_h), Image.Resampling.LANCZOS)

        # Move character significantly to the right. 
        # bg.width - target_w puts it exactly on the right edge. 
        # Adding 100 pushes it further right so it clips slightly off-screen 
        # (which moves it "back" visually towards the edge).
        paste_x = bg.width - target_w + 100
        paste_y = bg.height - target_h - 50
        bg.paste(rabbit, (paste_x, paste_y), rabbit)
    except Exception as e:
        print("Failed to load and remove background of rabbit image:", e)

    # Draw waveform mockup
    draw = ImageDraw.Draw(bg)
    wave_width = 800
    wave_height = 50  
    wave_y = 1400 
    wave_x_start = (bg.width - wave_width) // 2

    bar_width = 6
    spacing = 16 
    for i in range(0, wave_width, bar_width + spacing):
        h_bar = random.randint(20, wave_height)
        
        y1_top = wave_y - h_bar
        y2_top = wave_y
        draw.rectangle([wave_x_start + i, y1_top, wave_x_start + i + bar_width, y2_top], fill="white")
        
        y1_bot = wave_y
        y2_bot = wave_y + h_bar
        draw.rectangle([wave_x_start + i, y1_bot, wave_x_start + i + bar_width, y2_bot], fill="white")

    # Save
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    bg.save(out_path)
    print("Mockup saved to:", out_path)

if __name__ == "__main__":
    main()
