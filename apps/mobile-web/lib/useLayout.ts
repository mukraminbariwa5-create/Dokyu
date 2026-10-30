import { useWindowDimensions } from 'react-native';

/** Width where the app switches from the phone layout (bottom tabs) to the desktop layout (left sidebar). */
export const DESKTOP_MIN_WIDTH = 900;

export function useLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_MIN_WIDTH;
  return { width, isDesktop, isPhone: !isDesktop };
}
