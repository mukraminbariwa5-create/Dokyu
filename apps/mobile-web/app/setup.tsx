/**
 * Onboarding setup (plan §3.1 G): language → area → goals. Only the province and city are saved, never GPS.
 * Guests keep the answers on the device; signed-in users also save them to their profile.
 */
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GOALS, PROVINCES, colors, type GoalSlug } from '@dokyu/shared';

type Province = (typeof PROVINCES)[number];
import { Screen } from '../components/ui/Screen';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { ChoiceChip } from '../components/ui/ChoiceChip';
import { Doki } from '../components/ui/Doki';
import { Icon } from '../components/ui/Icon';
import { Input } from '../components/ui/Input';
import { Disclaimer } from '../components/ui/Disclaimer';
import { LANGUAGES } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import { useSettings } from '../lib/settings';

const TOTAL = 3;

export default function Setup() {
  const { t } = useTranslation();
  const router = useRouter();
  const settings = useSettings();
  const { status, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [province, setProvince] = useState<Province | null>(
    (PROVINCES as readonly string[]).includes(settings.province ?? '')
      ? (settings.province as Province)
      : null,
  );
  const [query, setQuery] = useState('');
  const [municipality, setMunicipality] = useState(settings.municipality ?? '');
  const [goals, setGoals] = useState<GoalSlug[]>(settings.goals);
  const [busy, setBusy] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const starts = PROVINCES.filter((p) => p.toLowerCase().startsWith(q));
    const contains = PROVINCES.filter(
      (p) => !p.toLowerCase().startsWith(q) && p.toLowerCase().includes(q),
    );
    return [...starts, ...contains].slice(0, 6);
  }, [query]);

  async function finish(skipped = false) {
    const town = municipality.trim();
    const answers = skipped
      ? {}
      : { province, municipality: town.length >= 2 ? town : null, goals };
    settings.update({ ...answers, introSeen: true, setupDone: true });
    if (status === 'signedIn') {
      setBusy(true);
      await updateProfile({
        ...answers,
        language: settings.language,
        textSize: settings.largeText ? 'large' : 'normal',
        onboarded: true,
      }).catch(() => {});
      setBusy(false);
      router.replace('/');
      return;
    }
    if (skipped) router.replace('/');
    else setStep(TOTAL + 1);
  }

  const header = step <= TOTAL && (
    <View className="flex-row items-center justify-between">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.back')}
        disabled={step === 1}
        onPress={() => setStep(step - 1)}
        className="h-11 w-11 items-center justify-center rounded-md"
        style={{ opacity: step === 1 ? 0 : 1 }}
      >
        <Icon name="chevronLeft" color={colors.primary} />
      </Pressable>
      <AppText variant="small" weight="semibold" tone="muted">
        {t('onboarding.stepOf', { step, total: TOTAL })}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={() => finish(true)}
        className="min-h-[44px] justify-center px-2"
      >
        <AppText variant="body" weight="semibold" tone="muted">
          {t('onboarding.skip')}
        </AppText>
      </Pressable>
    </View>
  );

  const progress = step <= TOTAL && (
    <View className="h-1.5 flex-row gap-1.5">
      {Array.from({ length: TOTAL }, (_, n) => (
        <View
          key={n}
          className="flex-1 rounded-full"
          style={{ backgroundColor: n < step ? colors.primary : colors.border }}
        />
      ))}
    </View>
  );

  return (
    <Screen className="gap-6">
      {header}
      {progress}

      {step === 1 && (
        <View className="gap-4">
          <AppText variant="h1">{t('onboarding.languageTitle')}</AppText>
          {LANGUAGES.map((l) => (
            <ChoiceChip
              key={l.code}
              label={l.label}
              selected={settings.language === l.code}
              onPress={() => settings.setLanguage(l.code)}
            />
          ))}
          <Button label={t('onboarding.next')} onPress={() => setStep(2)} fullWidth />
        </View>
      )}

      {step === 2 && (
        <View className="gap-4">
          <AppText variant="h1">{t('onboarding.areaTitle')}</AppText>
          <View className="flex-row gap-2 rounded-lg bg-primary-soft p-3">
            <Icon name="shield" size={20} color={colors.primary} />
            <AppText variant="small" tone="primaryDark" className="flex-1">
              {t('onboarding.areaIntro')}
            </AppText>
          </View>
          {province ? (
            <View className="gap-1.5">
              <AppText variant="small" weight="medium">
                {t('onboarding.province')}
              </AppText>
              <View className="flex-row items-center gap-2">
                <ChoiceChip label={province} selected onPress={() => setProvince(null)} />
              </View>
            </View>
          ) : (
            <View className="gap-2">
              <Input
                label={t('onboarding.province')}
                placeholder={t('onboarding.provinceSearch')}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
              />
              {matches.map((p) => (
                <Pressable
                  key={p}
                  accessibilityRole="button"
                  onPress={() => {
                    setProvince(p);
                    setQuery('');
                  }}
                  className="min-h-[48px] flex-row items-center gap-3 rounded-lg border border-line px-4 active:bg-surface-alt"
                >
                  <Icon name="pin" size={20} color={colors.textMuted} />
                  <AppText variant="body">{p}</AppText>
                </Pressable>
              ))}
              {query.trim() && matches.length === 0 ? (
                <AppText variant="small" tone="muted">
                  {t('onboarding.noMatch')}
                </AppText>
              ) : null}
            </View>
          )}
          <Input
            label={t('onboarding.municipality')}
            hint={t('onboarding.municipalityHint')}
            value={municipality}
            onChangeText={setMunicipality}
            autoComplete="off"
          />
          <Button label={t('onboarding.next')} onPress={() => setStep(3)} fullWidth />
        </View>
      )}

      {step === 3 && (
        <View className="gap-4">
          <View className="gap-1">
            <AppText variant="h1">{t('onboarding.goalsTitle')}</AppText>
            <AppText variant="body" tone="muted">
              {t('onboarding.goalsIntro')}
            </AppText>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {GOALS.map((g) => (
              <ChoiceChip
                key={g.slug}
                label={settings.language === 'tl' ? g.tl : g.en}
                selected={goals.includes(g.slug)}
                onPress={() =>
                  setGoals((cur) =>
                    cur.includes(g.slug) ? cur.filter((x) => x !== g.slug) : [...cur, g.slug],
                  )
                }
              />
            ))}
          </View>
          <Button
            label={t('onboarding.finish')}
            onPress={() => finish()}
            loading={busy}
            fullWidth
          />
        </View>
      )}

      {step > TOTAL && (
        <View className="items-center gap-5 pt-6">
          <View
            className="items-center justify-center rounded-full bg-primary-soft"
            style={{ width: 180, height: 180 }}
          >
            <Doki size={140} />
          </View>
          <AppText variant="h1" style={{ textAlign: 'center' }}>
            {t('onboarding.doneTitle')}
          </AppText>
          <AppText variant="bodyLg" tone="muted" style={{ textAlign: 'center' }}>
            {t('onboarding.doneText')}
          </AppText>
          <Button label={t('auth.signUp')} onPress={() => router.replace('/sign-up')} fullWidth />
          <Button
            label={t('onboarding.exploreGuides')}
            variant="secondary"
            onPress={() => router.replace('/guides')}
            fullWidth
          />
          <Button
            label={t('auth.goHome')}
            variant="ghost"
            onPress={() => router.replace('/')}
            fullWidth
          />
        </View>
      )}
      <Disclaimer />
    </Screen>
  );
}
