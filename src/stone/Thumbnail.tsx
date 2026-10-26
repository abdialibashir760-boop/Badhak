import React from 'react';
import {FxContext, Vignette} from '../components/Stage';
import {Svg} from '../scenes/kit';
import {Backdrop, Foreground, GROUND_Y} from './art/Backdrop';
import {Grade, PaintOverlay} from './art/Nature';
import {Wolf} from './art/Animals';
import {HeroArt} from './figures/Hero';
import type {Lang} from './i18n';

export type ThumbProps = {lang: Lang; variant: 'A' | 'B'};

const COPY = {
  en: {
    A: {lines: ['WOKE UP IN', 'THE STONE', 'AGE?'], accent: [1, 2], badge: '30,000 YEARS AGO'},
    B: {lines: ['SURVIVAL', 'ODDS: 2%'], accent: [1], badge: 'DAY ONE'},
  },
  tr: {
    A: {lines: ['TAŞ DEVRİNDE', 'UYANSAYDIN', 'NE OLURDU?'], accent: [0], badge: '30 BİN YIL ÖNCE'},
    B: {lines: ['HAYATTA KALMA', 'İHTİMALİ: %2'], accent: [1], badge: 'İLK GÜN'},
  },
} as const;

const font = "'Cormorant Garamond', 'Times New Roman', serif";

/** YouTube thumbnail (1280×720). Drawn on a 1920×1080 canvas and scaled so it shares art + coordinates with the film. */
export const Thumbnail: React.FC<ThumbProps> = ({lang, variant}) => {
  const c = COPY[lang][variant];
  const textStyle = (accent: boolean, size: number): React.CSSProperties => ({
    fontFamily: font,
    fontWeight: 700,
    fontSize: size,
    lineHeight: 0.98,
    letterSpacing: '0.01em',
    color: accent ? '#f2b53c' : '#fbf6ea',
    fontStyle: accent ? 'italic' : 'normal',
    WebkitTextStroke: '10px #070605',
    paintOrder: 'stroke fill',
    textShadow: '0 10px 40px rgba(0,0,0,0.65)',
  });
  const size = lang === 'tr' ? (variant === 'A' ? 150 : 128) : variant === 'A' ? 200 : 180;
  return (
    <FxContext.Provider value={{effects: true}}>
      <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(0.6667)', transformOrigin: '0 0'}}>
          <Svg>
            {variant === 'A' ? (
              <g transform="translate(-150,-110) scale(1.12)">
                <Backdrop frame={40} tod={0.03} seed={2} leaves giant={false} sunX={1700} />
                <HeroArt x={560} y={GROUND_Y + 150} scale={2.0} />
                <Foreground frame={40} tod={0.03} seed={2} trunks={[-200, 2300]} />
              </g>
            ) : (
              <g transform="translate(-300,-190) scale(1.2)">
                <Backdrop frame={60} tod={0.72} seed={13} giant clearing={[1300, 2300]} />
                <Wolf x={1780} y={GROUND_Y + 40} s={1.45} facing={-1} head={0.3} frame={60} eyes={1} fur="#78766f" />
                <HeroArt x={1290} y={GROUND_Y + 70} scale={1.45} />
                <Foreground frame={60} tod={0.72} seed={13} trunks={[-300, 2350]} />
              </g>
            )}
          </Svg>
          <PaintOverlay opacity={0.06} />
          <Grade tod={variant === 'A' ? 0.12 : 0.7} />
          <Vignette amount={0.6} />
          {/* darkened band so the headline reads at any size */}
          <div style={{position: 'absolute', inset: 0, background: variant === 'A' ? 'linear-gradient(90deg, rgba(0,0,0,0) 38%, rgba(0,0,0,0.62) 100%)' : 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 62%)'}} />
          <div style={{position: 'absolute', top: variant === 'A' ? 110 : 150, [variant === 'A' ? 'right' : 'left']: 90, textAlign: variant === 'A' ? 'right' : 'left'}}>
            {c.lines.map((l, i) => (
              <div key={i} style={textStyle((c.accent as readonly number[]).includes(i), size)}>
                {l}
              </div>
            ))}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 70,
              [variant === 'A' ? 'right' : 'left']: 90,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: 54,
              letterSpacing: '0.18em',
              color: '#0d0b07',
              background: '#f2b53c',
              padding: '14px 34px',
            }}
          >
            {c.badge}
          </div>
        </div>
      </div>
    </FxContext.Provider>
  );
};
