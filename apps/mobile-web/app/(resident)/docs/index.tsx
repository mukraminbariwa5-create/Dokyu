/** My Docs (plan §3.1 C): everything you and your family have, are getting or need, and what needs attention. */
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GUIDES, colors, manilaTime, pick } from '@dokyu/shared';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { Card, PressableCard } from '../../../components/ui/Card';
import { ChoiceChip } from '../../../components/ui/ChoiceChip';
import { Icon } from '../../../components/ui/Icon';
import { Doki } from '../../../components/ui/Doki';
import { SyncStatus } from '../../../components/docs/SyncStatus';
import { Disclaimer } from '../../../components/ui/Disclaimer';
import { DocCard, docTitle } from '../../../components/docs/DocCard';
import { FadeIn, Float } from '../../../lib/motion';
import { DOC_STATUSES, docAlerts, useMyDocs, type DocAlert } from '../../../lib/mydocs';
import { useNow } from '../../../lib/offices';
import { useSettings } from '../../../lib/settings';

export default function MyDocs() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useSettings();
  const { docs, people } = useMyDocs();
  const now = useNow();
  const [who, setWho] = useState<string>('all');

  const shown = useMemo(
    () => (who === 'all' ? docs : docs.filter((d) => d.personId === who)),
    [docs, who],
  );
  const alerts = useMemo(() => docAlerts(shown, manilaTime(now).iso), [shown, now]);
  const personOf = (id: string) => people.find((p) => p.id === id);

  const alertText = (a: DocAlert) => {
    const name = docTitle(a.doc, language);
    const person = personOf(a.doc.personId)?.name;
    const whose = person ? ` (${person})` : '';
    switch (a.kind) {
      case 'expired':
        return t('mydocs.alertExpired', { name: name + whose });
      case 'expiring':
        return t('mydocs.alertExpiring', { name: name + whose, count: a.days });
      case 'appointment':
        return a.days === 0
          ? t('mydocs.alertApptToday', { name: name + whose })
          : t('mydocs.alertAppt', { name: name + whose, count: a.days });
      case 'ready':
        return t('mydocs.alertReady', { name: name + whose });
    }
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between gap-3">
        <AppText variant="h1">{t('nav.docs')}</AppText>
        <Link href="/docs/new" asChild>
          <Button
            label={t('mydocs.add')}
            size="md"
            icon={<Icon name="plus" size={18} color="#FFFFFF" />}
          />
        </Link>
      </View>
      <AppText variant="body" tone="muted">
        {t('mydocs.intro')}
      </AppText>
      <SyncStatus />

      {people.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          <ChoiceChip
            label={t('mydocs.everyone')}
            selected={who === 'all'}
            onPress={() => setWho('all')}
          />
          <ChoiceChip label={t('mydocs.me')} selected={who === 'me'} onPress={() => setWho('me')} />
          {people.map((p) => (
            <ChoiceChip
              key={p.id}
              label={p.name}
              selected={who === p.id}
              onPress={() => setWho(p.id)}
            />
          ))}
        </ScrollView>
      ) : null}

      {alerts.length > 0 ? (
        <FadeIn>
          <Card tone="gold" className="gap-2">
            <View className="flex-row items-center gap-2">
              <Icon name="bell" size={20} color="#8A6400" />
              <AppText variant="body" weight="bold" style={{ color: '#5C4300' }}>
                {t('mydocs.attention')}
              </AppText>
            </View>
            {alerts.slice(0, 5).map((a, i) => (
              <Pressable
                key={`${a.kind}-${a.doc.id}-${i}`}
                accessibilityRole="link"
                onPress={() => router.push({ pathname: '/docs/[id]', params: { id: a.doc.id } })}
                className="justify-center active:opacity-70"
                style={{ minHeight: 40 }}
              >
                <AppText variant="small" style={{ color: '#5C4300' }}>
                  • {alertText(a)}
                </AppText>
              </Pressable>
            ))}
          </Card>
        </FadeIn>
      ) : null}

      {docs.length === 0 ? (
        <FadeIn>
          <Card tone="soft" className="items-center gap-3 py-6">
            <Float amount={4}>
              <Doki size={96} pose="wave" label="" />
            </Float>
            <AppText variant="title" style={{ textAlign: 'center' }}>
              {t('mydocs.emptyTitle')}
            </AppText>
            <AppText variant="body" tone="muted" style={{ textAlign: 'center' }}>
              {t('mydocs.emptyText')}
            </AppText>
            <View className="flex-row flex-wrap justify-center gap-2">
              {GUIDES.slice(0, 4).map((g) => (
                <PressableCard
                  key={g.slug}
                  className="px-3 py-2"
                  onPress={() => router.push({ pathname: '/docs/new', params: { guide: g.slug } })}
                >
                  <AppText variant="small" weight="semibold" tone="primary">
                    + {pick(g.title, language)}
                  </AppText>
                </PressableCard>
              ))}
            </View>
          </Card>
        </FadeIn>
      ) : null}

      {DOC_STATUSES.map((status) => {
        const list = shown.filter((d) => d.status === status);
        if (list.length === 0) return null;
        return (
          <View key={status} className="gap-2.5">
            <AppText variant="small" weight="semibold" tone="muted">
              {t(`mydocs.group_${status}`).toUpperCase()} · {list.length}
            </AppText>
            {list.map((d, n) => (
              <FadeIn key={d.id} delay={Math.min(n, 6) * 40}>
                <DocCard doc={d} person={personOf(d.personId)} />
              </FadeIn>
            ))}
          </View>
        );
      })}

      <Link href="/docs/family" asChild>
        <PressableCard className="flex-row items-center gap-3">
          <View
            className="items-center justify-center bg-primary-soft"
            style={{ width: 44, height: 44, borderRadius: 14 }}
          >
            <Icon name="people" size={22} color={colors.primary} />
          </View>
          <View className="flex-1">
            <AppText variant="body" weight="semibold">
              {t('mydocs.family')}
            </AppText>
            <AppText variant="caption" tone="muted">
              {people.length
                ? t('mydocs.familyCount', { count: people.length })
                : t('mydocs.familyHint')}
            </AppText>
          </View>
          <Icon name="chevronRight" size={20} color={colors.textSubtle} />
        </PressableCard>
      </Link>

      <Disclaimer />
    </Screen>
  );
}
