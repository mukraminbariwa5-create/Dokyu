import { Pressable, View } from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { Doki } from '../ui/Doki';
import { Icon } from '../ui/Icon';
import { Float } from '../../lib/motion';
import { useSettings } from '../../lib/settings';

function timeGreeting(hour: number) {
  if (hour < 12) return 'home.morning';
  if (hour < 18) return 'home.afternoon';
  return 'home.evening';
}

/** Greeting with the user's area and Doki holding a paper (Bayan Blue prototype, Home). */
export function GreetingCard({ name }: { name?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { municipality, province } = useSettings();
  const area = [municipality, province].filter(Boolean).join(', ');

  return (
    <View
      className="flex-row items-center overflow-hidden rounded-[22px] bg-primary-soft"
      style={{ minHeight: 132 }}
    >
      <View className="flex-1 gap-0.5 py-4 pl-5">
        <AppText variant="small" tone="muted">
          {t(timeGreeting(new Date().getHours()))}
        </AppText>
        <AppText variant="h2" weight="bold" tone="primaryDark" numberOfLines={1}>
          {name ?? t('home.friend')}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/setup')}
          className="mt-2 flex-row items-center gap-1.5 self-start rounded-full bg-surface px-2.5 py-1 active:opacity-80"
        >
          <Icon name="pin" size={13} color={colors.primary} strokeWidth={2.2} />
          <AppText variant="caption" weight="medium" tone="primary">
            {area || t('home.setArea')}
          </AppText>
        </Pressable>
      </View>
      <View style={{ width: 150, height: 132 }} aria-hidden>
        <Svg width={150} height={132} viewBox="0 0 150 132" style={{ position: 'absolute' }}>
          <Ellipse cx={40} cy={26} rx={20} ry={7} fill="#FFFFFF" />
          <Ellipse cx={128} cy={16} rx={16} ry={6} fill="#FFFFFF" />
          <Path d="M0 132c22-20 56-26 88-16s46 2 62-4v20z" fill={colors.primaryTint} />
          <Rect
            x={104}
            y={44}
            width={28}
            height={36}
            rx={4}
            fill="#FFFFFF"
            stroke={colors.primary}
            strokeWidth={2}
            transform="rotate(10 118 62)"
          />
          <Path
            d="M110 54h16M110 61h16M110 68h10"
            stroke="#AFC0FF"
            strokeWidth={2}
            strokeLinecap="round"
            transform="rotate(10 118 62)"
          />
        </Svg>
        <View style={{ position: 'absolute', left: 14, top: 22 }}>
          <Float>
            <Doki size={86} pose="wave" label="Doki" />
          </Float>
        </View>
      </View>
    </View>
  );
}
