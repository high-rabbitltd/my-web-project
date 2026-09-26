from PIL import Image
from rembg import remove

rabbit_path = r"D:\하이래빗컨텐츠\유튜브-알고리듬\캐릭터 모음\하이래빗 음악감상.png"
out_path = r"D:\하이래빗컨텐츠\유튜브-알고리듬\캐릭터 모음\하이래빗 음악감상_투명.png"

input_rabbit = Image.open(rabbit_path)
# Standard rembg without alpha matting to preserve the face perfectly
rabbit = remove(input_rabbit).convert("RGBA")
rabbit.save(out_path)
print("Saved transparent rabbit perfectly without alpha matting to:", out_path)
