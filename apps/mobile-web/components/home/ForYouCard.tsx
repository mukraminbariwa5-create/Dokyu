import { Animated, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GOALS, colors, pick } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { AgencyTile } from '../ui/AgencyTile';
import { DokiFace } from '../ui/Doki';
import { useAnimatedProgress, usePressScale } from '../../lib/motion';
import { useSettings } from '../../lib/settings';
import type { ForYou } from '../../lib/forYou';

/** The ticket-style banner from the prototype, showing one useful next step. */
export function ForYouCard({ item }: { item: ForYou }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useSettings();
  const press = usePressScale(0.98);
  const progress = useAnimatedProgress(item.kind === 'continue' ? item.done / item.total : 0);

  let label: string;
  let title: string;
  let text: string;
  let cta: string;
  let onPress: () => void;
  let art: React.ReactNode;

  if (item.kind === 'continue') {
    label = t('home.continueLabel');
    title = pick(item.guide.title, language);
    text = t('home.continueText', { done: item.done, total: item.total });
    cta = t('home.continueCta');
    onPress = () =>
      router.push({ pathname: '/guides/[slug]/checklist', params: { slug: item.guide.slug } });
    art = <AgencyTile mono={item.guide.mono} size={58} />;
  } else if (item.kind === 'goal') {
    const goal = GOALS.find((g) => g.slug === item.goal);
    label = t('home.goalLabel', {
      goal: (goal ? (language === 'tl' ? goal.tl : goal.en) : '').toUpperCase(),
    });
    title = pick(item.guide.title, language);
    text = pick(item.why, language);
    cta = t('home.goalCta', { title: pick(item.guide.title, language) });
    onPress = () => router.push({ pathname: '/goals', params: { goal: item.goal } });
    art = <AgencyTile mono={item.guide.mono} size={58} />;
  } else {
    label = t('home.pickLabel');
    title = t('home.pickTitle');
    text = t('home.pickText');
    cta = t('home.pickCta');
    onPress = () => router.push('/goals');
    art = (
      <View
        className="items-center justify-center rounded-lg"
        style={{ width: 58, height: 58, backgroundColor: colors.primaryDark }}
      >
        <DokiFace size={46} />
      </View>
    );
  }

  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${text}. ${cta}`}
        onPress={onPress}
        {...press.handlers}
        className="overflow-hidden rounded-card bg-primary"
      >
        {/* decoration from the prototype ticket */}
        <View
          className="absolute rounded-full"
          style={{ right: -40, top: -40, width: 170, height: 170, backgroundColor: '#2C4FD6' }}
        />
        <View className="flex-row gap-3 px-5 pb-3 pt-4">
          <View className="flex-1 gap-1">
            <AppText
              variant="caption"
              weight="semibold"
              style={{ color: colors.goldBright, letterSpacing: 0.8 }}
            >
              {label}
            </AppText>
            <AppText variant="title" tone="inverse">
              {title}
            </AppText>
            <AppText variant="small" style={{ color: colors.primaryTint }}>
              {text}
            </AppText>
            {item.kind === 'continue' ? (
              <View
                className="mt-1 h-2 overflow-hidden rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Animated.View
                  style={{
                    height: '100%',
                    borderRadius: 999,
                    width: progress,
                    backgroundColor: colors.goldBright,
                  }}
                />
              </View>
            ) : null}
          </View>
          {art}
        </View>
        {/* perforation */}
        <View className="flex-row items-center" style={{ height: 18 }}>
          <View className="h-5 w-5 rounded-full bg-surface" style={{ marginLeft: -10 }} />
          <View
            className="mx-1 flex-1"
            style={{ borderTopWidth: 2, borderStyle: 'dashed', borderColor: '#6F88E8' }}
          />
          <View className="h-5 w-5 rounded-full bg-surface" style={{ marginRight: -10 }} />
        </View>
        <View className="px-5 pb-4 pt-1">
          <AppText variant="small" weight="semibold" tone="inverse">
            {cta}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
}
