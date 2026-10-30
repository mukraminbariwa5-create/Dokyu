import Svg, { Ellipse, Circle, Path, Rect } from 'react-native-svg';

/** Static Doki face. Replaced by the Rive animation in Phase 7. */
export function DokiFace({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="14 10 92 92" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Rect x={30} y={8} width={56} height={16} rx={4} fill="#FFFFFF" />
      <Ellipse cx={46} cy={52} rx={10} ry={12} fill="#FFFFFF" />
      <Ellipse cx={76} cy={52} rx={10} ry={12} fill="#FFFFFF" />
      <Circle cx={48} cy={54} r={5.5} fill="#13287A" />
      <Circle cx={78} cy={54} r={5.5} fill="#13287A" />
      <Circle cx={33} cy={68} r={4.5} fill="#FF9DB0" />
      <Circle cx={89} cy={68} r={4.5} fill="#FF9DB0" />
      <Path d="M52 71 Q61 78 70 71" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
