import React from 'react';
import {INK, PAPER} from './utils';

export const Room: React.FC<{tc: number}> = ({tc}) => {
  const flicker = 1 + 0.05 * Math.sin(tc * 9) + 0.03 * Math.sin(tc * 23);
  return (
    <g>
      <rect x={-100} y={-100} width={2120} height={970} fill="url(#wall)" />
      <rect x={-100} y={866} width={2120} height={320} fill="#241d19" />
      {[905, 955, 1015].map((y) => (
        <line key={y} x1={-100} x2={2020} y1={y} y2={y} stroke="#15100d" strokeWidth={3} opacity={0.6} />
      ))}
      <line x1={-100} x2={2020} y1={866} y2={866} stroke={INK} strokeWidth={7} />

      {/* window + moon */}
      <rect x={250} y={130} width={230} height={270} rx={6} fill="#1f3550" stroke={INK} strokeWidth={8} />
      <circle cx={360} cy={235} r={44} fill={PAPER} />
      <circle cx={380} cy={222} r={40} fill="#1f3550" />
      <circle cx={300} cy={180} r={3} fill={PAPER} />
      <circle cx={440} cy={170} r={3} fill={PAPER} />
      <circle cx={420} cy={340} r={2.5} fill={PAPER} />
      <line x1={365} x2={365} y1={130} y2={400} stroke={INK} strokeWidth={7} />
      <line x1={250} x2={480} y1={265} y2={265} stroke={INK} strokeWidth={7} />

      {/* nightstand + lamp */}
      <circle cx={1570} cy={690} r={620} fill="url(#lampGlow)" opacity={flicker} />
      <rect x={1470} y={770} width={200} height={96} rx={8} fill="#6a4a36" stroke={INK} strokeWidth={7} />
      <rect x={1560} y={720} width={22} height={50} fill="#4a3426" stroke={INK} strokeWidth={6} />
      <path d="M1520 640 L1620 640 L1652 722 L1488 722 Z" fill="#ffd89a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />

      {/* floor shadow */}
      <ellipse cx={820} cy={872} rx={430} ry={16} fill="#000" opacity={0.35} />

      {/* bed */}
      <rect x={220} y={560} width={40} height={274} rx={10} fill="#7a553c" stroke={INK} strokeWidth={7} />
      <rect x={262} y={830} width={26} height={38} fill="#5d4130" stroke={INK} strokeWidth={6} />
      <rect x={912} y={830} width={26} height={38} fill="#5d4130" stroke={INK} strokeWidth={6} />
      <rect x={250} y={770} width={700} height={62} rx={10} fill="#7a553c" stroke={INK} strokeWidth={7} />
      <rect x={260} y={700} width={690} height={80} rx={26} fill="#efe2cd" stroke={INK} strokeWidth={7} />
      <rect x={270} y={686} width={430} height={100} rx={26} fill="#c98a63" stroke={INK} strokeWidth={7} />
      <path d="M300 722 Q480 744 680 718" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.55} />
      <rect x={278} y={646} width={134} height={56} rx={24} fill="#fff3e0" stroke={INK} strokeWidth={7} />
    </g>
  );
};
