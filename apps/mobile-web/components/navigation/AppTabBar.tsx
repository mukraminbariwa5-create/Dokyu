import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { colors, shadow } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { DokiFace } from '../ui/Doki';
import { Icon, type IconName } from '../ui/Icon';
import { Wordmark } from '../ui/Wordmark';
import { Disclaimer } from '../ui/Disclaimer';
import { useLayout } from '../../lib/useLayout';
import { cn } from '../../lib/cn';

/** Tabs in display order. "ask" is Doki's raised center button (plan §4.2). */
export const TABS: Array<{ name: string; label: string; icon: IconName | 'doki' }> = [
  { name: 'index', label: 'nav.home', icon: 'home' },
  { name: 'guides', label: 'nav.guides', icon: 'guides' },
  { name: 'ask', label: 'nav.ask', icon: 'doki' },
  { name: 'docs', label: 'nav.docs', icon: 'docs' },
  { name: 'account', label: 'nav.account', icon: 'account' },
];

/**
 * One tab bar, two layouts (plan §4.2): a bottom bar with a raised Doki button on phones,
 * and a left sidebar on desktop web.
 */
export function AppTabBar(props: BottomTabBarProps) {
  const { isDesktop } = useLayout();
  return isDesktop ? <Sidebar {...props} /> : <BottomBar {...props} />;
}

function useTabs({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const current = state.routes[state.index]?.name;
  return TABS.map((tab) => {
    const route = state.routes.find((r) => r.name === tab.name);
    const focused = current === tab.name;
    const onPress = () => {
      if (!route) return;
      const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigateToTab(route.key);
    };
    return { ...tab, focused, onPress };
  });
}

function BottomBar(props: BottomTabBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabs = useTabs(props);
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row items-end border-t border-line bg-surface px-1"
      style={{ paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8 }}
    >
      {tabs.map((tab) =>
        tab.icon === 'doki' ? (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityLabel={t(tab.label)}
            accessibilityState={{ selected: tab.focused }}
            onPress={tab.onPress}
            className="flex-1 items-center"
          >
            <View
              className="items-center justify-center bg-primary"
              style={{
                width: 66,
                height: 66,
                marginTop: -34,
                borderRadius: 22,
                borderWidth: 5,
                borderColor: colors.surface,
                boxShadow: tab.focused ? `${shadow.focusRing}, ${shadow.doki}` : shadow.doki,
              }}
            >
              <DokiFace />
            </View>
            <TabLabel focused={tab.focused}>{t(tab.label)}</TabLabel>
          </Pressable>
        ) : (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityLabel={t(tab.label)}
            accessibilityState={{ selected: tab.focused }}
            onPress={tab.onPress}
            className="min-h-[52px] flex-1 items-center justify-end gap-1"
          >
            <Icon
              name={tab.icon}
              color={tab.focused ? colors.primary : colors.textMuted}
              fill={tab.focused ? colors.primaryTint : 'none'}
            />
            <TabLabel focused={tab.focused}>{t(tab.label)}</TabLabel>
          </Pressable>
        ),
      )}
    </View>
  );
}

function TabLabel({ focused, children }: { focused: boolean; children: string }) {
  return (
    <AppText
      variant="caption"
      weight={focused ? 'semibold' : 'medium'}
      tone={focused ? 'primary' : 'muted'}
      numberOfLines={1}
    >
      {children}
    </AppText>
  );
}

function Sidebar(props: BottomTabBarProps) {
  const { t } = useTranslation();
  const tabs = useTabs(props);
  const router = useRouter();
  const showcaseActive = props.state.routes[props.state.index]?.name === 'showcase';
  return (
    <View
      accessibilityRole="tablist"
      className="h-full justify-between border-r border-line bg-surface px-4 py-6"
      style={{ width: 256 }}
    >
      <View className="gap-6">
        <View className="px-3">
          <Wordmark size={28} />
        </View>
        <View className="gap-1">
          {tabs.map((tab) =>
            tab.icon === 'doki' ? (
              <Pressable
                key={tab.name}
                accessibilityRole="tab"
                accessibilityLabel={t(tab.label)}
                accessibilityState={{ selected: tab.focused }}
                onPress={tab.onPress}
                className={cn(
                  'my-2 flex-row items-center gap-3 rounded-tile p-2 pr-4 active:opacity-90',
                  'bg-primary',
                )}
                style={{
                  boxShadow: tab.focused ? `${shadow.focusRing}, ${shadow.doki}` : shadow.doki,
                }}
              >
                <View
                  className="h-11 w-11 items-center justify-center rounded-lg"
                  style={{ backgroundColor: colors.primaryDark }}
                >
                  <DokiFace size={36} />
                </View>
                <AppText variant="body" weight="semibold" tone="inverse">
                  {t(tab.label)}
                </AppText>
              </Pressable>
            ) : (
              <SidebarItem
                key={tab.name}
                label={t(tab.label)}
                icon={tab.icon}
                focused={tab.focused}
                onPress={tab.onPress}
              />
            ),
          )}
        </View>
      </View>
      <View className="gap-3">
        <SidebarItem
          label={t('nav.showcase')}
          icon="palette"
          focused={showcaseActive}
          onPress={() => router.navigate('/(resident)/showcase')}
        />
        <Disclaimer align="left" />
      </View>
    </View>
  );
}

function SidebarItem({
  label,
  icon,
  focused,
  onPress,
}: {
  label: string;
  icon: IconName;
  focused: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      className={cn(
        'min-h-[48px] flex-row items-center gap-3 rounded-lg px-3',
        focused ? 'bg-primary-soft' : 'active:bg-surface-alt',
      )}
    >
      <Icon
        name={icon}
        color={focused ? colors.primary : colors.textMuted}
        fill={focused ? colors.primaryTint : 'none'}
      />
      <AppText
        variant="body"
        weight={focused ? 'semibold' : 'medium'}
        tone={focused ? 'primary' : 'muted'}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
