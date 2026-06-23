import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader } from 'lucide-react';
import './i18n';
import AdComponent from './AdComponent';
import PaymentPage from './PaymentPage';
import { DREAM_CATEGORIES, FREUD_INTERPRETATIONS } from './dreamsData';

const OPENAI_API_KEY = '여기에_발급받으신_API_키를_붙여넣으세요'; // ★ 여기에 API 키 입력!

const fetchOpenAIInterpretation = async (input) => {
  const text = input || "";
  
  if (OPENAI_API_KEY === '여기에_발급받으신_API_키를_붙여넣으세요') {
    alert('App.jsx 파일 상단에 OpenAI API 키를 먼저 입력해 주세요!');
    return "API 키가 설정되지 않았습니다. 개발자에게 문의하세요.";
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '당신은 10만 건 이상의 전통 명리학 및 심층 심리학(프로이트, 융) 빅데이터를 학습한 신비롭고 다정한 별자리 꿈 해몽 전문가입니다. 사용자의 꿈 이야기를 듣고, 핵심 상징과 길몽/흉몽 여부, 그리고 삶에 도움이 되는 조언을 3~4문장으로 신비로운 말투로 해석해 주세요.' },
          { role: 'user', content: text }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error:', error);
    return '앗, 무의식의 바다에서 답을 찾는 중 통신 문제가 발생했어요. 잠시 후 다시 시도해 주세요.';
  }
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
              src={`images/${selectedDreamDetail.fileName}`} 
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
                  onClick={async () => {
                    setShowPremiumPromptDetail(false);
                    setIsPremiumLoading(true);
                    const resultText = await fetchOpenAIInterpretation(premiumInput);
                    setIsPremiumLoading(false);
                    setPremiumResult(resultText);
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
                  src={`images/${dream.fileName}`} 
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
                onClick={async () => {
                  setShowPremiumPrompt(false);
                  setIsLoading(true);
                  const resultText = await fetchOpenAIInterpretation(customDream);
                  setIsLoading(false);
                  setResult({ 
                    text: resultText, 
                    imageUrl: null,
                    isPremium: true
                  });
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
