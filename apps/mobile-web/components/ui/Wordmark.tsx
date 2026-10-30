import { Text } from 'react-native';
import { colors } from '@dokyu/shared';

/** "dokyu" with the gold "y" (plan §4.2). Fixed size: it is a logo, not body text. */
export function Wordmark({ size = 24 }: { size?: number }) {
  return (
    <Text
      accessibilityRole="header"
      accessibilityLabel="Dokyu"
      className="font-poppins-bold"
      style={{ fontSize: size, letterSpacing: -0.4, color: colors.primary }}
      maxFontSizeMultiplier={1}
    >
      dok<Text style={{ color: colors.gold }}>y</Text>u
    </Text>
  );
}
