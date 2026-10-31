/** About, Help, Privacy and Terms (plan §3.1 H), one page with tabs. */
import { useEffect, useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, pick } from '@dokyu/shared';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ChoiceChip } from '../../components/ui/ChoiceChip';
import { Icon } from '../../components/ui/Icon';
import { BackLink } from '../../components/ui/BackLink';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { Doki } from '../../components/ui/Doki';
import { FadeIn, Float } from '../../lib/motion';
import {
  ABOUT,
  CONTACT_EMAIL,
  HELP,
  PRIVACY,
  TERMS,
  UPDATED,
  type InfoBlock,
} from '../../lib/legal';
import { useSettings } from '../../lib/settings';
import { formatDate } from '../../lib/format';

const PAGES: Record<string, InfoBlock[]> = {
  about: ABOUT,
  help: HELP,
  privacy: PRIVACY,
  terms: TERMS,
};
type Page = keyof typeof PAGES;

export default function About() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useSettings();
  const params = useLocalSearchParams<{ page?: string }>();
  const [page, setPage] = useState<Page>(
    params.page && params.page in PAGES ? params.page : 'about',
  );
  useEffect(() => {
    if (params.page && params.page in PAGES) setPage(params.page);
  }, [params.page]);

  return (
    <Screen>
      <BackLink label={t('nav.account')} fallback="/account" />
      <View className="flex-row items-center gap-3">
        <Float amount={3}>
          <Doki size={64} pose={page === 'help' ? 'talk' : 'idle'} label="" />
        </Float>
        <AppText variant="h1" className="flex-1">
          {t(`about.tab_${page}`)}
        </AppText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {Object.keys(PAGES).map((p) => (
          <ChoiceChip
            key={p}
            label={t(`about.tab_${p}`)}
            selected={page === p}
            onPress={() => {
              setPage(p);
              router.setParams({ page: p });
            }}
          />
        ))}
      </ScrollView>
      {page === 'privacy' || page === 'terms' ? (
        <AppText variant="caption" tone="muted">
          {t('about.updated', { date: formatDate(UPDATED, language) })}
        </AppText>
      ) : null}

      {PAGES[page]!.map((b, i) => (
        <FadeIn key={`${page}-${i}`} delay={i * 50}>
          <Card className="gap-1.5">
            <AppText variant="body" weight="semibold">
              {pick(b.heading, language)}
            </AppText>
            <AppText variant="body" tone="muted">
              {pick(b.body, language)}
            </AppText>
          </Card>
        </FadeIn>
      ))}

      <Card tone="soft" className="gap-2">
        <AppText variant="body" weight="semibold">
          {t('about.contactTitle')}
        </AppText>
        <AppText variant="small" tone="muted">
          {t('about.contactText')}
        </AppText>
        <Button
          label={CONTACT_EMAIL}
          variant="secondary"
          size="md"
          icon={<Icon name="mail" size={18} color={colors.primaryDark} />}
          onPress={() =>
            Linking.openURL(
              `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Dokyu feedback')}`,
            ).catch(() => {})
          }
        />
      </Card>
      <AppText variant="caption" tone="muted" style={{ textAlign: 'center' }}>
        Dokyu 0.1.0
      </AppText>
      <Disclaimer />
    </Screen>
  );
}
