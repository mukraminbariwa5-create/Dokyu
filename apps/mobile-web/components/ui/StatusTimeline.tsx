import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, timelineSteps, type RequestStatus, type TimelineStepState } from '@dokyu/shared';
import { AppText } from './AppText';
import { Icon } from './Icon';

export interface TimelineEvent {
  status: RequestStatus;
  /** When the request reached this status, already formatted for display. */
  at?: string;
  note?: string;
}

/**
 * Vertical status timeline for a barangay request (plan §3.1 D). Finished steps are green with a check,
 * the current step is blue, later steps are gray. A rejected or cancelled request ends with a red step.
 */
export function StatusTimeline({
  status,
  events = [],
}: {
  status: RequestStatus;
  events?: TimelineEvent[];
}) {
  const { t } = useTranslation();
  const reached = new Map(events.map((e) => [e.status, e]));
  const steps = timelineSteps(status, new Set(reached.keys()));

  return (
    <View accessibilityRole="list">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const ev = reached.get(step.status);
        const label = t(`status.${step.status}`);
        return (
          <View
            key={step.status}
            className="flex-row gap-3"
            accessibilityLabel={`${label}${step.state === 'current' ? ', current step' : step.state === 'done' ? ', done' : ''}${ev?.at ? `, ${ev.at}` : ''}`}
          >
            <View className="items-center" style={{ width: 28 }}>
              <Dot state={step.state} />
              {!last && (
                <View
                  className="w-0.5 flex-1"
                  style={{
                    minHeight: 22,
                    backgroundColor: step.state === 'done' ? colors.success : colors.border,
                  }}
                />
              )}
            </View>
            <View className="flex-1 pb-4" style={{ paddingTop: 2 }}>
              <AppText
                variant="body"
                weight={
                  step.state === 'current' || step.state === 'stopped' ? 'semibold' : 'medium'
                }
                tone={
                  step.state === 'upcoming'
                    ? 'subtle'
                    : step.state === 'stopped'
                      ? 'danger'
                      : 'default'
                }
              >
                {label}
              </AppText>
              {ev?.at ? (
                <AppText variant="small" tone="muted">
                  {ev.at}
                </AppText>
              ) : null}
              {ev?.note ? (
                <AppText variant="small" tone={step.state === 'stopped' ? 'danger' : 'muted'}>
                  {ev.note}
                </AppText>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Dot({ state }: { state: TimelineStepState }) {
  if (state === 'done') {
    return (
      <View className="h-7 w-7 items-center justify-center rounded-full bg-success">
        <Icon name="check" size={16} color="#FFFFFF" strokeWidth={2.6} />
      </View>
    );
  }
  if (state === 'stopped') {
    return (
      <View className="h-7 w-7 items-center justify-center rounded-full bg-red">
        <Icon name="x" size={16} color="#FFFFFF" strokeWidth={2.6} />
      </View>
    );
  }
  if (state === 'current') {
    return (
      <View
        className="h-7 w-7 items-center justify-center rounded-full bg-primary-soft"
        style={{ borderWidth: 2, borderColor: colors.primary }}
      >
        <View className="h-2.5 w-2.5 rounded-full bg-primary" />
      </View>
    );
  }
  return (
    <View
      className="h-7 w-7 rounded-full bg-surface"
      style={{ borderWidth: 2, borderColor: colors.border }}
    />
  );
}
