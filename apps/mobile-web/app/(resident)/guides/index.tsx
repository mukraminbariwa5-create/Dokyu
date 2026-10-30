import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { GUIDES } from '@dokyu/shared';
import { Screen } from '../../../components/ui/Screen';
import { AgencyTile } from '../../../components/ui/AgencyTile';
import { colors, fonts, type } from '../../../lib/theme';

export default function Guides() {
  return (
    <Screen>
      <Text style={type.h1}>Guides</Text>
      <Text style={type.small}>Fees, requirements and steps from official sources. Last verified {GUIDES[0]?.lastVerified}.</Text>
      <View style={{ gap: 10 }}>
        {GUIDES.map((g) => (
          <Link key={g.slug} href={{ pathname: '/guides/[slug]', params: { slug: g.slug } }} asChild>
            <Pressable accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
              <AgencyTile mono={g.mono} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.text }}>{g.title}</Text>
                <Text style={type.small}>{g.category}</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}
