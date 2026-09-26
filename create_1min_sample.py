import os
import glob
import subprocess
import imageio_ffmpeg

def main():
    pingpong_videos = glob.glob(r"D:\**\*부메랑_루프_시범영상.mp4", recursive=True)
    if not pingpong_videos:
        print("Error: pingpong video not found.")
        return
    pingpong_video = pingpong_videos[0]
    base_dir = os.path.dirname(pingpong_video)
    
    concat_audio_path = os.path.join(base_dir, "concat_audio.txt")
    output_video = os.path.join(base_dir, "부메랑_루프_1분_음악포함.mp4")
    
    if not os.path.exists(pingpong_video):
        print(f"Error: {pingpong_video} not found.")
        return
        
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    filter_complex = (
        "[1:a]asplit=2[outa][wave_a]; "
        "[wave_a]bass=g=-15,showfreqs=s=1500x80:mode=bar:colors=white:ascale=sqrt[raw_full]; "
        "[raw_full]crop=600:80:0:0[raw_wave]; "
        "[raw_wave]split[top][tmp]; [tmp]vflip[bottom]; [top][bottom]vstack,format=rgba,colorkey=black:0.1:0.1[wave_img]; "
        "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[bg]; "
        "[bg][wave_img]overlay=(W-w)/2:750:format=auto[outv]"
    )
    
    cmd = [
        ffmpeg_exe, "-y",
        "-stream_loop", "-1", "-i", pingpong_video,
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
    
    print("Generating 1-minute ping-pong loop sample with music and waveform...")
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if os.path.exists(output_video):
        print(f"Sample generated successfully at: {output_video}")
    else:
        print("Failed to generate 1-minute sample.")

if __name__ == "__main__":
    main()
