# -*- coding: utf-8 -*-
import os
import sys
import subprocess
import imageio_ffmpeg

sys.stdout.reconfigure(encoding='utf-8')
ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

width, height, fps, tbn, ar, ac = 1280, 720, "24", "12288", "44100", "2"

def run_cmd(cmd, desc):
    print(f"\n--- {desc} ---")
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8', stdin=subprocess.DEVNULL)
    for line in proc.stdout:
        print(line, end='')
    proc.wait()
    if proc.returncode != 0:
        raise Exception(f"Command failed: {desc}")
    print("Success")

def get_audio_duration(audio_file):
    try:
        from moviepy.editor import AudioFileClip
    except ImportError:
        from moviepy import AudioFileClip
    clip = AudioFileClip(audio_file)
    dur = clip.duration
    clip.close()
    return str(dur)

def generate_and_conform(audio_file, out_file):
    bg_video = r"D:\하이래빗컨텐츠\유튜브-알고리듬\래빗 영상(음악파동)\트로트_춤추는_하이래빗_0_4초.mp4"
    duration = get_audio_duration(audio_file)
    cmd = [
        ffmpeg_exe, "-y", "-stream_loop", "-1", "-i", bg_video, "-i", audio_file,
        "-map", "0:v:0", "-map", "1:a:0",  # EXPLICITLY MAP VIDEO AND AUDIO
        "-vf", f"scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height},setsar=1,fps={fps}",
        "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-video_track_timescale", tbn,
        "-c:a", "aac", "-ar", ar, "-ac", ac,
        "-t", duration,
        out_file
    ]
    run_cmd(cmd, f"Generate {os.path.basename(out_file)}")

print("Fixing generated videos...")
os.chdir(r"D:\하이래빗")

generate_and_conform(r"D:\음악 전체\1.전체음악\트로트\123bpm_7-5추억이 된 기억 트로트.mp3", "gen_14.mp4")
generate_and_conform(r"D:\음악 전체\1.전체음악\트로트\123bpm_7-4추억이 된 기억 영어버전.mp3", "gen_15.mp4")
generate_and_conform(r"D:\음악 전체\1.전체음악\트로트\136bpm_7-2안녕 나의 작은 이_트로트wav.wav", "gen_16.mp4")

concat_list = []
# 0 to 10 (11 files, ending with 부안)
for i in range(11):
    concat_list.append(f"conform_{i}.mp4")

# Insert generated videos BEFORE Damyang
concat_list.extend(["gen_14.mp4", "gen_15.mp4", "gen_16.mp4"])

# 11 and 12 (Damyang files)
concat_list.extend(["conform_11.mp4", "conform_12.mp4"])

# Target 2-hour video
concat_list.append(r"D:\하이래빗컨텐츠\유튜브-알고리듬\알고리듬 유튜브 업로드 영상\해변의_래빗_여름카페_2시간.mp4")

concat_file = "concat_july2.txt"
with open(concat_file, "w", encoding='utf-8') as f:
    for vid in concat_list:
        v_path = os.path.abspath(vid).replace('\\', '/')
        f.write(f"file '{v_path}'\n")

final_out = r"E:\2.알고리듬 유튜브 업로드 영상\7월_플레이리스트_최종.mp4"
cmd_concat = [
    ffmpeg_exe, "-y", "-f", "concat", "-safe", "0", "-i", concat_file,
    "-c", "copy", final_out
]
run_cmd(cmd_concat, "Concatenate all videos in new order")

print(f"\nALL DONE! Output saved to: {final_out}")
