document.addEventListener('DOMContentLoaded', () => {
    const dreamInput = document.getElementById('dreamInput');
    const interpretBtn = document.getElementById('interpretBtn');
    const resultSection = document.getElementById('resultSection');
    const resultText = document.getElementById('resultText');
    const loadingIndicator = document.getElementById('loadingIndicator');

    const OPENAI_API_KEY = '여기에_발급받으신_API_키를_붙여넣으세요'; // ★ 여기에 API 키 입력!

    interpretBtn.addEventListener('click', async () => {
        const text = dreamInput.value.trim();
        
        if (!text) {
            alert('어떤 꿈을 꾸셨는지 먼저 들려주세요.');
            dreamInput.focus();
            return;
        }

        if (OPENAI_API_KEY === '여기에_발급받으신_API_키를_붙여넣으세요') {
            alert('코드(app.js)에 OpenAI API 키를 먼저 입력해 주세요!');
            return;
        }

        // UI 상태 변경: 로딩 시작
        resultSection.classList.add('hidden');
        resultSection.classList.remove('fade-in-up');
        loadingIndicator.classList.remove('hidden');
        interpretBtn.disabled = true;
        interpretBtn.style.opacity = '0.7';
        interpretBtn.style.cursor = 'not-allowed';

        try {
            // OpenAI API (웨이터) 호출
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', // 빠르고 저렴한 모델
                    messages: [
                        { role: 'system', content: '당신은 신비롭고 다정한 별자리 꿈 해몽 전문가입니다. 사용자의 꿈 이야기를 듣고, 상징하는 바와 길몽/흉몽 여부, 그리고 삶에 도움이 되는 조언을 3~4문장으로 신비로운 말투로 해석해 주세요.' },
                        { role: 'user', content: text }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`API 오류: ${response.status}`);
            }

            const data = await response.json();
            const interpretation = data.choices[0].message.content;

            // 주방장(AI)이 보내온 결과 적용
            resultText.innerText = interpretation;

        } catch (error) {
            console.error('Error:', error);
            resultText.innerText = '앗, 별들의 속삭임을 가져오는 중 통신에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.';
        } finally {
            // UI 상태 변경: 로딩 끝, 결과 표시
            loadingIndicator.classList.add('hidden');
            resultSection.classList.remove('hidden');
            
            // 애니메이션 리플로우 강제
            void resultSection.offsetWidth;
            
            resultSection.classList.add('fade-in-up');

            // 버튼 상태 복구
            interpretBtn.disabled = false;
            interpretBtn.style.opacity = '1';
            interpretBtn.style.cursor = 'pointer';
        }
    });
});
