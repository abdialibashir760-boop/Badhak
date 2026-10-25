import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, type CaptionItem } from "../Captions";
import { CreditCard } from "../CreditCard";
import { FrameCanvas } from "../FrameCanvas";
import { drawNetworkBackdrop } from "../NetworkBackdrop";
import { makeBurst } from "../ParticleBurst";
import { PaymentTerminal, type ScreenState } from "../PaymentTerminal";
import { colors } from "../../theme";

const TOUCH = 90; // the card touches the terminal
const ZOOM_START = 120;
const ZOOM_END = 1350;
const SCREEN_CENTER = { x: 960, y: 400 };
const burst = makeBurst(960, 335, TOUCH);

const captions: CaptionItem[] = [
  { from: 0, to: 150, kicker: "Step 1 · The tap", text: "You hold your card to the terminal.", color: colors.merchant },
  { from: 150, to: 420, kicker: "Step 1 · The tap", text: "The chip shares a one-time token, not your real card number.", color: colors.merchant },
  { from: 420, to: 700, kicker: "Step 2 · The message", text: "The terminal adds the amount and merchant ID into one ISO 8583 message.", color: colors.merchant },
  { from: 700, to: 1000, kicker: "Step 3 · Encrypt", text: "It scrambles the message so nobody on the wire can read it.", color: colors.merchant },
  { from: 1000, to: 1350, kicker: "Step 4 · Send", text: "Then it fires the packet into the payment network. Follow it in…", color: colors.acquirer },
];

function screenAt(frame: number): ScreenState {
  const busy = interpolate(frame, [TOUCH, 1300], [0.04, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dots = ".".repeat(1 + (Math.floor(frame / 12) % 3));
  if (frame < TOUCH) return { title: "TAP CARD", sub: "$42.50", progress: null, tone: "idle" };
  if (frame < 200) return { title: "✓ CARD READ", sub: "$42.50", progress: busy, tone: "ok" };
  if (frame < 420) return { title: `READING TOKEN${dots}`, sub: "$42.50", progress: busy, tone: "busy" };
  if (frame < 700) return { title: `BUILDING MSG${dots}`, sub: "MTI 0100", progress: busy, tone: "busy" };
  if (frame < 1000) return { title: `ENCRYPTING${dots}`, sub: "AES-256", progress: busy, tone: "busy" };
  return { title: `SENDING${dots}`, sub: "→ ACQUIRER", progress: busy, tone: "busy" };
}

/** Scene 1: tap, particle burst, then a camera zoom through the terminal screen into the network. */
export const Scene1TapZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card glides in from the left. durationInFrames makes the spring land exactly on frame 90.
  const glide = spring({ frame: frame - 20, fps, durationInFrames: TOUCH - 20, config: { damping: 15, stiffness: 90 } });
  const leave = spring({ frame: frame - 215, fps, config: { damping: 200 } });
  const press = interpolate(frame, [TOUCH, TOUCH + 5, TOUCH + 16], [1, 0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardGlow = interpolate(frame, [TOUCH - 10, TOUCH, TOUCH + 40], [0.2, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardX = -420 + 1380 * glide - 560 * leave;
  const cardY = 360 - 25 * glide + 520 * leave;
  const cardRot = -16 * (1 - glide) - 3 - 20 * leave;
  const cardOpacity = frame < 20 ? 0 : 1 - leave;

  // Zoom: scale goes 1 -> 25 and opacity 1 -> 0 between frames 120 and 1350.
  // Interpolating the logarithm makes the zoom feel steady instead of rushing at the end.
  const zoomLog = interpolate(frame, [ZOOM_START, ZOOM_END], [0, Math.log(25)], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const scale = Math.exp(zoomLog);
  const opacity = interpolate(frame, [ZOOM_START, ZOOM_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });

  const backdropOpacity =
    interpolate(frame, [250, 700], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame, [1290, 1350], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const backdropScale = interpolate(frame, [250, 1350], [0.7, 2.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });

  const intro = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* the network keeps rushing towards the camera after the terminal has faded */}
      <div style={{ position: "absolute", inset: 0, opacity: backdropOpacity, transform: `scale(${backdropScale})` }}>
        <FrameCanvas draw={drawNetworkBackdrop} />
      </div>

      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, opacity: intro * opacity }}>
        <g transform={`translate(${SCREEN_CENTER.x} ${SCREEN_CENTER.y}) scale(${scale}) translate(${-SCREEN_CENTER.x} ${-SCREEN_CENTER.y})`}>
          <PaymentTerminal frame={frame} screen={screenAt(frame)} glow={cardGlow} />
          <g opacity={cardOpacity} transform={`translate(${cardX} ${cardY}) rotate(${cardRot}) scale(${press})`}>
            <CreditCard frame={frame} glow={cardGlow} />
          </g>
        </g>
      </svg>

      <FrameCanvas draw={burst} />
      {/* dark plate so captions stay readable while the screen zooms past */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 170, background: "linear-gradient(180deg, rgba(5,7,11,0), rgba(5,7,11,0.92) 45%)" }} />
      <Captions items={captions} />
    </AbsoluteFill>
  );
};
