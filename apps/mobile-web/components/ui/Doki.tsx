import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

/** Static Doki face for buttons and tabs. Replaced by the Rive animation in Phase 7. */
export function DokiFace({ size = 52 }: { size?: number }) {
  return (
    <View aria-hidden pointerEvents="none">
      <Svg width={size} height={size} viewBox="14 10 92 92">
        <Rect x={30} y={8} width={56} height={16} rx={4} fill="#FFFFFF" />
        <Ellipse cx={46} cy={52} rx={10} ry={12} fill="#FFFFFF" />
        <Ellipse cx={76} cy={52} rx={10} ry={12} fill="#FFFFFF" />
        <Circle cx={48} cy={54} r={5.5} fill="#13287A" />
        <Circle cx={78} cy={54} r={5.5} fill="#13287A" />
        <Circle cx={33} cy={68} r={4.5} fill="#FF9DB0" />
        <Circle cx={89} cy={68} r={4.5} fill="#FF9DB0" />
        <Path
          d="M52 71 Q61 78 70 71"
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

/**
 * Full static Doki (plan §4.2): blue folder body, red tab, white paper top, pink cheeks, gold lanyard.
 * Placeholder until the Rive character lands in Phase 7.
 */
export function Doki({
  size = 120,
  label = 'Doki, your Dokyu guide',
}: {
  size?: number;
  label?: string;
}) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{ width: size, height: size }}
    >
      <View aria-hidden pointerEvents="none">
        <Svg width={size} height={size} viewBox="0 0 120 120">
          {/* red folder tab */}
          <Rect x={18} y={20} width={38} height={18} rx={6} fill="#D93A4A" />
          {/* white paper peeking out */}
          <Rect
            x={30}
            y={14}
            width={62}
            height={30}
            rx={5}
            fill="#FFFFFF"
            stroke="#D5DEFF"
            strokeWidth={2}
          />
          {/* blue folder body */}
          <Rect x={14} y={30} width={92} height={74} rx={18} fill="#2042C4" />
          {/* eyes */}
          <Ellipse cx={46} cy={62} rx={10} ry={12} fill="#FFFFFF" />
          <Ellipse cx={76} cy={62} rx={10} ry={12} fill="#FFFFFF" />
          <Circle cx={48} cy={64} r={5.5} fill="#13287A" />
          <Circle cx={78} cy={64} r={5.5} fill="#13287A" />
          <Circle cx={50} cy={61} r={1.8} fill="#FFFFFF" />
          <Circle cx={80} cy={61} r={1.8} fill="#FFFFFF" />
          {/* cheeks and smile */}
          <Circle cx={33} cy={78} r={4.5} fill="#FF9DB0" />
          <Circle cx={89} cy={78} r={4.5} fill="#FF9DB0" />
          <Path
            d="M52 81 Q61 88 70 81"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
          {/* gold lanyard */}
          <Path
            d="M40 104 L60 92 L80 104"
            stroke="#E0A800"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Rect x={53} y={96} width={14} height={18} rx={3} fill="#FFD452" />
        </Svg>
      </View>
    </View>
  );
}
