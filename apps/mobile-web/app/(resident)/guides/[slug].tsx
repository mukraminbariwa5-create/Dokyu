import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GUIDES, colors, formatPeso } from '@dokyu/shared';
import { Screen, Section } from '../../../components/ui/Screen';
import { AgencyTile } from '../../../components/ui/AgencyTile';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { useSettings } from '../../../lib/settings';
import { formatDate } from '../../../lib/format';

export default function GuideDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useSettings();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const g = GUIDES.find((x) => x.slug === slug);

  const back = (
    <Pressable
      accessibilityRole="link"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/guides'))}
      className="min-h-[44px] flex-row items-center gap-1 self-start"
    >
      <Icon name="chevronLeft" size={20} color={colors.primary} />
      <AppText variant="body" weight="medium" tone="primary">
        {t('guides.back')}
      </AppText>
    </Pressable>
  );

  if (!g) {
    return (
      <Screen>
        {back}
        <AppText variant="h2">{t('guides.notFound')}</AppText>
      </Screen>
    );
  }

  const verified = t('guides.lastVerified', { date: formatDate(g.lastVerified, language) });

  return (
    <Screen>
      {back}
      <View className="flex-row items-center gap-4">
        <AgencyTile mono={g.mono} size={60} />
        <View className="flex-1">
          <AppText variant="h2">{g.title}</AppText>
          <AppText variant="small" tone="muted">
            {g.agency}
          </AppText>
        </View>
      </View>

      <Card tone="primary" className="gap-2">
        <AppText
          variant="caption"
          weight="semibold"
          style={{ color: colors.goldBright, letterSpacing: 0.6 }}
        >
          {t('guides.fees').toUpperCase()}
        </AppText>
        {g.fees.map((f) => (
          <View key={f.label} className="flex-row justify-between gap-4">
            <AppText variant="body" tone="inverse" className="flex-1">
              {f.addOn ? '+ ' : ''}
              {f.label}
            </AppText>
            <AppText
              variant="body"
              weight="semibold"
              tone="inverse"
              style={{ textAlign: 'right', flexShrink: 1 }}
            >
              {f.amount === null ? (f.note ?? t('common.varies')) : formatPeso(f.amount)}
            </AppText>
          </View>
        ))}
        <AppText variant="small" style={{ color: colors.primaryTint }}>
          {t('guides.validFor', { validity: g.validity })}
        </AppText>
      </Card>

      {g.firstTimeJobseekerFree && (
        <Card tone="gold">
          <AppText variant="small" style={{ color: '#5C4300' }}>
            {t('guides.firstJob')}
          </AppText>
        </Card>
      )}

      <Section>
        <AppText variant="title">{t('guides.whatToBring')}</AppText>
        {g.requirements.map((r) => (
          <View key={r} className="flex-row gap-3">
            <View className="mt-2 h-2 w-2 rounded-full bg-primary" />
            <AppText variant="body" className="flex-1">
              {r}
            </AppText>
          </View>
        ))}
      </Section>

      <Section>
        <AppText variant="title">{t('guides.steps')}</AppText>
        {g.steps.map((s, i) => (
          <View key={s} className="flex-row gap-3">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-primary-soft">
              <AppText variant="small" weight="bold" tone="primary">
                {i + 1}
              </AppText>
            </View>
            <AppText variant="body" className="flex-1" style={{ paddingTop: 2 }}>
              {s}
            </AppText>
          </View>
        ))}
      </Section>

      {g.warnings.map((w) => (
        <View key={w} className="flex-row gap-2 rounded-lg bg-red-soft p-3">
          <Icon name="alert" size={20} color={colors.danger} />
          <AppText variant="small" tone="danger" className="flex-1">
            {w}
          </AppText>
        </View>
      ))}

      {!!g.officialUrl && (
        <Card className="gap-3">
          <AppText variant="small" tone="muted">
            {t('guides.officialSite')}
          </AppText>
          <Button
            label={`${g.officialUrl.replace('https://', '')}`}
            variant="secondary"
            icon={<Icon name="external" size={18} color={colors.primaryDark} />}
            accessibilityRole="link"
            onPress={() => Linking.openURL(g.officialUrl)}
          />
          <AppText variant="caption" tone="subtle">
            {verified}
            {g.verified ? '' : ` · ${t('guides.confirmOfficial')}`}
          </AppText>
        </Card>
      )}
    </Screen>
  );
}
