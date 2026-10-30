import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { GUIDES, formatPeso } from '@dokyu/shared';
import { Screen } from '../../components/ui/Screen';
import { Wordmark } from '../../components/ui/Wordmark';
import { AgencyTile } from '../../components/ui/AgencyTile';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { colors, fonts, type } from '../../lib/theme';

const POPULAR = ['nbi-clearance', 'psa-birth-certificate', 'national-id'];

function totalFee(slug: string) {
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) return '';
  const amounts = g.fees.map((f) => f.amount);
  if (amounts.some((a) => a === null)) return 'Varies';
  // Show the first (main) option; add-on fees like e-payment are summed for NBI.
  return slug === 'nbi-clearance' ? formatPeso(amounts.reduce<number>((s, a) => s + (a ?? 0), 0)) : formatPeso(amounts[0] ?? 0);
}

export default function Home() {
  return (
    <Screen>
      <Wordmark />
      <View style={{ borderRadius: 22, backgroundColor: colors.primarySoft, padding: 18, gap: 2 }}>
        <Text style={type.small}>Magandang araw,</Text>
        <Text style={{ fontFamily: fonts.bold, fontSize: 22, color: colors.primaryDark }}>Welcome to Dokyu</Text>
        <Text style={[type.small, { marginTop: 6 }]}>Government papers, made easier. Phase 0 build.</Text>
      </View>

      <Text style={type.title}>Popular guides</Text>
      <View style={{ gap: 10 }}>
        {POPULAR.map((slug) => {
          const g = GUIDES.find((x) => x.slug === slug)!;
          return (
            <Link key={slug} href={{ pathname: '/guides/[slug]', params: { slug } }} asChild>
              <Pressable accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                <AgencyTile mono={g.mono} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.text }}>{g.title}</Text>
                  <Text style={type.small}>{g.agency}</Text>
                </View>
                <Text style={{ fontFamily: fonts.semibold, color: colors.primary }}>{totalFee(slug)}</Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
      <Disclaimer />
    </Screen>
  );
}
