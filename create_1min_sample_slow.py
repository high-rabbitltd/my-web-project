import os
import glob
import subprocess
import imageio_ffmpeg

def main():
    bg_video_list = glob.glob(r"D:\**\*여름*해변*카페*배경영상.mp4", recursive=True)
    if not bg_video_list:
        print("Error: bg video not found.")
        return
    bg_video = [f for f in bg_video_list if '2' not in f][0]
    base_dir = os.path.dirname(bg_video)
    
    concat_audio_path = os.path.join(base_dir, "concat_audio.txt")
    output_video = os.path.join(base_dir, "느린배경_1분_음악포함.mp4")
    
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    # 1. Slow down the original video by 2x and loop it
    # We can do this in filter_complex:
    # [0:v]setpts=2.0*PTS[slow_bg];
    # Then scale and overlay.
    
    filter_complex = (
        "[0:v]setpts=2.0*PTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[bg]; "
        "[1:a]asplit=2[outa][wave_a]; "
        "[wave_a]bass=g=-15,showfreqs=s=1500x80:mode=bar:colors=white:ascale=sqrt[raw_full]; "
        "[raw_full]crop=600:80:0:0[raw_wave]; "
        "[raw_wave]split[top][tmp]; [tmp]vflip[bottom]; [top][bottom]vstack,format=rgba,colorkey=black:0.1:0.1[wave_img]; "
        "[bg][wave_img]overlay=(W-w)/2:750:format=auto[outv]"
    )
    
    cmd = [
        ffmpeg_exe, "-y",
        "-stream_loop", "-1", "-i", bg_video,
        "-f", "concat", "-safe", "0", "-i", concat_audio_path,
        "-filter_complex", filter_complex,
        "-map", "[outv]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-r", "24",
        "-t", "60",
        output_video
    ]
    
    print("Generating 1-minute slow loop sample with music and waveform...")
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if os.path.exists(output_video):
        print(f"Sample generated successfully at: {output_video}")
    else:
        print("Failed to generate 1-minute sample.")

if __name__ == "__main__":
    main()
