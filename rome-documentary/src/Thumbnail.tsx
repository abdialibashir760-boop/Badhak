import React from 'react';
import { AbsoluteFill } from 'remotion';
import '././fonts';
import { ColosseumDusk } from './art/scenes1';
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: '#150d07', overflow: 'hidden' }}>
    <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', width: 1280, height: 720, filter: 'saturate(1.25) contrast(1.1)' }}><g transform="translate(-260 -60) scale(1.15)"><ColosseumDusk f={30} p={0.5} d={90} /></g></svg>
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(8,4,0,0.92) 0%, rgba(8,4,0,0.7) 38%, rgba(8,4,0,0) 70%)' }} />
    <div style={{ position: 'absolute', left: 54, top: 66, width: 700 }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 40, letterSpacing: 10, color: '#d9a93f' }}>HOW</div>
      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 118, lineHeight: 0.98, color: '#f6e7c4', textShadow: '0 6px 30px #000' }}>ROME</div>
      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 62, lineHeight: 1.08, color: '#f6e7c4', textShadow: '0 6px 30px #000', marginTop: 8 }}>BECAME THE MOST<br /><span style={{ color: '#e0432f' }}>POWERFUL EMPIRE</span></div>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 600, fontSize: 40, color: '#e8d4aa', marginTop: 18 }}>in the ancient world</div>
    </div>
    <div style={{ position: 'absolute', right: 40, bottom: 38, background: 'linear-gradient(180deg,#f3e7c6,#e2cc9c)', border: '3px solid #58361e', padding: '10px 26px', fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 34, color: '#8f1d1b', letterSpacing: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>753 BCE → 117 CE</div>
  </AbsoluteFill>
);
