import React, { useState } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";

export default function PaymentPage({ onBack }) {
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      setPaymentSuccess(true);
      alert('결제가 완료되었습니다! (테스트 모드)');
      // 실제 환경에서는 여기서 백엔드에 주문 완료 정보를 전송하고 권한을 부여합니다.
    });
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
            <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--accent-color)' }}>
              <h4 style={{ color: 'var(--accent-color)' }}>단건 결제 (1회용)</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>한 번의 4컷 만화 생성</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>$0.99</p>
              <PayPalButtons 
                style={{ layout: "horizontal", height: 40 }} 
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [{ amount: { value: "0.99" } }]
                  });
                }}
                onApprove={handleApprove}
              />
            </div>

            <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <h4>월간 구독 (무제한)</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>한 달 내내 제한 없는 만화 생성 및 심층 심리 분석</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>$4.99 / 월</p>
              <PayPalButtons 
                style={{ layout: "horizontal", height: 40 }} 
                createSubscription={(data, actions) => {
                  // 구독을 위해서는 페이팔 콘솔에서 플랜 ID를 생성해야 합니다.
                  // 현재는 데모를 위해 임시로 단건 결제 로직을 사용합니다.
                  return actions.order.create({
                    purchase_units: [{ amount: { value: "4.99" } }]
                  });
                }}
                onApprove={handleApprove}
              />
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
        <p>Secured by PayPal Sandbox</p>
      </div>
    </div>
  );
}
