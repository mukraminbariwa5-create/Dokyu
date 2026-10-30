import { Text } from 'react-native';
import { colors, fonts } from '../../lib/theme';

/** "dokyu" with the gold "y" (plan §4.2). */
export function Wordmark({ size = 24 }: { size?: number }) {
  return (
    <Text accessibilityRole="header" accessibilityLabel="Dokyu" style={{ fontFamily: fonts.bold, fontSize: size, letterSpacing: -0.4, color: colors.primary }}>
      dok<Text style={{ color: colors.gold }}>y</Text>u
    </Text>
  );
}
