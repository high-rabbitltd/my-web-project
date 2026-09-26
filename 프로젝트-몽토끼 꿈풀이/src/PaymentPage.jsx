import React, { useState } from 'react';

export default function PaymentPage({ onBack, onPaymentSuccess }) {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGooglePlayPurchase = (productId) => {
    setIsProcessing(true);
    
    if (window.CdvPurchase && window.CdvPurchase.store) {
      const product = window.CdvPurchase.store.get(productId);
      if (product) {
        const offer = product.getOffer();
        if (offer) {
          offer.order().then(() => {
            // 결제창이 뜨고 사용자가 결제를 진행합니다.
            // 성공 처리는 App.jsx의 store.when().approved() 리스너나 이 안에서 상태 업데이트를 통해 이루어집니다.
            // 임시로 결제 프로세스가 시작되면 로딩을 풉니다.
            setIsProcessing(false);
          }).catch(err => {
            console.error("Purchase error", err);
            setIsProcessing(false);
          });
        } else {
          alert('상품 옵션을 찾을 수 없습니다.');
          setIsProcessing(false);
        }
      } else {
        alert('상품 정보를 불러오지 못했습니다. 앱을 다시 실행해주세요.');
        setIsProcessing(false);
      }
    } else {
      // 웹 테스트용 임시 모드
      setTimeout(() => {
        setIsProcessing(false);
        if (onPaymentSuccess) {
          onPaymentSuccess(productId);
        } else {
          setPaymentSuccess(true);
        }
      }, 2000);
    }
  };

  return (
    <div className="container" style={{ animation: 'fadeInUp 0.6s ease' }}>
      <header className="app-header">
        <h2 className="logo-title" style={{ fontSize: '1.8rem' }}>💎 프리미엄 결제</h2>
        <p className="subtitle">무제한 AI 만화 해몽을 경험하세요.</p>
      </header>

      {paymentSuccess ? (
        <div className="result-card" style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>🎉 결제 완료!</h3>
          <p>프리미엄 기능이 활성화되었습니다.</p>
          <button className="primary-btn" onClick={onBack} style={{ marginTop: '2rem' }}>홈으로 돌아가기</button>
        </div>
      ) : (
        <div className="result-card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>요금제 선택</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {/* 단건 결제 */}
            <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--accent-color)' }}>
              <h4 style={{ color: 'var(--accent-color)' }}>단건 결제 (1회용)</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>한 번의 프리미엄 심층 꿈 해몽 분석</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>500원</p>
              <button 
                className="primary-btn" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.8rem' }}
                onClick={() => handleGooglePlayPurchase('one_time_500')}
                disabled={isProcessing}
              >
                <span>{isProcessing ? '결제 진행 중...' : '구글 플레이 결제 (500원)'}</span>
              </button>
            </div>

            {/* 월간 구독 */}
            <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <h4>월간 구독 (무제한)</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>한 달 내내 무제한 심층 심리 분석</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>4,900원 / 월</p>
              <button 
                style={{ width: '100%', background: '#4285F4', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.8rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => handleGooglePlayPurchase('sub_monthly_4900')}
                disabled={isProcessing}
              >
                <span>{isProcessing ? '결제 진행 중...' : '구글 플레이 구독 (4,900원/월)'}</span>
              </button>
            </div>
          </div>

          <button 
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', padding: '10px' }}
            onClick={onBack}
          >
            뒤로 가기
          </button>
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
        <p>Secured by Google Play In-App Billing</p>
      </div>
    </div>
  );
}
