import os
import asyncio
import subprocess
import edge_tts
import imageio_ffmpeg

# --- 설정 (Configuration) ---
OUTPUT_DIR = r"D:\하이래빗\heartwave_poc\output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 시나리오: 어머니 생신 축하 메시지 (한국어)
SCRIPT_KO = """
사랑하는 어머니, 생신 진심으로 축하드려요. 
평소에 쑥스러워서 사랑한다는 말 한 번 제대로 못 한 것 같은데, 
항상 묵묵히 챙겨주시고 따뜻하게 안아주셔서 정말 감사합니다.
앞으로는 제가 더 잘할게요. 늘 건강하시고, 오래오래 제 곁에 있어주세요. 
사랑합니다.
"""

# 시나리오: 해외 바이어 승진 축하 메시지 (영어)
SCRIPT_EN = """
Dear John, congratulations on your recent promotion! 
Your hard work and dedication have truly paid off. 
I am so proud of your achievements and looking forward to our continued partnership.
Wishing you all the best in your new role!
"""

# AI 성우 설정 (Edge-TTS)
VOICE_KO = "ko-KR-SunHiNeural"  # 한국어 여성 성우
VOICE_EN = "en-US-JennyNeural"  # 영어 여성 성우

# 임시 파일 경로
TTS_KO_WAV = os.path.join(OUTPUT_DIR, "tts_ko.wav")
TTS_EN_WAV = os.path.join(OUTPUT_DIR, "tts_en.wav")
FINAL_KO_MP4 = os.path.join(OUTPUT_DIR, "heartwave_sample_ko.mp4")
FINAL_EN_MP4 = os.path.join(OUTPUT_DIR, "heartwave_sample_en.mp4")

# 기존 프로젝트에서 쓰던 BGM 파일 중 하나를 사용 (위치 확인 필요)
# 기존 프로젝트에서 쓰던 BGM 파일 중 하나를 사용 (위치 확인 필요)
BGM_PATH = r"D:\음악 전체\1.전체음악\연주곡(경쾌한)\4-2도시의 비상(3분).wav"

async def generate_tts(text, voice, output_path):
    print(f"[TTS] 생성 중... ({voice})")
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)
    print(f"[TTS] 완료: {output_path}")

def mix_audio_and_bgm(tts_path, bgm_path, output_path):
    print(f"[Mix] BGM과 TTS 믹싱 중... ({output_path})")
    
    # BGM 볼륨을 0.05로 낮추고, TTS가 끝날 때 부드럽게 페이드아웃 되도록 설정
    # ffmpeg 필터 사용
    filter_complex = (
        f"[1:a]volume=0.05[bgm_vol]; "
        f"[0:a][bgm_vol]amix=inputs=2:duration=first:dropout_transition=2[aout]"
    )
    
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg_exe, "-y",
        "-i", tts_path,
        "-stream_loop", "-1", "-i", bgm_path,  # BGM을 무한 반복하다가
        "-filter_complex", filter_complex,
        "-map", "[aout]",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",  # TTS 길이에 맞춰서 종료
        output_path
    ]
    
    # 조용히 실행
    process = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if process.returncode == 0:
        print(f"[Mix] 믹싱 완료: {output_path}\n")
    else:
        print("[Mix] 믹싱 실패!")

async def main():
    print("=== HeartWave PoC 테스트 시작 ===")
    
    if not os.path.exists(BGM_PATH):
        print(f"오류: BGM 파일을 찾을 수 없습니다. ({BGM_PATH})")
        print("BGM_PATH를 존재하는 파일로 변경해주세요.")
        return

    # 1. 한국어 테스트 (감동적인 축하)
    print("\n--- 한국어 샘플 생성 ---")
    await generate_tts(SCRIPT_KO, VOICE_KO, TTS_KO_WAV)
    mix_audio_and_bgm(TTS_KO_WAV, BGM_PATH, FINAL_KO_MP4)
    
    # 2. 영어 테스트 (글로벌 다국어 테스트)
    print("\n--- 영어 샘플 생성 ---")
    await generate_tts(SCRIPT_EN, VOICE_EN, TTS_EN_WAV)
    mix_audio_and_bgm(TTS_EN_WAV, BGM_PATH, FINAL_EN_MP4)
    
    print("=== 모든 테스트 완료! ===")
    print(f"결과물 폴더: {OUTPUT_DIR}")

if __name__ == "__main__":
    asyncio.run(main())
