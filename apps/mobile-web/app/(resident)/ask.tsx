/**
 * Ask Doki (plan §3.1 E). Doki answers from Dokyu's checked guides, offices and holidays, in English or
 * Tagalog, with buttons that take you to the right page. Works offline; nothing you type leaves the phone.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { AppText } from '../../components/ui/AppText';
import { Doki, DokiFace, type DokiPose } from '../../components/ui/Doki';
import { Icon } from '../../components/ui/Icon';
import { openOfficial } from '../../components/guide/parts';
import { useTypewriter } from '../../components/doki/DokiBubble';
import { FadeIn, Float, PopOnChange } from '../../lib/motion';
import { dokiReply, type DokiButton } from '../../lib/askDoki';
import { useGuides } from '../../lib/guides';
import { useSettings } from '../../lib/settings';
import { useLayout } from '../../lib/useLayout';

interface Message {
  id: number;
  from: 'me' | 'doki';
  text: string;
  buttons?: DokiButton[];
}

const SUGGESTIONS = ['ask.s1', 'ask.s2', 'ask.s3', 'ask.s4', 'ask.s5'];

function DokiMessage({
  m,
  latest,
  onTyping,
}: {
  m: Message;
  latest: boolean;
  onTyping?: (v: boolean) => void;
}) {
  const router = useRouter();
  const { visible, typing, finish } = useTypewriter(latest ? m.text : '', 14);
  useEffect(() => {
    if (latest) onTyping?.(typing);
  }, [typing, latest, onTyping]);
  const text = latest ? visible : m.text;
  return (
    <FadeIn distance={8}>
      <View className="flex-row items-end gap-2" style={{ maxWidth: '92%' }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: colors.primary,
          }}
        >
          <DokiFace size={36} />
        </View>
        <Pressable
          onPress={finish}
          accessibilityLabel={m.text}
          className="flex-shrink gap-3 bg-surface p-3.5"
          style={{
            borderRadius: 18,
            borderBottomLeftRadius: 6,
            borderWidth: 1.5,
            borderColor: colors.primaryTint,
          }}
        >
          <AppText variant="body">{text}</AppText>
          {m.buttons?.length && (!latest || !typing) ? (
            <View className="flex-row flex-wrap gap-2">
              {m.buttons.map((b) => (
                <Pressable
                  key={b.label}
                  accessibilityRole={b.url ? 'link' : 'button'}
                  onPress={() =>
                    b.url ? openOfficial(b.url) : b.href ? router.push(b.href) : null
                  }
                  className="flex-row items-center gap-1.5 rounded-full bg-primary-soft px-3 active:bg-primary-tint"
                  style={{ minHeight: 40 }}
                >
                  <AppText variant="small" weight="semibold" tone="primaryDark">
                    {b.label}
                  </AppText>
                  <Icon
                    name={b.url ? 'external' : 'chevronRight'}
                    size={14}
                    color={colors.primaryDark}
                  />
                </Pressable>
              ))}
            </View>
          ) : null}
        </Pressable>
      </View>
    </FadeIn>
  );
}

export default function AskDoki() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const { isDesktop } = useLayout();
  const { data: guides } = useGuides();
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 0, from: 'doki', text: t('ask.hello') },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [pose, setPose] = useState<DokiPose>('wave');
  const [talking, setTalking] = useState(false);
  const [mouth, setMouth] = useState(false);
  // The greeting follows a language switch until the user starts chatting.
  useEffect(() => {
    setMessages((m) => (m.length === 1 ? [{ id: 0, from: 'doki', text: t('ask.hello') }] : m));
  }, [language, t]);
  const scroll = useRef<{ scrollToEnd: (o?: { animated?: boolean }) => void } | null>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (!talking) {
      setMouth(false);
      return;
    }
    const timer = setInterval(() => setMouth((v) => !v), 120);
    return () => clearInterval(timer);
  }, [talking]);
  const onTyping = useCallback((v: boolean) => setTalking(v), []);

  const send = (text: string) => {
    const q = text.trim().slice(0, 300);
    if (!q || thinking) return;
    setInput('');
    setMessages((m) => [...m, { id: nextId.current++, from: 'me', text: q }]);
    setThinking(true);
    setPose('idle');
    setTimeout(() => {
      const reply = dokiReply(q, guides, t, language);
      setMessages((m) => [
        ...m,
        { id: nextId.current++, from: 'doki', text: reply.text, buttons: reply.buttons },
      ]);
      setPose(reply.pose);
      setThinking(false);
    }, 650);
  };

  // Before the first question, show the example questions as an easy list.
  const fresh = messages.length <= 1 && !thinking;
  const lastDoki = [...messages].reverse().find((m) => m.from === 'doki')?.id;

  return (
    <SafeAreaView edges={isDesktop ? [] : ['top']} className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View className="w-full flex-1 self-center" style={{ maxWidth: 760 }}>
          <View className="flex-row items-center gap-3 px-5 pb-2 pt-4">
            <PopOnChange value={pose} from={0.85}>
              <Float amount={3}>
                <Doki size={70} pose={pose} mouthOpen={mouth} label={t('tour.dokiLabel')} />
              </Float>
            </PopOnChange>
            <View className="flex-1">
              <AppText variant="h2">{t('nav.ask')}</AppText>
              <AppText variant="small" tone="muted">
                {thinking ? t('ask.thinking') : t('ask.subtitle')}
              </AppText>
            </View>
          </View>

          <ScrollView
            ref={(node: { scrollToEnd: (o?: { animated?: boolean }) => void } | null) => {
              scroll.current = node;
            }}
            className="flex-1"
            contentContainerClassName="gap-3 px-5 py-3"
            onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((m) =>
              m.from === 'me' ? (
                <FadeIn key={m.id} distance={8} style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
                  <View
                    className="bg-primary px-4 py-3"
                    style={{ borderRadius: 18, borderBottomRightRadius: 6 }}
                  >
                    <AppText variant="body" tone="inverse">
                      {m.text}
                    </AppText>
                  </View>
                </FadeIn>
              ) : (
                <DokiMessage key={m.id} m={m} latest={m.id === lastDoki} onTyping={onTyping} />
              ),
            )}
            {fresh ? (
              <FadeIn delay={300} distance={8}>
                <View className="mt-2 gap-2">
                  <AppText variant="small" weight="semibold" tone="muted">
                    {t('ask.tryAsking')}
                  </AppText>
                  {SUGGESTIONS.map((k) => (
                    <Pressable
                      key={k}
                      accessibilityRole="button"
                      onPress={() => send(t(k))}
                      className="min-h-[48px] flex-row items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 active:bg-primary-soft"
                    >
                      <Icon name="help" size={18} color={colors.primary} />
                      <AppText variant="body" weight="medium" className="flex-1">
                        {t(k)}
                      </AppText>
                      <Icon name="chevronRight" size={18} color={colors.textSubtle} />
                    </Pressable>
                  ))}
                </View>
              </FadeIn>
            ) : null}
            {thinking ? (
              <FadeIn distance={6}>
                <View
                  className="flex-row items-center gap-1 self-start rounded-full bg-surface-alt px-4 py-3"
                  accessibilityLabel={t('ask.thinking')}
                >
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.primary,
                        opacity: 0.4 + i * 0.25,
                      }}
                    />
                  ))}
                </View>
              </FadeIn>
            ) : null}
          </ScrollView>

          {fresh ? null : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0, flexShrink: 0 }}
              contentContainerClassName="gap-2 px-5 pb-2"
              keyboardShouldPersistTaps="handled"
            >
              {SUGGESTIONS.map((k) => (
                <Pressable
                  key={k}
                  accessibilityRole="button"
                  onPress={() => send(t(k))}
                  className="rounded-full border border-primary-tint bg-surface px-3.5 active:bg-primary-soft"
                  style={{ minHeight: 40, justifyContent: 'center' }}
                >
                  <AppText variant="small" weight="medium" tone="primary">
                    {t(k)}
                  </AppText>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <View className="flex-row items-center gap-2 border-t border-line px-4 py-3">
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send(input)}
              placeholder={t('ask.placeholder')}
              placeholderTextColor={colors.textSubtle}
              accessibilityLabel={t('ask.placeholder')}
              returnKeyType="send"
              maxLength={300}
              className="flex-1 rounded-full bg-surface-alt px-4 font-poppins text-ink"
              style={
                {
                  minHeight: 48,
                  fontSize: 16,
                  minWidth: 0,
                  flexShrink: 1,
                  outlineStyle: 'none',
                } as object
              }
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('ask.send')}
              onPress={() => send(input)}
              disabled={!input.trim() || thinking}
              className="items-center justify-center bg-primary active:bg-primary-dark"
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                opacity: !input.trim() || thinking ? 0.5 : 1,
              }}
            >
              <Icon name="send" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
          <AppText
            variant="caption"
            tone="muted"
            className="px-5 pb-6"
            style={{ textAlign: 'center' }}
          >
            {t('ask.footer')}
          </AppText>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
