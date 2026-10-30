import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { DokiFace } from '../../components/ui/Doki';
import { colors, fonts } from '../../lib/theme';

const ICONS = {
  index: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  guides: 'M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z',
  docs: 'M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9L9.4 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
  account: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
} as const;

function TabIcon({ d, focused }: { d: string; focused: boolean }) {
  const c = focused ? colors.primary : colors.textMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={focused ? colors.primaryTint : 'none'} stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}

function DokiTab({ focused }: { focused: boolean }) {
  return (
    <View
      style={{
        width: 66,
        height: 66,
        marginTop: -30,
        borderRadius: 22,
        borderWidth: 5,
        borderColor: colors.surface,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: focused ? '0 0 0 4px #FFD452' : '0 6px 16px rgba(32, 66, 196, 0.35)',
      }}
    >
      <DokiFace />
    </View>
  );
}

export default function ResidentTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { height: 84, paddingTop: 10, borderTopColor: colors.border },
        tabBarLabel: ({ children, focused }) => (
          <Text style={{ fontFamily: focused ? fonts.semibold : fonts.medium, fontSize: 11, color: focused ? colors.primary : colors.textMuted }}>{children}</Text>
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon d={ICONS.index} focused={focused} /> }} />
      <Tabs.Screen name="guides" options={{ title: 'Guides', tabBarIcon: ({ focused }) => <TabIcon d={ICONS.guides} focused={focused} /> }} />
      <Tabs.Screen name="ask" options={{ title: 'Ask Doki', tabBarAccessibilityLabel: 'Ask Doki', tabBarIcon: ({ focused }) => <DokiTab focused={focused} /> }} />
      <Tabs.Screen name="docs" options={{ title: 'My Docs', tabBarIcon: ({ focused }) => <TabIcon d={ICONS.docs} focused={focused} /> }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: ({ focused }) => <TabIcon d={ICONS.account} focused={focused} /> }} />
    </Tabs>
  );
}
