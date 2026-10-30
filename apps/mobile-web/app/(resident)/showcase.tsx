/**
 * Phase 1 component showcase (docs/PLAN.md §12). Open /showcase on a phone and on a desktop browser.
 */
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, font, statusColors, type StatusTone, type TextVariant } from '@dokyu/shared';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge, NewTag } from '../../components/ui/Badge';
import { AgencyTile } from '../../components/ui/AgencyTile';
import { StatusTimeline } from '../../components/ui/StatusTimeline';
import { TicketCard } from '../../components/ui/TicketCard';
import { Doki } from '../../components/ui/Doki';
import { Icon } from '../../components/ui/Icon';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { DisplaySettings } from '../../components/DisplaySettings';
import { useLayout } from '../../lib/useLayout';

const SWATCHES: Array<[name: string, hex: string]> = [
  ['primary', colors.primary],
  ['primaryDark', colors.primaryDark],
  ['primarySoft', colors.primarySoft],
  ['gold', colors.gold],
  ['red', colors.red],
  ['success', colors.success],
  ['warning', colors.warning],
  ['danger', colors.danger],
  ['text', colors.text],
  ['textMuted', colors.textMuted],
  ['border', colors.border],
  ['surfaceAlt', colors.surfaceAlt],
];

const TYPE: TextVariant[] = ['h1', 'h2', 'title', 'bodyLg', 'body', 'small', 'caption'];
const TONES = Object.keys(statusColors) as StatusTone[];

export default function Showcase() {
  const { t } = useTranslation();
  const { isDesktop } = useLayout();
  const [name, setName] = useState('');

  const blocks: Array<[title: string, content: ReactNode]> = [
    [
      t('showcase.colors'),
      <View key="c" className="flex-row flex-wrap gap-3">
        {SWATCHES.map(([n, hex]) => (
          <View key={n} className="gap-1" style={{ width: 88 }}>
            <View className="h-12 rounded-md border border-line" style={{ backgroundColor: hex }} />
            <AppText variant="caption" weight="medium">
              {n}
            </AppText>
            <AppText variant="caption" tone="subtle">
              {hex}
            </AppText>
          </View>
        ))}
      </View>,
    ],
    [
      t('showcase.type'),
      <View key="t" className="gap-1">
        {TYPE.map((v) => (
          <AppText key={v} variant={v}>
            {v} · {font.size[v]}px · Papeles mo, alam mo
          </AppText>
        ))}
      </View>,
    ],
    [
      t('showcase.buttons'),
      <View key="b" className="gap-3">
        <Button label={t('showcase.primary')} />
        <Button label={t('showcase.secondary')} variant="secondary" />
        <Button label={t('showcase.ghost')} variant="ghost" />
        <Button
          label={t('showcase.danger')}
          variant="danger"
          icon={<Icon name="x" size={18} color="#FFFFFF" />}
        />
        <View className="flex-row flex-wrap gap-3">
          <Button label={t('showcase.loading')} loading size="md" />
          <Button label={t('showcase.disabled')} disabled size="md" variant="secondary" />
        </View>
      </View>,
    ],
    [
      t('showcase.badges'),
      <View key="bd" className="flex-row flex-wrap gap-2">
        {TONES.map((tone) => (
          <Badge key={tone} tone={tone} label={t(`status.${tone}`)} />
        ))}
        <NewTag />
      </View>,
    ],
    [
      t('showcase.inputs'),
      <View key="i" className="gap-4">
        <Input
          label={t('showcase.sampleLabel')}
          hint={t('showcase.sampleHint')}
          value={name}
          onChangeText={setName}
          placeholder="Juan Dela Cruz"
        />
        <Input label={t('showcase.sampleLabel')} error={t('showcase.sampleError')} value="" />
      </View>,
    ],
    [
      t('showcase.cards'),
      <View key="cd" className="gap-3">
        <View className="flex-row flex-wrap gap-3">
          {['PSA', 'NID', 'NBI', 'PNP', 'BRGY', 'POST', 'BIR', 'DFA'].map((m) => (
            <AgencyTile key={m} mono={m} size={60} />
          ))}
        </View>
        <Card>
          <AppText variant="title">Card · plain</AppText>
          <AppText variant="small" tone="muted">
            20px radius, soft blue-tinted shadow.
          </AppText>
        </Card>
        <Card tone="soft">
          <AppText variant="title" tone="primaryDark">
            Card · soft
          </AppText>
        </Card>
        <Card tone="primary">
          <AppText variant="title" tone="inverse">
            Card · primary
          </AppText>
        </Card>
        <Card tone="gold">
          <AppText variant="title">Card · gold</AppText>
        </Card>
      </View>,
    ],
    [
      t('showcase.timeline'),
      <View key="tl" className={isDesktop ? 'flex-row gap-6' : 'gap-4'}>
        <View className="flex-1">
          <StatusTimeline
            status="UNDER_REVIEW"
            events={[
              { status: 'SUBMITTED', at: 'Oct 30, 9:12 AM' },
              { status: 'UNDER_REVIEW', at: 'Oct 30, 10:05 AM' },
            ]}
          />
        </View>
        <View className="flex-1">
          <StatusTimeline
            status="REJECTED"
            events={[
              { status: 'SUBMITTED', at: 'Oct 29, 2:40 PM' },
              { status: 'UNDER_REVIEW', at: 'Oct 29, 3:15 PM' },
              {
                status: 'REJECTED',
                at: 'Oct 29, 3:20 PM',
                note: 'Proof of residency is unreadable. Please upload a clearer copy.',
              },
            ]}
          />
        </View>
      </View>,
    ],
    [
      t('showcase.ticket'),
      <View key="tk" className="gap-4">
        <TicketCard
          requestNo="BRGY-0241"
          documentName="Barangay Clearance"
          barangayName="Barangay Demo (Walled City, Jolo)"
          status="READY_FOR_PICKUP"
          fee={5000}
        />
        <TicketCard
          requestNo="BRGY-0242"
          documentName="First-Time Jobseeker Certification"
          barangayName="Barangay Demo (Walled City, Jolo)"
          status="SUBMITTED"
          fee={0}
        />
      </View>,
    ],
    [
      t('showcase.doki'),
      <View key="dk" className="flex-row items-center gap-4">
        <Doki size={120} />
        <AppText variant="small" tone="muted" className="flex-1">
          Static placeholder. The animated Rive character arrives in Phase 7.
        </AppText>
      </View>,
    ],
  ];

  return (
    <Screen wide>
      <View className="gap-1">
        <AppText variant="h1">{t('showcase.title')}</AppText>
        <AppText variant="body" tone="muted">
          {t('showcase.intro')}
        </AppText>
      </View>
      <DisplaySettings />
      <View className={isDesktop ? 'flex-row flex-wrap items-start gap-5' : 'gap-5'}>
        {blocks.map(([title, content]) => (
          <Card
            key={title}
            className="gap-4 p-5"
            style={isDesktop ? { width: '48.9%' } : undefined}
          >
            <AppText variant="title">{title}</AppText>
            {content}
          </Card>
        ))}
      </View>
      <Disclaimer />
    </Screen>
  );
}
