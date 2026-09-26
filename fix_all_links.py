import glob
files = glob.glob('d:/하이래빗/*.html') + glob.glob('d:/하이래빗/하이래빗컨텐츠/web/*.html')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        c = file.read()
    c = c.replace('https://www.youtube.com/@highrabbit', 'javascript:alert(\'채널 개설 준비 중입니다!\');')
    with open(f, 'w', encoding='utf-8') as file:
        file.write(c)