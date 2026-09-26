import os
import subprocess
import json

files = [
    r"D:\하이래빗컨텐츠\유튜브-알고리듬\알고리듬 유튜브 업로드 영상\해변의_래빗_여름카페_2시간.mp4",
    r"E:\2.알고리듬 유튜브 업로드 영상\이열치열.mp4"
]

def get_properties(file_path):
    cmd = [
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate,profile,codec_name",
        "-of", "json", file_path
    ]
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        v_data = json.loads(result.stdout)
        
        cmd_a = [
            "ffprobe", "-v", "error", "-select_streams", "a:0",
            "-show_entries", "stream=sample_rate,channels,codec_name",
            "-of", "json", file_path
        ]
        result_a = subprocess.run(cmd_a, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        a_data = json.loads(result_a.stdout)
        
        print(f"--- {os.path.basename(file_path)} ---")
        if v_data.get("programs") or v_data.get("streams"):
            print("Video:", v_data["streams"][0] if v_data.get("streams") else "None")
        if a_data.get("programs") or a_data.get("streams"):
            print("Audio:", a_data["streams"][0] if a_data.get("streams") else "None")
            
    except Exception as e:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        ffprobe_exe = ffmpeg_exe.replace("ffmpeg", "ffprobe")
        print(f"Fallback to imageio_ffmpeg: {ffprobe_exe}")
        
        cmd[0] = ffprobe_exe
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        v_data = json.loads(result.stdout)
        
        cmd_a[0] = ffprobe_exe
        result_a = subprocess.run(cmd_a, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        a_data = json.loads(result_a.stdout)
        
        print(f"--- {os.path.basename(file_path)} ---")
        if v_data.get("programs") or v_data.get("streams"):
            print("Video:", v_data["streams"][0] if v_data.get("streams") else "None")
        if a_data.get("programs") or a_data.get("streams"):
            print("Audio:", a_data["streams"][0] if a_data.get("streams") else "None")

for f in files:
    get_properties(f)
