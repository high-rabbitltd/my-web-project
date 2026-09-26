import os
import subprocess
import imageio_ffmpeg

def main():
    bg_video = r"D:\하이래빗컨텐츠\유튜브-알고리듬 카페\7-6배경영상- 비오는날 카페.mp4"
    audio_file = r"D:\음악 전체\1.전체음악\카페곡\비오는날\ca20-11Weightless_Anchor.mp3"
    rabbit_img = r"D:\하이래빗컨텐츠\유튜브-알고리듬\캐릭터 모음\하이래빗 음악감상_투명_fixed.png"
    out_video = r"D:\하이래빗컨텐츠\유튜브-알고리듬 카페\rainy_cafe_sample.mp4"

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    filter_complex = (
        "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[bg]; "
        "[1:a]asplit=2[outa][wave_a]; "
        "[2:v]scale=-1:320[rabbit]; "
        # Generate full spectrum, double height (160), then crop to 400 width to keep only active low frequencies.
        "[wave_a]bass=g=-15,showfreqs=s=1500x160:mode=bar:colors=white:ascale=sqrt[raw_full]; "
        "[raw_full]crop=400:160:0:0[raw_wave]; "
        # Gap adjustments: width=18, thickness=12 (gap=12, bar=6)
        "[raw_wave]split[top][tmp]; [tmp]vflip[bottom]; [top][bottom]vstack,drawgrid=width=18:height=400:thickness=12:color=black,format=rgba,colorkey=black:0.1:0.1[wave_img]; "
        "[bg][rabbit]overlay=W-w+120:H-h-35:format=auto[bg_with_rabbit]; "
        "[bg_with_rabbit][wave_img]overlay=(W-w)/2:880:format=auto[outv]"
    )

    cmd = [
        ffmpeg_exe, "-y",
        "-t", "30", # Only 30 seconds for the sample
        "-stream_loop", "-1", "-i", bg_video,
        "-t", "30", "-i", audio_file,
        "-i", rabbit_img,
        "-filter_complex", filter_complex,
        "-map", "[outv]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-r", "24",
        "-shortest",
        out_video
    ]

    print("Generating 30s sample video...")
    subprocess.run(cmd, check=True)
    print(f"Sample saved to {out_video}")

if __name__ == "__main__":
    main()
