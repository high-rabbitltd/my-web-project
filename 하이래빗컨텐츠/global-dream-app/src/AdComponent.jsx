import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AdComponent() {
  const { t } = useTranslation();
  return (
    <div style={{
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.05)',
      border: '1px dashed rgba(255,255,255,0.2)',
      padding: '1rem',
      textAlign: 'center',
      borderRadius: '8px',
      margin: '1.5rem 0',
      color: 'var(--text-secondary)'
    }}>
      <p style={{ fontSize: '0.85rem' }}>[ {t('adPlaceholder') || 'Google AdSense / AdMob Area'} ]</p>
      <p style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>광고를 시청하고 1회 무료 만화 생성을 이용하세요.</p>
    </div>
  );
}
