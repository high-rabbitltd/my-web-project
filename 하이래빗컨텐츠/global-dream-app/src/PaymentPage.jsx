import React from 'react';

export default function PaymentPage({ onBack }) {
  return (
    <div className="container" style={{ animation: 'fadeInUp 0.6s ease' }}>
      <header className="app-header">
        <h2 className="logo-title" style={{ fontSize: '1.8rem' }}>💎 프리미엄 결제</h2>
        <p className="subtitle">무제한 AI 만화 해몽을 경험하세요.</p>
      </header>

      <div className="result-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>요금제 선택</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--accent-color)' }}>
            <h4 style={{ color: 'var(--accent-color)' }}>단건 결제 (1회용)</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>한 번의 4컷 만화 생성</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>$0.99 / ₩1,200</p>
            <button className="primary-btn" style={{ marginTop: '1rem', padding: '0.8rem', fontSize: '1rem' }}>결제하기</button>
          </div>

          <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <h4>월간 구독 (무제한)</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>한 달 내내 제한 없는 만화 생성 및 심층 심리 분석</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>$4.99 / ₩5,900</p>
            <button className="primary-btn" style={{ marginTop: '1rem', padding: '0.8rem', fontSize: '1rem', background: '#333' }}>구독하기</button>
          </div>
        </div>

        <button 
          style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={onBack}
        >
          뒤로 가기
        </button>
      </div>
      
      {/* 글로벌 스크립트 로드 예시 */}
      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
        <p>Secured by Stripe & PortOne</p>
      </div>
    </div>
  );
}
