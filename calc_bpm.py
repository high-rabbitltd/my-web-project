import os
import glob
import librosa
import numpy as np

music_dir = r"D:\음악 전체"

files = glob.glob(os.path.join(music_dir, "**", "*.mp3"), recursive=True) + \
        glob.glob(os.path.join(music_dir, "**", "*.wav"), recursive=True)

def get_bpm(file_path):
    try:
        # Analyze first 60 seconds for performance
        y, sr = librosa.load(file_path, duration=60.0)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        bpm = float(tempo[0] if isinstance(tempo, np.ndarray) else tempo)
        return round(bpm)
    except Exception as e:
        print(f"Error analyzing {file_path}: {e}")
        return None

count = 0
print(f"Starting BPM analysis for {len(files)} files...")
for f in files:
    filename = os.path.basename(f)
    name, ext = os.path.splitext(filename)
    
    # Skip if already analyzed
    if "bpm_" in filename.lower():
        continue
        
    bpm = get_bpm(f)
    if bpm is not None:
        new_name = f"{bpm}bpm_{filename}"
        new_path = os.path.join(os.path.dirname(f), new_name)
        try:
            os.rename(f, new_path)
            print(f"Renamed: {filename} -> {new_name}")
            count += 1
        except Exception as e:
            print(f"Failed to rename {filename}: {e}")

print(f"\nTask Complete! Successfully processed and renamed {count} files.")
