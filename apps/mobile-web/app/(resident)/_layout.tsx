import { Redirect, Tabs } from 'expo-router';
import { View } from 'react-native';
import { TourProvider } from '../../lib/tour';
import { TourOverlay } from '../../components/doki/TourOverlay';
import { useTranslation } from 'react-i18next';
import { AppTabBar } from '../../components/navigation/AppTabBar';
import { useLayout } from '../../lib/useLayout';
import { useSettings } from '../../lib/settings';

export default function ResidentTabs() {
  const { t } = useTranslation();
  const { isDesktop } = useLayout();
  const { introSeen } = useSettings();
  // First launch: show the intro slides once (plan §3.1 H.12).
  if (!introSeen) return <Redirect href="/welcome" />;
  return (
    <TourProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          tabBar={(props) => <AppTabBar {...props} />}
          screenOptions={{ headerShown: false, tabBarPosition: isDesktop ? 'left' : 'bottom' }}
        >
          <Tabs.Screen name="index" options={{ title: t('nav.home') }} />
          <Tabs.Screen name="guides" options={{ title: t('nav.guides') }} />
          <Tabs.Screen name="ask" options={{ title: t('nav.ask') }} />
          <Tabs.Screen name="docs" options={{ title: t('nav.docs') }} />
          <Tabs.Screen name="account" options={{ title: t('nav.account') }} />
          {/* Not in the tab list (AppTabBar draws a fixed set), but reachable at /showcase and from the desktop sidebar. */}
          <Tabs.Screen name="showcase" options={{ title: t('nav.showcase') }} />
          <Tabs.Screen name="checklists" options={{ title: t('checklists.title') }} />
          <Tabs.Screen name="offices" options={{ title: t('offices.title') }} />
          <Tabs.Screen name="holidays" options={{ title: t('holidays.title') }} />
          <Tabs.Screen name="goals" options={{ title: t('goals.title') }} />
          <Tabs.Screen name="about" options={{ title: t('about.title') }} />
        </Tabs>
        <TourOverlay />
      </View>
    </TourProvider>
  );
}
