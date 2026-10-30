/** Building blocks for guide pages (plan v1.6 §3.1 A). */
import { Linking, Platform, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, pick, type GuideAction, type GuideStep, type Requirement } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { Icon, type IconName } from '../ui/Icon';
import { useSettings } from '../../lib/settings';
import { cn } from '../../lib/cn';

const ACTION_ICON: Record<GuideAction['kind'], IconName> = {
  register: 'userPlus',
  book: 'calendar',
  order: 'cart',
  download: 'download',
  info: 'info',
};

const BRING_ICON: Record<Requirement['bring'], IconName> = {
  original: 'shield',
  originalAndCopy: 'copy',
  printout: 'printer',
  phoneOk: 'phone',
  fillOut: 'pen',
};

export function openOfficial(url: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  Linking.openURL(url).catch(() => {});
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** A labelled official link: says what it does and which site it opens. */
export function ActionButton({
  action,
  prominent = false,
}: {
  action: GuideAction;
  prominent?: boolean;
}) {
  const { t } = useTranslation();
  const { language } = useSettings();
  const label = pick(action.label, language);
  const fg = prominent ? '#FFFFFF' : colors.primaryDark;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${label}. ${t('guide.opens', { host: hostOf(action.url) })}`}
      onPress={() => openOfficial(action.url)}
      className={cn(
        'min-h-[52px] flex-row items-center gap-3 rounded-lg px-4 py-3',
        prominent
          ? 'bg-primary active:bg-primary-dark'
          : 'border border-primary-tint bg-primary-soft active:bg-primary-tint',
      )}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-md"
        style={{ backgroundColor: prominent ? 'rgba(255,255,255,0.16)' : '#FFFFFF' }}
      >
        <Icon name={ACTION_ICON[action.kind]} size={20} color={fg} />
      </View>
      <View className="flex-1">
        <AppText variant={prominent ? 'bodyLg' : 'body'} weight="semibold" style={{ color: fg }}>
          {label}
        </AppText>
        <AppText
          variant="caption"
          style={{ color: prominent ? colors.primaryTint : colors.textMuted }}
        >
          {t('guide.opens', { host: hostOf(action.url) })}
        </AppText>
      </View>
      <Icon name="external" size={18} color={fg} />
    </Pressable>
  );
}

/** One thing to bring: how many, original or photocopy, and any note. */
export function RequirementCard({
  req,
  checked,
  onToggle,
}: {
  req: Requirement;
  checked?: boolean;
  onToggle?: () => void;
}) {
  const { t } = useTranslation();
  const { language } = useSettings();
  const name = pick(req.name, language);
  const bring = t(`guide.bring_${req.bring}`);
  const body = (
    <>
      {onToggle ? (
        <View
          className={cn(
            'mt-0.5 h-6 w-6 items-center justify-center border-2',
            checked ? 'border-success bg-success' : 'bg-surface',
          )}
          style={{ borderRadius: 6, borderColor: checked ? colors.success : colors.textSubtle }}
        >
          {checked ? <Icon name="check" size={16} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
      ) : (
        <View className="h-10 w-10 items-center justify-center rounded-md bg-primary-soft">
          <Icon name={BRING_ICON[req.bring]} size={20} color={colors.primary} />
        </View>
      )}
      <View className="flex-1 gap-1">
        <View className="flex-row flex-wrap items-center gap-2">
          {req.qty > 1 ? (
            <View className="rounded-md bg-primary px-1.5">
              <AppText variant="small" weight="bold" tone="inverse">
                {t('guide.qty', { n: req.qty })}
              </AppText>
            </View>
          ) : null}
          <AppText
            variant="body"
            weight="semibold"
            className="flex-shrink"
            style={
              checked ? { textDecorationLine: 'line-through', color: colors.textMuted } : undefined
            }
          >
            {name}
          </AppText>
        </View>
        <View className="flex-row flex-wrap gap-1.5">
          <View className="flex-row items-center gap-1 rounded-full bg-surface-alt px-2 py-0.5">
            <Icon name={BRING_ICON[req.bring]} size={12} color={colors.textMuted} />
            <AppText variant="caption" weight="medium" tone="muted">
              {bring}
            </AppText>
          </View>
          {req.onlyIf ? (
            <View className="rounded-lg bg-gold-soft px-2 py-0.5" style={{ maxWidth: '100%' }}>
              <AppText
                variant="caption"
                weight="medium"
                style={{ color: '#5C4300', flexShrink: 1 }}
              >
                {t('guide.onlyIf', { who: pick(req.onlyIf, language) })}
              </AppText>
            </View>
          ) : null}
        </View>
        {req.note ? (
          <AppText variant="small" tone="muted">
            {pick(req.note, language)}
          </AppText>
        ) : null}
      </View>
    </>
  );
  if (onToggle) {
    return (
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!checked }}
        accessibilityLabel={`${req.qty > 1 ? `${req.qty} ` : ''}${name}, ${bring}`}
        onPress={onToggle}
        className="flex-row gap-3 rounded-card border border-line bg-surface p-4 active:bg-surface-alt"
      >
        {body}
      </Pressable>
    );
  }
  return (
    <View
      className="flex-row gap-3 rounded-card border border-line bg-surface p-4"
      accessibilityLabel={`${name}, ${bring}`}
    >
      {body}
    </View>
  );
}

/** Steps grouped into "Do at home" and "At the office", numbered across both groups. */
export function StepGroups({ steps }: { steps: GuideStep[] }) {
  const { t } = useTranslation();
  const { language } = useSettings();
  const groups: Array<{ where: GuideStep['where']; items: Array<{ step: GuideStep; n: number }> }> =
    [];
  steps.forEach((step, i) => {
    const last = groups[groups.length - 1];
    if (last && last.where === step.where) last.items.push({ step, n: i + 1 });
    else groups.push({ where: step.where, items: [{ step, n: i + 1 }] });
  });
  return (
    <View className="gap-4">
      {groups.map((g, gi) => {
        const home = g.where === 'home';
        return (
          <View
            key={gi}
            className="gap-3 rounded-card p-4"
            style={{ backgroundColor: home ? colors.primarySoft : colors.surfaceAlt }}
          >
            <View className="flex-row items-center gap-2">
              <View
                className="h-9 w-9 items-center justify-center rounded-md"
                style={{ backgroundColor: home ? colors.primary : colors.text }}
              >
                <Icon name={home ? 'house' : 'building'} size={20} color="#FFFFFF" />
              </View>
              <View>
                <AppText variant="body" weight="bold" tone={home ? 'primaryDark' : 'default'}>
                  {home ? t('guide.atHome') : t('guide.atOffice')}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {home ? t('guide.atHomeHint') : t('guide.atOfficeHint')}
                </AppText>
              </View>
            </View>
            {g.items.map(({ step, n }) => (
              <View key={n} className="flex-row gap-3">
                <View
                  className="h-7 w-7 items-center justify-center rounded-full bg-surface"
                  style={{
                    borderWidth: 1.5,
                    borderColor: home ? colors.primary : colors.textMuted,
                  }}
                >
                  <AppText variant="small" weight="bold" tone={home ? 'primary' : 'muted'}>
                    {n}
                  </AppText>
                </View>
                <View className="flex-1 gap-2" style={{ paddingTop: 2 }}>
                  <AppText variant="body">{pick(step.text, language)}</AppText>
                  {step.action ? <ActionButton action={step.action} /> : null}
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

/** Helpful tip (blue) or warning about scams and wasted trips (red). */
export function TipBox({ tone, text }: { tone: 'tip' | 'warning'; text: string }) {
  const warn = tone === 'warning';
  return (
    <View className={cn('flex-row gap-2 rounded-lg p-3', warn ? 'bg-red-soft' : 'bg-primary-soft')}>
      <Icon
        name={warn ? 'alert' : 'info'}
        size={20}
        color={warn ? colors.danger : colors.primary}
      />
      <AppText variant="small" tone={warn ? 'danger' : 'primaryDark'} className="flex-1">
        {text}
      </AppText>
    </View>
  );
}

/** Small stat tile: fee, processing time, validity. */
export function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View className="min-w-[140px] flex-1 gap-1 rounded-card border border-line bg-surface p-3">
      <View className="flex-row items-center gap-1.5">
        <Icon name={icon} size={16} color={colors.primary} />
        <AppText variant="caption" weight="semibold" tone="muted">
          {label.toUpperCase()}
        </AppText>
      </View>
      <AppText variant="small" weight="medium">
        {value}
      </AppText>
    </View>
  );
}
