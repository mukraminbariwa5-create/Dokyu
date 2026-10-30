import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';
import { colors } from '@dokyu/shared';

/** Simple line icons drawn for Dokyu (24px grid, 1.8 stroke). */
const PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  guides: 'M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z',
  docs: 'M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9L9.4 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
  account: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  palette:
    'M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.5-1.5 0-1.5-1-1.7-1-3 0-1 .8-1.5 2-1.5H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3zM7.5 11.5h.01M10 7.5h.01M15 7.5h.01',
  check: 'M5 12.5 10 17.5 19 7',
  x: 'M6 6l12 12M18 6 6 18',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  chevronRight: 'M9 6l6 6-6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  alert:
    'M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 24,
  color = colors.text,
  fill = 'none',
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
}) {
  // Wrapped in a View so the decorative SVG is hidden from screen readers on every platform.
  return (
    <View aria-hidden pointerEvents="none">
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d={PATHS[name]} />
      </Svg>
    </View>
  );
}
