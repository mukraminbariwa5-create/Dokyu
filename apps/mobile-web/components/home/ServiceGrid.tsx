import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { Icon, type IconName } from '../ui/Icon';
import { usePressScale } from '../../lib/motion';
import { Animated } from 'react-native';

export interface Tile {
  key: string;
  icon: IconName;
  label: string;
  /** Not built yet: shows a "Soon" tag. */
  soon?: boolean;
  onPress: () => void;
}

function TileButton({ tile }: { tile: Tile }) {
  const { t } = useTranslation();
  const press = usePressScale(0.92);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tile.soon ? `${tile.label}, ${t('home.soon')}` : tile.label}
      onPress={tile.onPress}
      {...press.handlers}
      className="items-center gap-2"
      style={{ width: '25%', paddingVertical: 6 }}
    >
      <Animated.View style={press.style}>
        <View
          className="items-center justify-center bg-primary-soft"
          style={{ width: 60, height: 60, borderRadius: 18, opacity: tile.soon ? 0.6 : 1 }}
        >
          <Icon name={tile.icon} size={28} color={colors.primary} fill={colors.primaryTint} />
        </View>
        {tile.soon ? (
          <View className="absolute rounded-md bg-gold px-1.5" style={{ top: -6, right: -10 }}>
            <AppText
              variant="caption"
              weight="bold"
              style={{ color: '#3A2A00', fontSize: 9, lineHeight: 14 }}
            >
              {t('home.soon')}
            </AppText>
          </View>
        ) : null}
      </Animated.View>
      <AppText
        variant="caption"
        weight="medium"
        style={{ color: '#3E4A63', textAlign: 'center' }}
        numberOfLines={1}
      >
        {tile.label}
      </AppText>
    </Pressable>
  );
}

/** "What would you like to do?" icon grid, 4 per row (prototype). */
export function ServiceGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <View className="flex-row flex-wrap" style={{ rowGap: 10 }}>
      {tiles.map((tile) => (
        <TileButton key={tile.key} tile={tile} />
      ))}
    </View>
  );
}
