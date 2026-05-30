import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function AdComponent() {
  const { t } = useTranslation();

  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error('AdSense error', e);
    }
  }, []);

  return (
    <div style={{ margin: '1.5rem 0', textAlign: 'center', width: '100%', minHeight: '100px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-4486958947777936"
           data-ad-slot="1234567890" /* 임시 슬롯 ID */
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}
