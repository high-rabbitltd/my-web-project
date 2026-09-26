import cv2
import numpy as np

img_path = r"D:\하이래빗컨텐츠\유튜브-알고리듬\캐릭터 모음\하이래빗 음악감상_투명.png"
with open(img_path, "rb") as f:
    bytes = bytearray(f.read())
numpyarray = np.asarray(bytes, dtype=np.uint8)
img = cv2.imdecode(numpyarray, cv2.IMREAD_UNCHANGED)

# Draw grid lines and coordinates
for y in range(0, img.shape[0], 100):
    cv2.line(img, (0, y), (img.shape[1], y), (0, 0, 0, 255), 2)
    cv2.putText(img, str(y), (10, y-10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0, 255), 2)

for x in range(0, img.shape[1], 100):
    cv2.line(img, (x, 0), (x, img.shape[0]), (0, 0, 0, 255), 2)
    cv2.putText(img, str(x), (x+10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0, 255), 2)

out_path = r"C:\Users\USER\.gemini\antigravity-ide\brain\8e8ce254-f1c4-4e61-93ac-cab37cdb0f28\rabbit_grid.png"
cv2.imwrite(out_path, img)
print("Saved grid image to:", out_path)
