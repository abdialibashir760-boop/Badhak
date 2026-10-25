import { colors, font, mono } from "../theme";

export interface ScreenState {
  title: string;
  sub: string;
  /** 0-1 progress bar under the title; null hides it. */
  progress: number | null;
  tone: "idle" | "ok" | "busy";
}

/** Vector payment terminal drawn in 1920x1080 scene coordinates. The screen centre is (960, 400). */
export const PaymentTerminal: React.FC<{ frame: number; screen: ScreenState; glow: number }> = ({ frame, screen, glow }) => {
  const toneColor = screen.tone === "ok" ? colors.merchant : screen.tone === "busy" ? colors.acquirer : "#7DD3FC";
  const keys = [0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => ({ r, c })));
  const waves = [0, 1, 2].map((i) => 0.35 + 0.65 * Math.max(0, Math.sin(frame * 0.14 - i * 0.9)));

  return (
    <g fontFamily={font}>
      <defs>
        <linearGradient id="termBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1B263D" />
          <stop offset="1" stopColor="#0A101D" />
        </linearGradient>
        <linearGradient id="counter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#101A2E" />
          <stop offset="1" stopColor="#05070B" />
        </linearGradient>
        <radialGradient id="termGlow" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor={toneColor} stopOpacity={0.28 + glow * 0.3} />
          <stop offset="1" stopColor={toneColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx={960} cy={540} rx={620} ry={620} fill="url(#termGlow)" />
      <rect x={0} y={940} width={1920} height={140} fill="url(#counter)" />
      <rect x={0} y={938} width={1920} height={3} fill="#2B3A58" opacity={0.7} />
      <ellipse cx={960} cy={946} rx={400} ry={26} fill="#000" opacity={0.55} />

      <rect x={740} y={150} width={440} height={790} rx={64} fill="url(#termBody)" stroke="#2B3A58" strokeWidth={4} />
      <rect x={748} y={158} width={424} height={774} rx={58} fill="none" stroke="#fff" strokeOpacity={0.05} strokeWidth={2} />

      {/* contactless tap pad */}
      <rect x={775} y={180} width={370} height={78} rx={30} fill="#0C1424" stroke="#243049" strokeWidth={2} />
      {waves.map((o, i) => (
        <path key={i} d={`M ${935 + i * 22} ${200 - i * 6} Q ${955 + i * 24} 219 ${935 + i * 22} ${238 + i * 6}`} fill="none" stroke="#7DD3FC" strokeWidth={5} strokeLinecap="round" opacity={o} />
      ))}
      <text x={1000} y={226} fontSize={22} letterSpacing={4} fontWeight={800} fill="#4B5C7D">TAP HERE</text>

      {/* screen */}
      <rect x={790} y={275} width={340} height={250} rx={26} fill="#03131A" stroke={toneColor} strokeOpacity={0.55} strokeWidth={3} />
      <rect x={790} y={275} width={340} height={250} rx={26} fill={toneColor} opacity={0.05 + glow * 0.08} />
      <text x={960} y={330} textAnchor="middle" fontSize={22} fontWeight={700} letterSpacing={3} fill="#5B7083">CORNER COFFEE</text>
      <text x={960} y={405} textAnchor="middle" fontSize={44} fontWeight={800} fill={toneColor}>{screen.title}</text>
      <text x={960} y={450} textAnchor="middle" fontSize={30} fontFamily={mono} fontWeight={700} fill="#E2E8F0">{screen.sub}</text>
      {screen.progress !== null && (
        <g>
          <rect x={830} y={485} width={260} height={10} rx={5} fill="#0E2430" />
          <rect x={830} y={485} width={260 * screen.progress} height={10} rx={5} fill={toneColor} />
        </g>
      )}
      {/* tiny network glyph in the middle of the screen: the thing we zoom into */}
      <g opacity={0.9}>
        <circle cx={960} cy={372} r={3} fill="#fff" />
        <circle cx={944} cy={378} r={1.6} fill={colors.acquirer} />
        <circle cx={976} cy={378} r={1.6} fill={colors.network} />
        <circle cx={960} cy={360} r={1.6} fill={colors.merchant} />
        <path d="M960 372L944 378M960 372L976 378M960 372L960 360" stroke="#fff" strokeOpacity={0.5} strokeWidth={0.8} />
      </g>

      {/* keypad */}
      {keys.map(({ r, c }) => {
        const last = r === 3;
        const fill = last ? [colors.network, "#EAB308", "#EF4444"][c] : "#151F35";
        return (
          <rect key={`${r}-${c}`} x={802 + c * 110} y={565 + r * 70} width={96} height={54} rx={15} fill={fill} fillOpacity={last ? 0.8 : 1} stroke="#263553" strokeWidth={2} />
        );
      })}
      <rect x={800} y={850} width={320} height={18} rx={9} fill="#070C18" stroke="#1B263D" strokeWidth={2} />
      <text x={960} y={910} textAnchor="middle" fontSize={22} letterSpacing={8} fontWeight={800} fill="#3E4E6E">PAYTERM</text>
    </g>
  );
};
