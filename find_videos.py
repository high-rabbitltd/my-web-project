import os
import sys

search_dirs = ['E:\\', 'D:\\']
keywords = ['오늘떠나', '이열치열', '여수', '전주', '김여사', '부안', '부산', '무안', '익산', '장수', '추억', '안녕', '래빗', '파동', '0.4', '해변']

def find_files():
    results = {k: [] for k in keywords}
    for search_dir in search_dirs:
        print(f"Searching in {search_dir}...")
        try:
            for root, dirs, files in os.walk(search_dir):
                for file in files:
                    for kw in keywords:
                        if kw in file:
                            results[kw].append(os.path.join(root, file))
        except Exception as e:
            print(e)
            
    for kw, paths in results.items():
        print(f"\n--- {kw} ---")
        for p in set(paths):
            print(p)

if __name__ == '__main__':
    find_files()
