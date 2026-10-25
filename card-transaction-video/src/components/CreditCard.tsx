import { colors, font, mono } from "../theme";

/** Glowing credit card centred on (0,0), 320 x 200. Wrap it in a transform to move it. */
export const CreditCard: React.FC<{ frame: number; glow: number }> = ({ frame, glow }) => {
  const sheen = ((frame * 5) % 640) - 160;
  return (
    <g fontFamily={font}>
      <defs>
        <linearGradient id="cardFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1D4ED8" />
          <stop offset="0.55" stopColor="#4338CA" />
          <stop offset="1" stopColor="#0891B2" />
        </linearGradient>
        <linearGradient id="cardSheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="cardClip">
          <rect x={-160} y={-100} width={320} height={200} rx={24} />
        </clipPath>
        <filter id="cardGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={14} />
        </filter>
      </defs>
      <rect x={-166} y={-106} width={332} height={212} rx={30} fill={colors.network} opacity={0.5 + glow * 0.4} filter="url(#cardGlow)" />
      <rect x={-160} y={-100} width={320} height={200} rx={24} fill="url(#cardFill)" stroke="#fff" strokeOpacity={0.45} strokeWidth={2} />
      <g clipPath="url(#cardClip)">
        <rect x={sheen - 220} y={-140} width={90} height={300} fill="url(#cardSheen)" transform="rotate(18)" />
      </g>
      <rect x={-124} y={-52} width={56} height={42} rx={9} fill="#FBBF24" />
      <path d="M-124 -31H-68M-96 -52V-10" stroke="#92400E" strokeWidth={2} />
      <g fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" opacity={0.9}>
        <path d="M-40 -42Q-32 -31 -40 -20" />
        <path d="M-28 -50Q-16 -31 -28 -12" />
        <path d="M-16 -58Q0 -31 -16 -4" />
      </g>
      <text x={-124} y={44} fontSize={24} fontFamily={mono} fontWeight={700} fill="#fff" letterSpacing={2}>•••• •••• •••• 4242</text>
      <text x={-124} y={78} fontSize={16} fontWeight={700} fill="#fff" opacity={0.8} letterSpacing={3}>A. LEARNER</text>
      <circle cx={104} cy={70} r={18} fill="#F59E0B" opacity={0.9} />
      <circle cx={126} cy={70} r={18} fill="#EF4444" opacity={0.8} />
    </g>
  );
};
