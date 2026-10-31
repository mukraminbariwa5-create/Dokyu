import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, formatPeso, mainAction, pick, startingFee } from '@dokyu/shared';
import { Screen, Section } from '../../../../components/ui/Screen';
import { AgencyTile } from '../../../../components/ui/AgencyTile';
import { AppText } from '../../../../components/ui/AppText';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Icon, type IconName } from '../../../../components/ui/Icon';
import { Disclaimer } from '../../../../components/ui/Disclaimer';
import {
  ActionButton,
  RequirementCard,
  StepGroups,
  TipBox,
  openOfficial,
} from '../../../../components/guide/parts';
import { useGuide } from '../../../../lib/guides';
import { NotFound } from '../../../../components/NotFound';
import { TextLink } from '../../../../components/ui/TextLink';
import { sortByArea, shortLink } from '../../../../lib/offices';
import { OFFICES, officesForGuide } from '@dokyu/shared';
import { OfficeCard } from '../../../../components/office/OfficeCard';
import { useNow } from '../../../../lib/offices';
import { useSettings } from '../../../../lib/settings';
import { formatDate, formatFee } from '../../../../lib/format';

export default function GuideDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useSettings();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const g = useGuide(slug);
  const now = useNow();
  const { province } = useSettings();
  const L = (x: { en: string; tl: string }) => pick(x, language);

  const back = (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.navigate('/guides')}
      className="min-h-[44px] flex-row items-center gap-1 self-start"
    >
      <Icon name="chevronLeft" size={20} color={colors.primary} />
      <AppText variant="body" weight="medium" tone="primary">
        {t('guides.back')}
      </AppText>
    </Pressable>
  );

  if (!g) {
    return <NotFound title={t('guides.notFound')} back="/guides" backLabel={t('guides.back')} />;
  }

  const whereOffices = sortByArea(officesForGuide(OFFICES, g.slug), province);
  const main = mainAction(g);
  const always = g.requirements.filter((r) => !r.onlyIf);
  const sometimes = g.requirements.filter((r) => r.onlyIf);
  const date = formatDate(g.lastVerified, language);
  const warnings = g.tips.filter((tip) => tip.tone === 'warning');
  const tips = g.tips.filter((tip) => tip.tone !== 'warning');

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

      {/* Safety warnings (look-alike sites, fixers) belong next to the first action. */}
      {warnings.map((tip, i) => (
        <TipBox key={`w${i}`} tone="warning" text={L(tip.text)} />
      ))}

      <Section>
        <AppText variant="title">{t('guide.atAGlance')}</AppText>
        <Card style={{ padding: 0, gap: 0 }}>
          <GlanceRow icon="wallet" label={t('guide.fee')}>
            {g.fees.map((f, i) => (
              <View key={i} className="flex-row justify-between gap-3">
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
            {g.fees.length > 1 ? (
              <View className="flex-row justify-between gap-3 border-t border-line pt-2">
                <AppText variant="body" weight="semibold" className="flex-1">
                  {t('guide.youPay')}
                </AppText>
                <AppText variant="body" weight="bold" tone="primaryDark">
                  {formatFee(startingFee(g.fees), t)}
                </AppText>
              </View>
            ) : null}
          </GlanceRow>
          <GlanceRow icon="hourglass" label={t('guide.processing')} divider>
            <AppText variant="body">{L(g.processing)}</AppText>
          </GlanceRow>
          <GlanceRow icon="calendar" label={t('guide.validity')} divider>
            <AppText variant="body">{L(g.validity)}</AppText>
          </GlanceRow>
        </Card>
      </Section>

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
        <View className="mt-1 gap-2">
          <Button
            label={t('guide.makeChecklist')}
            fullWidth
            icon={<Icon name="checklist" size={20} color="#FFFFFF" />}
            onPress={() =>
              router.push({ pathname: '/guides/[slug]/checklist', params: { slug: g.slug } })
            }
          />
          <Button
            label={t('guide.track')}
            variant="secondary"
            fullWidth
            icon={<Icon name="docs" size={20} color={colors.primaryDark} />}
            onPress={() => router.push({ pathname: '/docs/new', params: { guide: g.slug } })}
          />
          <AppText variant="caption" tone="muted" style={{ textAlign: 'center' }}>
            {t('guide.actionsHint')}
          </AppText>
        </View>
      </Section>

      <Section>
        <AppText variant="title">{t('guide.steps')}</AppText>
        <StepGroups steps={g.steps} />
      </Section>

      <Section>
        <View className="flex-row items-center justify-between">
          <AppText variant="title">{t('guide.whereToGo')}</AppText>
          {whereOffices.length > 2 ? (
            <TextLink
              align="right"
              onPress={() => router.push({ pathname: '/offices', params: { guide: g.slug } })}
            >
              {t('home.seeAll')}
            </TextLink>
          ) : null}
        </View>
        {g.slug === 'police-clearance' ? (
          <AppText variant="body" tone="muted">
            {t('offices.policeText')}
          </AppText>
        ) : null}
        {whereOffices.length === 0 ? (
          <AppText variant="body" tone="muted">
            {g.slug === 'barangay-clearance' ? t('guide.whereBarangay') : t('guide.whereOnline')}
          </AppText>
        ) : (
          whereOffices.slice(0, 2).map((o) => <OfficeCard key={o.slug} office={o} now={now} />)
        )}
        {whereOffices.length > 0 ? (
          <Button
            label={t('guide.findOffice')}
            variant="secondary"
            fullWidth
            icon={<Icon name="pin" size={20} color={colors.primaryDark} />}
            onPress={() => router.push({ pathname: '/offices', params: { guide: g.slug } })}
          />
        ) : null}
      </Section>

      {tips.length ? (
        <Section>
          <AppText variant="title">{t('guide.tips')}</AppText>
          {tips.map((tip, i) => (
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
        <AppText variant="caption" weight="semibold" tone="muted" className="mt-1">
          {t('guide.sources')}
        </AppText>
        <View>
          {g.sources.map((s) => (
            <TextLink key={s} onPress={() => openOfficial(s)}>
              {shortLink(s)}
            </TextLink>
          ))}
        </View>
      </Card>
      <Disclaimer />
    </Screen>
  );
}

/** One labelled row of the "At a glance" card. */
function GlanceRow({
  icon,
  label,
  divider,
  children,
}: {
  icon: IconName;
  label: string;
  divider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className={`flex-row gap-3 p-4 ${divider ? 'border-t border-line' : ''}`}>
      <View
        className="items-center justify-center bg-primary-soft"
        style={{ width: 36, height: 36, borderRadius: 10 }}
      >
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <View className="flex-1 gap-1.5">
        <AppText variant="caption" weight="semibold" tone="muted">
          {label.toUpperCase()}
        </AppText>
        {children}
      </View>
    </View>
  );
}
