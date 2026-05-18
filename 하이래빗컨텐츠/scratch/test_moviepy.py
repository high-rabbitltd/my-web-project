import os
import sys

# Try imports
try:
    from moviepy import ImageClip, CompositeVideoClip, AudioFileClip
    print("Import from moviepy successful!")
except Exception as e:
    print(f"Import from moviepy failed: {e}")
    try:
        from moviepy.editor import ImageClip, CompositeVideoClip, AudioFileClip
        print("Import from moviepy.editor successful!")
    except Exception as e2:
        print(f"Import from moviepy.editor failed: {e2}")
        sys.exit(1)

# Check moviepy version
try:
    import moviepy
    print(f"Moviepy version: {getattr(moviepy, '__version__', 'unknown')}")
except Exception as e:
    print(f"Failed to check version: {e}")
