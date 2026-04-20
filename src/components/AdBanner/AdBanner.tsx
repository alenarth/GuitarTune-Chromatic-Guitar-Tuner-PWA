import React from 'react';

interface AdBannerProps {
  position?: 'top' | 'bottom';
}

/**
 * AdBanner — Placeholder for Google AdSense / AdMob integration.
 *
 * HOW TO ACTIVATE ADS:
 * 1. Sign up at https://adsense.google.com
 * 2. Replace the placeholder div below with the AdSense <ins> tag
 * 3. Add your AdSense script to index.html:
 *    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
 * 4. For mobile apps (Android/iOS via Capacitor), use AdMob instead.
 *
 * Standard sizes used here:
 *   Mobile:  320x50  (Mobile Banner)
 *   Desktop: 728x90  (Leaderboard)
 */
const AdBanner: React.FC<AdBannerProps> = ({ position = 'bottom' }) => {
  return (
    <div
      className="flex items-center justify-center w-full"
      style={{
        minHeight: '50px',
        borderTop: position === 'bottom' ? '1px solid #1e1e22' : 'none',
        borderBottom: position === 'top' ? '1px solid #1e1e22' : 'none',
        background: '#0d0d0f',
        padding: '4px 0',
      }}
      aria-label="Advertisement"
    >
      {/* ── MOBILE AD SLOT (320×50) ── */}
      <div
        className="block md:hidden"
        style={{
          width: '320px',
          height: '50px',
          background: '#161618',
          border: '1px dashed #2a2a30',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Replace this div with:
          <ins className="adsbygoogle"
            style={{ display: 'inline-block', width: '320px', height: '50px' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
            data-ad-slot="XXXXXXXXXX"
          />
        */}
        <span style={{ color: '#374151', fontSize: '11px', fontFamily: 'monospace' }}>
          AD 320×50
        </span>
      </div>

      {/* ── DESKTOP AD SLOT (728×90) ── */}
      <div
        className="hidden md:flex"
        style={{
          width: '728px',
          height: '90px',
          background: '#161618',
          border: '1px dashed #2a2a30',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Replace this div with:
          <ins className="adsbygoogle"
            style={{ display: 'inline-block', width: '728px', height: '90px' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
            data-ad-slot="XXXXXXXXXX"
          />
        */}
        <span style={{ color: '#374151', fontSize: '11px', fontFamily: 'monospace' }}>
          AD 728×90
        </span>
      </div>
    </div>
  );
};

export default AdBanner;
