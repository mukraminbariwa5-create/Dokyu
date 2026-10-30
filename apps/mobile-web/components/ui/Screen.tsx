import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../lib/theme';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 40 }}>
        <View style={{ width: '100%', maxWidth: 720, alignSelf: 'center', gap: 18 }}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
