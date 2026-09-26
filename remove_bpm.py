import os
import glob
import re

target_dir = r"D:\음악 전체\1.전체음악\카페곡\비오는날"
files = glob.glob(os.path.join(target_dir, "**", "*.mp3"), recursive=True) + \
        glob.glob(os.path.join(target_dir, "**", "*.wav"), recursive=True)

count = 0
for f in files:
    filename = os.path.basename(f)
    dir_name = os.path.dirname(f)
    
    # Check if filename starts with digits followed by "bpm_"
    match = re.match(r"^(\d+bpm_)(.+)$", filename, re.IGNORECASE)
    if match:
        original_name = match.group(2)
        new_path = os.path.join(dir_name, original_name)
        try:
            os.rename(f, new_path)
            print(f"Restored: {original_name}")
            count += 1
        except Exception as e:
            print(f"Failed to rename {filename}: {e}")

print(f"\nTask Complete! Successfully restored {count} files in 비오는날 folder.")
