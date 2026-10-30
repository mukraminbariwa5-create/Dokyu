import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, formatPeso, mainAction, pick, startingFee } from '@dokyu/shared';
import { Screen, Section } from '../../../../components/ui/Screen';
import { AgencyTile } from '../../../../components/ui/AgencyTile';
import { AppText } from '../../../../components/ui/AppText';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Icon } from '../../../../components/ui/Icon';
import { Disclaimer } from '../../../../components/ui/Disclaimer';
import {
  ActionButton,
  Fact,
  RequirementCard,
  StepGroups,
  TipBox,
  hostOf,
  openOfficial,
} from '../../../../components/guide/parts';
import { useGuide } from '../../../../lib/guides';
import { useSettings } from '../../../../lib/settings';
import { formatDate, formatFee } from '../../../../lib/format';

export default function GuideDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useSettings();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const g = useGuide(slug);
  const L = (x: { en: string; tl: string }) => pick(x, language);

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

  const main = mainAction(g);
  const always = g.requirements.filter((r) => !r.onlyIf);
  const sometimes = g.requirements.filter((r) => r.onlyIf);
  const date = formatDate(g.lastVerified, language);

  return (
    <Screen>
      {back}
      <View className="flex-row items-center gap-4">
        <AgencyTile mono={g.mono} size={60} />
        <View className="flex-1">
          <AppText variant="h2">{L(g.title)}</AppText>
          <AppText variant="small" tone="muted">
            {L(g.agency)}
          </AppText>
        </View>
      </View>
      <AppText variant="body" tone="muted">
        {L(g.summary)}
      </AppText>

      {main ? (
        <View className="gap-2">
          <AppText variant="caption" weight="semibold" tone="muted">
            {t('guide.doOnline').toUpperCase()}
          </AppText>
          <ActionButton action={main} prominent />
        </View>
      ) : (
        <TipBox tone="tip" text={t('guide.noOnline')} />
      )}

      <View className="flex-row flex-wrap gap-2">
        <Fact icon="wallet" label={t('guide.fee')} value={formatFee(startingFee(g.fees), t)} />
        <Fact icon="hourglass" label={t('guide.processing')} value={L(g.processing)} />
        <Fact icon="calendar" label={t('guide.validity')} value={L(g.validity)} />
      </View>

      {g.firstTimeJobseekerFree ? (
        <Card tone="gold" className="flex-row gap-2">
          <Icon name="sparkle" size={20} color="#8A6400" />
          <AppText variant="small" className="flex-1" style={{ color: '#5C4300' }}>
            {t('guide.firstJob')}
          </AppText>
        </Card>
      ) : null}

      <Section>
        <AppText variant="title">{t('guide.whatToBring')}</AppText>
        {always.map((r, i) => (
          <RequirementCard key={`a${i}`} req={r} />
        ))}
        {sometimes.length ? (
          <>
            <AppText variant="small" weight="semibold" tone="muted" className="mt-1">
              {t('guide.onlyIfTitle')}
            </AppText>
            {sometimes.map((r, i) => (
              <RequirementCard key={`s${i}`} req={r} />
            ))}
          </>
        ) : null}
        {g.noNeed.length ? (
          <View className="gap-2 rounded-card bg-success-soft p-4">
            <AppText variant="small" weight="semibold" tone="success">
              {t('guide.noNeed')}
            </AppText>
            {g.noNeed.map((n, i) => (
              <View key={i} className="flex-row gap-2">
                <Icon name="x" size={18} color={colors.success} />
                <AppText variant="small" className="flex-1">
                  {L(n)}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}
        <Button
          label={t('guide.makeChecklist')}
          variant="secondary"
          fullWidth
          icon={<Icon name="checklist" size={20} color={colors.primaryDark} />}
          onPress={() =>
            router.push({ pathname: '/guides/[slug]/checklist', params: { slug: g.slug } })
          }
        />
      </Section>

      <Section>
        <AppText variant="title">{t('guide.steps')}</AppText>
        <StepGroups steps={g.steps} />
      </Section>

      <Section>
        <AppText variant="title">{t('guide.fees')}</AppText>
        <Card className="gap-2">
          {g.fees.map((f, i) => (
            <View key={i} className="flex-row justify-between gap-4">
              <View className="flex-1">
                <AppText variant="body">
                  {f.addOn ? '+ ' : ''}
                  {L(f.label)}
                </AppText>
                {f.note ? (
                  <AppText variant="caption" tone="muted">
                    {L(f.note)}
                  </AppText>
                ) : null}
              </View>
              <AppText variant="body" weight="semibold" tone="primaryDark">
                {f.amount === null ? t('common.varies') : formatPeso(f.amount)}
              </AppText>
            </View>
          ))}
        </Card>
      </Section>

      {g.tips.length ? (
        <Section>
          <AppText variant="title">{t('guide.tips')}</AppText>
          {g.tips.map((tip, i) => (
            <TipBox key={i} tone={tip.tone} text={L(tip.text)} />
          ))}
        </Section>
      ) : null}

      <Card className="gap-2">
        <View className="flex-row gap-2">
          <Icon
            name={g.verified ? 'check' : 'alert'}
            size={18}
            color={g.verified ? colors.success : colors.warning}
          />
          <AppText variant="small" tone="muted" className="flex-1">
            {g.verified ? t('guide.verified', { date }) : t('guide.unverified', { date })}
          </AppText>
        </View>
        <AppText variant="caption" weight="semibold" tone="muted">
          {t('guide.sources')}
        </AppText>
        {g.sources.map((s) => (
          <Pressable key={s} accessibilityRole="link" onPress={() => openOfficial(s)}>
            <AppText variant="caption" tone="primary">
              {hostOf(s)}
            </AppText>
          </Pressable>
        ))}
      </Card>
      <Disclaimer />
    </Screen>
  );
}
