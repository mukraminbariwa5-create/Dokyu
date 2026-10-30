import { Text, View } from 'react-native';

/** Colored initials in a rounded square instead of real agency seals (originality rule, plan §4.2). */
const PALETTE: Record<string, [bg: string, fg: string]> = {
  PSA: ['#FFF4D1', '#8A6400'],
  NID: ['#E3EAFF', '#2042C4'],
  NBI: ['#FDE8EA', '#B42335'],
  PNP: ['#E3EAFF', '#13287A'],
  BRGY: ['#DFF3E4', '#15803D'],
  POST: ['#FDE8EA', '#B42335'],
  BIR: ['#E0F2FE', '#0369A1'],
  DFA: ['#EDE9FE', '#6D28D9'],
};

export function AgencyTile({ mono, size = 52 }: { mono: string; size?: number }) {
  const [bg, fg] = PALETTE[mono] ?? ['#ECF0FF', '#2042C4'];
  return (
    <View
      aria-hidden
      className="items-center justify-center"
      style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg }}
    >
      {/* Fixed size: the tile is decorative and the agency name is always written next to it. */}
      <Text
        className="font-poppins-bold"
        style={{ color: fg, fontSize: Math.round(size * 0.25) }}
        maxFontSizeMultiplier={1}
      >
        {mono}
      </Text>
    </View>
  );
}
