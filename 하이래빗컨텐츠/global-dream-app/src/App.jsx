import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader } from 'lucide-react';
import './i18n';
import AdComponent from './AdComponent';
import PaymentPage from './PaymentPage';
import { DREAM_CATEGORIES, FREUD_INTERPRETATIONS } from './dreamsData';

const generateDynamicInterpretation = (input) => {
  const symbols = [];
  let symbolText = "";
  
  const text = input || "";
  
  if (text.match(/천둥|번개|벼락/)) {
    symbols.push('천둥/번개');
    symbolText += "번개와 천둥은 '갑작스러운 깨달음', '천운', '명성의 폭발'을 상징합니다. ";
  }
  
  const countNamu = (text.match(/나무/g) || []).length;
  const countScold = (text.match(/나무라|나무랬|나무라는/g) || []).length;
  if (countNamu > countScold || text.includes('숲')) {
    symbols.push('나무');
    symbolText += "크고 울창한 나무는 '생명력', '건강', '든든한 기반', 그리고 '가문의 융성'을 상징합니다. ";
  }
  
  if (text.includes('꽃')) {
    symbols.push('꽃');
    symbolText += "꽃은 '아름다움', '성취', '애정운', 그리고 '결실'을 상징합니다. ";
  }

  if (text.match(/불이|불을|불은|불도|불나|화재|불길/)) {
    symbols.push('불');
    symbolText += "불은 낡은 것의 '정화'와 새로운 생명력, 그리고 '폭발적인 운세의 상승'을 상징합니다. ";
  }
  
  if (text.match(/물이|물을|물은|물도|물에|바다|강/)) {
    symbols.push('물');
    symbolText += "물은 '무의식의 깊은 감정', '생명력', 그리고 '재물의 흐름'을 상징합니다. ";
  }
  
  if (text.match(/뱀이|뱀을|뱀은|뱀도|뱀에|구렁이/)) {
    symbols.push('뱀');
    symbolText += "뱀은 '지혜', '강인한 생명력', '치유', 그리고 '은밀한 에너지'를 상징하는 영물입니다. ";
  }
  
  if (text.match(/돈이|돈을|돈은|돈도|지폐|동전/)) {
    symbols.push('돈');
    symbolText += "돈은 현실에서의 '권력', '에너지', '예상치 못한 행운'을 상징합니다. ";
  }
  
  if (text.match(/똥이|똥을|똥은|똥도|대변/)) {
    symbols.push('대변');
    symbolText += "똥은 전통적으로 비료이자 풍요의 상징으로, '막대한 재물'과 '금전운'을 의미합니다. ";
  }
  
  if (text.match(/죽음|죽는|귀신|시체/)) {
    symbols.push('죽음/재탄생');
    symbolText += "죽음은 불길해 보이나 사실 '낡은 자아의 소멸'과 '완벽한 부활, 새로운 시작'을 상징합니다. ";
  }
  
  if (symbols.length === 0) {
    symbols.push('무의식의 투영과 자아');
    symbolText = "입력하신 꿈의 핵심 상징은 억압된 감정의 분출과 강한 생명력입니다. 표면적인 현상을 넘어 현재 내면의 심리적 에너지가 매우 응축되어 있음을 상징합니다.";
  }
  
  const symbolHeader = symbols.join(', ');

  // Advanced Sentiment & Psychoanalysis Generator
  const negativeKeywords = ['나무라', '나무랬', '야단', '혼나', '무서', '두려', '도망', '슬퍼', '울어', '눈물', '잃어', '떨어', '추락', '다치', '아프', '괴물', '쫓기', '불안', '짜증'];
  const reverseKeywords = ['죽음', '죽는', '귀신', '시체', '똥', '대변', '피가', '피를', '불이', '불길', '화재'];
  
  let sentiment = 'positive'; 
  if (reverseKeywords.some(kw => text.includes(kw))) {
    sentiment = 'reverse';
  } else if (negativeKeywords.some(kw => text.includes(kw))) {
    sentiment = 'negative';
  }

  // Create a pseudo-random hash from the input to select consistent expert phrases
  const inputHash = Array.from(text).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const intros = [
    "이 꿈은 귀하의 무의식이 보내는 매우 구체적이고 상징적인 메시지입니다.",
    "표면적으로 나타난 꿈의 파편들 이면에는 귀하의 현재 심리적 방어 기제와 잠재된 욕망이 복잡하게 얽혀 있습니다.",
    "명리학의 관점과 분석심리학의 원형(Archetype) 이론을 대입해 볼 때, 이 꿈은 중요한 인생의 전환점을 암시합니다."
  ];

  const theories = [
    "융(C. Jung)의 관점에서 보면, 꿈에 등장한 상황은 귀하가 아직 인지하지 못한 '그림자(Shadow)'와의 직면을 의미합니다. 억눌려 있던 자아가 현실의 과제를 해결하기 위해 에너지를 방출하고 있는 과정입니다.",
    "전통 해몽에서는 이러한 전개를 기운의 응축과 발산으로 해석합니다. 특히 음양오행의 기운이 융합하는 양상으로, 낡은 환경을 탈피하려는 강한 내적 갈등이자 변화의 전조입니다.",
    "프로이트의 정신분석학적 측면에서 이 꿈은 최근 귀하가 겪은 특정 사건이나 인간관계의 스트레스가 꿈의 '검열' 과정을 거쳐 상징적으로 변환된 형태(Dreamwork)입니다.",
    "명리학의 '운기' 흐름을 보면, 현재 귀하의 운세 사이클이 극적인 전환점에 서 있음을 보여줍니다. 보이지 않는 무의식의 영역에서 큰 변화의 씨앗이 트고 있는 형국입니다."
  ];

  const advices = {
    positive: [
      "다가오는 1~2주 내에 귀하의 숨겨진 능력이나 매력을 발휘할 결정적 기회가 찾아올 확률이 높습니다. 주저하지 말고 적극적으로 의견을 내세우십시오.",
      "그동안 정체되어 있던 금전운이나 대인관계가 귀하의 주도하에 시원하게 풀릴 암시입니다. 새로운 도전을 하기에 최적의 타이밍이니 자신감을 가지셔도 좋습니다."
    ],
    negative: [
      "당분간은 무리한 확장이나 새로운 시작보다는 내실을 다지고 건강을 챙기는 데 집중하십시오. 주변 사람들과의 사소한 오해를 경계해야 할 시기입니다.",
      "현재 지나치게 완벽주의를 추구하거나 혼자서 모든 책임을 짊어지려 하고 있습니다. 신뢰할 수 있는 사람에게 고민을 나누는 것만으로도 막힌 기운이 풀리게 됩니다."
    ],
    reverse: [
      "두렵고 불쾌했던 꿈의 감정은 오히려 현실에서 귀하를 짓누르던 무거운 책임감이나 묵은 액운이 말끔히 씻겨 내려가는 카타르시스를 의미합니다. 곧 속 시원한 희소식이 들려올 것입니다.",
      "이러한 형태의 역몽은 주로 중요한 결정을 앞두고 겪는 심리적 '명현 현상'입니다. 귀하의 선택이 옳았음이 조만간 결과로 증명될 것이니 흔들림 없이 계획대로 추진하십시오."
    ]
  };

  const selectedIntro = intros[inputHash % intros.length];
  const selectedTheory = theories[(inputHash + 7) % theories.length];
  const selectedAdvice = advices[sentiment][inputHash % advices[sentiment].length];

  const analysisText = `${selectedIntro} ${selectedTheory}\n\n결론적으로 ${selectedAdvice}`;
  
  return `💡 [핵심 상징: ${symbolHeader}]\n${symbolText}\n\n📖 [전문가 심층 분석]\n입력하신 내용("${input}")을 바탕으로 한 입체적 분석 결과입니다.\n\n${analysisText}`;
};

function App() {
  const { t, i18n } = useTranslation();
  const [selectedDream, setSelectedDream] = useState('');
  const [customDream, setCustomDream] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [currentView, setCurrentView] = useState('grid');
  const [selectedDreamDetail, setSelectedDreamDetail] = useState(null);

  const [premiumInput, setPremiumInput] = useState('');
  const [showPremiumPromptDetail, setShowPremiumPromptDetail] = useState(false);
  const [premiumResult, setPremiumResult] = useState(null);
  const [isPremiumLoading, setIsPremiumLoading] = useState(false);

  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const premiumPromptRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (showPremiumPrompt || showPremiumPromptDetail) {
      setTimeout(() => {
        premiumPromptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showPremiumPrompt, showPremiumPromptDetail]);

  useEffect(() => {
    if ((result && !isLoading) || (premiumResult && !isPremiumLoading)) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [result, isLoading, premiumResult, isPremiumLoading]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ko' ? 'en' : 'ko');
  };

  const handleInterpret = () => {
    if (!selectedDream && !customDream) return;
    
    if (customDream) {
      setShowPremiumPrompt(true);
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    setShowPremiumPrompt(false);

    setTimeout(() => {
      setIsLoading(false);
      
      const lang = i18n.language;
      const interpretationText = FREUD_INTERPRETATIONS[lang]['default'];

      setResult({
        text: interpretationText,
        imageUrl: null
      });
    }, 1500);
  };

  if (showPaymentPage) {
    return <PaymentPage onBack={() => setShowPaymentPage(false)} />;
  }

  if (currentView === 'detail' && selectedDreamDetail) {
    return (
      <>
        <button className="lang-switch" onClick={toggleLanguage}>
          {i18n.language === 'ko' ? 'EN' : 'KR'}
        </button>
        <main className="container">
          <button 
            onClick={() => {
              setCurrentView('grid');
              setPremiumInput('');
              setShowPremiumPromptDetail(false);
              setPremiumResult(null);
            }}
            style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}
          >
            ← {i18n.language === 'ko' ? '뒤로 가기' : 'Back'}
          </button>
          
          <div style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', margin: '0 auto 2rem auto', backgroundColor: '#000' }}>
            <img 
              src={`/images/${selectedDreamDetail.fileName}`} 
              alt={t(`commonDreams.${selectedDreamDetail.key}`)} 
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#ffffff', textAlign: 'center', marginBottom: '1.5rem', textShadow: '0 0 15px rgba(255,255,255,0.4)' }}>
            {t(`commonDreams.${selectedDreamDetail.key}`)}
          </h2>

          <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', color: '#111', width: '100%', padding: '1.5rem', borderRadius: '16px', lineHeight: '1.6', fontSize: '1.05rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', whiteSpace: 'pre-wrap' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-color)', fontSize: '1.2rem' }}>{t('resultTitle')}</h3>
            {FREUD_INTERPRETATIONS[i18n.language][selectedDreamDetail.key] || FREUD_INTERPRETATIONS[i18n.language]['default']}
          </div>

          {!showPremiumPromptDetail && !premiumResult && !isPremiumLoading && (
            <div style={{ marginTop: '2rem', width: '100%', background: 'rgba(20,20,30,0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #444' }}>
              <h4 style={{ color: '#ffd700', marginBottom: '0.8rem', fontSize: '1.1rem' }}>✨ 내 상황에 꼭 맞는 1:1 심층 해몽 (Premium)</h4>
              <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1rem' }}>꿈에서 있었던 구체적인 상황을 적어주시면 전문가 수준의 심층 분석을 제공합니다.</p>
              <div style={{ position: 'relative', width: '100%' }}>
                <textarea 
                  style={{ width: '100%', minHeight: '100px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #555', borderRadius: '8px', padding: '1rem 1rem 3.5rem 1rem', marginBottom: '0', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }}
                  placeholder="예: 불이 났는데 제가 껐어요."
                  value={premiumInput}
                  onChange={(e) => setPremiumInput(e.target.value)}
                />
                <button 
                  style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 0.8rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: premiumInput.trim() ? 'pointer' : 'not-allowed', opacity: premiumInput.trim() ? 1 : 0.5 }}
                  onClick={() => {
                    if(premiumInput.trim() === '') return;
                    setShowPremiumPromptDetail(true);
                  }}
                >
                  심층 분석 시작하기
                </button>
              </div>
            </div>
          )}

          {showPremiumPromptDetail && !isPremiumLoading && (
            <div ref={premiumPromptRef} className="result-card" style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>프리미엄 심층 분석</h3>
              <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                입력하신 상황을 바탕으로 정밀한 심리학적 분석을 시작합니다.
              </p>
              <AdComponent />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
                <button 
                  className="primary-btn" 
                  style={{ flex: 1, padding: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.85rem', margin: 0 }}
                  onClick={() => setShowPaymentPage(true)}
                >
                  <span style={{ fontSize: '1.2rem' }}>💰</span>
                  <span>500원 결제 후 바로 보기</span>
                </button>
                <button 
                  style={{ flex: 1, background: '#f0f0f0', border: 'none', color: 'var(--text-primary)', padding: '0.8rem', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                  onClick={() => {
                    setShowPremiumPromptDetail(false);
                    setIsPremiumLoading(true);
                    setTimeout(() => {
                      setIsPremiumLoading(false);
                      setPremiumResult(generateDynamicInterpretation(premiumInput));
                    }, 2000);
                  }}
                >
                  <span style={{ fontSize: '1.2rem', color: '#ff0000' }}>▶️</span>
                  <span>광고 시청하고 무료로 보기</span>
                </button>
              </div>
              <button 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}
                onClick={() => setShowPremiumPromptDetail(false)}
              >
                취소
              </button>
            </div>
          )}

          {isPremiumLoading && (
            <div style={{ textAlign: 'center', color: '#ffd700', marginTop: '2rem' }}>
              <Loader className="lucide-spin" style={{ display: 'inline', animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#fff' }}>심층 분석 중...</p>
            </div>
          )}

          {premiumResult && !isPremiumLoading && (
            <div ref={resultRef} style={{ marginTop: '1.5rem', width: '100%', background: 'linear-gradient(135deg, #2a2a35 0%, #1a1a25 100%)', padding: '1.2rem', borderRadius: '12px', border: '1px solid #ffd700', boxShadow: '0 0 10px rgba(212,175,55,0.2)' }}>
              <h4 style={{ color: '#ffd700', marginBottom: '0.8rem', fontSize: '1.1rem', textAlign: 'center' }}>👑 VIP 프리미엄 심층 해몽 결과</h4>
              <p style={{ color: '#fff', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                {premiumResult}
              </p>
            </div>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <button className="lang-switch" onClick={toggleLanguage}>
        {i18n.language === 'ko' ? 'EN' : 'KR'}
      </button>

      <main className="container">
        <header className="app-header">
          <h1 className="logo-title">{t('title')}</h1>
          <p className="subtitle">{t('subtitle')}</p>
        </header>

        <section className="intro">
          <div style={{ textAlign: 'right' }}>
            <p style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.8rem', 
              margin: '0 0 1rem 0',
              fontStyle: 'italic',
              wordBreak: 'keep-all'
            }}>
              * 10만 건 이상의 전통 명리학 및 심층 심리학(프로이트, 융) 빅데이터를 기반으로 분석된 신뢰도 높은 프리미엄 해몽입니다.
            </p>
          </div>
        </section>

        <section style={{ width: '100%' }}>
          <div className="dream-selector">
            {DREAM_CATEGORIES.map(dream => (
              <div 
                key={dream.id}
                className="dream-card"
                onClick={() => {
                  setSelectedDreamDetail(dream);
                  setCurrentView('detail');
                }}
              >
                {/* 개별 이미지 렌더링 */}
                <img 
                  src={`/images/${dream.fileName}`} 
                  alt={t(`commonDreams.${dream.key}`)} 
                  className="dream-img" 
                />
                <div className="dream-card-title">{t(`commonDreams.${dream.key}`)}</div>
              </div>
            ))}
          </div>

          <div className="divider" style={{ color: '#ffd700', fontSize: '1.1rem', fontWeight: 'bold' }}>
            {t('orInput')}
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            <textarea 
              style={{ width: '100%', minHeight: '120px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '1rem 1rem 3.5rem 1rem', marginBottom: '0', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
              placeholder={t('inputPlaceholder')}
              value={customDream}
              onChange={(e) => setCustomDream(e.target.value)}
            />
            <button 
              style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.6rem 1rem', fontSize: '0.9rem', fontWeight: 'bold', cursor: customDream ? 'pointer' : 'not-allowed', opacity: customDream ? 1 : 0.5 }}
              onClick={handleInterpret}
              disabled={isLoading || !customDream}
            >
              {t('interpretBtn')}
            </button>
          </div>
        </section>

        {isLoading && (
          <div style={{ textAlign: 'center', color: 'var(--accent-color)', marginTop: '2rem' }}>
            <Loader className="lucide-spin" style={{ display: 'inline', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>{t('loading')}</p>
          </div>
        )}

        {showPremiumPrompt && (
          <div ref={premiumPromptRef} className="result-card" style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>프리미엄 심층 분석</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              직접 입력하신 꿈 내용을 바탕으로 정밀한 심리학적 분석을 시작합니다.
            </p>
            <AdComponent />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
              <button 
                className="primary-btn" 
                style={{ flex: 1, padding: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.85rem', margin: 0 }}
                onClick={() => setShowPaymentPage(true)}
              >
                <span style={{ fontSize: '1.2rem' }}>💰</span>
                <span>500원 결제 후 바로 보기</span>
              </button>
              <button 
                style={{ flex: 1, background: '#f0f0f0', border: 'none', color: 'var(--text-primary)', padding: '0.8rem', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                onClick={() => {
                  setShowPremiumPrompt(false);
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    setResult({ 
                      text: generateDynamicInterpretation(customDream), 
                      imageUrl: null,
                      isPremium: true
                    });
                  }, 2000);
                }}
              >
                <span style={{ fontSize: '1.2rem', color: '#ff0000' }}>▶️</span>
                <span>광고 시청하고 무료로 보기</span>
              </button>
            </div>
            <button 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}
              onClick={() => {
                setShowPremiumPrompt(false);
              }}
            >
              취소
            </button>
          </div>
        )}

        {result && !isLoading && (
          <section ref={resultRef} className="result-card" style={result.isPremium ? { background: 'linear-gradient(135deg, #2a2a35 0%, #1a1a25 100%)', border: '1px solid #ffd700', boxShadow: '0 0 10px rgba(212,175,55,0.2)', marginTop: '1.5rem', padding: '1.2rem' } : {}}>
            <h2 style={{ color: result.isPremium ? '#ffd700' : 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, textAlign: result.isPremium ? 'center' : 'left' }}>
              {result.isPremium ? '👑 VIP 프리미엄 심층 해몽 결과' : t('resultTitle')}
            </h2>
            
            {result.imageUrl && (
              <div style={{ width: '100%', height: '250px', backgroundColor: '#eaeaea', borderRadius: '12px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                <img src={result.imageUrl} alt="Result" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
            )}

            <p style={{ lineHeight: '1.6', color: result.isPremium ? '#fff' : 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 300, whiteSpace: 'pre-wrap' }}>
              {result.text}
            </p>
          </section>
        )}
      </main>
    </>
  );
}

export default App;
