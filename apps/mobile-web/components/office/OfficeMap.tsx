import { useMemo } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { mapHtml, type MapPin } from './mapHtml';

/** Android / iOS: the same map page in a WebView. */
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
  return (
    <View
      accessibilityLabel={t('offices.mapLabel')}
      style={{ height, borderRadius: 20, overflow: 'hidden', backgroundColor: '#ECF0FF' }}
    >
      <WebView
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://dokyu.onrender.com/' }}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data) as { type?: string; slug?: string };
            if (msg.type === 'select' && typeof msg.slug === 'string') onSelect?.(msg.slug);
          } catch {
            /* ignore */
          }
        }}
        setSupportMultipleWindows={false}
        javaScriptEnabled
      />
    </View>
  );
}
