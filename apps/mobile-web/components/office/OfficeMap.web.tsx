import { createElement, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { mapHtml, type MapPin } from './mapHtml';

/** Web: the map page in a sandboxed iframe (scripts only; it cannot reach the app's storage). */
export function OfficeMap({
  pins,
  selected,
  me,
  height = 280,
  onSelect,
}: {
  pins: MapPin[];
  selected?: string;
  me?: { lat: number; lng: number } | null;
  height?: number;
  onSelect?: (slug: string) => void;
}) {
  const { t } = useTranslation();
  const html = useMemo(
    () => mapHtml({ pins, selected, me, offlineText: t('offices.mapOffline') }),
    [pins, selected, me, t],
  );
  useEffect(() => {
    if (!onSelect) return;
    const listener = (e: MessageEvent) => {
      if (typeof e.data !== 'string') return;
      try {
        const msg = JSON.parse(e.data) as { type?: string; slug?: string };
        if (
          msg.type === 'select' &&
          typeof msg.slug === 'string' &&
          pins.some((p) => p.slug === msg.slug)
        )
          onSelect(msg.slug);
      } catch {
        /* not ours */
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [onSelect, pins]);
  return (
    <View
      accessibilityLabel={t('offices.mapLabel')}
      style={{ height, borderRadius: 20, overflow: 'hidden', backgroundColor: '#ECF0FF' }}
    >
      {createElement('iframe', {
        srcDoc: html,
        title: t('offices.mapLabel'),
        sandbox: 'allow-scripts',
        style: { border: 0, width: '100%', height: '100%' },
      })}
    </View>
  );
}
