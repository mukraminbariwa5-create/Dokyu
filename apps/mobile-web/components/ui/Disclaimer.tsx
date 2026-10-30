import { Text } from 'react-native';
import { type } from '../../lib/theme';

export function Disclaimer() {
  return <Text style={[type.caption, { textAlign: 'center' }]}>Independent guide · not affiliated with any government agency</Text>;
}
