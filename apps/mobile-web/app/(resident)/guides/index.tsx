import { useEffect, useMemo, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { ScrollView, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GUIDE_CATEGORIES, colors, pick, startingFee, type GuideCategory } from '@dokyu/shared';
import { Screen } from '../../../components/ui/Screen';
import { AgencyTile } from '../../../components/ui/AgencyTile';
import { AppText } from '../../../components/ui/AppText';
import { PressableCard } from '../../../components/ui/Card';
import { ChoiceChip } from '../../../components/ui/ChoiceChip';
import { Icon } from '../../../components/ui/Icon';
import { useGuides } from '../../../lib/guides';
import { useSettings } from '../../../lib/settings';
import { formatDate, formatFee } from '../../../lib/format';
import { FadeIn } from '../../../lib/motion';
import { useLayout } from '../../../lib/useLayout';

export default function Guides() {
  const { t } = useTranslation();
  const { language, textSize } = useSettings();
  const { isDesktop } = useLayout();
  const { data: guides } = useGuides();
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  // Home's tiles open this page on a category (e.g. ?category=identity).
  const params = useLocalSearchParams<{ category?: string; focus?: string }>();
  const fromParam = (GUIDE_CATEGORIES as readonly string[]).includes(params.category ?? '')
    ? (params.category as GuideCategory)
    : 'all';
  const [category, setCategory] = useState<GuideCategory | 'all'>(fromParam);
  useEffect(() => setCategory(fromParam), [fromParam]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return guides.filter(
      (g) =>
        (category === 'all' || g.category === category) &&
        (!needle ||
          [g.title.en, g.title.tl, g.agency.en, g.mono, g.summary.en, g.summary.tl].some((s) =>
            s.toLowerCase().includes(needle),
          )),
    );
  }, [guides, q, category]);
  const usedCategories = GUIDE_CATEGORIES.filter((c) => guides.some((g) => g.category === c));

  return (
    <Screen wide={isDesktop}>
      <View className="gap-1">
        <AppText variant="h1">{t('guides.title')}</AppText>
        <AppText variant="small" tone="muted">
          {t('guides.intro')}{' '}
          {t('guides.lastVerified', { date: formatDate(guides[0]?.lastVerified ?? '', language) })}.
        </AppText>
      </View>

      <View
        className={`min-h-[52px] flex-row items-center gap-2 rounded-lg border bg-surface px-4 ${focused ? 'border-primary' : 'border-line'}`}
        style={focused ? { boxShadow: `0 0 0 3px ${colors.primaryTint}` } : undefined}
      >
        <Icon name="search" size={20} color={colors.textMuted} />
        <TextInput
          accessibilityLabel={t('guide.searchPlaceholder')}
          placeholder={t('guide.searchPlaceholder')}
          placeholderTextColor={colors.textSubtle}
          value={q}
          onChangeText={setQ}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 font-poppins text-ink"
          // The box above shows focus, so the browser's own outline is turned off.
          style={{ fontSize: textSize('bodyLg'), minHeight: 48, outlineStyle: 'none' } as object}
          autoCorrect={false}
          // Home's search bar opens this page ready to type.
          autoFocus={params.focus === '1'}
          returnKeyType="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {(['all', ...usedCategories] as const).map((c) => (
          <ChoiceChip
            key={c}
            label={t(`categories.${c}`)}
            selected={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </ScrollView>

      {shown.length === 0 ? (
        <AppText variant="body" tone="muted">
          {t('guide.noResults', { q })}
        </AppText>
      ) : null}

      <View className={isDesktop ? 'flex-row flex-wrap gap-3' : 'gap-3'}>
        {shown.map((g, n) => (
          // The width lives on a wrapper: Link asChild replaces the child's style.
          // Keyed by the filter too, so the list cascades in again when the category changes.
          <FadeIn
            key={`${g.slug}-${category}`}
            delay={Math.min(n, 8) * 45}
            distance={16}
            style={isDesktop ? { width: '49%', flexGrow: 1 } : undefined}
          >
            <Link href={{ pathname: '/guides/[slug]', params: { slug: g.slug } }} asChild>
              <PressableCard className="flex-row items-center gap-4">
                <AgencyTile mono={g.mono} />
                <View className="flex-1">
                  <AppText variant="bodyLg" weight="semibold">
                    {pick(g.title, language)}
                  </AppText>
                  <AppText variant="small" tone="muted">
                    {t(`categories.${g.category}`)} · {formatFee(startingFee(g.fees), t)}
                  </AppText>
                </View>
                <Icon name="chevronRight" size={20} color={colors.textSubtle} />
              </PressableCard>
            </Link>
          </FadeIn>
        ))}
      </View>
    </Screen>
  );
}
