import { View } from 'react-native';
import { statusColors, type StatusTone } from '@dokyu/shared';
import { AppText } from './AppText';
import { cn } from '../../lib/cn';

/**
 * Status pill. The colors are fixed app-wide (plan §4.2): gray = not started, blue = in progress,
 * yellow = ready, green = done, red = rejected or expired.
 */
// A different dot shape per tone so color is never the only signal.
const DOT: Record<StatusTone, string> = {
  notStarted: 'h-2 w-2 rounded-full border-2',
  inProgress: 'h-2 w-2 rounded-full border-2',
  ready: 'h-2 w-2 rotate-45',
  done: 'h-2 w-2 rounded-full',
  problem: 'h-2 w-2',
};

export function Badge({
  tone,
  label,
  className,
}: {
  tone: StatusTone;
  label: string;
  className?: string;
}) {
  const c = statusColors[tone];
  return (
    <View
      className={cn('flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1', className)}
      style={{ backgroundColor: c.bg }}
      accessibilityLabel={label}
    >
      <View
        className={DOT[tone]}
        style={
          tone === 'notStarted' || tone === 'inProgress'
            ? { borderColor: c.fg }
            : { backgroundColor: c.fg }
        }
      />
      <AppText variant="small" weight="semibold" style={{ color: c.fg }}>
        {label}
      </AppText>
    </View>
  );
}

/** Small gold "New" tag (plan §4.2). */
export function NewTag({ label = 'New' }: { label?: string }) {
  return (
    <View className="self-start rounded-full bg-gold px-2 py-0.5">
      <AppText variant="caption" weight="bold" tone="inverse">
        {label}
      </AppText>
    </View>
  );
}
