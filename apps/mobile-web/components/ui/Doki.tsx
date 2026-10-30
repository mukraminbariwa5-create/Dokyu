/**
 * Doki, Dokyu's guide: a living document (chosen 2026-10-30). Built in code with react-native-svg so the same
 * character works on Android and web and can be animated piece by piece (Phase 7: walking across the screen,
 * stopping beside a button and pointing at it).
 *
 * Look (plan §4.2): blue folder body with a red tab, a white paper sheet with a folded corner and a checklist,
 * pink cheeks and a gold lanyard with an ID card. "Almost 3D": the folder has thickness, light comes from the
 * top left, eyes are glossy, limbs are rounded, and he stands on a soft shadow. No flag elements, no agency seals.
 */
import { useEffect, useId, useState } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useReducedMotion } from '../../lib/motion';

export type DokiPose =
  'idle' | 'walk' | 'walk2' | 'point' | 'wave' | 'happy' | 'talk' | 'worried' | 'pointDown';

const C = {
  folderLight: '#3D66F2',
  folder: '#2042C4',
  folderDark: '#13287A',
  edge: '#0F1F63',
  paper: '#FFFFFF',
  paperShade: '#E3E9FF',
  fold: '#C3D0FF',
  line: '#AFC0FF',
  tick: '#15803D',
  tab: '#E5485B',
  tabDark: '#B92C3F',
  gold: '#F2B705',
  goldDark: '#B98800',
  limb: '#1A2E85',
  limbHi: '#5577F0',
  pupil: '#0B1440',
  cheek: '#FF8FA6',
};

interface Limb {
  from: [number, number];
  to: [number, number];
}

/** Arm and leg positions for each pose (viewBox 0 0 200 240, light from top left). */
function rig(pose: DokiPose): {
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  finger?: [number, number];
} {
  const legsStill = {
    legL: { from: [84, 180], to: [80, 212] } as Limb,
    legR: { from: [116, 180], to: [120, 212] } as Limb,
  };
  switch (pose) {
    case 'walk':
      return {
        armL: { from: [50, 122], to: [40, 150] },
        armR: { from: [150, 122], to: [168, 146] },
        legL: { from: [84, 180], to: [70, 208] },
        legR: { from: [116, 180], to: [126, 212] },
      };
    case 'walk2':
      return {
        armL: { from: [50, 122], to: [32, 146] },
        armR: { from: [150, 122], to: [160, 150] },
        legL: { from: [84, 180], to: [88, 212] },
        legR: { from: [116, 180], to: [132, 206] },
      };
    case 'point':
      return {
        armL: { from: [50, 122], to: [36, 152] },
        armR: { from: [150, 118], to: [186, 96] },
        finger: [10, -6],
        ...legsStill,
      };
    case 'wave':
      return {
        armL: { from: [50, 122], to: [36, 152] },
        armR: { from: [150, 114], to: [174, 72] },
        ...legsStill,
      };
    case 'pointDown':
      return {
        armL: { from: [50, 122], to: [36, 152] },
        armR: { from: [150, 124], to: [182, 156] },
        finger: [8, 9],
        ...legsStill,
      };
    case 'talk':
      // explaining: one hand open at chest height
      return {
        armL: { from: [50, 122], to: [36, 152] },
        armR: { from: [150, 120], to: [176, 120] },
        ...legsStill,
      };
    case 'worried':
      // hands up near the face
      return {
        armL: { from: [50, 120], to: [40, 98] },
        armR: { from: [150, 120], to: [160, 98] },
        legL: { from: [84, 180], to: [86, 212] },
        legR: { from: [116, 180], to: [114, 212] },
      };
    case 'happy':
      return {
        armL: { from: [50, 114], to: [24, 78] },
        armR: { from: [150, 114], to: [176, 78] },
        ...legsStill,
      };
    default:
      return {
        armL: { from: [50, 122], to: [36, 154] },
        armR: { from: [150, 122], to: [164, 154] },
        ...legsStill,
      };
  }
}

function Tube({ limb, width = 11 }: { limb: Limb; width?: number }) {
  const d = `M${limb.from[0]} ${limb.from[1]} L${limb.to[0]} ${limb.to[1]}`;
  return (
    <G>
      <Path d={d} stroke={C.limb} strokeWidth={width} strokeLinecap="round" />
      {/* highlight on the lit side gives the tube a round look */}
      <Path
        d={d}
        stroke={C.limbHi}
        strokeWidth={width * 0.28}
        strokeLinecap="round"
        opacity={0.55}
        transform="translate(-2,-1.5)"
      />
    </G>
  );
}

export interface DokiProps {
  size?: number;
  pose?: DokiPose;
  /** Which way he looks and walks. */
  facing?: 'left' | 'right';
  /** Blinks now and then (off with reduce motion). */
  alive?: boolean;
  /** Open mouth, for talking (toggle it while a speech bubble types). */
  mouthOpen?: boolean;
  /** Read by screen readers. */
  label?: string;
}

/** The full Doki character. Width = size, height = size × 1.2. */
export function Doki({
  size = 120,
  pose = 'idle',
  facing = 'right',
  alive = true,
  mouthOpen = false,
  label = 'Doki, your Dokyu guide',
}: DokiProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (name: string) => `${name}${uid}`;
  const reduced = useReducedMotion();
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!alive || reduced) return;
    let close: ReturnType<typeof setTimeout> | undefined;
    const timer = setInterval(() => {
      setBlink(true);
      close = setTimeout(() => setBlink(false), 140);
    }, 3800);
    return () => {
      clearInterval(timer);
      if (close) clearTimeout(close);
    };
  }, [alive, reduced]);

  const r = rig(pose);
  const happy = pose === 'happy' || pose === 'wave';
  const worried = pose === 'worried';
  // Pupils look where he is going or pointing.
  const look =
    pose === 'point' || pose === 'pointDown' || pose === 'walk' || pose === 'walk2' ? 3 : 0;
  const lookY = pose === 'pointDown' ? 3 : pose === 'point' ? -2 : 0;
  const hand = (l: Limb) => (
    <Circle cx={l.to[0]} cy={l.to[1]} r={7.5} fill={`url(#${id('hand')})`} />
  );

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{ width: size, height: size * 1.2 }}
    >
      <View aria-hidden pointerEvents="none">
        <Svg width={size} height={size * 1.2} viewBox="0 0 200 240">
          <Defs>
            <LinearGradient id={id('folder')} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={C.folderLight} />
              <Stop offset="0.55" stopColor={C.folder} />
              <Stop offset="1" stopColor={C.folderDark} />
            </LinearGradient>
            <LinearGradient id={id('paper')} x1="0" y1="0" x2="0.4" y2="1">
              <Stop offset="0" stopColor={C.paper} />
              <Stop offset="1" stopColor={C.paperShade} />
            </LinearGradient>
            <LinearGradient id={id('tab')} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={C.tab} />
              <Stop offset="1" stopColor={C.tabDark} />
            </LinearGradient>
            <LinearGradient id={id('card')} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFD84D" />
              <Stop offset="1" stopColor={C.gold} />
            </LinearGradient>
            <RadialGradient id={id('eye')} cx="0.4" cy="0.35" r="0.7">
              <Stop offset="0" stopColor="#FFFFFF" />
              <Stop offset="1" stopColor="#D9E1F8" />
            </RadialGradient>
            <RadialGradient id={id('pupil')} cx="0.35" cy="0.3" r="0.75">
              <Stop offset="0" stopColor="#2A3C8E" />
              <Stop offset="1" stopColor={C.pupil} />
            </RadialGradient>
            <RadialGradient id={id('cheek')} cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0" stopColor={C.cheek} stopOpacity="0.9" />
              <Stop offset="1" stopColor={C.cheek} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id={id('hand')} cx="0.35" cy="0.3" r="0.8">
              <Stop offset="0" stopColor="#4C6CE6" />
              <Stop offset="1" stopColor={C.limb} />
            </RadialGradient>
            <RadialGradient id={id('shadow')} cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0" stopColor={C.folderDark} stopOpacity="0.28" />
              <Stop offset="1" stopColor={C.folderDark} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          <G transform={facing === 'left' ? 'translate(200,0) scale(-1,1)' : undefined}>
            {/* soft shadow on the ground */}
            <Ellipse cx={100} cy={222} rx={60} ry={9} fill={`url(#${id('shadow')})`} />

            {/* legs and shoes */}
            <Tube limb={r.legL} width={12} />
            <Tube limb={r.legR} width={12} />
            <Ellipse cx={r.legL.to[0] + 3} cy={r.legL.to[1] + 4} rx={12} ry={6.5} fill={C.edge} />
            <Ellipse cx={r.legR.to[0] + 3} cy={r.legR.to[1] + 4} rx={12} ry={6.5} fill={C.edge} />
            <Ellipse
              cx={r.legL.to[0] + 1}
              cy={r.legL.to[1] + 2}
              rx={6}
              ry={2}
              fill="#FFFFFF"
              opacity={0.25}
            />
            <Ellipse
              cx={r.legR.to[0] + 1}
              cy={r.legR.to[1] + 2}
              rx={6}
              ry={2}
              fill="#FFFFFF"
              opacity={0.25}
            />

            {/* back arm (behind the body) */}
            <Tube limb={r.armL} />
            {hand(r.armL)}

            {/* paper sheet peeking out of the folder, with a folded corner and a checklist */}
            <Path d="M62 20 H128 L144 36 V100 H62 Z" fill={`url(#${id('paper')})`} />
            <Path d="M128 20 V30 Q128 36 134 36 H144 Z" fill={C.fold} />
            <Path
              d="M70 32 l3.5 3.5 l7 -7"
              stroke={C.tick}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path d="M86 32 H120" stroke={C.line} strokeWidth={3} strokeLinecap="round" />
            <Path
              d="M70 45 l3.5 3.5 l7 -7"
              stroke={C.tick}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path d="M86 45 H130" stroke={C.line} strokeWidth={3} strokeLinecap="round" />
            <Path
              d="M72 58 H124"
              stroke={C.line}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.6}
            />

            {/* red tab of the folder */}
            <Rect x={54} y={58} width={36} height={18} rx={6} fill={`url(#${id('tab')})`} />

            {/* folder thickness (the side you see because of the light), then the front */}
            <Rect x={53} y={75} width={104} height={112} rx={24} fill={C.edge} />
            <Rect x={48} y={70} width={104} height={112} rx={24} fill={`url(#${id('folder')})`} />
            {/* light along the top lip and a soft gloss */}
            <Path
              d="M66 71 H134"
              stroke="#FFFFFF"
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.35}
            />
            <Ellipse
              cx={74}
              cy={92}
              rx={20}
              ry={9}
              fill="#FFFFFF"
              opacity={0.12}
              transform="rotate(-25 74 92)"
            />

            {/* cheeks */}
            <Circle cx={64} cy={136} r={11} fill={`url(#${id('cheek')})`} />
            <Circle cx={136} cy={136} r={11} fill={`url(#${id('cheek')})`} />

            {worried ? (
              <>
                <Path d="M70 94 L90 99" stroke={C.pupil} strokeWidth={3.5} strokeLinecap="round" />
                <Path
                  d="M130 94 L110 99"
                  stroke={C.pupil}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                />
                <Path d="M146 80 Q152 90 146 96 Q140 90 146 80 Z" fill="#9FD3FF" />
              </>
            ) : null}

            {/* eyes */}
            {blink || happy ? (
              <>
                <Path
                  d={happy ? 'M70 118 Q82 104 94 118' : 'M70 114 Q82 120 94 114'}
                  stroke={C.pupil}
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d={happy ? 'M106 118 Q118 104 130 118' : 'M106 114 Q118 120 130 114'}
                  stroke={C.pupil}
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : (
              <>
                <Ellipse cx={82} cy={112} rx={13} ry={15} fill={`url(#${id('eye')})`} />
                <Ellipse cx={118} cy={112} rx={13} ry={15} fill={`url(#${id('eye')})`} />
                <Circle cx={84 + look} cy={115 + lookY} r={7.5} fill={`url(#${id('pupil')})`} />
                <Circle cx={120 + look} cy={115 + lookY} r={7.5} fill={`url(#${id('pupil')})`} />
                <Circle cx={81.5 + look} cy={111.5 + lookY} r={2.6} fill="#FFFFFF" />
                <Circle cx={117.5 + look} cy={111.5 + lookY} r={2.6} fill="#FFFFFF" />
                <Circle cx={86.5 + look} cy={118 + lookY} r={1.2} fill="#FFFFFF" opacity={0.8} />
                <Circle cx={122.5 + look} cy={118 + lookY} r={1.2} fill="#FFFFFF" opacity={0.8} />
              </>
            )}

            {/* mouth */}
            {mouthOpen && !happy ? (
              <>
                <Ellipse cx={100} cy={138} rx={8} ry={6.5} fill={C.pupil} />
                <Ellipse cx={100} cy={141} rx={5} ry={2.6} fill={C.cheek} />
              </>
            ) : worried ? (
              <Path
                d="M89 139 Q94 134 100 139 Q106 144 111 139"
                stroke={C.pupil}
                strokeWidth={3.5}
                strokeLinecap="round"
                fill="none"
              />
            ) : happy ? (
              <>
                <Path d="M88 132 Q100 148 112 132 Z" fill={C.pupil} />
                <Path d="M93 139 Q100 146 107 139 Q100 136 93 139 Z" fill={C.cheek} />
              </>
            ) : (
              <Path
                d="M90 134 Q100 143 110 134"
                stroke={C.pupil}
                strokeWidth={3.5}
                strokeLinecap="round"
                fill="none"
              />
            )}

            {/* gold lanyard and ID card */}
            <Path
              d="M74 146 L96 162 M126 146 L104 162"
              stroke={C.gold}
              strokeWidth={3.5}
              strokeLinecap="round"
            />
            <Rect
              x={89}
              y={158}
              width={22}
              height={22}
              rx={4}
              fill={C.goldDark}
              transform="translate(1.5,1.5)"
            />
            <Rect x={89} y={158} width={22} height={22} rx={4} fill={`url(#${id('card')})`} />
            <Rect x={93} y={162} width={7} height={8} rx={1.5} fill="#FFFFFF" opacity={0.9} />
            <Path
              d="M102 164 H107 M102 168 H106 M93 174 H107"
              stroke={C.goldDark}
              strokeWidth={1.6}
              strokeLinecap="round"
            />

            {/* front arm */}
            <Tube limb={r.armR} />
            {hand(r.armR)}
            {r.finger ? (
              <Path
                d={`M${r.armR.to[0]} ${r.armR.to[1]} L${r.armR.to[0] + r.finger[0]} ${r.armR.to[1] + r.finger[1]}`}
                stroke={C.limb}
                strokeWidth={5}
                strokeLinecap="round"
              />
            ) : null}

            {/* extras */}
            {pose === 'wave' ? (
              <Path
                d="M184 60 Q190 68 186 78 M190 52 Q200 66 194 82"
                stroke={C.folder}
                strokeWidth={2.5}
                strokeLinecap="round"
                fill="none"
                opacity={0.6}
              />
            ) : null}
            {pose === 'happy' ? (
              <>
                <Path d="M30 40 L33 50 L43 53 L33 56 L30 66 L27 56 L17 53 L27 50 Z" fill={C.gold} />
                <Path
                  d="M170 30 L172 37 L179 39 L172 41 L170 48 L168 41 L161 39 L168 37 Z"
                  fill={C.gold}
                />
                <Path
                  d="M182 104 L184 109 L189 111 L184 113 L182 118 L180 113 L175 111 L180 109 Z"
                  fill="#FFD84D"
                />
              </>
            ) : null}
            {pose === 'walk' || pose === 'walk2' ? (
              <Path
                d="M16 196 H34 M10 206 H30"
                stroke={C.line}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.7}
              />
            ) : null}
          </G>
        </Svg>
      </View>
    </View>
  );
}

/**
 * Doki's head for small places (the Ask Doki tab button): the top of the character, cropped.
 * Same art as the full character, so he looks the same everywhere.
 */
export function DokiFace({ size = 52 }: { size?: number }) {
  return (
    <View
      aria-hidden
      pointerEvents="none"
      style={{ width: size, height: size, overflow: 'hidden' }}
    >
      <View style={{ position: 'absolute', left: -size * 0.32, top: -size * 0.33 }}>
        <Doki size={size * 1.64} label="" alive={false} />
      </View>
    </View>
  );
}
