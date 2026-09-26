import cv2
import numpy as np

out_path = r"D:\하이래빗컨텐츠\유튜브-알고리듬\캐릭터 모음\하이래빗 음악감상_투명_fixed.png"
img_path = r"D:\하이래빗컨텐츠\유튜브-알고리듬\캐릭터 모음\하이래빗 음악감상_투명.png"
with open(img_path, "rb") as f:
    bytes = bytearray(f.read())
numpyarray = np.asarray(bytes, dtype=np.uint8)
img = cv2.imdecode(numpyarray, cv2.IMREAD_UNCHANGED)

# We want to make the patch at (x=1450, y=380) transparent.
# Target the bounding box where the hole is: x=1550 to 1650, y=300 to 450
y1, y2 = 300, 450
x1, x2 = 1550, 1650

for y in range(y1, y2):
    for x in range(x1, x2):
        b, g, r, a = img[y, x]
        # The background is very close to white. We use strict threshold (e.g., >240)
        if b > 240 and g > 240 and r > 240:
            img[y, x, 3] = 0  # Set alpha to 0
# Save
_, encoded = cv2.imencode('.png', img)
encoded.tofile(out_path)
print("Saved fixed image to:", out_path)
