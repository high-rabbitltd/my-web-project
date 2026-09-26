import os
import glob
import subprocess
import imageio_ffmpeg

def main():
    bg_video_list = glob.glob(r"D:\**\*여름*해변*카페*배경영상.mp4", recursive=True)
    bg_video = [f for f in bg_video_list if '2' not in f][0]
    
    base_dir = os.path.dirname(bg_video)
    output_video = os.path.join(base_dir, "부메랑_루프_시범영상.mp4")
    
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    # Create ping-pong loop
    # [0:v]reverse[r]; [0:v][r]concat=n=2:v=1:a=0[outv]
    
    cmd = [
        ffmpeg_exe, "-y",
        "-i", bg_video,
        "-filter_complex", "[0:v]reverse[r];[0:v][r]concat=n=2:v=1:a=0[outv]",
        "-map", "[outv]",
        "-c:v", "libx264",
        "-preset", "fast",
        output_video
    ]
    
    print("Generating ping-pong loop sample...")
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if os.path.exists(output_video):
        print(f"Sample generated successfully at: {output_video}")
    else:
        print("Failed to generate sample.")

if __name__ == "__main__":
    main()
