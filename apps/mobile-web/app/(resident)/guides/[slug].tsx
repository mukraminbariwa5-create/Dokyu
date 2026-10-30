import { useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, Text, View } from 'react-native';
import { GUIDES, formatPeso } from '@dokyu/shared';
import { Screen } from '../../../components/ui/Screen';
import { AgencyTile } from '../../../components/ui/AgencyTile';
import { colors, fonts, type } from '../../../lib/theme';

export default function GuideDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) return <Screen><Text style={type.h2}>Guide not found</Text></Screen>;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <AgencyTile mono={g.mono} size={60} />
        <View style={{ flex: 1 }}>
          <Text style={type.h2}>{g.title}</Text>
          <Text style={type.small}>{g.agency}</Text>
        </View>
      </View>

      <View style={{ borderRadius: 18, backgroundColor: colors.primary, padding: 16, gap: 6 }}>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.6, color: colors.goldBright }}>FEES</Text>
        {g.fees.map((f) => (
          <Text key={f.label} style={{ fontFamily: fonts.medium, color: '#FFFFFF' }}>
            {f.label}: {f.amount === null ? (f.note ?? 'Varies') : formatPeso(f.amount)}
          </Text>
        ))}
        <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.primaryTint }}>Valid for: {g.validity}</Text>
      </View>

      {g.firstTimeJobseekerFree && (
        <View style={{ borderRadius: 16, backgroundColor: colors.goldSoft, padding: 14 }}>
          <Text style={[type.small, { color: '#5C4300' }]}>First job? Free once under RA 11261 with a First-Time Jobseeker Barangay Certification.</Text>
        </View>
      )}

      <Text style={type.title}>What to bring</Text>
      {g.requirements.map((r) => <Text key={r} style={type.body}>• {r}</Text>)}

      <Text style={type.title}>Steps</Text>
      {g.steps.map((s, i) => <Text key={s} style={type.body}>{i + 1}. {s}</Text>)}

      {g.warnings.map((w) => (
        <Text key={w} style={[type.small, { color: colors.danger }]}>⚠ {w}</Text>
      ))}

      {!!g.officialUrl && (
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(g.officialUrl)} style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 4 }}>
          <Text style={type.small}>Official site · the only place to apply</Text>
          <Text style={{ fontFamily: fonts.semibold, color: colors.primary }}>{g.officialUrl.replace('https://', '')} ↗</Text>
          <Text style={type.caption}>Last verified {g.lastVerified}{g.verified ? '' : ' · confirm on the official site'}</Text>
        </Pressable>
      )}
    </Screen>
  );
}
