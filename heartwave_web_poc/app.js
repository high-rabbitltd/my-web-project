document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-btn');
    const introView = document.getElementById('intro-view');
    const playerView = document.getElementById('player-view');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const waveformContainer = document.getElementById('waveform');
    const textLines = document.querySelectorAll('.fade-in-text');
    
    let isPlaying = true;
    let animationId;
    let time = 0;

    // 1. 편지 열기 버튼 클릭 이벤트
    openBtn.addEventListener('click', () => {
        introView.classList.remove('active');
        playerView.classList.add('active');
        
        // 텍스트 순차적 표시
        textLines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('show');
            }, index * 2000 + 500); // 2초 간격으로 표시
        });

        // 웨이브폼 애니메이션 시작
        startWaveform();
        updateTime();
    });

    // 2. 웨이브폼 바 생성 (약 40개)
    const numBars = 40;
    for (let i = 0; i < numBars; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar active';
        waveformContainer.appendChild(bar);
    }
    const bars = document.querySelectorAll('.bar');

    // 3. 웨이브폼 애니메이션 함수 (가짜 오디오 파동)
    function animateWaveform() {
        if (!isPlaying) return;

        bars.forEach((bar, index) => {
            // 랜덤한 높이 값 생성 (10px ~ 40px)
            // 실제 서비스에서는 Web Audio API의 AnalyserNode 데이터 사용
            const height = Math.random() * 30 + 10;
            bar.style.height = `${height}px`;
            
            // 색상 그라데이션 효과 흉내
            if (height > 30) {
                bar.style.background = '#ec4899'; // Pink
            } else if (height > 20) {
                bar.style.background = '#8b5cf6'; // Purple
            } else {
                bar.style.background = '#4f46e5'; // Indigo
            }
        });

        animationId = setTimeout(() => {
            requestAnimationFrame(animateWaveform);
        }, 100);
    }

    function startWaveform() {
        isPlaying = true;
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        animateWaveform();
    }

    function stopWaveform() {
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        clearTimeout(animationId);
        
        // 정지 시 모든 바를 기본 높이로
        bars.forEach(bar => {
            bar.style.height = '5px';
            bar.style.background = '#4f46e5';
        });
    }

    // 4. 재생/일시정지 토글
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            stopWaveform();
        } else {
            startWaveform();
        }
    });

    // 5. 가짜 시간 업데이트
    function updateTime() {
        if (!isPlaying) {
            setTimeout(updateTime, 1000);
            return;
        }

        time++;
        const seconds = time % 60;
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
        document.getElementById('current-time').innerText = `0:${formattedSeconds}`;

        if (time < 45) {
            setTimeout(updateTime, 1000);
        } else {
            stopWaveform(); // 끝나면 정지
        }
    }
});
