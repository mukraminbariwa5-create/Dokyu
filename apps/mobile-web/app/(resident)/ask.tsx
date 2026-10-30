import { Text } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { type } from '../../lib/theme';

export default function Placeholder() {
  return (
    <Screen>
      <Text style={type.h1}>Ask Doki</Text>
      <Text style={type.body}>Coming in Phase 6 (see docs/PLAN.md §12).</Text>
      <Disclaimer />
    </Screen>
  );
}
