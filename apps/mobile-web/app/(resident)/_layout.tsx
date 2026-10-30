import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppTabBar } from '../../components/navigation/AppTabBar';
import { useLayout } from '../../lib/useLayout';

export default function ResidentTabs() {
  const { t } = useTranslation();
  const { isDesktop } = useLayout();
  return (
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
    </Tabs>
  );
}
