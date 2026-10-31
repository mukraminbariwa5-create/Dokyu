/**
 * "Download my data" and "Delete data on this device" (privacy promise, plan §5.4). The phone keeps
 * settings, checklists and My Docs; the account (if any) is fetched from the API and added to the file.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Share } from 'react-native';

const PREFIX = 'dokyu.';

export async function readLocalData(): Promise<Record<string, unknown>> {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
  const pairs = await AsyncStorage.multiGet(keys);
  const out: Record<string, unknown> = {};
  for (const [k, v] of pairs) {
    if (v === null) continue;
    try {
      out[k] = JSON.parse(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

export async function clearLocalData(): Promise<void> {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
  await AsyncStorage.multiRemove(keys);
}

/** Web: downloads a .json file. Android: opens the share sheet so it can be saved or sent. */
export async function saveJson(filename: string, data: unknown): Promise<void> {
  const text = JSON.stringify(data, null, 2);
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  await Share.share({ title: filename, message: text });
}
