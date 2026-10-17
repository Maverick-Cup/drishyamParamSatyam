'use client';

import React, { useState, useEffect } from 'react';
import SeasonalParticleCanvas, { SeasonalThemeType } from './SeasonalParticleCanvas';

/**
 * SurrealBackdrop: a constant, app-wide background shared by every route.
 * It shows the user's chosen remembrance photo with a slow, dreamlike drift and
 * the guiding quote, enhanced with seasonal atmosphere and particle canvases.
 */

export const REMEMBRANCE_QUOTE =
  'Our loved ones always keep a watch over us no matter where they are.. let\u2019s do the simple things rightly and make them and us proud \u2764';

export default function SurrealBackdrop() {
  const [theme, setTheme] = useState<SeasonalThemeType>('cosmic');

  useEffect(() => {
    // Read cached theme or listen to live changes from anywhere in the app
    const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('paramsathya_theme')) as SeasonalThemeType;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const handleThemeChange = (e: any) => {
      if (e?.detail?.theme) {
        setTheme(e.detail.theme);
      }
    };

    window.addEventListener('paramsathya-theme-change', handleThemeChange);
    return () => window.removeEventListener('paramsathya-theme-change', handleThemeChange);
  }, []);

  const themeVignettes: Record<SeasonalThemeType, string> = {
    cosmic: 'from-[#080c14]/55 via-[#080c14]/35 to-[#080c14]/80',
    rains: 'from-[#060a12]/75 via-[#0a1320]/55 to-[#060a12]/90',
    snowfall: 'from-[#080d1a]/65 via-[#0e172a]/45 to-[#080e1c]/85',
    springs: 'from-[#081210]/60 via-[#10201c]/45 to-[#07100e]/85',
    autumn: 'from-[#170e06]/65 via-[#22140a]/45 to-[#0d0805]/85',
  };

  return (
    <div aria-hidden="true" className="surreal-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Photo layer with slow, gentle drift */}
      <div className="surreal-backdrop__photo absolute inset-0" />

      {/* Dynamic Seasonal Vignette Layer */}
      <div className={`absolute inset-0 bg-gradient-to-b ${themeVignettes[theme]} transition-colors duration-1000`} />

      {/* Ambient Theme Glow */}
      <div className="surreal-backdrop__glow absolute inset-0" />

      {/* Seasonal Particle Canvas (Snow, Rain, Sakura Petals, Autumn Leaves, Starlight) */}
      <SeasonalParticleCanvas theme={theme} />

      {/* Guiding Quote */}
      <p className="surreal-backdrop__quote absolute bottom-3 left-1/2 -translate-x-1/2 w-[min(92vw,56rem)] text-center font-serif italic text-[13px] sm:text-sm leading-snug text-amber-100/70">
        {REMEMBRANCE_QUOTE}
      </p>
    </div>
  );
}
