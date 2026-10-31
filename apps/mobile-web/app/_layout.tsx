import '../global.css';
import '../lib/i18n';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { SettingsProvider, useSettings } from '../lib/settings';
import { AuthProvider } from '../lib/auth';
import { MyDocsProvider } from '../lib/mydocs';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Web: fade out the "dokyu" loading screen from index.html (added by scripts/finish-web.mjs). */
function hideWebBoot() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const boot = document.getElementById('boot');
  if (!boot) return;
  boot.classList.add('hide');
  setTimeout(() => boot.remove(), 300);
}

function Root() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const { ready } = useSettings();
  const loaded = fontsLoaded && ready;

  useEffect(() => {
    if (!loaded) return;
    SplashScreen.hideAsync().catch(() => {});
    hideWebBoot();
  }, [loaded]);

  if (!loaded) return null;
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <AuthProvider>
            <MyDocsProvider>
              <Root />
            </MyDocsProvider>
          </AuthProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
