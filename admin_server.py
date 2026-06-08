import os
import subprocess
from flask import Flask, render_template_string, request, jsonify
from bs4 import BeautifulSoup

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PAGES = {
    'index.html': '홈페이지 (메인)',
    'media.html': '미디어 콘텐츠',
    'software.html': '소프트웨어',
    'character.html': '캐릭터 및 세계관'
}

INJECT_SCRIPT = """
<style id="admin-injected-style">
    .admin-edit-active {
        outline: 2px dashed #ff0000 !important;
        background-color: rgba(255, 255, 0, 0.1) !important;
        cursor: text !important;
    }
    .admin-img-active {
        outline: 3px solid #00ffcc !important;
        cursor: pointer !important;
    }
    #admin-floating-panel {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #1e293b;
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        z-index: 999999;
        font-family: 'Montserrat', '맑은 고딕', sans-serif;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    #admin-toolbar {
        position: absolute;
        background: #334155;
        border-radius: 8px;
        padding: 8px;
        display: none;
        gap: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 999999;
        align-items: center;
    }
    .admin-toolbar-btn {
        background: #475569;
        border: none;
        color: white;
        cursor: pointer;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 14px;
    }
    .admin-toolbar-btn:hover { background: #64748b; }
    #admin-save-btn {
        background: #00ffcc;
        color: #0f172a;
        border: none;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
        transition: 0.3s;
    }
    #admin-save-btn:hover { background: #00cca3; }
    #admin-cancel-btn {
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 8px 16px;
        font-size: 14px;
        border-radius: 8px;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
    }
</style>
<div id="admin-toolbar">
    <button class="admin-toolbar-btn" onclick="execCmd('bold')"><b>B</b></button>
    <button class="admin-toolbar-btn" onclick="execCmd('justifyLeft')">왼쪽</button>
    <button class="admin-toolbar-btn" onclick="execCmd('justifyCenter')">가운데</button>
    <button class="admin-toolbar-btn" onclick="execCmd('justifyRight')">오른쪽</button>
    <button class="admin-toolbar-btn" onclick="changeFontSize(1)">A+</button>
    <button class="admin-toolbar-btn" onclick="changeFontSize(-1)">A-</button>
    <input type="color" id="admin-color-picker" style="cursor:pointer;" onchange="execCmd('foreColor', this.value)">
</div>
<div id="admin-floating-panel">
    <div style="font-size: 14px; margin-bottom: 5px;">🛠️ <b>하이래빗 시각 편집기</b></div>
    <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 10px;">글자를 클릭해서 수정하고, 이미지를 더블클릭해서 바꾸세요!</div>
    <button id="admin-save-btn">💾 저장 및 웹사이트 배포</button>
    <a href="/" id="admin-cancel-btn">저장 안 하고 목록으로 가기</a>
</div>
<script id="admin-injected-script">
    let currentTarget = null;
    const toolbar = document.getElementById('admin-toolbar');

    function execCmd(command, value = null) {
        document.execCommand(command, false, value);
    }

    function changeFontSize(direction) {
        if (!currentTarget) return;
        const currentSize = window.getComputedStyle(currentTarget).fontSize;
        const newSize = parseFloat(currentSize) + (direction * 2);
        currentTarget.style.fontSize = newSize + 'px';
    }

    document.addEventListener("DOMContentLoaded", function() {
        const editableTags = ['h1', 'h2', 'h3', 'p', 'span', 'li', 'a', 'div'];
        
        const elements = document.querySelectorAll(editableTags.join(', '));
        elements.forEach(el => {
            let hasText = Array.from(el.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '');
            if(hasText && el.id !== 'admin-floating-panel' && !el.closest('#admin-floating-panel') && !el.closest('#admin-toolbar')) {
                el.setAttribute('contenteditable', 'true');
                el.classList.add('admin-edit-active');
            }
        });

        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.classList.add('admin-img-active');
            img.addEventListener('dblclick', function(e) {
                e.stopPropagation();
                const newSrc = prompt('새로운 이미지 경로를 입력하세요 (예: assets/new-image.jpg):', this.getAttribute('src'));
                if (newSrc) {
                    this.src = newSrc;
                }
            });
        });

        document.addEventListener('click', function(e) {
            if (e.target.closest('a') && e.target.id !== 'admin-cancel-btn' && !e.target.closest('#admin-toolbar')) {
                e.preventDefault();
            }
            
            if (e.target.classList.contains('admin-edit-active')) {
                currentTarget = e.target;
                const rect = e.target.getBoundingClientRect();
                toolbar.style.display = 'flex';
                toolbar.style.top = (window.scrollY + rect.top - 40) + 'px';
                toolbar.style.left = rect.left + 'px';
            } else if (!e.target.closest('#admin-toolbar')) {
                toolbar.style.display = 'none';
                currentTarget = null;
            }
        });

        document.getElementById('admin-save-btn').addEventListener('click', function() {
            this.innerText = '⏳ 저장 중... (약 10초 소요)';
            this.disabled = true;
            
            document.querySelectorAll('.admin-edit-active').forEach(el => {
                el.removeAttribute('contenteditable');
                el.classList.remove('admin-edit-active');
            });
            document.querySelectorAll('.admin-img-active').forEach(el => {
                el.classList.remove('admin-img-active');
            });
            
            document.getElementById('admin-floating-panel').remove();
            document.getElementById('admin-toolbar').remove();
            
            const newHtml = document.documentElement.outerHTML;
            
            fetch(window.location.pathname, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html: newHtml })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    alert('✅ 성공적으로 저장되고 깃허브에 자동 배포되었습니다! 실제 홈페이지에는 1~2분 뒤 적용됩니다.');
                    window.location.href = '/';
                } else {
                    alert('❌ 저장 중 오류 발생: ' + data.error);
                    location.reload();
                }
            })
            .catch(err => {
                alert('서버와 연결할 수 없습니다.');
                location.reload();
            });
        });
    });
</script>
"""

INDEX_TEMPLATE = """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>하이래빗 관리자 모드</title>
    <style>
        body { font-family: '맑은 고딕', 'Malgun Gothic', sans-serif; background: #f8fafc; padding: 40px; color: #334155; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; font-weight: 900; }
        .page-list { display: flex; flex-direction: column; gap: 15px; margin-top: 30px; }
        .page-card { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #f1f5f9; border-radius: 12px; border: 1px solid #e2e8f0; transition: 0.2s; }
        .page-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .page-title { font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 4px; }
        .page-filename { font-size: 14px; color: #64748b; }
        .edit-btn { background: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; transition: 0.2s; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); }
        .edit-btn:hover { background: #059669; transform: translateY(-2px); }
        .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐰 하이래빗 홈페이지 통합 관리자</h1>
        <p style="font-size: 16px; line-height: 1.6;">환영합니다! 아래에서 수정할 페이지를 선택하세요.<br>버튼을 누르면 실제 홈페이지 화면이 열리고, 그곳에서 <b>직접 글자를 클릭해 수정</b>할 수 있습니다.</p>
        
        <div class="page-list">
            {% for filename, title in pages.items() %}
            <div class="page-card">
                <div>
                    <div class="page-title">{{ title }}</div>
                    <div class="page-filename">파일명: {{ filename }}</div>
                </div>
                <a href="/edit/{{ filename }}" class="edit-btn">에디터 열기 ✏️</a>
            </div>
            {% endfor %}
        </div>
        
        <div class="footer">
            Powered by Antigravity Agent & Flask
        </div>
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(INDEX_TEMPLATE, pages=PAGES)

@app.route('/edit/<filename>', methods=['GET', 'POST'])
def edit_page(filename):
    if filename not in PAGES:
        return "존재하지 않는 페이지입니다.", 400
        
    filepath = os.path.join(BASE_DIR, filename)
    
    if request.method == 'POST':
        try:
            data = request.json
            new_html = data.get('html', '')
            
            soup = BeautifulSoup(new_html, 'html.parser')
            
            for tag_id in ['admin-injected-style', 'admin-injected-script']:
                tag = soup.find(id=tag_id)
                if tag:
                    tag.decompose()
                    
            clean_html = "<!DOCTYPE html>\n" + str(soup)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(clean_html)
                
            subprocess.run(['git', 'add', filename], cwd=BASE_DIR, check=True)
            subprocess.run(['git', 'commit', '-m', f"관리자 모드 텍스트 업데이트: {filename}"], cwd=BASE_DIR, check=True)
            subprocess.run(['git', 'push', 'origin', 'main'], cwd=BASE_DIR, check=True)
            
            return jsonify({'success': True})
        except subprocess.CalledProcessError as e:
            return jsonify({'success': False, 'error': '깃허브 업로드 중 오류가 발생했습니다.'})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})

    if not os.path.exists(filepath):
        return "파일을 찾을 수 없습니다.", 404
        
    with open(filepath, 'r', encoding='utf-8') as f:
        html_content = f.read()
        
    soup = BeautifulSoup(html_content, 'html.parser')
    
    inject_soup = BeautifulSoup(INJECT_SCRIPT, 'html.parser')
    if soup.body:
        soup.body.append(inject_soup)
    else:
        soup.append(inject_soup)
        
    return str(soup)

if __name__ == '__main__':
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    app.run(port=5000, debug=False)
