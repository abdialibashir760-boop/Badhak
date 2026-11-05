import React from "react";
import { Easing, interpolateColors, useCurrentFrame } from "remotion";
import { C, FONT, T } from "./theme";
import { lerp, prog } from "./math";

export const PX = 1180;
export const PY = 540;
const ZOOM = 8;
const BTN = { x: 0, y: 290 };

const Person: React.FC = () => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 22) * 3;
  return (
    <g transform={`translate(0 ${bob})`}>
      {/* light cast by the phone */}
      <ellipse cx={780} cy={560} rx={420} ry={420} fill="url(#glowCyan)" opacity={0.18} />
      {/* torso */}
      <path
        d="M170 1100 C180 900 290 820 440 800 L690 800 C830 820 940 900 950 1100 Z"
        fill="url(#sweater)"
      />
      <path
        d="M440 800 C470 850 520 880 565 880 C610 880 655 850 690 800"
        fill="none"
        stroke="#1a3150"
        strokeWidth={14}
        strokeLinecap="round"
      />
      {/* neck */}
      <path d="M520 690 L520 810 C545 850 590 850 612 810 L612 690 Z" fill={C.skinShade} />
      {/* back arm + hand holding the phone */}
      <path
        d="M830 880 L905 1005 L985 805"
        fill="none"
        stroke="url(#sweater)"
        strokeWidth={92}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx={1002} cy={770} rx={40} ry={52} fill={C.skin} />
      {/* head */}
      <ellipse cx={575} cy={575} rx={104} ry={120} fill="url(#skinGrad)" />
      <ellipse cx={470} cy={590} rx={16} ry={30} fill={C.skinShade} />
      {/* hair */}
      <path
        d="M462 575 C440 440 560 405 650 452 C690 475 692 530 676 575 C650 525 585 505 530 520 C495 530 475 548 462 575 Z"
        fill="#161b28"
      />
      {/* face details, looking toward the phone */}
      <path d="M626 548 q22 -9 40 0" stroke="#161b28" strokeWidth={6} fill="none" strokeLinecap="round" />
      <circle cx={648} cy={578} r={6} fill="#161b28" />
      <path d="M624 634 q22 16 44 -2" stroke="#8a4f3a" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M678 590 l12 28 l-14 4" stroke={C.skinShade} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* rim light */}
      <path
        d="M668 470 C700 490 700 540 684 590"
        stroke={C.cyan}
        strokeWidth={4}
        fill="none"
        opacity={0.55}
        strokeLinecap="round"
      />
    </g>
  );
};

const Screen: React.FC<{ f: number }> = ({ f }) => {
  const pressed = f >= T.press;
  const btnDim = interpolateColors(f, [T.press, T.press + 6], ["#2ee6c5", "#15606a"]);
  const fill = prog(f, T.press + 4, 100, Easing.inOut(Easing.quad));
  const pressDip = prog(f, T.press - 3, T.press) - prog(f, T.press + 4, T.press + 10);
  const label = pressed ? "SENDING" : "SEND";
  const ripple = prog(f, T.press, T.press + 20, Easing.out(Easing.cubic));
  return (
    <g fontFamily={FONT}>
      <rect x={-175} y={-375} width={350} height={750} fill="url(#screenBg)" />
      {/* status bar */}
      <text x={-140} y={-334} fill="#fff" fontSize={17} fontWeight={700}>
        9:41
      </text>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={82 + i * 8} y={-346 + (3 - i) * 3} width={5} height={8 + i * 3} rx={1.5} fill="#fff" />
      ))}
      <rect x={122} y={-346} width={28} height={14} rx={4} fill="none" stroke="#fff" strokeWidth={1.5} />
      <rect x={125} y={-343} width={20} height={8} rx={2} fill="#fff" />
      {/* island */}
      <rect x={-48} y={-366} width={96} height={28} rx={14} fill="#02060c" />
      {/* header */}
      <path d="M-140 -290 l-12 12 l12 12" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(12 0)" />
      <text x={0} y={-278} textAnchor="middle" fill="#fff" fontSize={26} fontWeight={700}>
        Send money
      </text>
      {/* recipient */}
      <rect x={-150} y={-246} width={300} height={92} rx={22} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" />
      <circle cx={-104} cy={-200} r={28} fill={C.gold} />
      <text x={-104} y={-193} textAnchor="middle" fill={C.navy} fontSize={20} fontWeight={800}>
        MC
      </text>
      <text x={-62} y={-208} fill="#fff" fontSize={22} fontWeight={700}>
        Maya Chen
      </text>
      <text x={-62} y={-180} fill={C.mute} fontSize={16}>
        Harbor Bank •••• 2207
      </text>
      {/* from */}
      <text x={-150} y={-112} fill={C.mute} fontSize={16}>
        From
      </text>
      <text x={150} y={-112} textAnchor="end" fill="#fff" fontSize={16} fontWeight={600}>
        Northgate Checking •••• 4821
      </text>
      <line x1={-150} x2={150} y1={-90} y2={-90} stroke="rgba(255,255,255,0.1)" />
      {/* amount */}
      <text x={0} y={-48} textAnchor="middle" fill={C.mute} fontSize={14} fontWeight={600} letterSpacing={4}>
        AMOUNT
      </text>
      <text
        x={0}
        y={26}
        textAnchor="middle"
        fill="#fff"
        fontSize={64}
        fontWeight={800}
        letterSpacing={-1.5}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        $1,000.00
      </text>
      <rect x={-62} y={52} width={124} height={32} rx={16} fill="rgba(46,230,197,0.14)" />
      <text x={0} y={74} textAnchor="middle" fill={C.teal} fontSize={16} fontWeight={600}>
        Rent share
      </text>
      <line x1={-150} x2={150} y1={112} y2={112} stroke="rgba(255,255,255,0.1)" />
      <text x={-150} y={142} fill={C.mute} fontSize={16}>
        Fee $0.00
      </text>
      <text x={150} y={142} textAnchor="end" fill="#fff" fontSize={16} fontWeight={600}>
        Arrives in seconds
      </text>
      {/* lock note */}
      <g transform="translate(-92 190)" fill="none" stroke={C.mute} strokeWidth={2} strokeLinecap="round">
        <rect x={-8} y={-2} width={16} height={12} rx={3} />
        <path d="M-5 -2 v-4 a5 5 0 0 1 10 0 v4" />
      </g>
      <text x={-70} y={195} fill={C.mute} fontSize={15}>
        End-to-end encrypted
      </text>
      {/* SEND button */}
      <g transform={`translate(${BTN.x} ${BTN.y}) scale(${1 - pressDip * 0.05})`}>
        <rect x={-150} y={-35} width={300} height={70} rx={35} fill={pressed ? btnDim : "url(#tealBtn)"} />
        {pressed && (
          <clipPath id="btnClip">
            <rect x={-150} y={-35} width={300} height={70} rx={35} />
          </clipPath>
        )}
        {pressed && (
          <rect x={-150} y={-35} width={300 * fill} height={70} fill="url(#tealBtn)" clipPath="url(#btnClip)" />
        )}
        {pressed && (
          <circle cx={0} cy={0} r={ripple * 190} fill="none" stroke="#fff" strokeWidth={4} opacity={(1 - ripple) * 0.8} />
        )}
        <text x={pressed ? 22 : 0} y={11} textAnchor="middle" fill={C.navy} fontSize={30} fontWeight={800} letterSpacing={4}>
          {label}
        </text>
        {pressed && (
          <g transform={`translate(-112 0) rotate(${f * 16})`}>
            <circle r={13} fill="none" stroke={C.navy} strokeOpacity={0.25} strokeWidth={4} />
            <path d="M0 -13 a13 13 0 0 1 13 13" fill="none" stroke={C.navy} strokeWidth={4} strokeLinecap="round" />
          </g>
        )}
      </g>
      <rect x={-60} y={354} width={120} height={6} rx={3} fill="rgba(255,255,255,0.4)" />
    </g>
  );
};

const Finger: React.FC<{ f: number }> = ({ f }) => {
  const start = { x: 250, y: 700 };
  const end = { x: BTN.x + 6, y: BTN.y + 4 };
  const approach = prog(f, 8, 38, Easing.out(Easing.cubic));
  const retreat = prog(f, 56, 80, Easing.in(Easing.cubic));
  const press = prog(f, T.press - 3, T.press) - prog(f, T.press + 4, T.press + 10);
  const px = lerp(lerp(start.x, end.x, approach), start.x, retreat);
  const py = lerp(lerp(start.y, end.y, approach), start.y, retreat);
  const opacity = prog(f, 8, 14) * (1 - prog(f, 70, 82));
  if (opacity <= 0) return null;
  return (
    <g transform={`translate(${px} ${py}) rotate(-28) scale(${1 - press * 0.06})`} opacity={opacity}>
      <rect x={-60} y={150} width={120} height={600} rx={60} fill="url(#skinGrad)" />
      <rect x={-27} y={-6} width={54} height={520} rx={27} fill="url(#skinGrad)" />
      <ellipse cx={0} cy={18} rx={17} ry={22} fill="#f0c9a6" />
    </g>
  );
};

/** Scene A: person presses SEND, then the camera dives into the phone. */
export const PhoneScene: React.FC = () => {
  const f = useCurrentFrame();
  const e = prog(f, T.zoomStart, T.zoomEnd, Easing.bezier(0.55, 0, 0.3, 1));
  const scale = Math.exp(Math.log(ZOOM) * e);
  const cx = lerp(960, PX, e);
  const cy = lerp(540, PY, e);
  const rot = -4 * (1 - e);
  const intro = prog(f, 0, 22, Easing.out(Easing.cubic));
  const fade = 1 - prog(f, 110, 134);
  const uiFade = 1 - prog(f, 98, 124);
  if (fade <= 0) return null;
  return (
    <g opacity={intro * fade}>
      <defs>
        <linearGradient id="sweater" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#35618f" />
          <stop offset="100%" stopColor="#1b3858" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e6b58d" />
          <stop offset="100%" stopColor={C.skinShade} />
        </linearGradient>
        <linearGradient id="screenBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12294a" />
          <stop offset="100%" stopColor="#081528" />
        </linearGradient>
        <linearGradient id="phoneBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a5576" />
          <stop offset="50%" stopColor="#101c2e" />
          <stop offset="100%" stopColor="#2b4566" />
        </linearGradient>
        <clipPath id="screenClip">
          <rect x={-175} y={-375} width={350} height={750} rx={40} />
        </clipPath>
        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
      </defs>
      <g transform={`translate(960 540) scale(${scale}) translate(${-cx} ${-cy})`}>
        <Person />
        <g transform={`translate(${PX} ${PY + (1 - intro) * 40}) rotate(${rot})`}>
          {/* glow + shadow */}
          <ellipse cx={0} cy={0} rx={330} ry={470} fill="url(#glowTeal)" opacity={0.22 + 0.2 * e} />
          <rect x={-170} y={-350} width={380} height={780} rx={60} fill="#000" opacity={0.5} filter="url(#softShadow)" />
          {/* body */}
          <rect x={-190} y={-390} width={380} height={780} rx={56} fill="url(#phoneBody)" stroke="rgba(160,220,255,0.35)" strokeWidth={2} />
          <rect x={192} y={-200} width={4} height={90} rx={2} fill="#2b4566" />
          <rect x={-196} y={-250} width={4} height={60} rx={2} fill="#2b4566" />
          <g clipPath="url(#screenClip)" opacity={uiFade}>
            <Screen f={f} />
          </g>
          <rect x={-175} y={-375} width={350} height={750} rx={40} fill="none" stroke="#000" strokeWidth={3} />
          {/* thumb gripping the edge */}
          <rect x={-212} y={252} width={62} height={30} rx={15} transform="rotate(14 -180 267)" fill="url(#skinGrad)" />
          <Finger f={f} />
        </g>
      </g>
    </g>
  );
};
