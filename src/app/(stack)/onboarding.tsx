import { router } from 'expo-router';
import { ChevronRight, Landmark } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, ScrollView, View } from '@/components/tw';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OptionPill } from '@/components/ui/Pills';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { AI } from '@/constants/ai';
import { MADHABS, PRAYER_METHODS, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useThemeStore } from '@/stores/useThemeStore';
import { useUserStore } from '@/stores/useUserStore';
import type { Madhab, PrayerMethodId, ThemePreference } from '@/types';
import { FONTS } from '@/constants/theme';

const TOTAL_STEPS = 6;

export default function OnboardingScreen() {
  const { theme } = useAppTheme();
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [method, setMethod] = useState<PrayerMethodId>('muslim-world-league');
  const [madhab, setMadhab] = useState<Madhab>('hanafi');
  const [themePref, setThemePref] = useState<ThemePreference>('dark');
  const [apiKey, setApiKey] = useState('');

  const canContinue = step === 1 ? name.trim().length > 0 : true;

  const goNext = () => {
    if (step >= TOTAL_STEPS - 1) return;
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step <= 0) return;
    setStep((s) => s - 1);
  };

  const finish = async () => {
    await completeOnboarding({
      name,
      theme: themePref,
      prayerSettings: { method, madhab, notificationsEnabled: true },
      aiSettings: { apiKey: apiKey.trim() || AI.defaultApiKey, model: AI.defaultModel, dailyReportTime: AI.dailyReportTime, enabledModules: [] },
    });
    useThemeStore.getState().setPreference(themePref);
    router.replace('/(tabs)');
  };

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerClassName="px-5 pb-12"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {step === 0 ? (
              <WelcomeStep theme={theme} onBegin={goNext} />
            ) : (
              <View>
                <View className="mb-6 flex-row items-center justify-between">
                  <ThemedText type="caption" tone="accent">
                    STEP {step} OF {TOTAL_STEPS}
                  </ThemedText>
                  <View
                    className="h-1.5 flex-1 ml-3 overflow-hidden rounded-full"
                    style={{ backgroundColor: theme.backgroundElevated }}
                  >
                    <View
                      style={{
                        width: `${(step / TOTAL_STEPS) * 100}%`,
                        height: '100%',
                        backgroundColor: theme.accent,
                        borderRadius: 999,
                      }}
                    />
                  </View>
                </View>

                {step === 1 && (
                  <View>
                    <ThemedText type="title" className="mb-1">
                      Who is the Warrior?
                    </ThemedText>
                    <ThemedText type="small" tone="secondary" className="mb-5">
                      Your name will be etched into the realm.
                    </ThemedText>
                    <Input
                      label="Hero name"
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Zayn"
                      maxLength={24}
                    />
                  </View>
                )}

                {step === 2 && (
                  <View>
                    <ThemedText type="title" className="mb-1">
                      Prayer Calculation
                    </ThemedText>
                    <ThemedText type="small" tone="secondary" className="mb-5">
                      Choose the method used to calculate prayer times for your location.
                    </ThemedText>
                    <View className="gap-2">
                      {PRAYER_METHODS.map((m) => (
                        <OptionPill
                          key={m.id}
                          label={m.label}
                          hint={m.short}
                          selected={method === m.id}
                          onPress={() => setMethod(m.id)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 3 && (
                  <View>
                    <ThemedText type="title" className="mb-1">
                      Madhab
                    </ThemedText>
                    <ThemedText type="small" tone="secondary" className="mb-5">
                      Affects the time of Asr prayer.
                    </ThemedText>
                    <View className="gap-2">
                      {MADHABS.map((m) => (
                        <OptionPill
                          key={m.id}
                          label={m.label}
                          hint={m.description}
                          selected={madhab === m.id}
                          onPress={() => setMadhab(m.id)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 4 && (
                  <View>
                    <ThemedText type="title" className="mb-1">
                      Realm Aesthetic
                    </ThemedText>
                    <ThemedText type="small" tone="secondary" className="mb-5">
                      Choose how the realm appears. You can change this anytime in Settings.
                    </ThemedText>
                    <View className="gap-2">
                      <OptionPill
                        label="Obsidian — dark, gold-lit"
                        hint="Darkest Dungeon energy"
                        selected={themePref === 'dark'}
                        onPress={() => setThemePref('dark')}
                      />
                      <OptionPill
                        label="Parchment — light, aged"
                        hint="An old atlas under lamplight"
                        selected={themePref === 'light'}
                        onPress={() => setThemePref('light')}
                      />
                      <OptionPill
                        label="Follow System"
                        hint="Matches your device theme"
                        selected={themePref === 'system'}
                        onPress={() => setThemePref('system')}
                      />
                    </View>
                  </View>
                )}

                {step === 5 && (
                  <View>
                    <ThemedText type="title" className="mb-1">
                      The Oracle&apos;s Key
                    </ThemedText>
                    <ThemedText type="small" tone="secondary" className="mb-5">
                      Optional. The Oracle (AI strategist) arrives in Version 8. Your key stays on
                      this device only.
                    </ThemedText>
                    <Input
                      label="OpenAI API key"
                      value={apiKey}
                      onChangeText={setApiKey}
                      placeholder="sk-..."
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry
                    />
                    <ThemedText type="caption" tone="secondary" className="mt-2">
                      Can also be set later in Settings → Oracle.
                    </ThemedText>
                  </View>
                )}

                <View className="mt-8 flex-row items-center justify-between gap-3">
                  {step > 1 ? (
                    <Button variant="ghost" onPress={goBack} className="px-4">
                      Back
                    </Button>
                  ) : (
                    <View />
                  )}
                  {step < TOTAL_STEPS - 1 ? (
                    <Button
                      variant="primary"
                      onPress={goNext}
                      disabled={!canContinue}
                      className="flex-1"
                    >
                      Continue <ChevronRight size={16} color={theme.name === 'dark' ? '#0B0F19' : '#fff'} />
                    </Button>
                  ) : null}
                </View>

                {step === TOTAL_STEPS - 1 && (
                  <Button variant="primary" size="lg" onPress={finish} className="mt-8">
                    Forge My Character
                  </Button>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

function WelcomeStep({ theme, onBegin }: { theme: ThemeColors; onBegin: () => void }) {
  return (
    <View className="flex-1 justify-center">
      <View
        className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border-2"
        style={{ borderColor: theme.accent, backgroundColor: theme.backgroundElevated }}
      >
        <Landmark size={44} color={theme.accent} />
      </View>
      <ThemedText
        type="display"
        className="text-center"
        style={{ fontSize: 34, letterSpacing: 4 }}
      >
        GitGud
      </ThemedText>
      <ThemedText
        type="subtitle"
        tone="accent"
        className="mt-2 text-center"
        style={{ fontFamily: FONTS.displayRegular, letterSpacing: 3, textTransform: 'uppercase' }}
      >
        Life OS
      </ThemedText>
      <ThemedText type="body" tone="secondary" className="mt-6 text-center">
        A gamified life-management realm. Every prayer, sprint, meal, and conversation feeds your
        character — stats rise, skills unlock, and an AI Oracle turns your days into strategy.
      </ThemedText>
      <ThemedText
        type="small"
        tone="secondary"
        className="mt-8 text-center"
        style={{ fontFamily: FONTS.mono }}
      >
        No accounts. No cloud. Everything stays on this device.
      </ThemedText>
      <Button variant="primary" size="lg" onPress={onBegin} className="mt-8">
        Begin the Journey
      </Button>
    </View>
  );
}