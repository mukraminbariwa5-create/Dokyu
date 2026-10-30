import { Text, View } from 'react-native';
import { fonts } from '../../lib/theme';

/** Colored initials instead of real agency seals (originality rule, plan §4.2). */
const PALETTE: Record<string, [string, string]> = {
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
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: fg }}>{mono}</Text>
    </View>
  );
}
