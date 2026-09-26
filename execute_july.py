# -*- coding: utf-8 -*-
import os
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

import imageio_ffmpeg
ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

def run_cmd(cmd, desc):
    print(f"\n--- {desc} ---")
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8', stdin=subprocess.DEVNULL)
    for line in proc.stdout:
        print(line, end='')
    proc.wait()
    if proc.returncode != 0:
        raise Exception(f"Command failed: {desc}")
    print("Success")

# Hardcoded properties matching the 2-hour target video
width = 1280
height = 720
fps = "24"
tbn = "12288"
ar = "44100"
ac = "2"

videos = [
    r"E:\2.알고리듬 유튜브 업로드 영상\알고리듬_오늘떠나_트로트_풀버전.mp4",
    r"E:\2.알고리듬 유튜브 업로드 영상\이열치열.mp4",
    r"E:\2.알고리듬 유튜브 업로드 영상\알고리듬_38.여수t.mp4",
    r"E:\2.알고리듬 유튜브 업로드 영상\알고리듬_43.g.t전주.mp4",
    r"E:\2.알고리듬 유튜브 업로드 영상\알고리듬_나이스샷김여사_전체곡.mp4",
    r"E:\2.알고리듬 유튜브 업로드 영상\알고리듬_37.부안g.t.mp4",
    r"E:\2.알고리듬 유튜브 업로드 영상\알고리듬_34.부산g.t.mp4",
    r"E:\2.알고리듬 유튜브 업로드 영상\무안_노래영상.mp4",
    r"E:\2.알고리듬 유튜브 업로드 영상\알고리듬_41.익산g,t.mp4",
    r"E:\2.알고리듬 유튜브 업로드 영상\장수군_배경음악_뮤직비디오.mp4",
    r"E:\2.알고리듬 유튜브 업로드 영상\알고리듬_35.부안g.t1.mp4",
    r"D:\하이래빗컨텐츠\유튜브-알고리듬\알고리듬 유튜브 업로드 영상\알고리듬_담양(도시).mp4",
    r"D:\하이래빗컨텐츠\유튜브-알고리듬\알고리듬 유튜브 업로드 영상\알고리듬_담양(K팝).mp4",
]

out_dir = r"E:\2.알고리듬 유튜브 업로드 영상"
target_file = r"D:\하이래빗컨텐츠\유튜브-알고리듬\알고리듬 유튜브 업로드 영상\해변의_래빗_여름카페_2시간.mp4"

def conform_video(in_file, out_file):
    if os.path.exists(out_file):
        print(f"Skipping {out_file}, already exists")
        return
    cmd = [
        ffmpeg_exe, "-y", "-i", in_file,
        "-vf", f"scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height},setsar=1,fps={fps}",
        "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-video_track_timescale", tbn,
        "-c:a", "aac", "-ar", ar, "-ac", ac,
        out_file
    ]
    run_cmd(cmd, f"Conform {os.path.basename(in_file)}")

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
    if os.path.exists(out_file):
        print(f"Skipping {out_file}, already exists")
        return
    bg_video = r"D:\하이래빗컨텐츠\유튜브-알고리듬\래빗 영상(음악파동)\트로트_춤추는_하이래빗_0_4초.mp4"
    duration = get_audio_duration(audio_file)
    cmd = [
        ffmpeg_exe, "-y", "-stream_loop", "-1", "-i", bg_video, "-i", audio_file,
        "-vf", f"scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height},setsar=1,fps={fps}",
        "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-video_track_timescale", tbn,
        "-c:a", "aac", "-ar", ar, "-ac", ac,
        "-t", duration,
        out_file
    ]
    run_cmd(cmd, f"Generate {os.path.basename(out_file)}")

print("Generating missing videos...")
work_dir = r"D:\하이래빗"
os.chdir(work_dir)
generate_and_conform(r"D:\음악 전체\1.전체음악\트로트\123bpm_7-5추억이 된 기억 트로트.mp3", "gen_14.mp4")
generate_and_conform(r"D:\음악 전체\1.전체음악\트로트\123bpm_7-4추억이 된 기억 영어버전.mp3", "gen_15.mp4")
generate_and_conform(r"D:\음악 전체\1.전체음악\트로트\136bpm_7-2안녕 나의 작은 이_트로트wav.wav", "gen_16.mp4")

conformed_list = []
for i, v in enumerate(videos):
    out_name = f"conform_{i}.mp4"
    print(f"[{i+1}/13] Processing...")
    conform_video(v, out_name)
    conformed_list.append(out_name)

conformed_list.extend(["gen_14.mp4", "gen_15.mp4", "gen_16.mp4"])
conformed_list.append(target_file)

concat_file = "concat_july.txt"
with open(concat_file, "w", encoding='utf-8') as f:
    for vid in conformed_list:
        v_path = os.path.abspath(vid).replace('\\', '/')
        f.write(f"file '{v_path}'\n")

final_out = os.path.join(out_dir, "7월_플레이리스트_최종.mp4")
cmd_concat = [
    ffmpeg_exe, "-y", "-f", "concat", "-safe", "0", "-i", concat_file,
    "-c", "copy", final_out
]
run_cmd(cmd_concat, "Concatenate all videos")

print(f"\nALL DONE! Output saved to: {final_out}")
