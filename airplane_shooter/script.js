// Ver 3.3.0-GLOBAL
// [REPAIR] 전역 에러 핸들러 (사소한 에러가 게임 전체를 멈추는 것을 방지)
window.onerror = function(message, source, lineno, colno, error) {
    console.warn("Global Error Captured (Defensive Mode):", message);
    return true; // 에러 전파 방지
};
console.log("🚀 뽕뽕비행기: 갤럭시 디펜더 [Ver 3.3.0-GLOBAL] 가동 시작");


// --- Capacitor & AdMob (출시용 광고) 설정 ---
const { AdMob } = window.Capacitor ? window.Capacitor.Plugins : {};

// [DEFENSIVE] 안전하게 엘리먼트를 가져오는 헬퍼 함수
function safeGetElement(id) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`[Defensive] Element with id '${id}' not found. Creating a dummy to prevent crashes.`);
        const dummy = document.createElement('div');
        dummy.id = 'dummy'; // 더미 유무 확인을 위한 식별자 부여
        return dummy;
    }
    return el;
}

async function initAds() {
    if (!window.Capacitor) return;
    try {
        await AdMob.initialize({ requestTrackingAuthorization: true });
        // 하단 배너 광고 상시 노출 (테스트 ID)
        await AdMob.showBanner({
            adId: 'ca-app-pub-3940256099942544/6300978111',
            adSize: 'BANNER',
            position: 'BOTTOM_CENTER',
            margin: 0
        });
    } catch (e) { console.warn("AdMob Init Failed:", e); }
}

async function showInterstitial() {
    if (!window.Capacitor) return;
    try {
        await AdMob.prepareInterstitial({ adId: 'ca-app-pub-3940256099942544/1033173712' });
        await AdMob.showInterstitial();
    } catch (e) { console.warn("Interstitial Failed:", e); }
}

async function showRewarded(successCallback) {
    console.log("📺 광고 버튼 클릭됨! (showRewarded 호출)");
    if (!window.Capacitor) {
        // 웹 환경: 구글 애드센스(AdSense for H5 Games) 웹 광고 연동
        const adOverlay = document.createElement('div');
        adOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#fff; font-family:sans-serif; text-align:center;';
        adOverlay.innerHTML = `
            <h2 style="color:#ff9900; margin-bottom:20px;">스폰서 광고 시청 중...</h2>
            <div style="width:50px; height:50px; border:4px solid rgba(255,153,0,0.3); border-top-color:#ff9900; border-radius:50%; animation:spin 1s linear infinite;"></div>
            <p style="margin-top:20px; font-size:14px; color:#aaa;">(현재 H5 광고 아이디 미등록 상태로 가상 광고가 노출됩니다)</p>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        `;
        document.body.appendChild(adOverlay);

        // 구글 H5 Games AdBreak API가 등록되어 있다면 진짜 광고 호출
        if (typeof adBreak === 'function') {
            adBreak({
                type: 'reward',
                name: 'rewarded_ad',
                beforeAd: () => { console.log('웹 광고 시작'); },
                afterAd: () => { 
                    console.log('웹 광고 종료 (보상 지급)'); 
                    if(document.body.contains(adOverlay)) document.body.removeChild(adOverlay);
                    if(successCallback) successCallback(); 
                },
                adBreakDone: () => { 
                    if(document.body.contains(adOverlay)) document.body.removeChild(adOverlay);
                }
            });
        } else {
            // H5 광고 아이디가 없는 테스트 기간에는 3초 뒤 자동 보상 지급
            let timeLeft = 3;
            const timer = setInterval(() => {
                timeLeft--;
                if(timeLeft <= 0) {
                    clearInterval(timer);
                    if(document.body.contains(adOverlay)) document.body.removeChild(adOverlay);
                    if(successCallback) successCallback();
                }
            }, 1000);
        }
        return;
    }
    
    // 앱(안드로이드/iOS) 환경: 애드몹(AdMob) 호출
    try {
        await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-3940256099942544/5224354917' });
        const reward = await AdMob.showRewardVideoAd();
        if (reward) successCallback();
    } catch (e) {
        console.warn("Reward Ad Failed:", e);
        successCallback();
    }
}

// --- Web Audio API (효과음) 초기화 ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function playLaserSound() {
    if (!audioCtx) audioCtx = new AudioContext(); // 첫 발사 시 생성
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // 복고풍 뿅뿅 소리 (Square wave 파형 피치 드랍)
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.1);

    // 짧고 굵직하게 끊어지는 사운드
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// [NEW] 보스 폭발 사운드 (스펙타클 딥 익스플로전)
function playBossExplosionSound() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    // 1. Deep Explosion Rumble
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 1.2);
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + 1.2);
    
    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start(); osc.stop(now + 1.2);

    // 2. Metallic Crash
    const metallicOsc = audioCtx.createOscillator();
    const metalGain = audioCtx.createGain();
    metallicOsc.type = 'square';
    metallicOsc.frequency.setValueAtTime(350, now);
    metallicOsc.frequency.linearRampToValueAtTime(80, now + 0.8);
    
    metalGain.gain.setValueAtTime(0.5, now);
    metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    metallicOsc.connect(metalGain);
    metalGain.connect(audioCtx.destination);
    metallicOsc.start(); metallicOsc.stop(now + 0.8);

    // 3. Heavy Impact Noise Burst
    const bufferSize = audioCtx.sampleRate * 0.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(250, now);
    noiseFilter.frequency.linearRampToValueAtTime(50, now + 0.5);
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noiseSource.start(); noiseSource.stop(now + 0.5);
}

function playCoinSound() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // 코인 특유의 띠-링! 느낌 (두 개의 음이 연달아 들리도록 피치 점프)
    osc.type = 'sine'; // 맑은 음색
    osc.frequency.setValueAtTime(987.77, audioCtx.currentTime); // 첫음 (B5)
    osc.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.05); // 짧게 E6로 도약

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.05);
    // 서서히 여운을 남기며 사라짐
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

// [NEW] 자석 강화 사운드 (지잉- 하는 전자음)
function playMagnetSound() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

// 실제 유리 파손음을 Web Audio API로 극도로 정교하게 합성 (Impact + Crackling + Tinkling)
function playGlassSound() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    // 1. 강한 타격음 (Impact) - 깡! 하는 순간적인 충격
    const impactOsc = audioCtx.createOscillator();
    const impactGain = audioCtx.createGain();
    impactOsc.type = 'triangle';
    impactOsc.frequency.setValueAtTime(150, now);
    impactOsc.frequency.exponentialRampToValueAtTime(1000, now + 0.05);
    impactGain.gain.setValueAtTime(0.4, now);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    impactOsc.connect(impactGain);
    impactGain.connect(audioCtx.destination);
    impactOsc.start(now);
    impactOsc.stop(now + 0.1);

    // 2. 균열음 및 파편 비산 (Crackling/Shatter Noise) - 챙그랑!
    const duration = 0.5;
    const bufferSize = audioCtx.sampleRate * duration;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        // 시간에 따라 감쇄하는 화이트 노이즈
        output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(3000, now);
    noiseFilter.Q.value = 10; // 공명 추가로 맑은 느낌 강화

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noiseSource.start(now);

    // 3. 고주파 잔향음 (Tinkling) - 찰랑찰랑 흩어지는 파편
    for (let i = 0; i < 5; i++) {
        const tinkleOsc = audioCtx.createOscillator();
        const tinkleGain = audioCtx.createGain();
        const delay = Math.random() * 0.1;
        const freq = 4000 + Math.random() * 6000;

        tinkleOsc.type = 'sine';
        tinkleOsc.frequency.setValueAtTime(freq, now + delay);
        tinkleGain.gain.setValueAtTime(0, now + delay);
        tinkleGain.gain.linearRampToValueAtTime(0.1, now + delay + 0.01);
        tinkleGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);

        tinkleOsc.connect(tinkleGain);
        tinkleGain.connect(audioCtx.destination);
        tinkleOsc.start(now + delay);
        tinkleOsc.stop(now + delay + 0.2);
    }
}

let lastKlaxonTime = 0;
function playKlaxonSound() {
    const now = audioCtx ? audioCtx.currentTime : 0;
    if (now - lastKlaxonTime < 0.1) return; // 0.1초 쿨다운 (연속 재생 방지)
    lastKlaxonTime = now;

    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const currentTime = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = 'square';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(440, currentTime);
    osc2.frequency.setValueAtTime(349.23, currentTime);

    gainNode.gain.setValueAtTime(0.08, currentTime); // 약간 볼륨 하향
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.2);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start(currentTime);
    osc2.start(currentTime);
    osc1.stop(currentTime + 0.2);
    osc2.stop(currentTime + 0.2);
}

// [NEW] 11단계: 땡그랑! 보석/동전 부딪히는 소리
function playClinkSound() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(now + 0.2);
}

// [NEW] 결제 성공 소리 (카칭!)
function playPurchaseSuccessSound() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc1.frequency.setValueAtTime(1000, now);
    osc1.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
    osc2.frequency.setValueAtTime(1200, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain); osc2.connect(gain);
    gain.connect(audioCtx.destination);
    osc1.start(); osc2.start();
    osc1.stop(now + 0.3); osc2.stop(now + 0.3);
}

// [NEW] 결제 실패 소리 (띠딕- 소리)
function playPurchaseFailSound() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(now + 0.2);
}

// [NEW] 13단계: 우주 공간의 웅성임 (자연스러운 톤으로 변경)
let spaceAmbianceSource = null;
let spaceAmbianceGain = null;

function startSpaceAmbiance() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // 이미 재생 중이면 중복 생성 방지
    if (spaceAmbianceSource) return;

    const now = audioCtx.currentTime;
    
    // 우주의 고요하고 부드러운 화이트 노이즈
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now); // 매우 부드러운 필터

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 2); // 아주 은은하게 커짐

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noiseSource.start(now);

    spaceAmbianceSource = noiseSource;
    spaceAmbianceGain = gain;
}

function stopSpaceAmbiance() {
    if (spaceAmbianceSource && spaceAmbianceGain) {
        const now = audioCtx.currentTime;
        spaceAmbianceGain.gain.cancelScheduledValues(now);
        spaceAmbianceGain.gain.setValueAtTime(spaceAmbianceGain.gain.value, now);
        spaceAmbianceGain.gain.linearRampToValueAtTime(0, now + 1); // 1초간 페이드 아웃

        const sourceToStop = spaceAmbianceSource;
        setTimeout(() => {
            try { sourceToStop.stop(); } catch (e) { }
        }, 1100);

        spaceAmbianceSource = null;
        spaceAmbianceGain = null;
    }
}

// [NEW] 16단계: 폭죽 빵빵 터지는 소리 (개선된 realism - Bass Boom + Multi Crackle)
function playFireworkSound() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    // 1. 메인 폭발음 (Deep Bass Boom)
    const boomOsc = audioCtx.createOscillator();
    const boomGain = audioCtx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(150, now);
    boomOsc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    boomGain.gain.setValueAtTime(0.6, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    boomOsc.connect(boomGain);
    boomGain.connect(audioCtx.destination);
    boomOsc.start(); boomOsc.stop(now + 0.4);

    // 2. 중간 타격음 (Mid-range punch)
    const punchOsc = audioCtx.createOscillator();
    const punchGain = audioCtx.createGain();
    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(200, now);
    punchOsc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    punchGain.gain.setValueAtTime(0.4, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    punchOsc.connect(punchGain);
    punchGain.connect(audioCtx.destination);
    punchOsc.start(); punchOsc.stop(now + 0.15);

    // 3. 파바박! 파편 소리 (Layered Noise Crackle)
    for (let i = 0; i < 3; i++) {
        const delay = i * 0.05;
        const bufSize = audioCtx.sampleRate * (0.2 + Math.random() * 0.2);
        const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let j = 0; j < bufSize; j++) data[j] = Math.random() * 2 - 1;

        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000 + Math.random() * 2000, now + delay);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.1, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        src.start(now + delay);
    }
}

// [NEW] Stage 19: 뾱뾱 (뿌잉뿌잉) 소리
function playBboingSound() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(); osc.stop(now + 0.2);
}

// [NEW] 공 바람 빠지는 소리 (피융~)
function playAirEscapeSound() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(); osc.stop(now + 0.4);
}

// [NEW] 12단계 동물 소리
function playAnimalSound(model) {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    if (model === '🐶') { // 멍멍
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    } else if (model === '🐱') { // 야옹
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    } else if (model === '🐰') { // 뀩
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    } else { // 기본 인형 소리
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    }
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(); osc.stop(now + 0.3);
}

const BGM = {
    instances: {}, // Cache of Audio instances keyed by filename
    current: null,
    init() {
        if (!this.current) {
            this.current = new Audio();
            this.current.volume = 0.5;
        }
    },
    play(filename, loop = true) {
        this.init();
        try {
            console.log("🎵 [BGM] Play Request:", filename, "Loop:", loop);
            
            // If current is playing the requested track, just make sure it's running
            if (this.current && this.current._filename === filename) {
                this.current.loop = loop;
                if (this.current.paused) {
                    this.current.play().catch(e => console.warn("BGM resume failed:", e));
                }
                return;
            }
            
            // Stop current playing BGM
            if (this.current) {
                this.current.pause();
            }
            
            // Get or create instance for this filename
            let audio = this.instances[filename];
            if (!audio) {
                audio = new Audio(`./${filename}`);
                audio.volume = 0.5;
                audio._filename = filename;
                this.instances[filename] = audio;
            }
            
            audio.loop = loop;
            audio.currentTime = 0;
            this.current = audio;
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("✅ [BGM] Playing started:", filename);
                }).catch(e => {
                    console.warn("⚠️ [BGM] Autoplay blocked or Load failed. Waiting for interaction.", e);
                    const forcePlay = () => {
                        if (this.current === audio) {
                            audio.play().catch(err => console.error("❌ [BGM] Force play failed:", err));
                        }
                        window.removeEventListener('click', forcePlay);
                        window.removeEventListener('touchstart', forcePlay);
                    };
                    window.addEventListener('click', forcePlay, { once: true });
                    window.addEventListener('touchstart', forcePlay, { once: true });
                });
            }
        } catch (err) {
            console.error("❌ [BGM] Error in play():", err);
        }
    },
    stop() {
        if (this.current) {
            console.log("⏹️ [BGM] Stop called.");
            this.current.pause();
            this.current.currentTime = 0;
            this.current = null; // Reset track pointer to prevent stale reuse
        }
    }
};

function updateBGM() {
    // 보스 단계인지 확인
    const bossStages = [25, 30, 35, 40];
    if (bossStages.includes(currentStage)) {
        BGM.play('boss_bgm_new.m4a');
        return;
    }

    // 스테이지 범위에 따른 배경음악 변경
    if (currentStage >= 1 && currentStage <= 10) {
        BGM.play('stage_1_10_bgm.m4a'); 
    } else if (currentStage >= 11 && currentStage <= 20) {
        BGM.play('stage_1_20_bgm.m4a');
    } else if (currentStage >= 21 && currentStage <= 30) {
        BGM.play('stage_21_30.m4a'); // [MOD] 21~30단계 전용 BGM으로 교체
    } else if (currentStage >= 31 && currentStage <= 40) {
        BGM.play('terminal_velocity.m4a');
    } else {
        BGM.play('terminal_velocity.m4a');
    }
}

function handleStageClear() {
    console.log(`${currentStage} 스테이지 클리어!`);
    
    if (currentStage === 40) {
        gameClear();
        return;
    }
    
    // 10단위 스테이지면 특별 전환 화면, 아니면 일반 다음 단계
    if (currentStage % 10 === 0) {
        triggerTransition();
    } else {
        currentStage++;
        thisStageCoins = 0; // [중요] 다음 단계를 위해 현재 스테이지 코인 리셋
        updateBGM();
        saveData(); // 변경사항 즉시 저장
        
        // 스테이지 메시지 표시를 위한 타이머 설정
        stageMessageTimer = 180;
        console.log(`이제 ${currentStage} 단계를 시작합니다.`);
    }
}

let transitionRAF = null;
function triggerTransition() {
    isPaused = true;
    BGM.stop();
    BGM.play('stage_complete_new.m4a', false); // [MOD] 새 파일명으로 교체 (스테이지 컴플리트 30초 뿅뿅)

    const screen = safeGetElement('transitionScreen');
    const progress = safeGetElement('transitionProgress');
    const btn = safeGetElement('transitionStartBtn');
    
    screen.classList.remove('hidden');
    screen.classList.add('active');

    let startTime = Date.now();
    const duration = 15000; // 15초

    const updateTimer = () => {
        let elapsed = Date.now() - startTime;
        let remaining = Math.max(0, duration - elapsed);
        let percent = (remaining / duration) * 100;
        progress.style.width = `${percent}%`;

        if (elapsed >= duration) {
            completeTransition();
        } else if (isPaused) {
            transitionRAF = requestAnimationFrame(updateTimer);
        }
    };
    transitionRAF = requestAnimationFrame(updateTimer);

    btn.onclick = () => {
        completeTransition();
    };
}

function completeTransition() {
    if (transitionRAF) {
        cancelAnimationFrame(transitionRAF);
        transitionRAF = null;
    }
    safeGetElement('transitionScreen').classList.add('hidden');
    safeGetElement('transitionScreen').classList.remove('active');
    
    BGM.stop();
    currentStage++;
    thisStageCoins = 0; // [NEW] 10단위 스테이지 클리어 후 초기화
    updateBGM();
    isPaused = false;
    saveData();
    
    // [FIX] 중단되었던 게임 루프를 다시 시작
    gameLoop();
}

// [NEW] 18단계: 악기 소리 (바이올린, 북, 탬버린)
function playInstrumentSound(instSymbol) {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    if (instSymbol === '🎻') { // 바이올린 (Vibrato + Slow Attack)
        const osc = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        const gain = audioCtx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        
        // Vibrato
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(6, now); // 6Hz 비브라토
        lfoGain.gain.setValueAtTime(10, now); // 피치 변동 폭
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        // 활로 켜는 듯한 서서히 커지는 어택
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.2); // 느린 어택
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6); // 릴리즈
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(); lfo.start(); 
        osc.stop(now + 0.6); lfo.stop(now + 0.6);
    } else if (instSymbol === '🥁') { // 북 (Sharp Pitch Drop + Noise Thud)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle'; // 사인보단 약간 배음이 있는 질감
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.05); // 매우 급격하게 떨어짐
        
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(); osc.stop(now + 0.2);
        
        // 추가 타격 노이즈
        const bufSize = audioCtx.sampleRate * 0.05;
        const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1000, now);
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        src.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        src.start(now);
    } else if (instSymbol === '🔔') { // 맑은 종소리 (여러 사인파 합성)
        const freqs = [1000, 2010, 3050]; // 종 특유의 비배음렬
        freqs.forEach(freq => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8); // 긴 여운
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(); osc.stop(now + 0.8);
        });
    }
}

// [NEW] 8단계: 풍물놀이 악기 소리 합성 (장구, 북, 꽹과리, 징, 소고)
function playPungmulSound(instrument) {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    // 공통 헬퍼: 꽹과리 음역대 단성 합성
    function synthKkwaenggwari(time, duration, volume, isMuffled = false) {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const osc3 = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        const mainGain = audioCtx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(isMuffled ? 800 : 950, time);
        osc1.frequency.exponentialRampToValueAtTime(isMuffled ? 750 : 900, time + duration);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(isMuffled ? 1200 : 1450, time);
        osc2.frequency.exponentialRampToValueAtTime(isMuffled ? 1150 : 1400, time + duration * 0.8);

        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(isMuffled ? 1800 : 2200, time);

        // LFO 진동
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(isMuffled ? 35 : 24, time); // 째쨍쨍쨍 느낌
        lfoGain.gain.setValueAtTime(isMuffled ? 15 : 8, time);
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        mainGain.gain.setValueAtTime(volume, time);
        mainGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc1.connect(mainGain);
        osc2.connect(mainGain);
        osc3.connect(mainGain);
        mainGain.connect(audioCtx.destination);

        osc1.start(time); osc2.start(time); osc3.start(time); lfo.start(time);
        osc1.stop(time + duration); osc2.stop(time + duration); osc3.stop(time + duration); lfo.stop(time + duration);
    }

    // 공통 헬퍼: 징 음역대 단성 합성
    function synthJing(time, duration, volume) {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        const mainGain = audioCtx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(115, time);
        osc1.frequency.linearRampToValueAtTime(110, time + duration);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(230, time);
        osc2.frequency.linearRampToValueAtTime(220, time + duration * 0.8);

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(6.5, time);
        lfoGain.gain.setValueAtTime(0.05, time);
        lfo.connect(lfoGain);
        lfoGain.connect(mainGain.gain);

        mainGain.gain.setValueAtTime(volume, time);
        mainGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc1.connect(mainGain);
        osc2.connect(mainGain);
        mainGain.connect(audioCtx.destination);

        osc1.start(time); osc2.start(time); lfo.start(time);
        osc1.stop(time + duration); osc2.stop(time + duration); lfo.stop(time + duration);
    }

    // 공통 헬퍼: 북 가죽 소리 합성
    function synthBuk(time, duration, volume, frequencyStart, frequencyEnd) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequencyStart, time);
        osc.frequency.exponentialRampToValueAtTime(frequencyEnd, time + duration * 0.35);

        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time); osc.stop(time + duration);

        // 가죽 노이즈 필터링 추가
        const bufSize = audioCtx.sampleRate * duration;
        const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, time);

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(volume * 0.25, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.45);

        src.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        src.start(time); src.stop(time + duration);
    }

    // 공통 헬퍼: 소고/장구 열채 나무 타격 합성
    function synthSogoTap(time, duration, volume, frequencyStart, frequencyEnd) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequencyStart, time);
        osc.frequency.exponentialRampToValueAtTime(frequencyEnd, time + duration * 0.5);

        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time); osc.stop(time + duration);
    }

    if (instrument === '꽹과리') {
        // 3음절 리듬: "갠 - 지 - 갱" (정통 꽹과리 호흡)
        // 1음절: 갠 (본 타격, 째쨍쨍)
        synthKkwaenggwari(now, 0.22, 0.20, false);
        // 2음절: 지 (손으로 막아 쇠막음한 짧은 리듬)
        synthKkwaenggwari(now + 0.11, 0.06, 0.08, true);
        // 3음절: 갱 (강하고 여운 있는 타격)
        synthKkwaenggwari(now + 0.20, 0.38, 0.22, false);

    } else if (instrument === '징') {
        // 3음절 리듬: "징 - 이 - 잉" (깊게 퍼지는 3중 맥놀이 파동)
        // 1음절: 징 (최초 묵직한 타격)
        synthJing(now, 0.7, 0.28);
        // 2음절: 이 (잔향 속에서 스며나오는 깊은 파동)
        synthJing(now + 0.32, 0.6, 0.16);
        // 3음절: 잉 (최종적으로 부풀며 길게 서서히 퍼지는 여운)
        synthJing(now + 0.65, 1.4, 0.26);

    } else if (instrument === '장구') {
        // 3음절 리듬: "덩 - 기 - 덕" (전통 사물놀이 장단의 꽃)
        // 1음절: 덩 (양손 합동 타격 - 열채 + 궁글채)
        synthBuk(now, 0.18, 0.38, 80, 45); // 궁글채 (쿵)
        synthSogoTap(now, 0.06, 0.20, 320, 160); // 열채 (덕)
        
        // 2음절: 기 (열채 채끝으로 가볍고 빠르게 가죽을 튀기는 소리)
        synthSogoTap(now + 0.10, 0.05, 0.12, 350, 220);
        
        // 3음절: 덕 (열채로 가죽 Rim을 딱 끊어 쳐주는 강한 타격)
        synthSogoTap(now + 0.21, 0.12, 0.28, 320, 150);

    } else if (instrument === '북') {
        // 3음절 리듬: "쿵 - 더 - 쿵" (심장 박동 같은 기백 넘치는 북장단)
        // 1음절: 쿵 (묵직한 첫 타)
        synthBuk(now, 0.28, 0.42, 140, 40);
        // 2음절: 더 (북 껍질 테두리를 빗겨 때리는 경쾌하고 가벼운 타)
        synthBuk(now + 0.13, 0.10, 0.18, 185, 75);
        // 3음절: 쿵 (다시 기백 있게 내리치는 강한 마무리 타)
        synthBuk(now + 0.25, 0.35, 0.38, 130, 35);

    } else if (instrument === '소고') {
        // 3음절 리듬: "딱 - 따 - 딱" (신명 나는 소고의 나무 프레임/가죽 연주)
        // 1음절: 딱
        synthSogoTap(now, 0.08, 0.22, 380, 220);
        // 2음절: 따
        synthSogoTap(now + 0.09, 0.06, 0.14, 400, 250);
        // 3음절: 딱
        synthSogoTap(now + 0.18, 0.14, 0.26, 380, 200);
    }
}

// [NEW] 4단계: 중국 전통악기 소리 합성 (얼후, 고쟁, 디쯔, 비파, 소나)
function playChineseInstrumentSound(instrument) {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    if (instrument === '얼후') {
        // 얼후: 2현의 활 연주. 애절하면서도 부드러운 바이올린/현악기 음색 + 비브라토
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(329.63, now); // E4 음
        osc.frequency.exponentialRampToValueAtTime(392.00, now + 0.35); // G4 음으로 슬라이드 (얼후 특유의 기교)

        // 전통적인 비브라토를 주는 LFO
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(6, now); // 6Hz 부드러운 비브라토
        lfoGain.gain.setValueAtTime(5, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(); lfo.start();
        osc.stop(now + 0.45); lfo.stop(now + 0.45);

    } else if (instrument === '고쟁') {
        // 고쟁: 다현 뜯기 악기. 펜타토닉(궁상각치우) 하프 형태의 빠른 흘림 기교(글리산도) 연주
        // C4, D4, E4, G4, A4 (도레미솔아) 빠르게 연속 뜯기
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00];
        scale.forEach((freq, idx) => {
            const time = now + idx * 0.06;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(time); osc.stop(time + 0.3);
        });

    } else if (instrument === '디쯔') {
        // 디쯔: 청공(울림막)이 있는 대나무 피리. 맑은 플루트 음색 + 고주파의 울림 비브라토
        const osc = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5 고음 피리음
        osc.frequency.linearRampToValueAtTime(659.25, now + 0.2); // E5 음으로 상행 장식음

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(9, now); // 9Hz 다소 빠른 청공 떨림
        lfoGain.gain.setValueAtTime(8, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(); lfo.start();
        osc.stop(now + 0.35); lfo.stop(now + 0.35);

    } else if (instrument === '비파') {
        // 비파: 4현 뜯기 류. 한 줄을 매우 빠르게 뜯는 트레몰로(룬지) 기교 구현 (따라라랑!)
        const scale = [440.0, 440.0, 440.0, 523.25];
        scale.forEach((freq, idx) => {
            const time = now + idx * 0.05;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.18, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(time); osc.stop(time + 0.15);
        });

    } else if (instrument === '소나') {
        // 소나: 태평소 계열 태평한 날카로운 홑적 태평소 혼. 불협 고조파 + 고볼륨 고압력 사운드
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(698.46, now); // F5
        osc1.frequency.linearRampToValueAtTime(783.99, now + 0.15); // G5 삐익!

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1396.92, now); // 옥타브 배음
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25); // 쨍하고 짧게 끝남

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.start(); osc2.start();
        osc1.stop(now + 0.25); osc2.stop(now + 0.25);
    }
}

// [NEW] 16단계: 인도 전통악기 소리 합성 (시타르, 타블라, 반수리, 셰나이, 사랑기)
function playIndianInstrumentSound(instrument) {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    if (instrument === '시타르') {
        // 시타르: 긴 목 현악기, 메탈릭한 자바리(Javari) 브릿지 쇳소리 울림 (팅~~잉~~)
        const osc = audioCtx.createOscillator();
        const delay = audioCtx.createDelay();
        const feedback = audioCtx.createGain();
        const mainGain = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(196.00, now); // G3 베이스 음
        // 피치가 살짝 늘어나는 전통 장식 기교(미라)
        osc.frequency.exponentialRampToValueAtTime(220.00, now + 0.25);

        // 짧은 피드백 딜레이로 시타르 특유의 쇳소리 금속 배음을 변조
        delay.delayTime.setValueAtTime(0.0012, now);
        feedback.gain.setValueAtTime(0.85, now);

        mainGain.gain.setValueAtTime(0.25, now);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(mainGain);
        mainGain.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay); // 딜레이 루프
        delay.connect(audioCtx.destination);
        mainGain.connect(audioCtx.destination);

        osc.start();
        osc.stop(now + 0.7);

    } else if (instrument === '타블라') {
        // 타블라: 한 쌍의 타악기. 바얀의 피치 상행 슬라이드("후웁" 베이스 톤) + 다야의 맑은 림 타격음
        // 1음절: 맑은 다야 림 타격("나/Na" - 높은 금속성 목재 음)
        const dayaSector = audioCtx.createOscillator();
        const dayaGain = audioCtx.createGain();
        dayaSector.type = 'triangle';
        dayaSector.frequency.setValueAtTime(330, now); // 고주파 맑은 소리
        dayaGain.gain.setValueAtTime(0.2, now);
        dayaGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        dayaSector.connect(dayaGain);
        dayaGain.connect(audioCtx.destination);
        dayaSector.start(); dayaSector.stop(now + 0.12);

        // 2음절: 바얀의 베이스 손바닥 기교("게/Ge" - 피치가 주르륵 올라가는 슬라이드)
        const bayanSector = audioCtx.createOscillator();
        const bayanGain = audioCtx.createGain();
        bayanSector.type = 'sine';
        bayanSector.frequency.setValueAtTime(90, now + 0.08);
        bayanSector.frequency.exponentialRampToValueAtTime(160, now + 0.32); // 90Hz -> 160Hz 상행!
        bayanGain.gain.setValueAtTime(0.35, now + 0.08);
        bayanGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        bayanSector.connect(bayanGain);
        bayanGain.connect(audioCtx.destination);
        bayanSector.start(now + 0.08); bayanSector.stop(now + 0.35);

    } else if (instrument === '반수리') {
        // 반수리: 대나무 플루트, 매우 부드럽고 호흡 섞인 중저음 피리 소리
        const osc = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(493.88, now + 0.25); // B4 부드러운 글라이딩

        // 먹먹한 대나무 느낌을 위해 로우패스 필터 적용
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(now + 0.4);

    } else if (instrument === '셰나이') {
        // 셰나이: 고대 Oboe, 금주 코가 막힌 듯 맹렬하고 날카로운 고조파 Reed 소리
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.linearRampToValueAtTime(554.37, now + 0.15); // C#5

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1174.66, now); // 2옥타브 배음

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.start(); osc2.start();
        osc1.stop(now + 0.3); osc2.stop(now + 0.3);

    } else if (instrument === '사랑기') {
        // 사랑기: 퉁퉁한 바이올린 계열 활 악기, 인도 특유의 애절하게 꺾이는 소리
        const osc = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        const gain = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(293.66, now); // D4
        osc.frequency.linearRampToValueAtTime(261.63, now + 0.1); // C4로 꺾임
        osc.frequency.linearRampToValueAtTime(293.66, now + 0.3); // 다시 D4로 회귀

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(7.5, now); // 정교한 비브라토
        lfoGain.gain.setValueAtTime(6, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(); lfo.start();
        osc.stop(now + 0.38); lfo.stop(now + 0.38);
    }
}

// [NEW] 17단계: 가전제품 오퍼레이션 소리 합성 (냉장고, TV, 세탁기, 선풍기, 전자레인지, 청소기)
function playApplianceSound(appliance) {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    if (appliance === '냉장고') {
        // 냉장고: 윙하는 콤프레셔 모터음(120Hz) + 문 오래 열릴 때의 비프멜로디 "딩-동!"
        const oscHum = audioCtx.createOscillator();
        const gainHum = audioCtx.createGain();
        oscHum.type = 'sine';
        oscHum.frequency.setValueAtTime(120, now);
        gainHum.gain.setValueAtTime(0.15, now);
        gainHum.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        oscHum.connect(gainHum);
        gainHum.connect(audioCtx.destination);
        oscHum.start(); oscHum.stop(now + 0.4);

        // "딩-동!" 멜로디 (E5 -> C5)
        const note1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        note1.type = 'sine';
        note1.frequency.setValueAtTime(659.25, now + 0.05); // E5
        gain1.gain.setValueAtTime(0.15, now + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        note1.connect(gain1);
        gain1.connect(audioCtx.destination);
        note1.start(now + 0.05); note1.stop(now + 0.25);

        const note2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        note2.type = 'sine';
        note2.frequency.setValueAtTime(523.25, now + 0.22); // C5
        gain2.gain.setValueAtTime(0.15, now + 0.22);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        note2.connect(gain2);
        gain2.connect(audioCtx.destination);
        note2.start(now + 0.22); note2.stop(now + 0.45);

    } else if (appliance === 'TV') {
        // TV: 브라운관 켤때의 삐익 고음 펄스(10000Hz -> 3000Hz) + 지지직 화이트 노이즈
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(10000, now);
        osc.frequency.exponentialRampToValueAtTime(3000, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(); osc.stop(now + 0.2);

        // 지지직 노이즈
        const bufSize = audioCtx.sampleRate * 0.15;
        const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.12, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        src.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        src.start(now);

    } else if (appliance === '세탁기') {
        // 세탁기: 물살이 세차게 회전하는 회전 진동(60Hz 베이스 파동) + 물 출렁이는 소리
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.35);
        
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(); osc.stop(now + 0.35);

        // 물 출렁 노이즈 필터링
        const bufSize = audioCtx.sampleRate * 0.35;
        const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.linearRampToValueAtTime(200, now + 0.35);
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.18, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        src.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        src.start(now);

    } else if (appliance === '선풍기') {
        // 선풍기: "쉬이이이잉" 고풍량 팬 바람 소리 (핑크 노이즈 스윕)
        const bufSize = audioCtx.sampleRate * 0.35;
        const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        src.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        src.start(now);

    } else if (appliance === '전자레인지') {
        // 전자레인지: 완료 알람의 맑고 높은 "딩!" (2000Hz 사인파 땡그랑음)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, now);
        
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(); osc.stop(now + 0.4);

    } else if (appliance === '청소기') {
        // 청소기: 고진공 모터 흡입음 (1000Hz에서 250Hz로 하강하는 날카로운 사이렌 톤 모터 사운드)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.35);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(); osc.stop(now + 0.35);
    }
}

const canvas = document.getElementById('gameCanvas');

const ctx = canvas.getContext('2d');

// 플레이어 외형 진화 스프라이트 에셋 (단계별 투명화 캔버스 저장용)
const playerSprites = {
    1: null, 2: null, 3: null, 4: null
};

// AI가 생성한 이미지의 하얀색/검은색 박스(배경색)를 자동으로 투명하게 뚫어주는 함수
function loadAndRemoveBackground(src, level) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const octx = offCanvas.getContext('2d');
        octx.drawImage(img, 0, 0);

        try {
            const imgData = octx.getImageData(0, 0, offCanvas.width, offCanvas.height);
            const data = imgData.data;
            // 좌상단(0,0) 픽셀을 배경색 기준으로 삼음 (주로 흰색이나 검은색 영역)
            const bgR = data[0], bgG = data[1], bgB = data[2];

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
                // 배경색과 오차범위 70 이내로 유사하거나, 완전한 흰색에 가까우면 투명화
                const isBgColor = Math.abs(r - bgR) < 70 && Math.abs(g - bgG) < 70 && Math.abs(b - bgB) < 70;
                const isVeryLight = r > 200 && g > 200 && b > 200; // 밝은 색 영역 광범위 타겟팅

                if (isBgColor || isVeryLight) {
                    data[i + 3] = 0;
                }
            }
            octx.putImageData(imgData, 0, 0);
            playerSprites[level] = offCanvas; // 투명화가 완료된 캔버스를 에셋으로 사용
        } catch (e) {
            console.warn("Canvas CORS/Data access blocked. Using original image with background potential.", e);
            playerSprites[level] = img; // 로컬 보안 에러 시 원본 이미지 대체
        }
    };
}

loadAndRemoveBackground('player_lv1.png', 1);
loadAndRemoveBackground('player_lv2.png', 2);
loadAndRemoveBackground('player_lv3.png', 3);
loadAndRemoveBackground('player_lv4.png', 4);

// 적군 레이싱 카 에셋 로드 (개별 고화질 이미지로 교체)
const racingCarSprites = { imgs: [] };
const carSources = ['car_new_1.png', 'car_new_2.png', 'car_new_3.png'];

carSources.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const octx = offCanvas.getContext('2d');
        octx.drawImage(img, 0, 0);

        try {
            const imgData = octx.getImageData(0, 0, img.width, img.height);
            const data = imgData.data;
            const bgR = data[0], bgG = data[1], bgB = data[2];
            for (let j = 0; j < data.length; j += 4) {
                const r = data[j], g = data[j + 1], b = data[j + 2], a = data[j + 3];
                const isBgColor = Math.abs(r - bgR) < 60 && Math.abs(g - bgG) < 60 && Math.abs(b - bgB) < 60;
                const isVeryLight = r > 200 && g > 200 && b > 200;

                if (isBgColor || isVeryLight) {
                    data[j + 3] = 0;
                }
            }
            octx.putImageData(imgData, 0, 0);
            racingCarSprites.imgs.push(offCanvas);
        } catch (e) {
            racingCarSprites.imgs.push(img);
        }
    };
});

// 8단계 행성 이미지 로드
const planetSprites = {};
const planetSources = {
    'mars': 'planet_mars.png',
    'jupiter': 'planet_jupiter.png',
    'saturn': 'planet_saturn.png',
    'uranus': 'planet_uranus.png',
    'earth': 'planet_earth.png',
    'moon': 'planet_moon.png'
};

Object.keys(planetSources).forEach(key => {
    const img = new Image();
    img.src = planetSources[key];
    img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const octx = offCanvas.getContext('2d');
        if (!octx) { planetSprites[key] = img; return; }
        octx.drawImage(img, 0, 0);
        try {
            const imgData = octx.getImageData(0, 0, img.width, img.height);
            const data = imgData.data;
            // [개선] 행성 이미지의 까만색 배경 제거 (Chroma Key)
            for (let j = 0; j < data.length; j += 4) {
                const r = data[j], g = data[j + 1], b = data[j + 2];
                if (r < 15 && g < 15 && b < 15) { // 완전 검정색에 가까우면 투명화
                    data[j + 3] = 0;
                }
            }
            octx.putImageData(imgData, 0, 0);
            planetSprites[key] = offCanvas;
        } catch (e) {
            planetSprites[key] = img;
        }
    };
});

// [NEW] 12단계 팬더 몸통 에셋 로드 (대표님 요청 "몸통까지 그려줘" + 고화질 v4 에셋 적용)
const pandaSprite = { img: null };
function loadPandaSprite(src) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const octx = offCanvas.getContext('2d');
        if (!octx) { pandaSprite.img = img; return; }
        octx.drawImage(img, 0, 0);
        try {
            const imgData = octx.getImageData(0, 0, img.width, img.height);
            const data = imgData.data;
            // [개선] v4 에셋의 파란색(Chroma Key) 배경 제거 및 경계선(안티앨리어싱) 부드럽게 처리
            for (let j = 0; j < data.length; j += 4) {
                const r = data[j], g = data[j + 1], b = data[j + 2];
                // 파란색이 다른 색상보다 얼마나 더 강한지 측정
                const blueDiff = b - Math.max(r, g);
                
                if (blueDiff > 30) {
                    // 경계선 페더링 (값이 클수록 투명하게, 작을수록 불투명하게 그라데이션)
                    const alphaRaw = 255 - (blueDiff - 30) * 4;
                    data[j + 3] = Math.max(0, Math.min(255, alphaRaw));
                }
            }
            octx.putImageData(imgData, 0, 0);
            pandaSprite.img = offCanvas;
        } catch (e) {
            console.warn("Panda BG removal failed:", e);
            pandaSprite.img = img;
        }
    };
    img.onerror = () => { console.warn("Panda image load failed:", src); };
}
loadPandaSprite('panda_sprite_v4.png');

// UI 엘리먼트 가져오기
const uiLayer = safeGetElement('uiLayer');
const scoreValue = safeGetElement('scoreValue');
const stageInfoDisplay = safeGetElement('scoreValue'); // scoreValue를 스테이지 표시로도 활용
const coinValue = safeGetElement('coinValue');
const finalScoreValue = safeGetElement('finalScoreValue');
const acquiredCoinValue = safeGetElement('acquiredCoinValue');

const startScreen = safeGetElement('startScreen');
const gameOverScreen = safeGetElement('gameOverScreen');
const gameClearScreen = safeGetElement('gameClearScreen');
const shopScreen = safeGetElement('shopScreen');

const bossHpContainer = safeGetElement('bossHpContainer');
const bossName = safeGetElement('bossName');
const bossHpText = safeGetElement('bossHpText');
const bossHpBar = safeGetElement('bossHpBar');

const startBtn = safeGetElement('startBtn');
const restartBtn = safeGetElement('restartBtn');
const playAgainBtn = safeGetElement('playAgainBtn');
console.log("Buttons found:", {startBtn:!!startBtn, restartBtn:!!restartBtn, playAgainBtn:!!playAgainBtn});
const shopBtn = safeGetElement('shopBtn');
const closeShopBtn = safeGetElement('closeShopBtn');

const shopCoinValue = safeGetElement('shopCoinValue');
const costFireRateElement = safeGetElement('costFireRate');
const costMultiShotElement = safeGetElement('costMultiShot');
const upgFireRateBtn = safeGetElement('upgFireRateBtn');
const upgMultiShotBtn = safeGetElement('upgMultiShotBtn');

// [NEW] 상점 추가 버튼들
const costEnemySpeedElement = safeGetElement('costEnemySpeed');
const upgEnemySpeedBtn = safeGetElement('upgEnemySpeedBtn');
const costLaserElement = safeGetElement('costLaser');
const upgLaserBtn = safeGetElement('upgLaserBtn');
const adCoinShopBtn = safeGetElement('adCoinShopBtn');

const adReviveBtn = safeGetElement('adReviveBtn');
const adDoubleCoinBtn = safeGetElement('adDoubleCoinBtn');
const clearScoreValue = safeGetElement('clearScoreValue');
const clearCoinValue = safeGetElement('clearCoinValue');
const debugPanel = safeGetElement('debugPanel');
const debugStageInfo = safeGetElement('debugStageInfo');
const btnStageUp = safeGetElement('btnStageUp');
const btnStageDown = safeGetElement('btnStageDown');
const btnCoinCheat = safeGetElement('btnCoinCheat');
const btnHardReset = safeGetElement('btnHardReset');

// [NEW] HUD 퀵 업그레이드 버튼
const btnQuickFireRate = safeGetElement('btnQuickFireRate');
const btnQuickMultiShot = safeGetElement('btnQuickMultiShot');
const btnQuickEnemySlow = safeGetElement('btnQuickEnemySlow');

// [NEW] 자석 및 2배 광고 UI 요소
const btnMagnetUpg = safeGetElement('btnMagnetUpg');
const magnetCostDisplay = safeGetElement('magnetCost');
const doubleCoinTimerDisplay = safeGetElement('doubleCoinTimerDisplay');
const adDoubleCoinTimedBtn = safeGetElement('adDoubleCoinTimedBtn');

// [MOD] 개발자 전용 패널 숨김 처리 (실제 사용자에게는 노출되지 않음)
// URL 파라미터에 ?debug=true 를 입력한 경우에만 테스트 패널이 활성화됩니다.
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('debug') === 'true') {
    if (debugPanel) {
        debugPanel.style.display = 'flex';
        debugPanel.style.pointerEvents = 'auto'; // 확실하게 클릭 가능하도록 설정
    }
} else {
    if (debugPanel) debugPanel.style.display = 'none';
}

// 캔버스 크기 - 화면에 꽉 차게 설정
let CANVAS_WIDTH = window.innerWidth;
let CANVAS_HEIGHT = window.innerHeight;

function resizeCanvas() {
    CANVAS_WIDTH = window.innerWidth;
    CANVAS_HEIGHT = window.innerHeight;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
}

// 초기 로드 시 캔버스 크기 맞추기 및 리사이즈 이벤트 등록
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


// ==========================================
// 게임 상태 변수들
// ==========================================
let isPlaying = false;
let isPaused = false; // [NEW] 스테이지 전환 시 일시정지용
let animationId;
let score = 0;
let thisGameCoins = 0; // 이번 판에서 얻은 코인
let totalCoins = 0;    // 내 계정에 누적된 코인 (DB 모사)

let player; // 전역 플레이어 객체

// 게임 오브젝트 배열 관리
let bullets = [];
let enemies = [];
let particles = [];
let coins = [];

// ==========================================
// 스테이지 (20단계 레벨업) 테마 풀 (Target Objects)
// ==========================================
let currentStage = 1;
let prevStage = 1;
let coinsPerStage = 10000; // [NEW] 스테이지 클리어 기준 코인 수
let stageMessageTimer = 0; // 스테이지 전환 알림 텍스트 타이머
let thisStageCoins = 0; // [FIX] 현재 스테이지 진행도 변수 (유저 요청 명칭)

// 각 스테이지별로 유저가 부숴야 할 타겟들 (이모지 기반)
const stageTargetPools = {
    1: ['🛩️', '🚁'],       // 1단계: 비행기
    2: ['🍽️', '🥣'],       // 2단계: 접시 (쨍그랑!)
    3: ['🚗', '🚕', '🚓'], // 3단계: 자동차 (스프라이트 시트 사용)
    4: ['얼후', '고쟁', '디쯔', '비파', '소나'], // 4단계: 중국 전통악기
    5: ['🍰', '🍪', '🍞', '🧁', '🍩'], // 5단계: 케이크, 쿠키, 빵 (테마 변경)
    6: ['💡', '🔦', '🏮', '🕯️', '✨'], // 6단계: 조명 (전구, 손전등, 등불, 양초) - 유리 깨지는 소리 적용
    7: ['🥢', '🍴', '🥄', '🥘', '🍳', '🥣'], // 7단계: 식기류 (냄비, 프라이팬, 도마 대용 그릇 추가)
    8: ['장구', '북', '꽹과리', '징', '소고'], // 8단계: 한국 전통 풍물놀이 악기
    9: ['🍎', '🍐', '🥭', '🍑', '🍋', '🍈', '🍌', '🍍', '🍉', '🍅', '🍓'], // 9단계: 과일 (바나나, 파인애플, 수박, 토마토, 딸기 추가)
    10: ['⚽', '🏀', '🏈', '⚾', '🎾', '⚪'], // 10단계: 스포츠 공 (테니스공, 골프공 대용 추가)
    11: ['💎', '💰', '👑', '💵'], // 11단계: 보석/골드 (땡그랑!)
    12: ['🐰', '🐶', '🐱', '🧸', '🐼'], // 12단계: 동물 인형 (토끼, 강아지, 고양이 추가 / 깨짐 현상 방지를 위해 이모지 최적화)
    13: ['☀️', '⭐', '🌟', '✨', '🎆', '🎇'], // 13단계: 별 & 폭죽 추가
    14: ['🍕', '🍔', '🍟', '🍦', '🍗'], // 14단계: 패스트푸드 (치킨 머리 제거, 프라이드 치킨 유지)
    15: ['🎈', '🎁', '🎉', '🎀', '🎊', '🥳', '🎂'], // 15단계: 파티 용품 추가
    16: ['시타르', '타블라', '반수리', '셰나이', '사랑기'], // 16단계: 인도 전통악기
    17: ['냉장고', 'TV', '세탁기', '선풍기', '전자레인지', '청소기'], // 17단계: 가전제품

    18: ['🎻', '🥁', '🔔'], // 18단계: 악기 (바이올린, 북, 탬버린/종)
    19: ['🦑', '🐙', '🦞', '🦐', '🦀'], // 19단계: 해산물 + 새우/꽃게 추가
    20: ['🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏙️', '🛖', '🏘️', '🌲'], // 20단계: 건물/집
    21: ['☁️', '🎈', '🐦', '🫧'], // 21단계: 상쾌한 아침 비행 (구름, 풍선, 참새, 비눗방울)
    22: ['🐱', '👕', '📡', '🏺'], // 22단계: 지붕 위 소동 (고양이, 빨래, 안테나, 장독대)
    23: ['🪃', '🐶', '🛸', '🏀'], // 23단계: 분주한 공원 (부메랑, 강아지, 드론, 농구공)
    24: ['🍎', '🐟', '🛵', '💥'], // 24단계: 시끌벅적 시장통 (과일, 고등어, 오토바이, 뻥튀기기계)
    25: ['🚌'],                // 25단계: [보스] 꽉 막힌 퇴근길 (대형 2층 버스)
    26: ['🍭', '🍪', '🧇', '🧸'], // 26단계: 달콤한 과자 숲 (사탕, 초코칩, 웨하스, 젤리곰)
    27: ['🍦', '🍒', '🧇', '🧊'], // 27단계: 아이스크림 동산 (소프트콘, 체리, 와플, 얼음)
    28: ['🍞', '🥐', '🧁', '🍩'], // 28단계: 빵빵한 베이커리 (식빵, 크루아상, 슈크림, 도넛)
    29: ['🍉', '🍇', '🍍', '🍌'], // 29단계: 상큼한 과일 파라다이스 (수박, 포도, 파인애플, 바나나껍질)
    30: ['🎂'],                // 30단계: [보스] 자이언트 생일 케이크 (대형 3단 케이크)
    31: ['🧱', '🧩', '🏎️', '🏰'], // 31단계: 레고 블록 성
    32: ['🧸', '🧶', '☃️', '🔔'], // 32단계: 푹신푹신 인형의 집
    33: ['🧹', '🤖', '🔩', '📦'], // 33단계: 씽씽 로봇 공장
    34: ['👾', '🕹️', '🪙', '🧱'], // 34단계: 추억의 오락실
    35: ['🤖'],                // 35단계: [보스] 슈퍼 합체 로봇
    36: ['⭐', '☄️', '🌌', '🕳️'], // 36단계: 반짝이는 은하수
    37: ['🐰', '🌕', '🌠', '🥣'], // 37단계: 달토끼의 공장
    38: ['🪐', '🌫️', '🛸', '🛰️'], // 38단계: 신비로운 토성 고리
    39: ['☀️', '☄️', '💨', '🌑'], // 39단계: 타오르는 태양
    40: ['👑'],               // 40단계: [최종 보스] 골든 엠페러 크라운
};

// 적 스폰 관련
let lastSpawntime = 0;
let spawnInterval = 750; // 초기 0.75초마다 생성 (기존 대비 2배 빠름!)
let enemySpeedMultiplier = 1; // 시간이 지날수록 빨라지는 배율

// 업그레이드 스탯 변수 (레벨 기반 & 진화형으로 개편)
let fireRateLevel = 1;
let multiShotLevel = 1;
let enemySlowLevel = 1;

let currentFireRate = 180; // 기본 발사 쿨타임 (ms)
let currentMultiShot = 1;   // 기본 1발 시작 (업그레이드 시 V자 -> 방사형)
let baseEnemySpeedMultiplier = 1.0;

let costFireRate = 1000;
let costMultiShot = 1000;
let costEnemySlow = 1000;

let costEnemySpeed = 1000; // 기존 변수 (HUD 연동 시 costEnemySlow로 대체/혼용 가능)
let costLaser = 5000;
let currentLaserActive = false;

// 모의 광고 시청 여부 리미터
let isRevived = false;
let isDoubleCoinMode = false;
let doubleCoinTimer = 0; // 5분 = 300초 (초 단위 관리)
let coinsAlreadyAdded = 0;

// [NEW] 자석 시스템 스탯
let magnetRange = 100;
let costMagnetRange = 1000;

// [ADD] 데이터 저장 및 로드 로직
function saveData() {
    const data = {
        totalCoins: totalCoins,
        fireRateLevel: fireRateLevel,
        multiShotLevel: multiShotLevel,
        enemySlowLevel: enemySlowLevel,
        magnetRange: magnetRange,
        costFireRate: costFireRate,
        costMultiShot: costMultiShot,
        costEnemySlow: costEnemySlow,
        costMagnetRange: costMagnetRange,
        costEnemySpeed: costEnemySpeed,
        costLaser: costLaser
    };
    localStorage.setItem('airplaneShooterData', JSON.stringify(data));
}

function loadData() {
    console.log("데이터 로드 시도 중...");
    const saved = localStorage.getItem('airplaneShooterData');
    
    // [핵심] 새로고침 시 무조건 초기화되는 변수들
    currentStage = 1;
    thisStageCoins = 0;
    score = 0;

    if (saved) {
        try {
            const data = JSON.parse(saved);
            const sanitize = (val, def = 0) => Math.max(0, Math.floor(Number(val) || def));

            fireRateLevel = sanitize(data.fireRateLevel, 1);
            multiShotLevel = sanitize(data.multiShotLevel, 1);
            enemySlowLevel = sanitize(data.enemySlowLevel, 1);
            magnetRange = sanitize(data.magnetRange, 100);

            costFireRate = sanitize(data.costFireRate, 1000);
            costMultiShot = sanitize(data.costMultiShot, 1000);
            costEnemySlow = sanitize(data.costEnemySlow, 1000);
            costMagnetRange = sanitize(data.costMagnetRange, 2000);
            costEnemySpeed = sanitize(data.costEnemySpeed, 1000);
            costLaser = sanitize(data.costLaser, 5000);

            totalCoins = sanitize(data.totalCoins, 0);
        } catch (e) {
            console.error("Data load error:", e);
        }
    }
    updateHUD();
    updateShopUI();
}

function updateHUD() {
    if (stageInfoDisplay) {
        // [LV.X] Score: 0 형식으로 표시 (scoreValue 엘리먼트 활용)
        stageInfoDisplay.innerText = `[LV.${currentStage}] Score: ${Math.floor(score).toLocaleString()}`;
    }
    if (coinValue) {
        const displayCoins = Math.max(0, Math.floor(totalCoins / 100) * 100);
        coinValue.innerText = displayCoins.toLocaleString();
    }
    if (debugStageInfo && debugStageInfo.id !== 'dummy') {
        debugStageInfo.innerText = `Current Stage: LV.${currentStage}`;
    }
}

// [ADD] Load saved data on startup (모든 글로벌 변수 선언 후 실행)
loadData();

// ==========================================
// 사용자 입력 (마우스 / 터치) 처리 객체
// ==========================================
const mouse = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    isDown: false
};

// ==========================================
// Player (내 기체) 클래스 구현
// ==========================================
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.color = '#00ffcc'; // 우주 테마에 어울리는 네온 컬러
        this.speed = 0.2; // 이동 속도 계수 상향 (0.1 -> 0.2)
        this.lastShotTime = 0;
        this.fireRate = 180; // 기본 발사 쿨타임 (ms)
        this.powerup = null; // 'red', 'blue', 'fire'
        this.powerupTimer = 0;
        this.slowTimer = 0;
        this.stunTimer = 0;
        this.blindTimer = 0;
    }

    update() {
        if (this.powerupTimer > 0) {
            this.powerupTimer -= 16.6;
            if (this.powerupTimer <= 0) {
                this.powerup = null;
            }
        }
        
        // [NEW] 상태 이상 타이머 처리
        if (this.slowTimer > 0) this.slowTimer -= 16.6;
        if (this.stunTimer > 0) this.stunTimer -= 16.6;
        if (this.blindTimer > 0) this.blindTimer -= 16.6;

        // 부드럽게 마우스(터치) 위치로 따라가기 (Lerp 효과)
        let targetSpeed = this.speed;
        if (this.slowTimer > 0) targetSpeed *= 0.5; // 속도 저하
        if (this.stunTimer > 0) targetSpeed = 0;    // 조작 불능

        this.x += (mouse.x - this.x) * targetSpeed;
        this.y += (mouse.y - this.y) * targetSpeed;

        // 화면 밖으로 나가지 못하게 제한
        if (this.x < this.width / 2) this.x = this.width / 2;
        if (this.x > CANVAS_WIDTH - this.width / 2) this.x = CANVAS_WIDTH - this.width / 2;
        if (this.y < this.height / 2) this.y = this.height / 2;
        if (this.y > CANVAS_HEIGHT - this.height / 2) this.y = CANVAS_HEIGHT - this.height / 2;

        this.fire(); // 매 프레임마다 발사 시도
    }

    draw() {
        // [MOD] 오라 효과 제거 - 대표님 지시 (깔끔한 UI 유지)

        ctx.save();
        ctx.translate(this.x, this.y);

        // 스테이지에 따라 진화하는 기체 이미지 선택
        let currentImg = playerSprites[1];
        if (currentStage >= 6 && currentStage <= 10) currentImg = playerSprites[2];
        else if (currentStage >= 11 && currentStage <= 15) currentImg = playerSprites[3];
        else if (currentStage >= 16) currentImg = playerSprites[4];

        // 투명화된 캔버스가 로드되었으면 렌더링 (사이즈를 60 정도로 듬직하게 조정)
        if (currentImg) {
            const size = 60;
            ctx.drawImage(currentImg, -size / 2, -size / 2, size, size);
        } else {
            // 아직 로드 안 됐을 땐 임시 사각형으로 땜빵
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        // [MOD] 추진력 불꽃 제거 (대표님 요청)

        ctx.restore();
    }

    // [NEW] 레벨에 따른 총알 색상 반환 (진화 시각 효과)
    getBulletColor() {
        if (fireRateLevel >= 15) return '#ff00ff'; // 마젠타 (초강력)
        if (fireRateLevel >= 10) return '#ffff00'; // 골드/옐로우
        if (fireRateLevel >= 5)  return '#00ff00'; // 네온 그린
        return '#00ffff'; // 기본 네온 블루
    }

    fire() {
        const currentTime = Date.now();
        
        // 레벨에 따라 공속 계산 (최소 50ms)
        const calcFireRate = Math.max(50, 180 - (fireRateLevel - 1) * 10);
        
        if (currentTime - this.lastShotTime > calcFireRate) {
            if (currentLaserActive) {
                // [SPECIAL] Ultimate Piercing Laser (상점 특별 아이템)
                const b = new Bullet(this.x, this.y - this.height / 2, 0, -35);
                b.color = '#ff00ff';
                b.width = 15;
                b.height = 60;
                b.damage = 100;
                b.isPiercing = true;
                bullets.push(b);
            } else {
                // 1. 총알 개수 계산 (아이템 없을 시 기본 1발 시작으로 대표님 요청사항 적용!)
                let totalBulletCount = 1; 
                if (this.powerup === 'fire') totalBulletCount = 4;        // 불 뿜는 총알 (4발)
                else if (this.powerup === 'blue') totalBulletCount = 3;   // 세개짜리 총알 (3발)
                else if (this.powerup === 'red') totalBulletCount = 2;    // 두개짜리 총알 (2발)

                // 2. 부채꼴 발사 (Loop & Angle) 계산
                // 총알 개수가 많아질수록 퍼지는 각도를 유동적으로 조절
                let maxSpread = Math.min(80, 10 + totalBulletCount * 5); 
                if (this.powerup === 'fire') maxSpread *= 2; // 방사 각도 2배
                
                for (let i = 0; i < totalBulletCount; i++) {
                    let angle = 0;
                    if (totalBulletCount > 1) {
                        // 중앙을 기준으로 대칭되게 각도 분산
                        angle = -maxSpread / 2 + (i * (maxSpread / (totalBulletCount - 1)));
                    }
                    
                    const rad = angle * Math.PI / 180;
                    const vx = Math.sin(rad) * 25;
                    const vy = -Math.cos(rad) * 25;
                    
                    const b = new Bullet(this.x, this.y - this.height / 2, vx, vy);
                    
                    // 기본 데미지 설정: 상점 MLT 레벨 연동 (MLT 레벨당 공격력 추가!)
                    b.damage = multiShotLevel;
                    
                    // 3. 색상 부여 (아이템 색상 우선, 없으면 상점 레벨 색상)
                    if (this.powerup === 'red') b.color = '#ff3333';
                    else if (this.powerup === 'blue') b.color = '#3333ff';
                    else if (this.powerup === 'fire') b.color = '#ff9900';
                    else b.color = this.getBulletColor();

                    // 총알 색상에 따른 굵기 확대 (모든 진화/파워업 총알 굵기 상향!)
                    const thickColors = ['#00ffff', '#3333ff', '#ff3333', '#00ff00', '#ffff00', '#ff00ff'];
                    if (thickColors.includes(b.color)) {
                        b.width = 12;
                    }

                    // 4. 주황템('fire') 상태 특수 효과 부여
                    if (this.powerup === 'fire') {
                        b.damage = 5 + multiShotLevel; // 주황템도 기본 MLT 레벨 연동 보너스 데미지 적용
                        b.isPiercing = true;
                        b.width = 24; // 훨씬 굵게 불같이
                        b.isFire = true; // 불 시각 효과용 플래그
                    }
                    
                    bullets.push(b);
                }
            }
            playLaserSound(); 
            this.lastShotTime = currentTime;
        }
    }
}

// ==========================================
// Bullet (총알) 클래스
// ==========================================
class Bullet {
    constructor(x, y, vx = 0, vy = -25) {
        this.x = x;
        this.y = y;
        this.width = 3;
        this.height = 20;
        this.radius = 4;
        this.vx = vx;
        this.vy = vy;
        this.color = '#00ffff';
        this.damage = 1; // 기본 데미지
        this.isPiercing = false; // [NEW] 관통 속성 추가
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y + this.height < 0 || this.x < 0 || this.x > CANVAS_WIDTH) this.markedForDeletion = true;
    }

    draw() {
        ctx.save(); // [FIX] Canvas 상태 저장하여 shadowBlur 등이 다른 곳에 새어 나가지 않게 함
        ctx.fillStyle = this.color;

        if (this.isFire) {
            // 불타는 느낌 연출 (울퉁불퉁한 다각형)
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.height);
            ctx.lineTo(this.x + this.width / 2 + Math.random() * 4, this.y + this.height / 2);
            ctx.lineTo(this.x, this.y + this.height + Math.random() * 4);
            ctx.lineTo(this.x - this.width / 2 - Math.random() * 4, this.y + this.height / 2);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#ffff66'; // 중심부 노란색 빛
            ctx.fillRect(this.x - 2, this.y, 4, this.height / 2);
        } else {
            // 가는 직선 형태의 레이저 렌더링
            ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
            ctx.fillStyle = '#ffffff'; // 중심부 흰색으로 더 밝게 처리
            ctx.fillRect(this.x - 1, this.y, 2, this.height);
        }
        ctx.restore(); // [FIX] 상태 복구
    }
}

// ==========================================
// EnemyBullet (적군 발사체) 클래스
// ==========================================
class EnemyBullet {
    constructor(x, y, vx, vy, type = 'basic') {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.radius = 6;
        this.timer = 0;
        this.markedForDeletion = false;
    }

    update() {
        this.timer++;
        if (this.type === 'orbit') {
            const dist = 40 + this.timer * 0.8;
            const ang = this.timer * 0.08;
            this.x = this.startX + Math.cos(ang) * dist;
            this.y = this.startY + Math.sin(ang) * dist;
            if (this.timer > 400) this.markedForDeletion = true;
        } else if (this.type === 'claw') {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.hypot(dx, dy);
            this.vx += (dx / dist) * 0.12;
            this.vy += (dy / dist) * 0.12;
            this.x += this.vx;
            this.y += this.vy;
            // 유도 탄환은 속도 제한
            const speed = Math.hypot(this.vx, this.vy);
            if (speed > 5) {
                this.vx = (this.vx / speed) * 5;
                this.vy = (this.vy / speed) * 5;
            }
        } else {
            this.x += this.vx;
            this.y += this.vy;
        }
        
        if (this.y < -100 || this.y > CANVAS_HEIGHT + 100 || this.x < -100 || this.x > CANVAS_WIDTH + 100) {
            this.markedForDeletion = true;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let emoji = '🔴';
        switch (this.type) {
            case 'hairball': emoji = '🧶'; break;
            case 'wave': emoji = '〰️'; break;
            case 'bottle': emoji = '🍼'; break;
            case 'bone': emoji = '🦴'; break;
            case 'bag': emoji = '💼'; break;
            case 'document': emoji = '📄'; break;
            case 'candle': emoji = '🕯️'; break;
            case 'cream_ball': emoji = '⚪'; break;
            case 'melt': emoji = '💧'; break;
            case 'thorn': emoji = '🌵'; break;
        }
        ctx.fillText(emoji, 0, 0);
        ctx.restore();
    }
}

let enemyBullets = [];

// ==========================================
// Enemy (적 비행기/운석) 클래스
// ==========================================
class Enemy {
    constructor(isMinion = false, minionType = null, parentX = 0, parentY = 0) {
        this.radius = Math.random() * 20 + 15;

        // --- 60% 확률로 플레이어 타겟팅(유도/곡선) 스폰 로직 ---
        const isTargeting = Math.random() < 0.6 && player;

        // 이동 패턴을 위한 파동(Wave) 변수
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = Math.random() * 0.05 + 0.02;
        this.curveMagnitude = Math.random() * 1.5;

        if (isTargeting) {
            // [MOD] 자동차 스테이지(LV.3)도 여러 방향에서 출현하도록 제약 해제
            const spawnEdge = Math.floor(Math.random() * 3);
            if (spawnEdge === 0) {
                this.x = -this.radius * 2;
                this.y = Math.random() * (CANVAS_HEIGHT / 2);
            } else if (spawnEdge === 1) {
                this.x = CANVAS_WIDTH + this.radius * 2;
                this.y = Math.random() * (CANVAS_HEIGHT / 2);
            } else {
                this.x = Math.random() * (CANVAS_WIDTH - this.radius * 2) + this.radius;
                this.y = -this.radius * 2;
            }

            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.hypot(dx, dy);

            // [MOD] 자동차(LV.3)는 타 적군 대비 속도를 대폭 하향 (0.5~1.2)
            let baseSpeed = (Math.random() * 3 + 1.5) * enemySpeedMultiplier;
            if (currentStage === 3) baseSpeed = (Math.random() * 0.7 + 0.5) * enemySpeedMultiplier;

            this.targetSpeedX = (dx / dist) * baseSpeed;
            this.targetSpeedY = (dy / dist) * baseSpeed;

            this.speedX = this.targetSpeedX;
            this.speedY = this.targetSpeedY;

        } else {
            // 지그재그/하강 스폰
            this.x = Math.random() * (CANVAS_WIDTH - this.radius * 2) + this.radius;
            this.y = -this.radius;

            this.targetSpeedX = 0;
            // [MOD] 자동차(LV.3)는 하강 속도도 매우 느리게 조정
            let baseSpeedY = (Math.random() * 2 + 1) * enemySpeedMultiplier;
            if (currentStage === 3) baseSpeedY = (Math.random() * 0.5 + 0.8) * enemySpeedMultiplier;

            this.speedY = baseSpeedY;
            this.curveMagnitude = Math.random() * 3 + 1;
        }

        this.hp = 1; // 기본은 1대 맞으면 파괴
        this.behavior = 'basic'; // 기본 행동 패턴
        this.subType = null;
        this.timer = 0;
        this.isBoss = false;
        this.isExploding = false;
        this.explosionTimer = 0;
        this.isIndestructible = false;

        if (currentStage === 3) {
            // 정예 레이싱 카 타겟 (사이즈 축소 및 다수 출현 연동)
            this.modelType = 'racing_car';
            this.radius = Math.random() * 6 + 18;
            this.hp = 3;
            this.carIndex = Math.floor(Math.random() * (racingCarSprites.imgs.length || 1));

            this.zigzagFreq = Math.random() * 0.12 + 0.08;
            this.zigzagAmp = Math.random() * 10 + 5;
        } else {
            // 다른 스테이지 이모지 할당
            const pool = stageTargetPools[currentStage] || stageTargetPools[20];
            this.model = pool[Math.floor(Math.random() * pool.length)];

            // [NEW] 21-30단계 특수 행동 지정
            if (currentStage === 21) {
                if (this.model === '🎈') this.behavior = 'zigzag';
                if (this.model === '🐦') this.behavior = 'charge';
                if (this.model === '🫧') { this.behavior = 'split'; this.subType = 'soap_bubble'; }
            } else if (currentStage === 22) {
                if (this.model === '🐱') { this.behavior = 'shoot'; this.subType = 'hairball'; }
                if (this.model === '📡') { this.behavior = 'shoot'; this.subType = 'wave'; }
                if (this.model === '🏺') { this.isIndestructible = true; this.radius = 40; }
            } else if (currentStage === 23) {
                if (this.model === '🪃') this.behavior = 'boomerang';
                if (this.model === '🐶') { this.behavior = 'shoot'; this.subType = 'bone'; }
                if (this.model === '🛸') this.behavior = 'drone';
                if (this.model === '🏀') this.behavior = 'bounce';
            } else if (currentStage === 24) {
                if (this.model === '🍎') this.behavior = 'parabola';
                if (this.model === '🐟') this.behavior = 'charge';
                if (this.model === '💥') { this.behavior = 'burst'; this.subType = 'popcorn'; }
            } else if (currentStage === 25) {
                this.isBoss = true;
                this.modelType = 'boss_bus';
                this.radius = 80; // 2배 확대 적용 (대표님 지시사항)
                this.hp = 1500;
                this.behavior = 'boss_bus_pattern';
            } else if (currentStage === 26) {
                if (this.model === '🍭') this.behavior = 'bounce_wall';
                if (this.model === '🍪') this.behavior = 'guided';
                if (this.model === ' waffle' || this.model === '🧇') { this.behavior = 'shatter'; this.subType = 'wafer'; }
                if (this.model === '🧸') this.behavior = 'swarm';
            } else if (currentStage === 27) {
                if (this.model === '🍦') { this.behavior = 'shoot'; this.subType = 'melt'; }
                if (this.model === '🍒') this.behavior = 'bounce_explode';
                if (this.model === '🧇') this.behavior = 'rotate_attack';
                if (this.model === '🧊') { this.hp = 15; this.radius = 45; }
            } else if (currentStage === 28) {
                if (this.model === '🍞') this.behavior = 'growth';
                if (this.model === '🥐') this.behavior = 'boomerang';
                if (this.model === '🧁') { this.behavior = 'split'; this.subType = 'cream'; }
            } else if (currentStage === 29) {
                if (this.model === '🍉') { this.behavior = 'split'; this.subType = 'watermelon'; }
                if (this.model === '🍇') this.behavior = 'cluster';
                if (this.model === '🍍') { this.behavior = 'shoot'; this.subType = 'thorn'; }
                if (this.model === '🍌') { this.isIndestructible = true; this.subType = 'peel'; this.radius = 35; }
            } else if (currentStage === 30) {
                this.isBoss = true;
                this.modelType = 'boss_cake';
                this.radius = 100; // 2배 확대 적용 (대표님 지시사항)
                this.hp = 2500;
                this.behavior = 'boss_cake_pattern';
            } else if (currentStage === 31) {
                if (this.model === '🧱' || this.model === '🧩') this.behavior = 'join_split';
                if (this.model === '🏎️') { this.behavior = 'basic'; this.speedY *= 2.5; }
                if (this.model === '🏰') { this.behavior = 'shoot'; this.subType = 'lego_bullet'; this.hp = 20; this.radius = 50; }
            } else if (currentStage === 32) {
                if (this.model === '🧸') this.behavior = 'wind_up';
                if (this.model === '🧶') { this.behavior = 'burst'; this.subType = 'cotton'; }
                if (this.model === '☃️') { this.behavior = 'shoot'; this.subType = 'snowball'; }
                if (this.model === '🔔') this.behavior = 'zigzag_fast';
            } else if (currentStage === 33) {
                if (this.model === '🧹') this.behavior = 'vacuum';
                if (this.model === '🤖') this.behavior = 'chase_stab';
                if (this.model === '🔩') { this.behavior = 'shoot'; this.subType = 'spark'; }
                if (this.model === '📦') { this.isIndestructible = true; this.radius = 45; }
            } else if (currentStage === 34) {
                if (this.model === '👾') this.behavior = 'pixel_shoot';
                if (this.model === '🕹️') this.behavior = 'joystick';
                if (this.model === '🪙') { this.behavior = 'split'; this.subType = 'coin_fragment'; }
                if (this.model === '🧱') this.behavior = 'tetris_fall';
            } else if (currentStage === 35) {
                this.isBoss = true;
                this.modelType = 'boss_robot';
                this.radius = 106; // 2배 확대 적용 (대표님 지시사항)
                this.hp = 4000;
                this.behavior = 'boss_robot_pattern';
            } else if (currentStage === 36) {
                if (this.model === '⭐') this.behavior = 'star_danmaku';
                if (this.model === '☄️') this.behavior = 'parabola_fast';
                if (this.model === '🌌') this.behavior = 'meteor_shower';
                if (this.model === '🕳️') { this.behavior = 'blackhole_pull'; this.isIndestructible = true; this.radius = 60; }
            } else if (currentStage === 37) {
                if (this.model === '🐰') this.behavior = 'shockwave';
                if (this.model === '🌕') this.behavior = 'growth_moon';
                if (this.model === '🌠') this.behavior = 'charge_fast';
                if (this.model === '🥣') { this.isIndestructible = true; this.radius = 40; }
            } else if (currentStage === 38) {
                if (this.model === '🪐') this.behavior = 'orbit_shoot';
                if (this.model === '🌫️') { this.behavior = 'dust_vision'; this.isIndestructible = true; }
                if (this.model === '🛸') this.behavior = 'zigzag_guided';
                if (this.model === '🛰️') this.behavior = 'fixed_orbit_shoot';
            } else if (currentStage === 39) {
                if (this.model === '☀️') this.behavior = 'solar_flare';
                if (this.model === '☄️') this.behavior = 'guided_fire';
                if (this.model === '💨') this.behavior = 'heat_push';
                if (this.model === '🌑') { this.hp = 50; this.radius = 50; }
            } else if (currentStage === 40) {
                this.isBoss = true;
                this.modelType = 'boss_pirate';
                this.radius = 132; // 2배 확대 적용 (대표님 지시사항)
                this.hp = 6000;
                this.behavior = 'boss_pirate_pattern';
            }

            if (this.isBoss) {
                this.x = CANVAS_WIDTH / 2;
                this.y = -this.radius * 1.5;
                this.speedX = 0;
                this.speedY = 0;
            }

            // 비행기, 헬리콥터 같은 기계류 이모지면 고퀄리티 직접 그리기(벡터) 모드 적용
            const planeEmojis = ['🛩️', '🚁', '🛸', '🚀'];
            if (planeEmojis.includes(this.model) && currentStage < 21) {
                this.modelType = 'plane';
                const dangerHues = [0, 15, 30, 345];
                const hue = dangerHues[Math.floor(Math.random() * dangerHues.length)];
                this.color = `hsl(${hue}, 90%, 65%)`; // [MOD] 더 밝고 선명한 색상으로 변경
            } else {
                // 접시, 외계인, 인형 등은 쌩 이모지로 취급
                this.modelType = 'emoji';
                if (currentStage === 2) this.modelType = 'special_plate';
                if (currentStage === 4) {
                    this.modelType = 'chinese_inst';
                    this.radius = 32;
                    this.hp = 4;
                    if (this.model === '얼후') this.color = '#8e5b3f';
                    else if (this.model === '고쟁') this.color = '#b07d62';
                    else if (this.model === '디쯔') this.color = '#99e2b4';
                    else if (this.model === '비파') this.color = '#e6ccb2';
                    else if (this.model === '소나') this.color = '#cc5a01';
                }
                if (currentStage === 8) {
                    this.modelType = 'pungmul';
                    this.radius = 32; // 크기를 시원시원하게 확대
                    this.hp = 4;
                    
                    // 각 악기 모델별 고유 색상(파티클용) 매핑
                    if (this.model === '장구') this.color = '#8b0000'; // 장구 몸통 적갈색
                    else if (this.model === '북') this.color = '#8b5a2b'; // 북 테두리 갈색
                    else if (this.model === '꽹과리') this.color = '#ffd700'; // 꽹과리 금색
                    else if (this.model === '징') this.color = '#ffa000'; // 징 동색
                    else if (this.model === '소고') this.color = '#d90429'; // 소고 빨간 테두리
                }
                if (currentStage === 16) {
                    this.modelType = 'indian_inst';
                    this.radius = 32;
                    this.hp = 5;
                    if (this.model === '시타르') this.color = '#d4a373';
                    else if (this.model === '타블라') this.color = '#e3d5ca';
                    else if (this.model === '반수리') this.color = '#e9edc9';
                    else if (this.model === '셰나이') this.color = '#d8a48f';
                    else if (this.model === '사랑기') this.color = '#9a7b56';
                }
                if (currentStage === 10) {
                    this.modelType = 'sports_ball';
                    this.radius = 28;
                    this.hp = 3;
                    if (this.model === '⚽') this.color = '#ffffff';
                    else if (this.model === '🏀') this.color = '#ff6b35';
                    else if (this.model === '🏈') this.color = '#8b4513';
                    else if (this.model === '⚾') this.color = '#f5f3f0';
                    else if (this.model === '🎾') this.color = '#adff2f';
                    else if (this.model === '⚪') this.color = '#333333';
                }
                if (currentStage === 17) {
                    this.modelType = 'appliance';
                    this.radius = 32;
                    this.hp = 5;
                    if (this.model === '냉장고') this.color = '#e2e2e2';
                    else if (this.model === 'TV') this.color = '#1a1a1a';
                    else if (this.model === '세탁기') this.color = '#3a86c8';
                    else if (this.model === '선풍기') this.color = '#add8e6';
                    else if (this.model === '전자레인지') this.color = '#ffe066';
                    else if (this.model === '청소기') this.color = '#e63946';
                }


                // [NEW] 12단계: 팬더 이모지면 커스텀 몸통 이미지로 교체
                if (currentStage === 12 && this.model === '🐼') {
                    this.modelType = 'panda_img';
                    this.radius = 35;
                    this.hp = 5;
                }

                this.spinAngle = Math.random() * Math.PI * 2;
                this.spinSpeed = (Math.random() - 0.5) * 0.1;

                // 파티클용 테마 색상 지정
                const colorMap = {
                    2: '#ffffff', // 접시
                    3: '#555555', // 자동차 파편
                    6: '#8a2be2', // 행성
                    9: '#ff4500', // 과일
                    12: '#deb887', // 인형
                    15: '#ff00ff', // 풍선
                    16: '#ffc0cb', // 인형
                    20: '#8b4513', // 건물
                    21: '#87ceeb', // 아침 비행 (하늘색)
                    22: '#8b4513', // 지붕 (브라운)
                    23: '#32cd32', // 공원 (그린)
                    24: '#ffa500', // 시장 (오렌지)
                    26: '#ff69b4', // 과자 (핑크)
                    27: '#e0ffff', // 아이스크림 (라이트블루)
                    28: '#f5deb3', // 베이커리 (베이지)
                    29: '#00ff00', // 과일 (그린)
                    31: '#ff0000', // 레고 (레드)
                    32: '#ffb6c1', // 인형 (핑크)
                    33: '#c0c0c0', // 로봇 (실버)
                    34: '#ffff00', // 오락실 (옐로)
                    36: '#0000ff', // 은하수 (블루)
                    37: '#f0e68c', // 달토끼 (카키)
                    38: '#ffd700', // 토성 (골드)
                    39: '#ff4500'  // 태양 (오렌지레드)
                };
                if (!this.color) this.color = colorMap[currentStage] || '#ffffff';
            }
        }
        
        if (isMinion) {
            this.isMinion = true;
            this.isBoss = false;
            this.radius = 18; // 기존 절반 크기(12)에서 1.5배 상향 조정 (대표님 피드백 반영)
            this.hp = 1;
            // 사방으로 널리 분산되도록 소환 X 좌표 범위 240px로 확장 및 Y축 흔들림 오프셋 부여
            this.x = parentX + (Math.random() - 0.5) * 240;
            this.y = parentY + (Math.random() - 0.5) * 40; 
            this.speedX = (Math.random() - 0.5) * 12; // 수평 이동 속도 범위 확장 (-6 ~ 6)으로 사방 분산 효과 극대화
            this.speedY = Math.random() * 3 + 2.5; // 자연스러운 하강 속도 분배
            
            // Assign custom minion emojis
            if (minionType === 'bus') {
                const busMinions = ['🚗', '🚕', '🚗'];
                this.model = busMinions[Math.floor(Math.random() * busMinions.length)];
                this.modelType = 'basic';
            } else if (minionType === 'cake') {
                const cakeMinions = ['🧁', '🍒', '🍭'];
                this.model = cakeMinions[Math.floor(Math.random() * cakeMinions.length)];
                this.modelType = 'basic';
            } else if (minionType === 'robot') {
                const robotMinions = ['🛸', '👾', '📡'];
                this.model = robotMinions[Math.floor(Math.random() * robotMinions.length)];
                this.modelType = 'basic';
            } else if (minionType === 'crown') {
                const crownMinions = ['⭐', '💎', '✨'];
                this.model = crownMinions[Math.floor(Math.random() * crownMinions.length)];
                this.modelType = 'basic';
            }
            this.behavior = 'basic';
        }

        // [MOD] 일반 적 체력 밸런싱 최적화: 보스 및 보스 미니언이 아닌 일반/정예 적 체력 제한 (최대 2방)
        if (!this.isBoss && !this.isMinion) {
            if (this.hp > 2) {
                this.hp = 2; // 대형/정예 몹은 최대 2대까지만 맞으면 깨지도록 설정
            } else if (this.hp < 1) {
                this.hp = 1; // 최소 체력 1 보장
            }
        }

        this.maxHp = this.hp;
        this.markedForDeletion = false;
    }

    update() {
        if (this.isBoss && this.isExploding) {
            this.timer++;
            this.explosionTimer--;

            // 1. 처음 1초 동안 (explosionTimer > 180) 보스가 제자리에서 부르르 떨며 예비 충전 스파크 연출
            if (this.explosionTimer > 180) {
                this.x = CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 15;
                this.y += (Math.random() - 0.5) * 3;

                // 지속적으로 고조되는 중간급 화면 진동
                shakeTime = Math.max(shakeTime, 6);
                shakeAmount = Math.max(shakeAmount, 10);

                // 예비 푸른빛/금빛 전기 스파크 파티클 매 프레임 3개씩 스폰
                for (let k = 0; k < 3; k++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * this.radius;
                    const px = this.x + Math.cos(angle) * dist;
                    const py = this.y + Math.sin(angle) * dist;
                    const pColor = Math.random() < 0.5 ? '#ffd700' : '#00ffff';
                    particles.push(new Particle(px, py, pColor, 0.035, 1.2)); // 스파크는 빠르게 소멸
                }
            }

            // 2. 정확히 1초 경과 시점 (explosionTimer === 180) 보스 기체 대폭발 "빰!" 발생
            if (this.explosionTimer === 180) {
                // 단 한 번의 깊고 강력한 이중 대폭발 사운드 재생
                playBossExplosionSound();
                try { playFireworkSound(); } catch (e) {}

                // 화면 전체가 극도로 흔들리는 초대형 지진 연출 주입
                shakeTime = 55;
                shakeAmount = 30;

                // 3초 동안 서서히 사라지는 180개의 다채로운 파편 대량 스폰!
                for (let k = 0; k < 180; k++) {
                    const pColor = Math.random() < 0.4 ? '#ffd700' : (Math.random() < 0.75 ? '#ff4500' : '#ffffff');
                    
                    // customDecay를 0.004~0.007 범위로 주어 3초(180프레임) 안팎으로 서서히 자연스럽게 페이드아웃 되게 함
                    const customDecay = Math.random() * 0.003 + 0.004; 
                    
                    // 힘차게 사방으로 뿜어지도록 속도 계수 상향 (1.5 ~ 4.0배)
                    const speedMultiplier = Math.random() * 2.5 + 1.5; 
                    
                    const p = new Particle(this.x, this.y, pColor, customDecay, speedMultiplier);
                    p.radius = Math.random() * 3.5 + 1.5; // 파편 크기도 2px ~ 5px로 다양화
                    particles.push(p);
                }
            }

            // 4초가 다 지나면 마침내 삭제 처리 및 스테이지 전환 실행
            if (this.explosionTimer <= 0) {
                this.markedForDeletion = true;
                handleStageClear();
            }
            return; // 일반 이동 및 패턴 로직 전체 스킵
        }

        // 시간에 따른 각도 변화로 사인파(곡선) 이동 생성
        this.angle += this.angleSpeed;
        this.timer++;

        if (this.modelType === 'emoji') {
            this.spinAngle += this.spinSpeed;
        }

        const slowFactor = Math.max(0.3, 1.0 - (enemySlowLevel - 1) * 0.1);
        let moveX = this.speedX;
        let moveY = this.speedY;

        // [NEW] 행동 패턴별 로직 분기
        switch (this.behavior) {
            case 'zigzag':
                moveX = Math.sin(this.angle * 2) * 8;
                break;
            case 'charge':
                // 유저를 향해 갑자기 돌진 (스폰 시 이미 방향은 결정됨, 속도만 가속)
                moveX *= 1.5;
                moveY *= 1.5;
                break;
            case 'shoot':
                // 일정 주기마다 총알 발사
                if (this.timer % 120 === 0) {
                    this.shootProjectiles();
                }
                break;
            case 'boomerang':
                // 멀어졌다가 다시 유저 쪽으로 굽어 들어옴
                const curve = Math.sin(this.timer * 0.05) * 10;
                moveX += curve;
                if (this.timer > 100) moveY *= -0.5; // 일정 시간 뒤 다시 위로? 혹은 곡선 유지
                break;
            case 'drone':
                // 불규칙하게 멈췄다 움직였다 반복
                if (Math.sin(this.timer * 0.05) > 0.8) {
                    moveX = (player.x - this.x) * 0.05;
                    moveY = 0;
                }
                break;
            case 'bounce':
                // 바닥에서 튀어 오름
                if (this.y > CANVAS_HEIGHT - 100) this.speedY = -Math.abs(this.speedY) * 1.2;
                this.speedY += 0.1; // 중력 적용
                moveY = this.speedY;
                break;
            case 'parabola':
                // 포물선 이동
                this.speedY += 0.05; 
                moveY = this.speedY;
                break;
            case 'guided':
                // 유저를 향해 서서히 유도
                const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
                moveX = Math.cos(targetAngle) * 3;
                moveY = Math.sin(targetAngle) * 3;
                break;
            case 'swarm':
                // 뭉쳐 있다가 유저 근처에서 흩어짐
                if (Math.hypot(player.x - this.x, player.y - this.y) < 200) {
                    this.speedX += (Math.random() - 0.5) * 2;
                    this.speedY += (Math.random() - 0.5) * 2;
                }
                break;
            case 'growth':
                // 시간이 지날수록 커짐
                if (this.radius < 100) this.radius += 0.2;
                break;
            case 'cluster':
                // 여러 개가 뭉쳐서 움직이다 하나씩 떨어져 나옴
                if (this.timer > 200) {
                    this.speedX += (Math.random() - 0.5) * 5;
                    this.behavior = 'basic';
                }
                break;
            case 'rotate_attack':
                // 회전하며 주기적으로 발사
                this.spinAngle += 0.2;
                if (this.timer % 60 === 0) this.shootProjectiles('wave');
                break;
            case 'bounce_wall':
                // 벽에 튕기는 속성 강화
                if (this.x - this.radius <= 0 || this.x + this.radius >= CANVAS_WIDTH) {
                    if (this.timer % 30 === 0) this.shootProjectiles('wave');
                }
                break;
            case 'bounce_explode':
                // 바닥에 닿으면 폭발 (파티클 생성 및 삭제)
                if (this.y > CANVAS_HEIGHT - 50) {
                    for (let k = 0; k < 20; k++) particles.push(new Particle(this.x, this.y, '#ff0000'));
                    this.markedForDeletion = true;
                }
                break;
            case 'zigzag_fast':
                moveX = Math.sin(this.angle * 4) * 12;
                break;
            case 'join_split':
                // 서서히 중앙으로 모였다가 흩어짐
                const targetX = CANVAS_WIDTH / 2;
                this.speedX += (this.x < targetX ? 0.1 : -0.1);
                moveX = this.speedX;
                break;
            case 'wind_up':
                // 처음엔 느리다가 태엽이 풀리면 급발진
                if (this.timer < 120) moveY = 0.8;
                else moveY = 8.0;
                break;
            case 'vacuum':
                moveY = 1.0;
                break;
            case 'chase_stab':
                const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
                moveX = Math.cos(angleToPlayer) * 3;
                moveY = Math.sin(angleToPlayer) * 3;
                break;
            case 'pixel_shoot':
                moveY = 1.5;
                if (this.timer % 80 === 0) {
                    for(let i=-1; i<=1; i++) {
                        enemyBullets.push(new EnemyBullet(this.x, this.y, i*0.5, 3, 'pixel'));
                    }
                }
                break;
            case 'joystick':
                if (this.timer % 50 === 0) {
                    const dirs = [[3,0], [-3,0], [0,3], [0,-3]];
                    const d = dirs[Math.floor(Math.random()*dirs.length)];
                    this.speedX = d[0]; this.speedY = d[1];
                }
                moveX = this.speedX; moveY = this.speedY;
                break;
            case 'tetris_fall':
                moveY = 4.0;
                break;
            case 'star_danmaku':
                moveY = 1.0;
                if (this.timer % 5 === 0) {
                    const ang = this.timer * 0.2;
                    enemyBullets.push(new EnemyBullet(this.x, this.y, Math.cos(ang)*2, Math.sin(ang)*2, 'star'));
                }
                break;
            case 'blackhole_pull':
                moveY = 0.5;
                break;
            case 'shockwave':
                moveY = 1.0;
                if (this.timer % 100 === 0) {
                    for(let i=0; i<8; i++) {
                        const ang = (Math.PI*2/8)*i;
                        enemyBullets.push(new EnemyBullet(this.x, this.y, Math.cos(ang)*4, Math.sin(ang)*4, 'wave'));
                    }
                }
                break;
            case 'orbit_shoot':
                moveY = 1.2;
                if (this.timer % 120 === 0) {
                    enemyBullets.push(new EnemyBullet(this.x, this.y, 0, 0, 'orbit'));
                }
                break;
            case 'solar_flare':
                moveX = Math.sin(this.timer * 0.05) * 10;
                moveY = 1.5;
                break;
            case 'heat_push':
                moveY = 1.0;
                break;
            case 'boss_robot_pattern':
                // 천천히 화면 위쪽으로 진입 후 한가운데에 고정되어 위아래로만 살짝 호버링
                const spawnTargetY_robot = 160;
                if (this.y < spawnTargetY_robot) {
                    this.y += 3;
                } else {
                    this.y = spawnTargetY_robot + Math.sin(this.timer * 0.03) * 15;
                }
                this.x = CANVAS_WIDTH / 2;
                moveX = 0; moveY = 0;
                // 미니언(파괴 가능) 등장 확률 2배 상향! (대표님 지시사항 반영)
                if (this.timer % 30 === 0) {
                    enemies.push(new Enemy(true, 'robot', this.x, this.y));
                }
                // 미사일(방해물) 등장 확률 하향 조정 및 보스 크기 축소에 맞춰 스폰 오프셋 보정 (40 -> 15)
                if (this.timer % 90 === 0) {
                    enemyBullets.push(new EnemyBullet(this.x - 15, this.y, -2, 5, 'missile'));
                    enemyBullets.push(new EnemyBullet(this.x + 15, this.y, 2, 5, 'missile'));
                }
                if (this.timer % 200 === 0) {
                    for(let i=-2; i<=2; i++) {
                        enemyBullets.push(new EnemyBullet(this.x, this.y, i*0.3, 8, 'laser_red'));
                    }
                }
                break;
            case 'boss_pirate_pattern':
                const spawnTargetY_pirate = 180;
                if (this.y < spawnTargetY_pirate) {
                    this.y += 3;
                } else {
                    this.y = spawnTargetY_pirate + Math.cos(this.timer * 0.03) * 15;
                }
                this.x = CANVAS_WIDTH / 2;
                moveX = 0; moveY = 0;
                if (this.timer % 80 === 0) {
                    const ang = Math.atan2(player.y - this.y, player.x - this.x);
                    enemyBullets.push(new EnemyBullet(this.x, this.y, Math.cos(ang)*4, Math.sin(ang)*4, 'cannon'));
                }
                // 미니언 등장 빈도 2배 상향!
                if (this.timer % 25 === 0) {
                    enemies.push(new Enemy(true, 'crown', this.x, this.y));
                }
                if (this.timer % 240 === 0) {
                    enemyBullets.push(new EnemyBullet(this.x, this.y, 0, 0, 'claw'));
                }
                break;
            case 'boss_bus_pattern':
                const spawnTargetY_bus = 150;
                if (this.y < spawnTargetY_bus) {
                    this.y += 3;
                } else {
                    this.y = spawnTargetY_bus + Math.cos(this.timer * 0.03) * 15;
                }
                this.x = CANVAS_WIDTH / 2;
                moveX = 0; moveY = 0;
                // 장애물 스폰 3배 감소!
                if (this.timer % 90 === 0) this.shootProjectiles('bag');
                // 미니언 등장 2배 상향!
                if (this.timer % 30 === 0) {
                    enemies.push(new Enemy(true, 'bus', this.x, this.y));
                }
                break;
            case 'boss_cake_pattern':
                const spawnTargetY_cake = 150;
                if (this.y < spawnTargetY_cake) {
                    this.y += 3;
                } else {
                    this.y = spawnTargetY_cake + Math.sin(this.timer * 0.03) * 15;
                }
                this.x = CANVAS_WIDTH / 2;
                moveX = 0; moveY = 0;
                // 대표님 촛불 장벽 지시사항: 촛불 스폰 3배 감소 (40 -> 120)
                if (this.timer % 120 === 0) this.shootProjectiles('candle');
                // 달콤한 파괴 가능 미니언 등장 2배 상향 (50 -> 25)
                if (this.timer % 25 === 0) {
                    enemies.push(new Enemy(true, 'cake', this.x, this.y));
                }
                if (this.hp < this.maxHp * 0.3 && this.timer % 100 === 0) {
                    this.shootProjectiles('cream_ball');
                }
                break;
            default:
                // 기본 하강 및 약간의 곡선
                moveX = this.speedX + Math.sin(this.angle) * this.curveMagnitude;
                break;
        }

        this.x += moveX * slowFactor;
        this.y += moveY * slowFactor;

        // 화면 테두리 처리
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.speedX *= -1;
        } else if (this.x + this.radius > CANVAS_WIDTH) {
            this.x = CANVAS_WIDTH - this.radius;
            this.speedX *= -1;
        }

        // 화면 아래로 벗어나면 삭제 (보스는 제외)
        if (this.y - this.radius > CANVAS_HEIGHT && !this.isBoss) {
            this.markedForDeletion = true;
        }

        if (this.isBoss) {
            this.maxHp = 20000;
            if (!this.isExploding) {
                this.hp = Math.max(0, 20000 - thisStageCoins);
            }

            if (this.hp <= 0 && !this.isExploding) {
                this.isExploding = true;
                this.explosionTimer = 240; // 4초간 대폭발 지속 (60fps * 4 = 240)
                
                // 보스 격파 시 영구 지갑에 5,000 코인 추가 지급! (대표님 요청사항)
                totalCoins = Number(totalCoins) + 5000;
                saveData(); // 영구 반영 및 저장

                // 화면 상에 존재하는 모든 적 탄환 즉시 소멸 처리 (안전지대 보장)
                enemyBullets.length = 0;

                // [MOD] 1초의 과열 진동 후 180프레임 시점에 단 한 번 큰 빰! 대폭발이 발생하므로
                // 여기서는 예비 흔들림과 대전 상태 진입만 트리거합니다.
                shakeTime = 60;
                shakeAmount = 8; // 부르르 떨리기 시작하는 초기 흔들림
            }
        }
    }

    // [NEW] 적군용 발사체 생성 메서드
    shootProjectiles(type = this.subType) {
        if (!isPlaying) return;
        const bulletCount = (this.isBoss) ? 8 : 1;
        for (let i = 0; i < bulletCount; i++) {
            const angle = (Math.PI * 2 / bulletCount) * i + (this.timer * 0.1);
            const vx = Math.cos(angle) * 4;
            const vy = Math.sin(angle) * 4;
            // 적군 총알을 bullets 배열에 추가 (단, 플레이어 총알과 구분 필요할 수도 있음)
            // 여기서는 단순하게 플레이어에게 데미지를 주는 적군 전용 'EnemyBullet' 클래스를 쓰거나 
            // 기존 Bullet에 isEnemy 플래그를 추가합니다.
            const eb = new EnemyBullet(this.x, this.y, vx, vy, type);
            enemyBullets.push(eb);
        }
        if (type === 'wave') playAirEscapeSound();
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.isBoss && this.isExploding && this.explosionTimer <= 180) {
            // [MOD] 1초 경과하여 보스 본체가 "빰!" 터진 후이므로, 본체(버스, 케이크, 로봇, 크라운)는 전혀 그리지 않고 통과합니다.
        }

        if (this.modelType === 'racing_car' && racingCarSprites.imgs[this.carIndex]) {
            // 레이싱 카 렌더링 (다양한 6종 모델)
            const img = racingCarSprites.imgs[this.carIndex];
            if (img && img.complete && img.width > 0) { // 안전성 검사 추가
                const rotateAngle = Math.PI; // 기본적으로 플레이어를 향해 아래로 내려옴
                ctx.rotate(rotateAngle);

                const renderWidth = this.radius * 4; // [MOD] 사이즈 약간 상향 (3.5 -> 4)
                const renderHeight = renderWidth * (img.height / img.width);

                ctx.drawImage(
                    img,
                    -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight
                );
            } else {
                // 이미지 로드 안 된 경우 이모지로 대체
                ctx.rotate(this.spinAngle || 0);
                ctx.font = `${this.radius * 2}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🚗', 0, 0);
            }
        }
        else if (this.modelType === 'special_plate') {
            // 2단계 스페셜 (하얀색 납작 접시)
            this.modelType = 'special_plate';
            ctx.rotate(this.spinAngle);
            ctx.fillStyle = '#ffffff';

            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 1.5, this.radius * 1.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 1.1, this.radius * 1.1, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        else if (this.modelType === 'plane') {
            // 방향에 맞춰 기수(머리)를 회전(rotate)
            const currentThrustX = this.speedX + Math.sin(this.angle) * this.curveMagnitude;
            const currentThrustY = this.speedY;
            const rotateAngle = Math.atan2(currentThrustY, currentThrustX) - Math.PI / 2;
            ctx.rotate(rotateAngle);

            // 적군 비행기 (빨간색 조차도 디테일하게!)
            let w = this.radius * 2.5;
            let h = this.radius * 2.5;

            // 동체
            ctx.fillStyle = this.color;
            ctx.strokeStyle = '#fff'; // [MOD] 광선 대신 하얀색 테두리로 선명하게
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, h / 2); // 코 부분 (아래쪽)
            ctx.lineTo(w / 8, h / 4);
            ctx.lineTo(w / 8, -h / 2);
            ctx.lineTo(-w / 8, -h / 2);
            ctx.lineTo(-w / 8, h / 4);
            ctx.closePath();
            ctx.fill();

            // 주 날개
            ctx.beginPath();
            ctx.moveTo(w / 8, h / 8);
            ctx.lineTo(w / 2, -h / 6);
            ctx.lineTo(w / 8, -h / 4);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-w / 8, h / 8);
            ctx.lineTo(-w / 2, -h / 6);
            ctx.lineTo(-w / 8, -h / 4);
            ctx.closePath();
            ctx.fill();

            // 꼬리 날개
            ctx.beginPath();
            ctx.moveTo(w / 8, -h / 3);
            ctx.lineTo(w / 3, -h / 2);
            ctx.lineTo(w / 8, -h / 2);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-w / 8, -h / 3);
            ctx.lineTo(-w / 3, -h / 2);
            ctx.lineTo(-w / 8, -h / 2);
            ctx.closePath();
            ctx.fill();

            // 적 콕핏(조종석) 장식 (검은색)
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.ellipse(0, h / 6, w / 10, h / 8, 0, 0, Math.PI * 2);
            ctx.fill();
            // [MOD] 비행기 모드에서 이모지 중복 텍스트 제거 (깔끔함 유지)
        } else if (this.modelType === 'pungmul') {
            // 8단계 풍물놀이 악기 그리기
            ctx.save();
            ctx.rotate(this.spinAngle);

            if (this.model === '장구') {
                // 장구 바디 (모래시계 형태)
                const bodyHeight = this.radius * 1.6;
                const headWidth = this.radius * 0.4;
                const cylinderWidth = this.radius * 0.9;
                
                // 가죽 머리 부분 (두께 있는 타원)
                ctx.fillStyle = '#f5deb3'; // 가죽색 (Wheat)
                ctx.strokeStyle = '#deb887';
                ctx.lineWidth = 3;
                
                // 왼쪽 가죽
                ctx.beginPath();
                ctx.ellipse(-cylinderWidth, 0, headWidth, bodyHeight / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // 오른쪽 가죽
                ctx.beginPath();
                ctx.ellipse(cylinderWidth, 0, headWidth, bodyHeight / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // 장구 몸통 (나무 부분 - 빨간/갈색 모래시계)
                ctx.fillStyle = '#8b0000'; // 다크 레드
                ctx.strokeStyle = '#3a0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-cylinderWidth + headWidth / 2, -bodyHeight / 3);
                ctx.bezierCurveTo(
                    -cylinderWidth / 3, -bodyHeight / 10,
                    -cylinderWidth / 3, -bodyHeight / 10,
                    0, -bodyHeight / 8
                );
                ctx.bezierCurveTo(
                    cylinderWidth / 3, -bodyHeight / 10,
                    cylinderWidth / 3, -bodyHeight / 10,
                    cylinderWidth - headWidth / 2, -bodyHeight / 3
                );
                ctx.lineTo(cylinderWidth - headWidth / 2, bodyHeight / 3);
                ctx.bezierCurveTo(
                    cylinderWidth / 3, bodyHeight / 10,
                    cylinderWidth / 3, bodyHeight / 10,
                    0, bodyHeight / 8
                );
                ctx.bezierCurveTo(
                    -cylinderWidth / 3, bodyHeight / 10,
                    -cylinderWidth / 3, bodyHeight / 10,
                    -cylinderWidth + headWidth / 2, bodyHeight / 3
                );
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // 조임줄 (줄 모양 지그재그선)
                ctx.strokeStyle = '#e6ccb2';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-cylinderWidth, -bodyHeight / 2);
                ctx.lineTo(cylinderWidth, -bodyHeight / 3);
                ctx.lineTo(-cylinderWidth, -bodyHeight / 6);
                ctx.lineTo(cylinderWidth, 0);
                ctx.lineTo(-cylinderWidth, bodyHeight / 6);
                ctx.lineTo(cylinderWidth, bodyHeight / 3);
                ctx.lineTo(-cylinderWidth, bodyHeight / 2);
                ctx.stroke();

            } else if (this.model === '북') {
                // 둥근 통북
                const r = this.radius;
                // 북의 몸통 (나무 테두리)
                ctx.fillStyle = '#8b5a2b'; // 갈색 나무
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();

                // 가죽 머리 (안쪽 원)
                ctx.fillStyle = '#fffff0'; // 아이보리 가죽
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
                ctx.fill();

                // 북 못(rivets)들 그리기
                ctx.fillStyle = '#111';
                for (let i = 0; i < 12; i++) {
                    const ang = (Math.PI * 2 / 12) * i;
                    const nailX = Math.cos(ang) * (r * 0.92);
                    const nailY = Math.sin(ang) * (r * 0.92);
                    ctx.beginPath();
                    ctx.arc(nailX, nailY, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                // 전통 무늬 선형 림
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
                ctx.stroke();

            } else if (this.model === '꽹과리') {
                // 꽹과리: 노란 청동 빛, 고리 끈이 달림
                const r = this.radius * 0.9;
                
                // 손잡이 끈 (빨간 끈)
                ctx.strokeStyle = '#d90429';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(-r * 0.5, -r * 1.4, 0, -r * 1.5);
                ctx.stroke();

                // 놋쇠 본체 (금색 그라데이션)
                const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
                grad.addColorStop(0, '#ffe57f'); // 밝은 금색
                grad.addColorStop(0.6, '#ffd740');
                grad.addColorStop(1, '#ffc400'); // 테두리 진한 황금색
                ctx.fillStyle = grad;
                
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();

                // 테두리 두께 표현
                ctx.strokeStyle = '#ffab00';
                ctx.lineWidth = 3;
                ctx.stroke();

                // 동심원 무늬 (꽹과리 특유의 두들긴 결)
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
                ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
                ctx.stroke();

            } else if (this.model === '징') {
                // 징: 크고 묵직한 구리빛, 둥글게 파여서 깊이감이 있음
                const r = this.radius * 1.15;
                
                // 징 걸이 끈
                ctx.strokeStyle = '#222';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(-r * 0.3, -r);
                ctx.lineTo(0, -r * 1.4);
                ctx.lineTo(r * 0.3, -r);
                ctx.stroke();

                // 징 본체 그라데이션 (약간 어둡고 깊은 놋쇠색)
                const grad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
                grad.addColorStop(0, '#ffd54f'); // 중심부 밝음
                grad.addColorStop(0.5, '#ffa000');
                grad.addColorStop(0.9, '#c37200'); // 외곽선 어두운 청동색
                grad.addColorStop(1, '#6d3d00');
                ctx.fillStyle = grad;
                
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();

                // 두꺼운 징 테두리
                ctx.strokeStyle = '#5d3400';
                ctx.lineWidth = 4;
                ctx.stroke();

                // 징 무늬
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
                ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
                ctx.stroke();

            } else if (this.model === '소고') {
                // 소고: 나무 손잡이가 밑으로 뻗은 미니 드럼
                const r = this.radius * 0.8;
                
                // 손잡이 (아래로 뻗은 나무 손잡이)
                ctx.fillStyle = '#8b5a2b';
                ctx.fillRect(-6, 0, 12, r * 1.8);
                
                // 소고 프레임
                ctx.fillStyle = '#d90429'; // 빨간 테두리
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();

                // 가죽면
                ctx.fillStyle = '#fffff0'; // 아이보리 가죽
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
                ctx.fill();

                // 중앙의 삼색 태극 무늬 (소고의 상징적인 무늬!)
                const centerR = r * 0.45;
                ctx.save();
                ctx.fillStyle = '#d90429'; // 빨
                ctx.beginPath();
                ctx.arc(0, 0, centerR, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#005f73'; // 파
                ctx.beginPath();
                ctx.moveTo(0,0);
                ctx.arc(0, 0, centerR, 0, Math.PI);
                ctx.fill();
                
                ctx.fillStyle = '#ca6702'; // 황
                ctx.beginPath();
                ctx.moveTo(0,0);
                ctx.arc(0, 0, centerR, Math.PI * 0.66, Math.PI * 1.33);
                ctx.fill();
                ctx.restore();
            }

            ctx.restore();

            // [MOD] 한글 텍스트 라벨 비표시 (사용자 요청 반영)
        } else if (this.modelType === 'chinese_inst') {
            // 4단계 중국 전통악기 그리기
            ctx.save();
            ctx.rotate(this.spinAngle);

            if (this.model === '얼후') {
                // 얼후: 2현 세로 활악기
                const r = this.radius;
                // 1. 울림통 (육각형 갈색 바디)
                ctx.fillStyle = '#8e5b3f';
                ctx.strokeStyle = '#5c3a26';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const ang = (Math.PI * 2 / 6) * i;
                    const x = Math.cos(ang) * (r * 0.45);
                    const y = Math.sin(ang) * (r * 0.45) + r * 0.5;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // 울림통 가죽 전면부
                ctx.fillStyle = '#d4a373';
                ctx.beginPath();
                ctx.arc(0, r * 0.5, r * 0.3, 0, Math.PI*2);
                ctx.fill();

                // 2. 대나무 기둥 (촨치)
                ctx.fillStyle = '#5c3a26';
                ctx.fillRect(-3, -r * 1.1, 6, r * 1.6);

                // 3. 축 (줄 조율 손잡이 2개)
                ctx.fillStyle = '#8e5b3f';
                ctx.fillRect(0, -r * 0.8, r * 0.45, 5);
                ctx.fillRect(0, -r * 0.6, r * 0.45, 5);

                // 4. 현 (2줄)
                ctx.strokeStyle = '#e2e2e2';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-1, -r * 0.9);
                ctx.lineTo(-1, r * 0.5);
                ctx.moveTo(1, -r * 0.9);
                ctx.lineTo(1, r * 0.5);
                ctx.stroke();

                // 5. 활 (궁)
                ctx.strokeStyle = 'rgba(212, 163, 115, 0.85)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-r * 0.9, r * 0.1);
                ctx.quadraticCurveTo(0, r * 0.3, r * 0.9, r * 0.15);
                ctx.stroke();

            } else if (this.model === '고쟁') {
                // 고쟁: 가로형 21현 가야금/쟁
                const r = this.radius;
                const w = r * 1.8;
                const h = r * 0.65;

                // 1. 몸통 (긴 나무 상자)
                ctx.fillStyle = '#b07d62';
                ctx.strokeStyle = '#6c4a37';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.rect(-w / 2, -h / 2, w, h);
                ctx.fill();
                ctx.stroke();

                // 좌우 장식판 (붉은 대추나무 빛깔)
                ctx.fillStyle = '#6c4a37';
                ctx.fillRect(-w / 2, -h / 2, 10, h);
                ctx.fillRect(w / 2 - 10, -h / 2, 10, h);

                // 2. 안족 (줄을 받쳐주는 삼각형 기둥들)
                ctx.fillStyle = '#fff';
                for (let i = 0; i < 7; i++) {
                    const ax = -w * 0.35 + (i * (w * 0.7 / 6));
                    const ay = -h * 0.2 + (i % 2) * 6;
                    ctx.beginPath();
                    ctx.moveTo(ax, ay - 4);
                    ctx.lineTo(ax - 3, ay + 4);
                    ctx.lineTo(ax + 3, ay + 4);
                    ctx.closePath();
                    ctx.fill();
                }

                // 3. 줄 (현)
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 1;
                for (let i = 0; i < 5; i++) {
                    const y = -h * 0.3 + (i * h * 0.15);
                    ctx.beginPath();
                    ctx.moveTo(-w / 2 + 10, y);
                    ctx.lineTo(w / 2 - 10, y);
                    ctx.stroke();
                }

            } else if (this.model === '디쯔') {
                // 디쯔: 대나무 가로피리
                const r = this.radius;
                const len = r * 2.2;
                const thick = r * 0.16;

                // 가로로 누운 디쯔 바디
                ctx.save();
                ctx.rotate(-Math.PI / 8); // 살짝 비스듬히 눕힘
                
                // 마디 및 몸체
                ctx.fillStyle = '#99e2b4'; // 맑은 대나무색
                ctx.strokeStyle = '#52b788';
                ctx.lineWidth = 2;
                ctx.fillRect(-len / 2, -thick / 2, len, thick);
                ctx.strokeRect(-len / 2, -thick / 2, len, thick);

                // 대나무 마디 주름선들
                ctx.strokeStyle = '#40916c';
                ctx.lineWidth = 1.5;
                for (let i = 1; i <= 4; i++) {
                    const x = -len / 2 + (i * len / 5);
                    ctx.beginPath();
                    ctx.moveTo(x, -thick / 2);
                    ctx.lineTo(x, thick / 2);
                    ctx.stroke();
                }

                // 구멍들 (불어넣는 구멍 및 지공)
                ctx.fillStyle = '#1e1e1e';
                ctx.beginPath();
                ctx.arc(-len * 0.35, 0, 2.5, 0, Math.PI*2); // 취구
                for (let i = 0; i < 6; i++) {
                    ctx.arc(len * 0.05 + (i * 12), 0, 2, 0, Math.PI*2); // 지공
                }
                ctx.fill();

                // 붉은 매듭술 장식
                ctx.strokeStyle = '#ff0a54';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(len * 0.42, thick / 3);
                ctx.lineTo(len * 0.42, thick + 10);
                ctx.stroke();
                ctx.fillStyle = '#ff0a54';
                ctx.beginPath();
                ctx.arc(len * 0.42, thick + 12, 4, 0, Math.PI*2);
                ctx.fill();

                ctx.restore();

            } else if (this.model === '비파') {
                // 비파: 등비형(pear-shaped) 비파
                const r = this.radius;

                // 1. 울림통 (조개/배 형태 바디)
                ctx.fillStyle = '#e6ccb2';
                ctx.strokeStyle = '#b79a78';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(0, -r * 0.9); // 상단 목 시작점
                ctx.quadraticCurveTo(-r * 0.8, r * 0.2, -r * 0.7, r * 0.6);
                ctx.quadraticCurveTo(-r * 0.4, r * 1.1, 0, r * 1.1);
                ctx.quadraticCurveTo(r * 0.4, r * 1.1, r * 0.7, r * 0.6);
                ctx.quadraticCurveTo(r * 0.8, r * 0.2, 0, -r * 0.9);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // 비파 복판 배 가리개 장식 (달 모양 어두운 판)
                ctx.fillStyle = '#7f5539';
                ctx.beginPath();
                ctx.arc(0, r * 0.6, r * 0.35, Math.PI, 0);
                ctx.fill();

                // 2. 목(상부)과 꺾인 머리
                ctx.fillStyle = '#7f5539';
                ctx.fillRect(-6, -r * 1.3, 12, r * 0.4);
                // 꺾인 모양의 끝머리
                ctx.beginPath();
                ctx.moveTo(-6, -r * 1.3);
                ctx.lineTo(6, -r * 1.3);
                ctx.lineTo(12, -r * 1.45);
                ctx.lineTo(-2, -r * 1.45);
                ctx.closePath();
                ctx.fill();

                // 3. 괘 (프렛 지판 무늬)
                ctx.strokeStyle = '#ddb892';
                ctx.lineWidth = 2;
                for (let i = 0; i < 5; i++) {
                    const y = -r * 0.8 + (i * 12);
                    ctx.beginPath();
                    ctx.moveTo(-5, y);
                    ctx.lineTo(5, y);
                    ctx.stroke();
                }

                // 4. 현 (4줄)
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.2;
                for (let i = -2; i <= 2; i++) {
                    if (i === 0) continue;
                    ctx.beginPath();
                    ctx.moveTo(i * 1.5, -r * 1.2);
                    ctx.lineTo(i * 2.5, r * 0.9);
                    ctx.stroke();
                }

            } else if (this.model === '소나') {
                // 소나: 중국식 태평소
                const r = this.radius;

                // 1. 놋쇠 나팔 깔때기 (금색 금속광택)
                const grad = ctx.createRadialGradient(0, r * 0.6, r * 0.1, 0, r * 0.6, r * 0.65);
                grad.addColorStop(0, '#ffd700');
                grad.addColorStop(0.8, '#ff9100');
                grad.addColorStop(1, '#b55a00');
                ctx.fillStyle = grad;
                ctx.strokeStyle = '#6d3d00';
                ctx.lineWidth = 2.5;

                ctx.beginPath();
                ctx.moveTo(-r * 0.15, r * 0.3);
                ctx.lineTo(-r * 0.7, r * 0.95);
                ctx.quadraticCurveTo(0, r * 1.2, r * 0.7, r * 0.95);
                ctx.lineTo(r * 0.15, r * 0.3);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // 2. 나무 관통 파이프 (적갈색 관)
                ctx.fillStyle = '#8b2500';
                ctx.strokeStyle = '#431200';
                ctx.lineWidth = 1.5;
                ctx.fillRect(-5, -r * 1.0, 10, r * 1.3);
                ctx.strokeRect(-5, -r * 1.0, 10, r * 1.3);

                // 파이프 지공 표시
                ctx.fillStyle = '#000';
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.arc(0, -r * 0.8 + (i * 15), 2.2, 0, Math.PI*2);
                    ctx.fill();
                }

                // 3. 상단 구리 주전자 주둥이와 서 (reed)
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(-2, -r * 1.25, 4, r * 0.25);
                ctx.fillStyle = '#deb887';
                ctx.fillRect(-4, -r * 1.35, 8, 5); // 볏짚 reed
            }

            ctx.restore();

        } else if (this.modelType === 'indian_inst') {
            // 16단계 인도 전통악기 그리기
            ctx.save();
            ctx.rotate(this.spinAngle);

            if (this.model === '시타르') {
                // 시타르: 커다란 조가박 몸체와 길고 장식적인 핑거보드
                const r = this.radius;

                // 1. 하단 박 울림통 (호박/황토색 조가박)
                ctx.fillStyle = '#d4a373';
                ctx.strokeStyle = '#a66c38';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(0, r * 0.6, r * 0.55, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();

                // 울림통 상부의 오목한 꽃무늬 장식판
                ctx.fillStyle = '#e9edc9';
                ctx.beginPath();
                ctx.ellipse(0, r * 0.3, r * 0.35, r * 0.15, 0, 0, Math.PI*2);
                ctx.fill();

                // 2. 길고 넓은 핑거보드 넥
                ctx.fillStyle = '#a66c38';
                ctx.fillRect(-7, -r * 1.3, 14, r * 1.4);

                // 상부 미니 보조 박
                ctx.fillStyle = '#d4a373';
                ctx.beginPath();
                ctx.arc(-12, -r * 0.7, r * 0.2, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();

                // 3. 다수의 튜닝 못(Pegs)
                ctx.fillStyle = '#faedcd';
                for (let i = 0; i < 5; i++) {
                    const py = -r * 1.2 + (i * 15);
                    const px = (i % 2 === 0) ? 10 : -10;
                    ctx.fillRect(px > 0 ? 5 : -13, py, 8, 3);
                }

                // 4. 금속제 아치 튜브 프렛과 금선 현
                ctx.strokeStyle = '#faedcd';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-2, -r * 1.2);
                ctx.lineTo(-2, r * 0.6);
                ctx.moveTo(2, -r * 1.2);
                ctx.lineTo(2, r * 0.6);
                ctx.stroke();

            } else if (this.model === '타블라') {
                // 타블라: 쌍드럼 (바얀 & 다야)
                const r = this.radius;

                // 1. 왼쪽 바얀 드럼 (금속성 구 형태, 대형)
                ctx.fillStyle = '#ccd5ae'; // 흙갈색/황동색
                ctx.strokeStyle = '#a5a58d';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(-r * 0.45, r * 0.2, r * 0.55, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();

                // 바얀 가죽 탑 + 중앙 샤히(검은 동그라미)
                ctx.fillStyle = '#fefae0';
                ctx.beginPath();
                ctx.ellipse(-r * 0.45, -r * 0.15, r * 0.45, r * 0.2, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = '#222';
                ctx.beginPath();
                ctx.ellipse(-r * 0.45, -r * 0.15, r * 0.2, r * 0.09, 0, 0, Math.PI*2);
                ctx.fill();

                // 2. 오른쪽 다야 드럼 (나무통 실린더, 날씬하고 높음)
                ctx.fillStyle = '#b7b7a4'; // 붉은 자작나무 나무결
                ctx.strokeStyle = '#6b705c';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect(r * 0.15, -r * 0.35, r * 0.6, r * 0.95);
                ctx.fill();
                ctx.stroke();

                // 다야 가죽 탑 + 중앙 샤히
                ctx.fillStyle = '#fefae0';
                ctx.beginPath();
                ctx.ellipse(r * 0.45, -r * 0.35, r * 0.3, r * 0.12, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = '#222';
                ctx.beginPath();
                ctx.ellipse(r * 0.45, -r * 0.35, r * 0.14, r * 0.06, 0, 0, Math.PI*2);
                ctx.fill();

                // 조임용 나무 토막(Gatta) 묘사
                ctx.fillStyle = '#e6ccb2';
                ctx.fillRect(r * 0.18, r * 0.1, 6, 12);
                ctx.fillRect(r * 0.65, r * 0.05, 6, 12);

            } else if (this.model === '반수리') {
                // 반수리: 인도의 긴 대나무 대형 피리
                const r = this.radius;
                const len = r * 2.3;
                const thick = r * 0.14;

                ctx.save();
                ctx.rotate(Math.PI / 6); // 인도적인 감각의 대각선 배치

                // 밝은 갈색 황금빛 대나무 관
                ctx.fillStyle = '#e9edc9';
                ctx.strokeStyle = '#d4a373';
                ctx.lineWidth = 2.5;
                ctx.fillRect(-len/2, -thick/2, len, thick);
                ctx.strokeRect(-len/2, -thick/2, len, thick);

                // 마디 실선
                ctx.strokeStyle = '#ccd5ae';
                for (let i = -2; i <= 2; i++) {
                    const x = i * (len / 6);
                    ctx.beginPath();
                    ctx.moveTo(x, -thick/2);
                    ctx.lineTo(x, thick/2);
                    ctx.stroke();
                }

                // 전통 실매듭 (빨강-오렌지)
                ctx.fillStyle = '#ff4d6d';
                ctx.fillRect(-len*0.4, -thick/2 - 2, 8, thick + 4);
                ctx.fillRect(len*0.35, -thick/2 - 2, 8, thick + 4);

                // 검정색 원형 지공
                ctx.fillStyle = '#333';
                for (let i = 0; i < 6; i++) {
                    ctx.beginPath();
                    ctx.arc(-len*0.1 + (i * 14), 0, 2.5, 0, Math.PI*2);
                    ctx.fill();
                }

                ctx.restore();

            } else if (this.model === '셰나이') {
                // 셰나이: 고대 목관 호른
                const r = this.radius;

                // 1. 나팔 벨 (금빛 구리 벨)
                ctx.fillStyle = '#d4a373';
                ctx.strokeStyle = '#8c593b';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(-r*0.1, r*0.3);
                ctx.lineTo(-r*0.65, r*1.15);
                ctx.quadraticCurveTo(0, r*1.35, r*0.65, r*1.15);
                ctx.lineTo(r*0.1, r*0.3);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // 2. 검붉은 목재 몸통 관
                ctx.fillStyle = '#5c3a21';
                ctx.fillRect(-5, -r*1.1, 10, r*1.4);

                // 구멍 뚫기
                ctx.fillStyle = '#faedcd';
                for (let i = 0; i < 6; i++) {
                    ctx.beginPath();
                    ctx.arc(0, -r*0.8 + (i * 15), 2.2, 0, Math.PI*2);
                    ctx.fill();
                }

                // 3. 리드 팁
                ctx.fillStyle = '#d4a373';
                ctx.fillRect(-2, -r*1.22, 4, 8);

            } else if (this.model === '사랑기') {
                // 사랑기: 나무 몸체에 염소 가죽을 씌운 인도 현악기
                const r = this.radius;

                // 1. 사각형의 두툼한 나무 바디
                ctx.fillStyle = '#9a7b56';
                ctx.strokeStyle = '#6d5334';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.rect(-r*0.4, -r*0.9, r*0.8, r*1.8);
                ctx.fill();
                ctx.stroke();

                // 2. 염소 가죽 울림면 (중하단에 씌운 가죽)
                ctx.fillStyle = '#fefae0';
                ctx.beginPath();
                ctx.rect(-r*0.36, r*0.1, r*0.72, r*0.75);
                ctx.fill();

                // 가죽을 받치는 커다란 브릿지 (안족)
                ctx.fillStyle = '#faedcd';
                ctx.fillRect(-r*0.15, r*0.45, r*0.3, 6);

                // 3. 넥 끝머리 박스 페그
                ctx.fillStyle = '#6d5334';
                ctx.fillRect(-r*0.3, -r*1.2, r*0.6, r*0.35);

                // 좌우 돌출된 귀여운 튜닝 페그 4개
                ctx.fillStyle = '#faedcd';
                ctx.fillRect(-r*0.48, -r*1.12, 10, 4);
                ctx.fillRect(-r*0.48, -r*0.95, 10, 4);
                ctx.fillRect(r*0.3, -r*1.12, 10, 4);
                ctx.fillRect(r*0.3, -r*0.95, 10, 4);

                // 4. 현 (두꺼운 줄 3선)
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(-4, -r*0.95); ctx.lineTo(-2, r*0.8);
                ctx.moveTo(0, -r*0.95); ctx.lineTo(0, r*0.8);
                ctx.moveTo(4, -r*0.95); ctx.lineTo(2, r*0.8);
                ctx.stroke();
            }

            ctx.restore();

        } else if (this.modelType === 'appliance') {
            // 17단계 현대 생활 가전제품 그리기
            ctx.save();
            ctx.rotate(this.spinAngle);

            // 시간 경과에 따른 펄스(애니메이션)용 시간값 계산
            const animTime = Date.now() / 1000;

            if (this.model === '냉장고') {
                // 냉장고: 세로형 메탈 실버 냉장고
                const r = this.radius;
                const w = r * 1.0;
                const h = r * 1.7;

                // 본체 스틸 그라데이션
                const grad = ctx.createLinearGradient(-w/2, 0, w/2, 0);
                grad.addColorStop(0, '#eceff1');
                grad.addColorStop(0.7, '#cfd8dc');
                grad.addColorStop(1, '#90a4ae');
                ctx.fillStyle = grad;
                ctx.strokeStyle = '#455a64';
                ctx.lineWidth = 2.5;

                ctx.beginPath();
                ctx.rect(-w/2, -h/2, w, h);
                ctx.fill();
                ctx.stroke();

                // 상/하부 도어 분리선
                ctx.strokeStyle = '#37474f';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-w/2, -h*0.1);
                ctx.lineTo(w/2, -h*0.1);
                ctx.stroke();

                // 도어 손잡이 (세로형 다크 실버 바)
                ctx.fillStyle = '#37474f';
                ctx.fillRect(w*0.25, -h*0.4, 5, h*0.25);
                ctx.fillRect(w*0.25, 0, 5, h*0.35);

                // 디지털 디스플레이 액정 (파란 LED 라이팅 효과)
                ctx.fillStyle = '#0d47a1';
                ctx.fillRect(-w*0.25, -h*0.35, w*0.35, h*0.12);
                ctx.fillStyle = '#80d8ff';
                ctx.font = 'bold 8px Courier';
                ctx.fillText('-18℃', -w*0.22, -h*0.28);

            } else if (this.model === 'TV') {
                // TV: 메카니컬 패널 및 스탠드가 있는 모던 와이드 TV
                const r = this.radius;
                const w = r * 1.7;
                const h = r * 1.1;

                // 1. 하단 지지대 스탠드
                ctx.fillStyle = '#37474f';
                ctx.beginPath();
                ctx.moveTo(-r*0.2, h/2);
                ctx.lineTo(r*0.2, h/2);
                ctx.lineTo(r*0.1, h/2 + 8);
                ctx.lineTo(-r*0.1, h/2 + 8);
                ctx.closePath();
                ctx.fill();

                // 2. TV 베젤 프레임 (하이글로시 블랙)
                ctx.fillStyle = '#1e1e1e';
                ctx.strokeStyle = '#37474f';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.rect(-w/2, -h/2, w, h);
                ctx.fill();
                ctx.stroke();

                // 3. 디스플레이 유리창 (네온 픽셀 노이즈 / 칼라 브라운관 컬러 바 효과)
                const innerW = w - 8;
                const innerH = h - 8;
                
                // 레트로 컬러바 렌더링 (빨주노초파남보 수직 분할)
                const colorsArray = ['#e63946', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
                const stripeW = innerW / colorsArray.length;
                ctx.save();
                ctx.beginPath();
                ctx.rect(-innerW/2, -innerH/2, innerW, innerH);
                ctx.clip();
                for (let i = 0; i < colorsArray.length; i++) {
                    ctx.fillStyle = colorsArray[i];
                    ctx.fillRect(-innerW/2 + (i * stripeW), -innerH/2, stripeW, innerH);
                }
                ctx.restore();

            } else if (this.model === '세탁기') {
                // 세탁기: 드럼식 하이글로시 세탁기
                const r = this.radius;
                const w = r * 1.35;
                const h = r * 1.35;

                // 1. 세탁기 본체 프레임 (순백색)
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#b0bec5';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.rect(-w/2, -h/2, w, h);
                ctx.fill();
                ctx.stroke();

                // 상부 조작 컨트롤 패널 (회색)
                ctx.fillStyle = '#eceff1';
                ctx.fillRect(-w/2 + 3, -h/2 + 3, w - 6, h*0.22);
                ctx.fillStyle = '#cfd8dc';
                ctx.beginPath();
                ctx.arc(-w*0.25, -h*0.38, 5, 0, Math.PI*2); // 조그 셔틀 다이얼
                ctx.fill();

                // 2. 전면 드럼 도어 (원형 유리창 커버)
                const doorR = r * 0.42;
                ctx.fillStyle = '#90caf9'; // 파란 코팅 유리
                ctx.strokeStyle = '#b0bec5';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(0, h*0.12, doorR, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();

                // 유리 내부 파란 물결 소용돌이 물살
                ctx.strokeStyle = 'rgba(255,255,255,0.7)';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(0, h*0.12, doorR * 0.6, animTime * 2, animTime * 2 + Math.PI);
                ctx.stroke();

            } else if (this.model === '선풍기') {
                // 선풍기: 3엽 날개가 회전하는 탁상형 선풍기
                const r = this.radius;

                // 1. 하단 베이스 판
                ctx.fillStyle = '#cfd8dc';
                ctx.beginPath();
                ctx.ellipse(0, r * 1.0, r * 0.5, r * 0.15, 0, 0, Math.PI*2);
                ctx.fill();
                
                // 버튼 장식
                ctx.fillStyle = '#ff1744'; ctx.fillRect(-10, r*0.93, 4, 3);
                ctx.fillStyle = '#00e676'; ctx.fillRect(-3, r*0.93, 4, 3);
                ctx.fillStyle = '#2979ff'; ctx.fillRect(4, r*0.93, 4, 3);

                // 2. 연결 스탠드 지지대
                ctx.strokeStyle = '#90a4ae';
                ctx.lineWidth = 7;
                ctx.beginPath();
                ctx.moveTo(0, r * 0.9);
                ctx.lineTo(0, r * 0.1);
                ctx.stroke();

                // 3. 선풍기 안전 그릴망 테두리
                ctx.fillStyle = '#fafafa';
                ctx.strokeStyle = '#b0bec5';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, -r*0.1, r * 0.85, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();

                // 안전 그릴 망 살
                ctx.strokeStyle = '#cfd8dc';
                ctx.lineWidth = 1;
                for (let i = 0; i < 8; i++) {
                    const ang = (Math.PI * 2 / 8) * i;
                    ctx.beginPath();
                    ctx.moveTo(0, -r*0.1);
                    ctx.lineTo(Math.cos(ang) * (r*0.85), -r*0.1 + Math.sin(ang) * (r*0.85));
                    ctx.stroke();
                }

                // 4. 3엽 날개 렌더링 (살짝 돌려서 동적 회전 연출)
                ctx.fillStyle = 'rgba(3, 169, 244, 0.7)'; // 반투명 시원한 하늘색 날개
                ctx.save();
                ctx.translate(0, -r*0.1);
                ctx.rotate(animTime * 8); // 실시간 애니메이션 회전
                for (let i = 0; i < 3; i++) {
                    const ang = (Math.PI * 2 / 3) * i;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, r * 0.2, r * 0.72, ang, 0, Math.PI*2);
                    ctx.fill();
                }
                // 날개 중앙 캡
                ctx.fillStyle = '#0288d1';
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.15, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();

            } else if (this.model === '전자레인지') {
                // 전자레인지: 콤팩트 주방 오븐
                const r = this.radius;
                const w = r * 1.5;
                const h = r * 1.0;

                // 1. 본체 스틸 케이스
                ctx.fillStyle = '#37474f';
                ctx.strokeStyle = '#cfd8dc';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.rect(-w/2, -h/2, w, h);
                ctx.fill();
                ctx.stroke();

                // 2. 도어 전면 강화유리 창
                ctx.fillStyle = '#1e1e1e';
                ctx.fillRect(-w/2 + 8, -h/2 + 8, w * 0.65, h - 16);

                // 오븐 내부 노란 불빛 및 회전접시 가열 접시
                ctx.fillStyle = 'rgba(255, 235, 59, 0.45)'; // 따뜻한 가열 황색 빛
                ctx.fillRect(-w/2 + 12, -h/2 + 12, w * 0.58, h - 24);

                // 내부 도는 컵/머그잔 묘사
                ctx.fillStyle = '#ff7043';
                ctx.fillRect(-5, 0, 10, 10);
                ctx.fillStyle = '#fff';
                ctx.fillRect(5, 2, 3, 6); // 머그컵 손잡이

                // 3. 우측 컨트롤 단추 패널
                ctx.fillStyle = '#263238';
                ctx.fillRect(w*0.22, -h/2 + 8, w*0.23, h - 16);

                // 디지털 시계 초록 폰트 ("12:00" 번쩍임)
                ctx.fillStyle = '#00e676';
                ctx.font = 'bold 8px Courier';
                ctx.fillText('12:00', w*0.24, -h*0.24);

            } else if (this.model === '청소기') {
                // 청소기: 휠과 흡입 호스가 연결된 청소기 본체
                const r = this.radius;

                // 1. 양측면 대형 로드 휠(바퀴)
                ctx.fillStyle = '#37474f';
                ctx.beginPath();
                ctx.arc(-r*0.4, r*0.35, 14, 0, Math.PI*2);
                ctx.arc(r*0.4, r*0.35, 14, 0, Math.PI*2);
                ctx.fill();

                // 2. 다이내믹 레드 캡슐형 흡입 바디
                const grad = ctx.createRadialGradient(0, -r*0.1, r*0.1, 0, -r*0.1, r*0.8);
                grad.addColorStop(0, '#ff5252');
                grad.addColorStop(0.8, '#d50000');
                grad.addColorStop(1, '#800000');
                ctx.fillStyle = grad;
                ctx.strokeStyle = '#430000';
                ctx.lineWidth = 2.5;

                ctx.beginPath();
                ctx.ellipse(0, 0, r * 0.65, r * 0.5, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();

                // 전원 발판 전원 스위치
                ctx.fillStyle = '#eceff1';
                ctx.fillRect(-15, -r*0.42, 10, 6);
                ctx.fillStyle = '#cfd8dc';
                ctx.fillRect(5, -r*0.42, 10, 6);

                // 3. 앞코 흡입구 및 회색 자바라 주름 호스
                ctx.strokeStyle = '#90a4ae';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(0, r*0.4);
                ctx.quadraticCurveTo(-r*0.45, r*0.85, -r*0.35, r*1.35);
                ctx.stroke();

                // 바닥 브러시 헤드 (삼각형 노즐)
                ctx.fillStyle = '#37474f';
                ctx.beginPath();
                ctx.moveTo(-r*0.35, r*1.35);
                ctx.lineTo(-r*0.6, r*1.55);
                ctx.lineTo(-r*0.1, r*1.55);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();

        } else if (this.modelType === 'panda_img' && pandaSprite.img) {

            // [NEW] 12단계: 팬더 커스텀 몸통 이미지 렌더링
            const img = pandaSprite.img;
            const size = this.radius * 2.5;
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else if (this.modelType === 'boss_bus') {
            // [NEW] 25단계 보스: 대형 2층 버스 (1/3 축소 및 비율 동적 연동)
            ctx.fillStyle = '#ffcc00'; // 버스 색상
            ctx.fillRect(-this.radius, -this.radius / 2, this.radius * 2, this.radius);
            
            // 바퀴 (지름 축소 및 비율 연동)
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(-this.radius * 0.7, this.radius / 2, this.radius * 0.16, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.7, this.radius / 2, this.radius * 0.16, 0, Math.PI * 2);
            ctx.fill();
            
            // 창문들 (비율 자동 연동)
            ctx.fillStyle = '#add8e6';
            const winSize = this.radius * 0.25;
            const winSpacing = this.radius * 0.38;
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(-this.radius + this.radius * 0.15 + i * winSpacing, -this.radius / 4, winSize, winSize);
            }
            
            ctx.fillStyle = '#000';
            ctx.font = `bold ${Math.max(10, this.radius * 0.25)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('BUS 25', 0, this.radius / 3);
        } else if (this.modelType === 'boss_cake') {
            // [NEW] 30단계 보스: 대형 3단 케이크 (1/3 축소 및 비율 동적 연동)
            const colors = ['#fff', '#ffb6c1', '#f0e68c'];
            const h = this.radius * 0.27; // 레이어 높이 비율 연동
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = colors[i];
                const w = this.radius * (1 - i * 0.2);
                ctx.fillRect(-w / 2, -h - (i * h), w, h);
                ctx.strokeStyle = '#ff69b4';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-w / 2, -h - (i * h), w, h);
            }
            
            // 촛불 (비율 연동)
            ctx.fillStyle = '#ff4500';
            ctx.beginPath();
            ctx.moveTo(0, -3.5 * h);
            ctx.lineTo(this.radius * 0.08, -3 * h);
            ctx.lineTo(-this.radius * 0.08, -3 * h);
            ctx.fill();
            
            ctx.fillStyle = '#ff69b4';
            ctx.font = `bold ${Math.max(10, this.radius * 0.24)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🎂 BOSS 30 🎂', 0, this.radius * 0.35);
        } else if (this.modelType === 'boss_robot') {
            // [NEW] 35단계 보스: 슈퍼 합체 로봇 (1/3 축소 및 비율 동적 연동)
            ctx.fillStyle = '#7f8c8d'; // 금속 회색
            ctx.fillRect(-this.radius * 0.5, -this.radius * 0.375, this.radius, this.radius * 0.75); // 몸통
            
            ctx.fillStyle = '#34495e';
            ctx.fillRect(-this.radius * 0.25, -this.radius * 0.625, this.radius * 0.5, this.radius * 0.25); // 머리
            
            ctx.fillStyle = '#e74c3c'; // 눈
            ctx.beginPath();
            ctx.arc(-this.radius * 0.125, -this.radius * 0.5, this.radius * 0.035, 0, Math.PI * 2);
            ctx.arc(this.radius * 0.125, -this.radius * 0.5, this.radius * 0.035, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#2980b9'; // 팔
            ctx.fillRect(-this.radius * 0.75, -this.radius * 0.25, this.radius * 0.25, this.radius * 0.625); // 왼팔
            ctx.fillRect(this.radius * 0.5, -this.radius * 0.25, this.radius * 0.25, this.radius * 0.625); // 오른팔
            
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.max(10, this.radius * 0.16)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🤖 MEGA ROBOT 🤖', 0, this.radius * 0.55);
        } else if (this.modelType === 'boss_pirate') {
            // [NEW] 40단계 최종 보스: 골든 엠페러 크라운 전함 (1/3 축소 및 비율 동적 연동)
            ctx.save();
            
            const scale = this.radius / 200; // 스케일 인자 계산
            
            // 황금 광채 효과
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 20 * scale;
            
            // 황금빛 그라데이션
            const goldGrad = ctx.createLinearGradient(-150 * scale, -100 * scale, 150 * scale, 100 * scale);
            goldGrad.addColorStop(0, '#ffe066');
            goldGrad.addColorStop(0.3, '#ffd700');
            goldGrad.addColorStop(0.7, '#cca300');
            goldGrad.addColorStop(1, '#997a00');
            ctx.fillStyle = goldGrad;
            
            // 왕관 테두리 드로잉
            ctx.beginPath();
            ctx.moveTo(-150 * scale, -40 * scale);
            ctx.quadraticCurveTo(-110 * scale, 40 * scale, -100 * scale, 50 * scale);
            ctx.lineTo(100 * scale, 50 * scale);
            ctx.quadraticCurveTo(110 * scale, 40 * scale, 150 * scale, -40 * scale);
            ctx.lineTo(120 * scale, -100 * scale);
            ctx.quadraticCurveTo(80 * scale, -30 * scale, 60 * scale, -30 * scale);
            ctx.lineTo(0 * scale, -150 * scale);
            ctx.quadraticCurveTo(-60 * scale, -30 * scale, -120 * scale, -100 * scale);
            ctx.closePath();
            ctx.fill();
            
            // 황금 아웃라인
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4 * scale;
            ctx.stroke();
            
            // 중앙 보석 (Glowing red ruby)
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 15 * scale;
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.arc(0, -150 * scale, 18 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2 * scale;
            ctx.stroke();
            
            // 왼쪽 보석 (Glowing blue sapphire)
            ctx.shadowColor = '#0000ff';
            ctx.shadowBlur = 15 * scale;
            ctx.fillStyle = '#3333ff';
            ctx.beginPath();
            ctx.arc(-120 * scale, -100 * scale, 14 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // 오른쪽 보석 (Glowing blue sapphire)
            ctx.fillStyle = '#3333ff';
            ctx.beginPath();
            ctx.arc(120 * scale, -100 * scale, 14 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            ctx.restore(); // 그림자 리셋
            ctx.save();
            ctx.fillStyle = '#4d3d00';
            ctx.font = `bold ${Math.max(12, 36 * scale)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('👑', 0, 5 * scale);
            ctx.restore();
            
            // 보스 명칭
            ctx.save();
            ctx.fillStyle = '#ffd700';
            ctx.font = `bold ${Math.max(12, 32 * scale)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 5 * scale;
            ctx.fillText('EMPEROR CROWN', 0, 100 * scale);
            ctx.restore();
        } else if (this.modelType === 'sports_ball') {
            // 10단계 스포츠 공 커스텀 벡터 드로잉 (Windows OS 이모지 분리/미정렬 버그 완벽 수정)
            ctx.rotate(this.spinAngle);
            const r = this.radius;

            if (this.model === '⚽') {
                // 1. 축구공 (Soccer Ball)
                // 하얀색 바디 그라데이션 (3D 구형)
                const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.7, '#f0f0f0');
                grad.addColorStop(1, '#cccccc');
                ctx.fillStyle = grad;
                ctx.strokeStyle = '#333333';
                ctx.lineWidth = 1.5;

                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // 오각형 및 격자선 그리기
                ctx.fillStyle = '#222222';
                ctx.strokeStyle = '#333333';
                ctx.lineWidth = 1.5;

                // 중앙 오각형
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const ang = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const px = Math.cos(ang) * (r * 0.35);
                    const py = Math.sin(ang) * (r * 0.35);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // 주변 오각형 꼭짓점 연결선 및 외각 반대편 선들
                for (let i = 0; i < 5; i++) {
                    const ang = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const c1x = Math.cos(ang) * (r * 0.35);
                    const c1y = Math.sin(ang) * (r * 0.35);
                    const c2x = Math.cos(ang) * (r * 0.7);
                    const c2y = Math.sin(ang) * (r * 0.7);
                    
                    // 연결선
                    ctx.beginPath();
                    ctx.moveTo(c1x, c1y);
                    ctx.lineTo(c2x, c2y);
                    ctx.stroke();

                    // 외각의 절반 부분 (오각형 연결 조각 묘사)
                    const angNext = (Math.PI * 2 / 5) * (i + 1) - Math.PI / 2;
                    const n2x = Math.cos(angNext) * (r * 0.7);
                    const n2y = Math.sin(angNext) * (r * 0.7);

                    ctx.beginPath();
                    ctx.moveTo(c2x, c2y);
                    ctx.lineTo(n2x, n2y);
                    const outX1 = Math.cos(ang + (Math.PI * 2 / 10)) * r;
                    const outY1 = Math.sin(ang + (Math.PI * 2 / 10)) * r;
                    ctx.lineTo(outX1, outY1);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }

                // 구형 하이라이트 글래스 효과
                const glassGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, -r * 0.3, -r * 0.3, r * 0.8);
                glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = glassGrad;
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();

            } else if (this.model === '🏀') {
                // 2. 농구공 (Basketball)
                // 오렌지 빛깔 3D 그라데이션
                const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
                grad.addColorStop(0, '#ff884d');
                grad.addColorStop(0.7, '#ff5500');
                grad.addColorStop(1, '#b33b00');
                ctx.fillStyle = grad;
                ctx.strokeStyle = '#222222';
                ctx.lineWidth = 2.0;

                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // 가로/세로 리브 선
                ctx.beginPath();
                ctx.moveTo(-r, 0); ctx.lineTo(r, 0);
                ctx.moveTo(0, -r); ctx.lineTo(0, r);
                ctx.stroke();

                // 양쪽 곡선 띠 (안쪽 타원형 띠)
                ctx.beginPath();
                ctx.arc(-r * 1.1, 0, r * 0.8, -Math.PI / 3, Math.PI / 3);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(r * 1.1, 0, r * 0.8, Math.PI - Math.PI / 3, Math.PI + Math.PI / 3);
                ctx.stroke();

                // 가죽 엠보싱 텍스처 느낌의 미세 점 (샌드 노이즈 렌더링)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                for (let i = 0; i < 15; i++) {
                    const tr = Math.random() * (r - 4);
                    const ta = Math.random() * Math.PI * 2;
                    ctx.fillRect(Math.cos(ta) * tr, Math.sin(ta) * tr, 1.5, 1.5);
                }

            } else if (this.model === '🏈') {
                // 3. 미식축구공 (American Football)
                ctx.save();
                ctx.rotate(-Math.PI / 6); // 살짝 눕힘
                
                // 가죽빛 3D 타원
                const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.3);
                grad.addColorStop(0, '#a05c3c');
                grad.addColorStop(0.7, '#804020');
                grad.addColorStop(1, '#4d200a');
                ctx.fillStyle = grad;
                ctx.strokeStyle = '#2b1104';
                ctx.lineWidth = 2.0;

                ctx.beginPath();
                ctx.ellipse(0, 0, r * 1.3, r * 0.8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // 양 끝 흰색 스트라이프 줄
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.arc(-r * 0.7, 0, r * 0.5, -Math.PI / 2, Math.PI / 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(r * 0.7, 0, r * 0.5, Math.PI / 2, Math.PI * 1.5);
                ctx.stroke();

                // 중앙 흰색 매듭 끈
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(-r * 0.5, 0); ctx.lineTo(r * 0.5, 0);
                ctx.stroke();

                ctx.lineWidth = 2.0;
                for (let i = -3; i <= 3; i++) {
                    const lx = i * (r * 0.13);
                    ctx.beginPath();
                    ctx.moveTo(lx, -5);
                    ctx.lineTo(lx, 5);
                    ctx.stroke();
                }

                ctx.restore();

            } else if (this.model === '⚾') {
                // 4. 야구공 (Baseball)
                const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.8, '#f5f3ef');
                grad.addColorStop(1, '#dbd8d0');
                ctx.fillStyle = grad;
                ctx.strokeStyle = '#999999';
                ctx.lineWidth = 1.5;

                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // 두 줄의 실밥 붉은 곡선
                ctx.strokeStyle = '#e63946';
                ctx.lineWidth = 1.5;

                ctx.beginPath();
                ctx.arc(-r * 0.8, 0, r * 0.65, -Math.PI * 0.35, Math.PI * 0.35);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(r * 0.8, 0, r * 0.65, Math.PI - Math.PI * 0.35, Math.PI + Math.PI * 0.35);
                ctx.stroke();

                ctx.fillStyle = '#e63946';
                for (let i = -4; i <= 4; i++) {
                    const ang = i * 0.22;
                    const lx = -r * 0.8 + Math.cos(ang) * (r * 0.65);
                    const ly = Math.sin(ang) * (r * 0.65);
                    ctx.fillRect(lx - 1, ly - 1, 2, 2);

                    const rx = r * 0.8 - Math.cos(ang) * (r * 0.65);
                    const ry = Math.sin(ang) * (r * 0.65);
                    ctx.fillRect(rx - 1, ry - 1, 2, 2);
                }

            } else if (this.model === '🎾') {
                // 5. 테니스공 (Tennis Ball)
                const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
                grad.addColorStop(0, '#e6ff33');
                grad.addColorStop(0.6, '#ccff00');
                grad.addColorStop(1, '#99cc00');
                ctx.fillStyle = grad;
                ctx.strokeStyle = '#80a000';
                ctx.lineWidth = 1.5;

                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.0;

                ctx.beginPath();
                ctx.arc(-r * 0.8, -r * 0.8, r * 0.9, -Math.PI * 0.1, Math.PI * 0.6);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(r * 0.8, r * 0.8, r * 0.9, Math.PI * 0.9, Math.PI * 1.6);
                ctx.stroke();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                for (let i = 0; i < 8; i++) {
                    const dx = (Math.random() - 0.5) * (r * 1.8);
                    const dy = (Math.random() - 0.5) * (r * 1.8);
                    if (Math.hypot(dx, dy) < r - 2) {
                        ctx.fillRect(dx, dy, 2, 2);
                    }
                }

            } else if (this.model === '⚪') {
                // 6. 당구공 (Glossy Billiard 8-Ball)
                const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
                grad.addColorStop(0, '#4e4e4e');
                grad.addColorStop(0.6, '#1a1a1a');
                grad.addColorStop(1, '#050505');
                ctx.fillStyle = grad;
                ctx.strokeStyle = '#111111';
                ctx.lineWidth = 1.5;

                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#000000';
                ctx.font = `bold ${r * 0.48}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('8', 0, 0);

                const glassGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 0, -r * 0.35, -r * 0.35, r * 0.6);
                glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
                glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = glassGrad;
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // 기본 이모지 및 기타 기체 렌더링 (Stage 1, 4, 5+ 등)
            ctx.rotate(this.spinAngle);
            
            // [MOD] 가독성 향상을 위해 사이즈 대폭 상향 (2.5 -> 3.0) 및 선명도 강화
            ctx.font = `${this.radius * 3.0}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.model, 0, 0);
        }

        if (this.isBoss && (!this.isExploding || this.explosionTimer > 180)) {
            const hpRatio = this.hp / this.maxHp;
            if (hpRatio < 0.7) {
                ctx.save();
                ctx.globalCompositeOperation = 'source-atop';
                
                let alpha = 0.55 * (1 - hpRatio);
                if (hpRatio <= 0.3) {
                    alpha = Math.floor(Date.now() / 150) % 2 === 0 ? 0.75 : 0.2;
                }
                ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
                ctx.fillRect(-this.radius * 2.1, -this.radius * 2.1, this.radius * 4.2, this.radius * 4.2);
                ctx.restore();
            }
        }

        // 보스 단계 점수에 따른 빨간 과열(Tint) 효과 적용 (대표님 음성 피드백 반영: 서서히 미세하게 빨개지도록 최대 알파 0.35 적용)
        if (this.isBoss && (!this.isExploding || this.explosionTimer > 180)) {
            const redRatio = (thisStageCoins / 20000) * 0.35;
            if (redRatio > 0) {
                ctx.save();
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = `rgba(255, 0, 0, ${redRatio})`;
                ctx.beginPath();
                // 보스 바디 영역을 확실히 덮는 큰 반경으로 마스킹 그리기
                ctx.arc(0, 0, this.radius * 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // [NEW] 보스 자가 대폭발 중일 때 과부하 번쩍임 및 동적 쇼크웨이브 고리 렌더링
        if (this.isBoss && this.isExploding) {
            ctx.save();
            
            // 1초 뒤 대폭발이 일어난 후에는 본체가 없으므로 source-over(일반) 드로잉을 하고, 그 전에는 본체 내부를 번쩍이게 source-atop을 씁니다.
            const exploded = this.explosionTimer <= 180;
            ctx.globalCompositeOperation = exploded ? 'source-over' : 'source-atop';
            
            const flash = Math.sin(this.timer * 0.4) > 0;
            // 1초 후에는 중심부 대형 불꽃 구체가 3초 동안 부드럽게 페이드아웃 되게 알파 계산
            const fadeAlpha = exploded ? (this.explosionTimer / 180) * 0.75 : 0.85;
            ctx.fillStyle = flash ? `rgba(255, 255, 255, ${fadeAlpha})` : `rgba(255, 69, 0, ${fadeAlpha * 0.75})`;
            
            ctx.beginPath();
            // 1초 뒤 터지는 순간(폭풍 팽창 후 수축) 구체 반경 애니메이션
            const sizeMult = exploded ? 1.0 + (1.0 - this.explosionTimer / 180) * 1.5 : 1.0;
            ctx.arc(0, 0, this.radius * 2.5 * sizeMult, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // 쇼크웨이브 링은 1초 뒤 대폭발이 일어난 후에만 퍼져나가는 고리로 연출!
            if (exploded) {
                ctx.save();
                const ringCount = 2;
                for (let rIdx = 0; rIdx < ringCount; rIdx++) {
                    const age = (this.timer + rIdx * 15) % 30; // 0 ~ 29
                    const sizeRatio = age / 30;
                    const ringRadius = this.radius * (1.0 + sizeRatio * 1.2);
                    const opacity = (1.0 - sizeRatio) * (this.explosionTimer / 180);
                    ctx.strokeStyle = `rgba(255, 140, 0, ${opacity})`;
                    ctx.lineWidth = 6 * (1.0 - sizeRatio);
                    ctx.beginPath();
                    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
            }
        }

        ctx.restore();

        // [MOD] HP 텍스트 렌더링 제거 - 대표님 요청
    }
}

// ==========================================
// Particle (폭발 파편) 클래스
// ==========================================
class Particle {
    constructor(x, y, color, customDecay = 0.02, speedMultiplier = 1) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 3 + 1;
        this.color = color;
        // 사방으로 퍼지는 속도
        this.speedX = (Math.random() - 0.5) * (Math.random() * 5 + 2) * speedMultiplier;
        this.speedY = (Math.random() - 0.5) * (Math.random() * 5 + 2) * speedMultiplier;
        this.alpha = 1; // 투명도
        this.friction = customDecay < 0.01 ? 0.975 : 0.95; // 3초 파편은 공기저항을 덜 받아 더 우아하게 날아감
        this.alphaDecay = customDecay;
        this.markedForDeletion = false;
    }

    update() {
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.alphaDecay; // 서서히 사라짐

        if (this.alpha <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ==========================================
// [NEW] 적군 분열/파편 생성 로직
// ==========================================
function spawnFragments(parent) {
    let count = 3;
    let model = '✨';
    let type = 'emoji';
    let radius = parent.radius * 0.5;
    let behavior = 'basic';
    let subType = null;

    if (parent.subType === 'soap_bubble') {
        model = '🫧'; count = 2;
    } else if (parent.subType === 'wafer') {
        model = '🧇'; count = 4; radius = 15;
    } else if (parent.subType === 'watermelon') {
        model = '🍉'; count = 6; radius = 20;
    } else if (parent.subType === 'cream') {
        model = '🧁'; count = 3; radius = 18;
    } else if (parent.subType === 'popcorn') {
        model = '🍿'; count = 5; radius = 12;
    }

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const speed = 3 + Math.random() * 3;
        
        const fragment = new Enemy();
        fragment.x = parent.x;
        fragment.y = parent.y;
        fragment.model = model;
        fragment.radius = radius;
        fragment.speedX = Math.cos(angle) * speed;
        fragment.speedY = Math.sin(angle) * speed;
        fragment.behavior = behavior;
        fragment.subType = subType;
        fragment.hp = 1;
        
        enemies.push(fragment);
    }
}

// ==========================================
// Coin (적 파괴 시 드랍되는 재화) 클래스
// ==========================================
class Coin {
    constructor(x, y, type = 'gold') {
        this.x = x;
        this.y = y;
        this.type = type; // 'gold', 'red', 'blue'
        this.radius = 12;
        this.speedY = 2.5;
        this.markedForDeletion = false;
    }

    update() {
        if (player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.hypot(dx, dy);

            // [NEW] 자석 시스템: 범위 내에 있으면 플레이어에게 끌려옴
            if (distance < magnetRange) {
                // 초당 300px (1프레임당 약 5px) 속도로 흡수
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * 5;
                this.y += Math.sin(angle) * 5;
            } else {
                // 범위 밖이면 그냥 아래로 내려옴
                this.y += this.speedY;
            }

            if (distance < this.radius + player.width / 2) {
                // [수정] 아이템 효과 부여 (상점 MLT 레벨당 지속 시간 2초 추가!)
                const extraTimer = (multiShotLevel - 1) * 2000;
                if (this.type === 'red') { player.powerup = 'red'; player.powerupTimer = 10000 + extraTimer; }
                else if (this.type === 'blue') { player.powerup = 'blue'; player.powerupTimer = 10000 + extraTimer; }
                else if (this.type === 'fire') { player.powerup = 'fire'; player.powerupTimer = 8000 + extraTimer; }

                // [수정] 점수 튐 현상 방지: Number()로 강제 형변환 후 더하기
                const earned = (doubleCoinTimer > 0 || isDoubleCoinMode) ? 400 : 200;
                
                thisGameCoins = Number(thisGameCoins) + earned;
                thisStageCoins = Number(thisStageCoins) + earned;
                totalCoins = Number(totalCoins) + earned;
                
                saveData(); 
                playCoinSound();
                this.markedForDeletion = true;
            }
        }

        if (this.y > CANVAS_HEIGHT) {
            this.markedForDeletion = true;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // 코인 색상 분기
        if (this.type === 'red') ctx.fillStyle = '#ff3333';
        else if (this.type === 'blue') ctx.fillStyle = '#3333ff';
        else if (this.type === 'fire') ctx.fillStyle = '#ff8800'; // 불꽃 색상
        else ctx.fillStyle = '#ffd700';

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let symbol = '$';
        if (this.type === 'red') symbol = 'P';
        if (this.type === 'blue') symbol = 'W';
        if (this.type === 'fire') symbol = 'F';
        ctx.fillText(symbol, 0, 0);
        ctx.restore();
    }
}

// 화면 진동(Camera Shake) 변수
let shakeTime = 0;
let shakeAmount = 20;

// ==========================================
// 메인 게임 루프
// ==========================================
function gameLoop() {
    try {
        if (!isPlaying || isPaused) return; // [MOD] 일시정지 시 루프 중단

    // [FIX] 잔상 및 빛번짐을 완전히 제거하기 위해 루프 시작 시 모든 상태 초기화 및 전체 화면 소거
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 변환 행렬 초기화
    ctx.shadowBlur = 0;                 // 광원 효과 잔류 방지
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // 전체 픽셀 소거
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);  // 검은색 배경 채우기

    // [NEW] 보스 체력바 UI 업데이트
    const activeBoss = enemies.find(e => e.isBoss);
    if (activeBoss) {
        if (bossHpContainer) bossHpContainer.style.display = 'block';
        
        let bossDisplayName = '👹 BOSS';
        if (activeBoss.modelType === 'boss_bus') bossDisplayName = '🚌 BUS 25';
        else if (activeBoss.modelType === 'boss_cake') bossDisplayName = '🎂 CAKE 30';
        else if (activeBoss.modelType === 'boss_robot') bossDisplayName = '🤖 MEGA ROBOT 35';
        else if (activeBoss.modelType === 'boss_pirate') bossDisplayName = '👑 EMPEROR CROWN 40';
        
        if (bossName) bossName.innerText = bossDisplayName;
        
        const currentHp = Math.max(0, Math.floor(activeBoss.hp));
        const maxHp = activeBoss.maxHp || 100;
        if (bossHpText) bossHpText.innerText = `${currentHp} / ${maxHp}`;
        
        const ratio = (currentHp / maxHp) * 100;
        if (bossHpBar) bossHpBar.style.width = `${ratio}%`;
    } else {
        if (bossHpContainer) bossHpContainer.style.display = 'none';
    }

    // 카메라 셰이크 로직 시작 (여기서부터 다시 translate 적용)
    ctx.save();
    if (shakeTime > 0) {
        const dx = (Math.random() - 0.5) * shakeAmount;
        const dy = (Math.random() - 0.5) * shakeAmount;
        ctx.translate(dx, dy);
        shakeTime--;
    }

    // 플레이어 업데이트 및 그리기
    if (player) {
        player.update();
        player.draw();
    }

    // 시간 경과에 따른 적 스폰
    const currentTime = Date.now();
    let canSpawn = false;

    const isBossStage = [25, 30, 35, 40].includes(currentStage);

    if (currentTime - lastSpawntime > spawnInterval) {
        canSpawn = true;
    }

    if (isBossStage) {
        // 보스가 이미 있으면 추가 스폰 방지 (1:1 단판 승부)
        const hasBoss = enemies.some(e => e.isBoss);
        if (hasBoss) {
            canSpawn = false;
        }
    }

    if (canSpawn) {
        enemies.push(new Enemy());
        lastSpawntime = currentTime;

        // 난이도 상승 로직
        if (spawnInterval > 250) spawnInterval -= 5;
        enemySpeedMultiplier += 0.002;
    }

    // [MOD] 총알 업데이트 - 안전하게 역순 for 루프로 변경하여 삭제 시 인덱스 밀림 방지
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.update();
        bullet.draw();
        if (bullet.markedForDeletion) {
            bullets.splice(i, 1);
        }
    }

    // [MOD] 적 업데이트 및 그리기 - 안전한 역순 for 루프
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();
        enemy.draw();

        // [NEW] 폭사 중인 보스는 물리적 충돌 및 총알 타격 대상에서 제외
        if (enemy.isBoss && enemy.isExploding) {
            continue;
        }

        // [NEW] 행동 패턴별 플레이어/탄환 상호작용
        if (enemy.behavior === 'vacuum') {
            // 플레이어 탄환을 빨아들임
            bullets.forEach(b => {
                const dist = Math.hypot(enemy.x - b.x, enemy.y - b.y);
                if (dist < 250) {
                    const ang = Math.atan2(enemy.y - b.y, enemy.x - b.x);
                    b.x += Math.cos(ang) * 4;
                    b.y += Math.sin(ang) * 4;
                }
            });
        }
        if (enemy.behavior === 'blackhole_pull') {
            const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            if (dist < 300) {
                const ang = Math.atan2(enemy.y - player.y, enemy.x - player.x);
                mouse.x += Math.cos(ang) * 3;
                mouse.y += Math.sin(ang) * 3;
            }
        }
        if (enemy.behavior === 'heat_push') {
            const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            if (dist < 200) {
                const ang = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                mouse.x += Math.cos(ang) * 5;
                mouse.y += Math.sin(ang) * 5;
            }
        }

        // 1. 플레이어와 적군 충돌 검사
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.hypot(dx, dy);

        const playerHitRadius = enemy.isBoss ? 120 : enemy.radius; // 보스 피격 반지름 2배 확대 (60 -> 120)
        if (distance < playerHitRadius + player.width / 3) {
            // [NEW] 특수 장애물 충돌 시 상태 이상 부여 (데드 판정 대신)
            if (enemy.isIndestructible && enemy.subType === 'peel') {
                player.stunTimer = 2000; // 2초간 조작 불능
                enemy.markedForDeletion = true;
            } else if (enemy.isIndestructible && enemy.subType === null) {
                 // 장독대 등은 그냥 튕겨나가거나 플레이어 사망 (여기선 사망 유지)
                 isPlaying = false;
                 gameOver();
            } else {
                for (let j = 0; j < 30; j++) {
                    particles.push(new Particle(player.x, player.y, '#ff0000'));
                    particles.push(new Particle(player.x, player.y, '#ffffff'));
                }
                shakeTime = 20;
                setTimeout(() => { gameOver(); }, 500);
                isPlaying = false;
            }
        }

        // 2. 총알과 적군 충돌 검사
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            const bx = bullet.x - enemy.x;
            const by = bullet.y - enemy.y;
            const bDist = Math.hypot(bx, by);

            const bulletHitRadius = enemy.isBoss ? 100 : enemy.radius; // 보스 탄환 충돌 반지름 2배 확대 (50 -> 100)
            if (bDist < bulletHitRadius + bullet.radius) {
                if (enemy.isIndestructible) {
                    bullet.markedForDeletion = true;
                    continue; // 파괴 불가 적은 데미지 무시
                }
                for (let k = 0; k < 3; k++) {
                    particles.push(new Particle(bullet.x, bullet.y, bullet.color));
                }

                if (enemy.modelType === 'special_plate') {
                    playGlassSound();
                } else if (enemy.modelType === 'racing_car') {
                    playKlaxonSound();
                } else if (enemy.modelType === 'pungmul') {
                    playPungmulSound(enemy.model);
                } else if (enemy.modelType === 'chinese_inst') {
                    playChineseInstrumentSound(enemy.model);
                } else if (enemy.modelType === 'indian_inst') {
                    playIndianInstrumentSound(enemy.model);
                } else if (enemy.modelType === 'appliance') {
                    playApplianceSound(enemy.model);
                } else {
                    if (currentStage === 4) playChineseInstrumentSound(enemy.model);
                    else if (currentStage === 6) playGlassSound(); 
                    else if (currentStage === 8) playPungmulSound(enemy.model); // 백업 가드
                    else if (currentStage === 10) playAirEscapeSound();
                    else if (currentStage === 11) playClinkSound();
                    else if (currentStage === 12) playAnimalSound(enemy.model);
                    else if (currentStage === 15) playFireworkSound();
                    else if (currentStage === 16) playIndianInstrumentSound(enemy.model);
                    else if (currentStage === 17) playApplianceSound(enemy.model);
                    else if (currentStage === 18) playInstrumentSound(enemy.model);
                    else if (currentStage === 19) playBboingSound();
                }



                // 보스 타격 시: 데미지는 무시하되 타격 연출과 사운드 재생 (코인 수집으로만 격파되도록 설정!)
                if (enemy.isBoss) {
                    for (let k = 0; k < 5; k++) {
                        particles.push(new Particle(bullet.x, bullet.y, '#ffd700'));
                    }
                    if (enemy.modelType === 'boss_bus') playKlaxonSound();
                    else if (enemy.modelType === 'boss_cake') playBboingSound();
                    else if (enemy.modelType === 'boss_robot') playClinkSound();
                    else playClinkSound(); // 최종 보스 왕관
                } else {
                    enemy.hp -= bullet.damage || 1;
                }

                if (!bullet.isPiercing) {
                    bullet.markedForDeletion = true;
                }

                if (enemy.hp <= 0 && !enemy.isBoss) {
                    enemy.markedForDeletion = true;
                    
                    if (enemy.isBoss) {
                        // [NEW] 보스 격파 스펙타클 연출
                        shakeTime = 45;
                        shakeAmount = 25; // 강렬한 화면 흔들림
                        
                        // 65개 이상의 풍부한 파티클 생성
                        for (let k = 0; k < 65; k++) {
                            const pColor = Math.random() < 0.4 ? '#ffd700' : (Math.random() < 0.7 ? '#ff3333' : '#ffffff');
                            particles.push(new Particle(enemy.x, enemy.y, pColor));
                        }
                        
                        // 웅장한 폭발 사운드 재생
                        playBossExplosionSound();
                        console.log("🔥 보스 격파! 스펙타클 연출 실행");
                    }

                    score = Math.floor(Number(score) + (Number(enemy.maxHp) * 10));
                    if (score < 0) score = 0; 
                    saveData();

                    // [NEW] 분열/파편 로직
                    if (enemy.behavior === 'split' || enemy.behavior === 'shatter' || enemy.behavior === 'burst') {
                        spawnFragments(enemy);
                    }

                    if (enemy.modelType === 'special_plate') {
                        playGlassSound();
                        playGlassSound();
                    }

                    let dropChance = 1.0; // 일반 단계는 100% 코인 드롭
                    if (currentStage === 25 || currentStage === 30 || currentStage === 35 || currentStage === 40) {
                        dropChance = 0.50; // 보스 단계(25, 30, 35, 40)만 50% 드롭 확률
                    }

                    if (Math.random() < dropChance) {
                        const rand = Math.random();
                        if (rand < 0.08) coins.push(new Coin(enemy.x, enemy.y, 'fire'));
                        else if (rand < 0.18) coins.push(new Coin(enemy.x, enemy.y, 'red'));
                        else if (rand < 0.28) coins.push(new Coin(enemy.x, enemy.y, 'blue'));
                        else coins.push(new Coin(enemy.x, enemy.y, 'gold'));
                    }

                    for (let k = 0; k < 15; k++) {
                        particles.push(new Particle(enemy.x, enemy.y, enemy.color));
                        particles.push(new Particle(enemy.x, enemy.y, '#ffffff'));
                    }
                }
            }
        }

        if (enemy.markedForDeletion) {
            enemies.splice(i, 1);
        }
    }

    // [NEW] 적군 발사체 업데이트 및 플레이어 충돌
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eb = enemyBullets[i];
        eb.update();
        eb.draw();

        const dist = Math.hypot(player.x - eb.x, player.y - eb.y);
        if (dist < eb.radius + player.width / 3) {
            // 특수 효과 부여
            if (eb.type === 'melt') player.slowTimer = 3000;
            else if (eb.type === 'cream_ball') player.blindTimer = 2000;
            else {
                // 일반 적군 탄환은 플레이어 사망
                isPlaying = false;
                gameOver();
            }
            eb.markedForDeletion = true;
        }

        if (eb.markedForDeletion) {
            enemyBullets.splice(i, 1);
        }
    }

    // [NEW] 시야 방해 (Blind) 효과 레이어
    if (player.blindTimer > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('시야 방해!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    // 파티클 업데이트 및 그리기 - 안전한 역순 for 루프
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();
        if (particle.markedForDeletion) {
            particles.splice(i, 1);
        }
    }

    // [NEW] 보스 단계 20,000코인, 일반 단계 10,000코인 동적 배정
    const isBossStageDynamic = [25, 30, 35, 40].includes(currentStage);
    coinsPerStage = isBossStageDynamic ? 20000 : 10000;

    const currentProgress = Math.floor(thisStageCoins);
    // [MOD] 보스전의 경우 코인이 다 모였을 때 즉시 전환하지 않고, 보스의 폭발 연출(4초)이 끝난 뒤에 handleStageClear()가 수동으로 작동하도록 지연시킵니다.
    if (currentProgress >= coinsPerStage && !isBossStageDynamic) {
        console.log(`🚀 스테이지 클리어 조건 충족(${coinsPerStage})! ${currentStage + 1}단계로 전환을 시도합니다.`);
        handleStageClear();
    }

    // 스테이지가 바뀌었을 때 화면 싹쓸이(클리어) 연출 및 배경색 전환 처리
    if (currentStage !== prevStage) {
        thisStageCoins = 0; // [FIX] 대입을 통한 0 초기화
        stageMessageTimer = 180;

        // 하늘에 떠 있던 기존 적군의 타입을 바꾸거나 클리어 시각 효과 연출
        enemies.forEach(enemy => {
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(enemy.x, enemy.y, enemy.color || '#fff'));
            }
        });
        enemies = []; // 적군 싹 치우기 (새로운 타겟들이 떨어지도록 비워줌)
        bullets = []; // 현재 쏜 총알들도 화면에 남아 에러가 나지 않게 일괄 리셋

        // 배경색을 스테이지에 맞춰서 변경 (기본은 우주 느낌의 그라데이션)
        const hue1 = (currentStage * 18) % 360;
        const hue2 = (currentStage * 18 + 40) % 360;
        canvas.style.background = `linear-gradient(to bottom, hsl(${hue1}, 50%, 15%), hsl(${hue2}, 50%, 25%))`;

        // [NEW] 스테이지 진입 특수 효과음 및 앰비언스 처리
        if (currentStage === 13) {
            startSpaceAmbiance(); // 우주 진입 소리 (무한 루프 시작)
        } else {
            stopSpaceAmbiance(); // 우주 탈출 시 소리 멈춤
        }

        prevStage = currentStage;
    }

    // 타겟 풀 이모지/스테이지 번호 등 라운드 변경 알림을 화면 중앙에 커다랗게 렌더링
    if (stageMessageTimer > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${stageMessageTimer / 180})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // "STAGE X" 글자
        ctx.font = 'bold 50px Arial';
        ctx.fillText(`Space Defender: STAGE ${currentStage}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

        // 렌더링될 타겟 미리보기 글자
        const pool = stageTargetPools[currentStage] || stageTargetPools[20];
        ctx.font = 'bold 35px Arial';
        ctx.fillText(`Targets: ${pool.join(' ')}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

        ctx.restore();
        stageMessageTimer--;
    }

    // 코인 렌더링 호출 - 안전한 역순 for 루프
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        coin.update();
        coin.draw();
        if (coin.markedForDeletion) {
            coins.splice(i, 1);
        }
    }

    ctx.restore(); // 카메라 셰이크 복구용

    // [FINAL HUD GUARD] 화면에 뿌리기 직전에 음수 및 소수점을 강제로 자릅니다.
    updateHUD();

    // [NEW] 2배 코인 타이머 자막 표시 및 자석 비용 갱신
    if (doubleCoinTimer > 0 || isDoubleCoinMode) {
        doubleCoinTimerDisplay.style.display = 'inline';
        if (doubleCoinTimer > 0) {
            // 1프레임당 0.016초씩 차감 (약 60fps)
            doubleCoinTimer -= 0.016; 
            const mins = Math.floor(doubleCoinTimer / 60);
            const secs = Math.floor(doubleCoinTimer % 60);
            doubleCoinTimerDisplay.innerText = `⏳ 2X: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            doubleCoinTimerDisplay.innerText = `⏳ 2X: REVIVED`;
        }
    } else {
        doubleCoinTimerDisplay.style.display = 'none';
    }
    if (magnetCostDisplay) magnetCostDisplay.innerText = costMagnetRange.toLocaleString();

    // [NEW] HUD 퀵 업그레이드 버튼 갱신 (Safety Guard 추가)
    if (btnQuickFireRate) {
        btnQuickFireRate.innerText = `🔫 SPD [LV.${fireRateLevel}] ${costFireRate.toLocaleString()}`;
        btnQuickFireRate.disabled = totalCoins < costFireRate;
    }
    if (btnQuickMultiShot) {
        btnQuickMultiShot.innerText = `🌟 MLT [LV.${multiShotLevel}] ${costMultiShot.toLocaleString()}`;
        btnQuickMultiShot.disabled = totalCoins < costMultiShot || multiShotLevel >= 3;
    }
    if (btnQuickEnemySlow) {
        btnQuickEnemySlow.innerText = `🐢 SLW [LV.${enemySlowLevel}] ${costEnemySlow.toLocaleString()}`;
        btnQuickEnemySlow.disabled = totalCoins < costEnemySlow || enemySlowLevel >= 8;
    }

    // [ADD] 다음 레벨까지의 진행도 표시 (대표님 확인용)
    const nextLevelCoinGoal = coinsPerStage;
    const currentProgressCoins = Math.max(0, Math.floor(thisStageCoins));
    const progressPercent = (currentProgressCoins / nextLevelCoinGoal) * 100;

    const bar = safeGetElement('levelProgressBar');
    if (bar) bar.style.width = Math.min(100, progressPercent) + '%';
    const progressText = safeGetElement('levelProgressText');
    if (progressText) {
        progressText.innerText = `To Next Level: ${currentProgressCoins.toLocaleString()} / ${nextLevelCoinGoal.toLocaleString()}`;
    }

        // 다음 프레임 예약
        animationId = requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error("GameLoop Error:", e);
        // [FIX] 무한 에러 루프 방지를 위해 즉시 재호출하지 않고 게임 중지
        isPlaying = false;
        alert("게임 루프 중 치명적인 오류가 발생했습니다. 페이지를 새로고침 해주세요! (Error: " + e.message + ")");
    }
}

// ==========================================
// 게임 컨트롤 함수
// ==========================================
let isGameStarting = false;
function startGame() {
    if (isGameStarting) return;
    isGameStarting = true;
    
    try {
        console.log("🚀 게임 엔진 초기화 중...");
        
        // 1. 기존 루프 완전 박멸 (중복 실행 방지)
        isPlaying = false; 
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        // 2. 점수 및 세션 데이터 완전 초기화 (Number 강제)
        score = 0;
        thisGameCoins = 0;
        thisStageCoins = 0;
        
        // 누적 코인은 항상 최신 상태 유지 (전역 변수 사용)
        console.log("현재 누적 코인:", totalCoins);

        // 3. UI 화면 전환 (확실하게 처리)
        const allScreens = [startScreen, gameOverScreen, gameClearScreen, shopScreen];
        allScreens.forEach(s => {
            if(s) {
                s.classList.remove('active');
                s.classList.add('hidden');
            }
        });
        if (bossHpContainer) bossHpContainer.style.display = 'none';

        // 4. Game environment reset
        bullets = [];
        enemies = [];
        particles = [];
        coins = [];
        enemyBullets = [];
        lastSpawntime = Date.now();
        enemySpeedMultiplier = baseEnemySpeedMultiplier;
        isRevived = false;
        isDoubleCoinMode = false;
        window.isDeveloperStageOverridden = false;

        player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 150);
        mouse.x = player.x;
        mouse.y = player.y;

        // 5. BGM 및 루프 시작
        updateBGM(); 
        isPlaying = true;
        isPaused = false;
        gameLoop();

    } catch (e) {
        console.error("게임 시작 중 치명적 에러:", e);
    } finally {
        setTimeout(() => { isGameStarting = false; }, 500);
    }
}

function updateShopUI() {
    // 1. 코인 표시 정규화
    const displayTotalCoins = Math.max(0, Math.floor(totalCoins / 100) * 100);
    if (shopCoinValue) shopCoinValue.innerText = displayTotalCoins.toLocaleString();
    if (coinValue) coinValue.innerText = displayTotalCoins.toLocaleString();

    // 2. 상점 가격 텍스트 갱신
    if (costFireRateElement) costFireRateElement.innerText = costFireRate.toLocaleString();
    if (costMultiShotElement) costMultiShotElement.innerText = costMultiShot.toLocaleString();
    if (costEnemySpeedElement) costEnemySpeedElement.innerText = costEnemySpeed.toLocaleString(); 
    if (costLaserElement) costLaserElement.innerText = costLaser.toLocaleString();
    if (magnetCost) magnetCost.innerText = costMagnetRange.toLocaleString();

    // 3. HUD 퀵 버튼 텍스트 갱신 [LV.X] 표시 추가
    if (btnQuickFireRate) btnQuickFireRate.innerText = `🔫 SPD [LV.${fireRateLevel}] ${costFireRate.toLocaleString()}`;
    if (btnQuickMultiShot) btnQuickMultiShot.innerText = `🌟 MLT [LV.${multiShotLevel}] ${costMultiShot.toLocaleString()}`;
    if (btnQuickEnemySlow) btnQuickEnemySlow.innerText = `🐢 SLW [LV.${enemySlowLevel}] ${costEnemySpeed.toLocaleString()}`;

    // 4. 버튼 활성화/비활성화 제어
    upgFireRateBtn.disabled = totalCoins < costFireRate;
    upgMultiShotBtn.disabled = totalCoins < costMultiShot || multiShotLevel >= 5;
    upgEnemySpeedBtn.disabled = totalCoins < costEnemySpeed || enemySlowLevel >= 10; 
    
    btnQuickFireRate.disabled = totalCoins < costFireRate;
    btnQuickMultiShot.disabled = totalCoins < costMultiShot || multiShotLevel >= 5;
    btnQuickEnemySlow.disabled = totalCoins < costEnemySlow || enemySlowLevel >= 10;
    btnMagnetUpg.disabled = totalCoins < costMagnetRange;
    
    // 레이저는 단판용 코드로 특수 처리
    if (currentLaserActive) {
        upgLaserBtn.innerText = "EQUIPPED";
        upgLaserBtn.disabled = true;
    } else {
        upgLaserBtn.innerText = `EQUIP (${costLaser.toLocaleString()})`;
        upgLaserBtn.disabled = totalCoins < costLaser;
    }
}

function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(animationId);

    // [NEW] 죽었을 때 배경음악 정지 (다시 시작할 때 처음부터 나오게 하기 위함)
    BGM.stop();

    // [MOD] 게임 오버 시 전면 광고(Interstitial) 시도
    showInterstitial();

    // [MOD] 결과 화면 출력 시에도 마이너딩 및 지저분한 끝자리 강제 교정
    const finalResultsScore = Math.max(0, Math.floor(score));
    const finalResultsCoins = Math.max(0, Math.floor(thisGameCoins / 100) * 100);

    finalScoreValue.innerText = finalResultsScore.toLocaleString();
    acquiredCoinValue.innerText = finalResultsCoins.toLocaleString();

    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('active');

    // 게임오버 시 단판용 레이저 효과 제거
    currentLaserActive = false;

    // 무제한 부활 허용 (더 이상 부활 버튼을 숨기지 않음)
    adReviveBtn.style.display = 'block';
    adDoubleCoinBtn.style.display = 'inline-block';
}

function gameClear() {
    isPlaying = false;
    cancelAnimationFrame(animationId);
    showInterstitial();

    // [MOD] 결과 화면 출력 시에도 마이너스 및 지저분한 끝자리 강제 교정
    const finalClearScore = Math.max(0, Math.floor(score));
    const finalClearCoins = Math.max(0, Math.floor(thisGameCoins / 100) * 100);

    clearScoreValue.innerText = finalClearScore.toLocaleString();
    clearCoinValue.innerText = finalClearCoins.toLocaleString();

    gameClearScreen.classList.remove('hidden');
    gameClearScreen.classList.add('active');
}

// ==========================================
// 이벤트 리스너 등록
// ==========================================

// ==========================================
// 마우스 및 터치 이벤트 처리 (모바일 민감도 향상)
// ==========================================
let lastTouchX = null;
let lastTouchY = null;
const TOUCH_SENSITIVITY = 2.2; // 스마트폰 터치 이동 민감도 (살짝 터치해도 많이 이동)

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isPlaying) return;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isPlaying) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    if (lastTouchX !== null && lastTouchY !== null) {
        const deltaX = currentX - lastTouchX;
        const deltaY = currentY - lastTouchY;

        mouse.x += deltaX * TOUCH_SENSITIVITY;
        mouse.y += deltaY * TOUCH_SENSITIVITY;

        // 타겟 위치가 화면 밖으로 벗어나지 않도록 보정
        mouse.x = Math.max(0, Math.min(CANVAS_WIDTH, mouse.x));
        mouse.y = Math.max(0, Math.min(CANVAS_HEIGHT, mouse.y));
    }
    lastTouchX = currentX;
    lastTouchY = currentY;
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    lastTouchX = null;
    lastTouchY = null;
});

// PC 환경 마우스는 직관적인 절대 좌표 방식 유지
canvas.addEventListener('mousemove', (e) => {
    if (!isPlaying) return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// 터치/클릭 혹은 롱 프레스 시 브라우저 기본 우클릭/컨텍스트 메뉴 차단
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// 버튼 이벤트 - 터치 및 클릭 허용 (이벤트 전파 방지 옵션 추가)
function bindTouchAndClick(element, callback) {
    if (!element) return;
    let lastEventTime = 0;
    const handler = (e, isTouch) => {
        const now = Date.now();
        if (now - lastEventTime < 300) {
            if (isTouch) e.preventDefault();
            e.stopPropagation();
            return;
        }
        lastEventTime = now;
        e.stopPropagation();
        callback(e);
    };
    element.addEventListener('click', (e) => handler(e, false));
    element.addEventListener('touchstart', (e) => {
        handler(e, true);
    }, { passive: false });
}

// 메인 메뉴 <-> 상점 이동 로직
bindTouchAndClick(shopBtn, () => {
    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');
    shopScreen.classList.remove('hidden');
    shopScreen.classList.add('active');
    updateShopUI(); // 상점 진입 시 코인 최신화
});

bindTouchAndClick(closeShopBtn, () => {
    shopScreen.classList.remove('active');
    shopScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    startScreen.classList.add('active');
});

// 상점에 진입하거나 나갈 때 UI 최신화는 이미 등록됨

// [FINAL] 상점 및 HUD 업그레이드 통합 로직
bindTouchAndClick(upgFireRateBtn, () => {
    if (totalCoins >= costFireRate) {
        totalCoins -= costFireRate;
        totalCoins = Math.floor(totalCoins / 100) * 100;
        fireRateLevel++;
        costFireRate *= 2; 
        saveData();
        updateShopUI();
        playPurchaseSuccessSound();
        alert("Purchase Successful! (SPD LV Up)");
    } else {
        playPurchaseFailSound();
        alert("Not enough coins!");
    }
});

bindTouchAndClick(upgMultiShotBtn, () => {
    if (totalCoins >= costMultiShot && multiShotLevel < 5) {
        totalCoins -= costMultiShot;
        totalCoins = Math.floor(totalCoins / 100) * 100;
        multiShotLevel++;
        costMultiShot *= 2;
        saveData();
        updateShopUI();
        playPurchaseSuccessSound();
        alert("Purchase Successful! (MLT LV Up)");
    } else {
        playPurchaseFailSound();
        alert("Not enough coins!");
    }
});

bindTouchAndClick(upgEnemySpeedBtn, () => {
    if (totalCoins >= costEnemySpeed && enemySlowLevel < 10) {
        totalCoins -= costEnemySpeed;
        totalCoins = Math.floor(totalCoins / 100) * 100;
        enemySlowLevel++;
        costEnemySpeed *= 2;
        saveData();
        updateShopUI();
        playPurchaseSuccessSound();
        alert("Purchase Successful! (SLW LV Up)");
    } else {
        playPurchaseFailSound();
        alert("Not enough coins!");
    }
});

bindTouchAndClick(upgLaserBtn, () => {
    if (totalCoins >= costLaser && !currentLaserActive) {
        totalCoins -= costLaser;
        totalCoins = Math.floor(totalCoins / 100) * 100;
        currentLaserActive = true;
        saveData();
        updateShopUI();
        playPurchaseSuccessSound();
        alert("Purchase Successful! (Laser Equipped)");
    } else {
        playPurchaseFailSound();
        alert("Not enough coins!");
    }
});

// HUD 퀵 업그레이드 버튼 (상점과 가격/레벨 공유)
bindTouchAndClick(btnQuickFireRate, () => {
    if (totalCoins >= costFireRate) {
        totalCoins -= costFireRate;
        totalCoins = Math.floor(totalCoins / 100) * 100;
        fireRateLevel++;
        costFireRate *= 2;
        saveData();
        updateShopUI();
        playPurchaseSuccessSound();
        alert("Purchase Successful! (SPD LV Up)");
    } else {
        playPurchaseFailSound();
        alert("Not enough coins!");
    }
});

bindTouchAndClick(btnQuickMultiShot, () => {
    if (totalCoins >= costMultiShot && multiShotLevel < 5) {
        totalCoins -= costMultiShot;
        totalCoins = Math.floor(totalCoins / 100) * 100;
        multiShotLevel++;
        costMultiShot *= 2;
        saveData();
        updateShopUI();
        playPurchaseSuccessSound();
        alert("Purchase Successful! (MLT LV Up)");
    } else {
        playPurchaseFailSound();
        alert("Not enough coins!");
    }
});

bindTouchAndClick(btnQuickEnemySlow, () => {
    if (totalCoins >= costEnemySlow && enemySlowLevel < 10) {
        totalCoins -= costEnemySlow;
        totalCoins = Math.floor(totalCoins / 100) * 100;
        enemySlowLevel++;
        costEnemySlow *= 2;
        saveData();
        updateShopUI();
        playPurchaseSuccessSound();
        alert("Purchase Successful! (SLW LV Up)");
    } else {
        playPurchaseFailSound();
        alert("Not enough coins!");
    }
});

bindTouchAndClick(btnMagnetUpg, () => {
    if (totalCoins >= costMagnetRange) {
        totalCoins -= costMagnetRange;
        totalCoins = Math.floor(totalCoins / 100) * 100;
        magnetRange += 20;
        costMagnetRange *= 2;
        saveData();
        updateShopUI();
        playPurchaseSuccessSound();
        alert("Purchase Successful! (Magnet Range Up)");
    } else {
        playPurchaseFailSound();
        alert("Not enough coins!");
    }
});

// [NEW] 상점 내에서 광고 보고 50,000 코인 즉시 받기
bindTouchAndClick(adCoinShopBtn, () => {
    console.log("광고 버튼 클릭됨! (adCoinShopBtn)");
    showRewarded(() => {
        // showRewarded 내부 시뮬레이션에서도 50k를 주지만, 콜백에서도 확실히 처리
        // (Capacitor 환경에서는 showRewarded가 50k를 안 주므로 여기서 주는 게 맞음)
        // 단, 시뮬레이션 모드에서 중복 지급을 방지하려면 로직이 필요할 수 있으나 
        // 유저가 "확인을 누르면 즉시 50,000 코인이 들어오게 해줘"라고 했으니 
        // 시뮬레이션 모드에서 총 100,000이 들어와도 "반응이 온다"는 확신을 줄 수 있음.
        // 여기서는 안전하게 50,000 추가 지급 로직 유지.
        totalCoins = Math.floor(totalCoins / 100) * 100 + 50000;
        saveData();
        updateShopUI();
        playPurchaseSuccessSound();
        alert("💎 50,000 Coins Received! 💎");
    });
});

// 5분 코인 2배 광고 리스너 (상점에서 시청)
bindTouchAndClick(adDoubleCoinTimedBtn, () => {
    console.log("광고 버튼 클릭됨! (adDoubleCoinTimedBtn)");
    showRewarded(() => {
        doubleCoinTimer = 300; // 5분
        saveData();
        updateShopUI();
        playPurchaseSuccessSound();
        alert("🚀 5-Minute 2X Coin Mode Activated!");
    });
});

// 광고 시청 후 2배 코드 및 부활 로직 수정
bindTouchAndClick(adDoubleCoinBtn, () => {
    console.log("광고 시청 완료: 2배 모드 부활");
    showRewarded(() => {
        isRevived = true;
        isDoubleCoinMode = true;
        
        // [수정] 부활 시 음악이 다시 나오도록 추가
        updateBGM(); 

        enemySpeedMultiplier = Math.max(1.5, baseEnemySpeedMultiplier * 1.5);
        spawnInterval = 400;
        
        player.x = CANVAS_WIDTH / 2;
        player.y = CANVAS_HEIGHT - 100;
        mouse.x = player.x;
        mouse.y = player.y;

        enemies = [];
        bullets = [];
        enemyBullets = [];

        gameOverScreen.classList.remove('active');
        gameOverScreen.classList.add('hidden');

        isPlaying = true;
        lastSpawntime = Date.now();
        gameLoop();
    });
});

bindTouchAndClick(adReviveBtn, () => {
    console.log("광고 시청 완료: 일반 부활");
    showRewarded(() => {
        isRevived = true;
        isDoubleCoinMode = false;
        
        // [수정] 부활 시 음악이 다시 나오도록 추가
        updateBGM(); 

        enemySpeedMultiplier = baseEnemySpeedMultiplier;
        spawnInterval = 750;

        player.x = CANVAS_WIDTH / 2;
        player.y = CANVAS_HEIGHT - 100;
        mouse.x = player.x;
        mouse.y = player.y;

        enemies = [];
        bullets = [];
        enemyBullets = [];

        gameOverScreen.classList.remove('active');
        gameOverScreen.classList.add('hidden');

        isPlaying = true;
        lastSpawntime = Date.now(); 
        gameLoop();
    });
});

// 버튼 이벤트 - 터치 및 클릭 허용 (이벤트 전파 방지 옵션 추가)
bindTouchAndClick(startBtn, () => {
    console.log("Start Button Clicked - Forcing BGM Permission");
    BGM.init(); 
    if (BGM.current) BGM.current.play().then(() => BGM.current.pause()).catch(()=>{});
    
    thisStageCoins = 0; // 시작 시 리셋
    startGame();
});

bindTouchAndClick(restartBtn, () => {
    console.log("Restart Button Clicked");
    
    if (confirm("처음부터 다시 시작하시겠습니까? (스테이지 및 코인 초기화)")) {
        isRevived = false;
        // 데이터 완전 초기화
        totalCoins = 0;
        currentStage = 1;
        currentFireRate = 180;
        currentMultiShot = 2;
        costFireRate = 50;
        costMultiShot = 200;
        baseEnemySpeedMultiplier = 1;
        costEnemySpeed = 500;
        costLaser = 5000;
        saveData();

        // 로비로 전송
        gameOverScreen.classList.remove('active');
        gameOverScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        startScreen.classList.add('active');
        updateShopUI();
    }
});

bindTouchAndClick(playAgainBtn, () => {
    console.log("Play Again Clicked - Resetting to Stage 1");
    currentStage = 1; // [중요] 1스테이지로 강제 초기화
    thisStageCoins = 0;
    score = 0;
    saveData(); // [중요] 초기화된 스테이지 정보를 즉시 저장
    startGame(); 
});

// ==========================================
// 개발자 전용 디버깅 (치트) 패널 이벤트
// ==========================================
window.isDeveloperStageOverridden = false; // 수동으로 조작했는지 여부 기록

bindTouchAndClick(btnStageUp, () => {
    window.isDeveloperStageOverridden = true;
    if (currentStage < 40) { // [MOD] 40단계까지 증가 가능하도록 수정
        currentStage++;
        thisStageCoins = 0; 
        debugStageInfo.innerText = `Current Stage: LV.${currentStage}`;
        updateHUD(); // HUD도 즉시 갱신
        updateBGM(); // 배경음악도 변경
    }
});

bindTouchAndClick(btnStageDown, () => {
    window.isDeveloperStageOverridden = true;
    if (currentStage > 1) {
        currentStage--;
        thisStageCoins = 0;
        debugStageInfo.innerText = `Current Stage: LV.${currentStage}`;
        updateHUD();
        updateBGM();
    }
});

bindTouchAndClick(btnCoinCheat, () => {
    const cheatAmount = 10000;
    thisGameCoins = Math.floor(thisGameCoins / 100) * 100 + cheatAmount; 
    thisStageCoins = Math.floor(thisStageCoins / 100) * 100 + cheatAmount; 
    totalCoins = Math.floor(totalCoins / 100) * 100 + cheatAmount;
    updateShopUI();
    alert("💸 Cheat Activated: 10,000 Coins added! 💸");
});

bindTouchAndClick(btnHardReset, () => {
    if (confirm("처음부터 다시 시작하시겠습니까? (스테이지 및 코인 초기화)")) {
        localStorage.clear();
        location.reload();
    }
});

// [NEW] 상점 내 데이터 완전 초기화 버튼 로직
const btnHardResetShop = safeGetElement('btnHardResetShop');
if (btnHardResetShop && btnHardResetShop.id !== 'dummy') { // safeGetElement가 dummy를 반환할 수 있으므로 체크
    bindTouchAndClick(btnHardResetShop, () => {
        if (confirm("⚠️ 경고: 모든 게임 데이터(코인, 업그레이드, 스테이지)가 영구적으로 삭제됩니다. 계속하시겠습니까?")) {
            localStorage.clear();
            location.reload();
        }
    });
}

// 초기 광고 초기화 실행
initAds();
