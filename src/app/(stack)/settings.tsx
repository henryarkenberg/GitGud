import { router } from 'expo-router';
import { Bell, BellOff, Database, Download, KeyRound, MapPin, Minus, Moon, Plus, RotateCcw, Smartphone, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView , Pressable, View } from '@/components/tw';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OptionPill } from '@/components/ui/Pills';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { resetDatabase } from '@/db/database';
import { MADHABS, PRAYER_METHODS } from '@/constants/theme';
import { DEFAULT_COORDS } from '@/constants/prayers';
import { SLEEP_TARGET_MAX, SLEEP_TARGET_MIN, SLEEP_TARGET_STEP } from '@/constants/sleep';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  cancelScheduledPrayerNotifications,
  ensureNotificationPermission,
  schedulePrayerNotifications,
} from '@/services/notifications';
import { useThemeStore } from '@/stores/useThemeStore';
import { useSleepStore } from '@/stores/useSleepStore';
import { useUserStore } from '@/stores/useUserStore';
import type { ThemePreference } from '@/types';
import { exportFullBackup, importLatestBackup } from '@/utils/backup';
import { formatDuration } from '@/utils/sleep';
import { getPrayerTimesFor } from '@/utils/prayerTimes';

export default function SettingsScreen() {
  const { theme } = useAppTheme();
  const profile = useUserStore((state) => state.profile);
  const patchProfile = useUserStore((state) => state.patchProfile);
  const clearProfile = useUserStore((state) => state.clear);
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);

  const [apiKeyDraft, setApiKeyDraft] = useState(profile?.aiSettings.apiKey ?? '');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const methodLabel =
    PRAYER_METHODS.find((m) => m.id === profile?.prayerSettings.method)?.label ?? 'Muslim World League';
  const madhabLabel = MADHABS.find((m) => m.id === profile?.prayerSettings.madhab)?.label ?? 'Hanafi';

  const sleepTarget = useSleepStore((state) => state.targetMinutes);
  const setSleepTarget = useSleepStore((state) => state.setTarget);

  const changeTheme = (value: ThemePreference) => {
    setPreference(value);
    patchProfile({ theme: value });
  };

  const onExport = async () => {
    setExporting(true);
    const result = await exportFullBackup();
    setExporting(false);
    Alert.alert(result.ok ? 'Export Complete' : 'Export Failed', result.message);
  };

  const onImport = async () => {
    Alert.alert(
      'Restore Backup',
      'This overwrites your current data with the most recent backup. Your current state is saved first. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setImporting(true);
            const result = await importLatestBackup();
            setImporting(false);
            Alert.alert(result.ok ? 'Restored' : 'Restore Failed', result.message);
          },
        },
      ],
    );
  };

  const onReset = () => {
    Alert.alert(
      'Reset All Data',
      'This permanently destroys your hero, ledger, and all settings on this device. There is no undo. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Destroy Everything',
          style: 'destructive',
          onPress: async () => {
            await resetDatabase();
            clearProfile();
            setPreference('system');
            router.replace('/(stack)/onboarding');
          },
        },
      ],
    );
  };

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4" edges={['top', 'bottom']}>
        <ScreenHeader title="Settings" subtitle="Command room of the realm" />

        <View className="gap-6 pb-12">
          {/* Appearance */}
          <View>
            <View className="mb-2 flex-row items-center gap-2">
              <Smartphone size={15} color={theme.accent} />
              <ThemedText type="caption" tone="accent">
                Appearance
              </ThemedText>
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <OptionPill label="Obsidian" hint="Dark" selected={preference === 'dark'} onPress={() => changeTheme('dark')} />
              </View>
              <View className="flex-1">
                <OptionPill label="Parchment" hint="Light" selected={preference === 'light'} onPress={() => changeTheme('light')} />
              </View>
              <View className="flex-1">
                <OptionPill label="System" hint="Device" selected={preference === 'system'} onPress={() => changeTheme('system')} />
              </View>
            </View>
          </View>

          {/* Prayer */}
          <View>
            <View className="mb-2 flex-row items-center gap-2">
              <KeyRound size={15} color={theme.accent} />
              <ThemedText type="caption" tone="accent">
                Sanctum — Prayer Settings
              </ThemedText>
            </View>
            {profile ? (
            <View
              className="rounded-xl border px-4 py-3"
              style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}
            >
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <ThemedText type="body" bold>
                    {methodLabel}
                  </ThemedText>
                  <ThemedText type="small" tone="secondary" className="mt-0.5">
                    Madhab: {madhabLabel}
                  </ThemedText>
                  <View className="mt-0.5 flex-row items-center gap-1">
                    <MapPin size={12} color={theme.textSecondary} />
                    <ThemedText type="small" tone="secondary">
                      {profile.prayerSettings.location?.label ?? 'Default (Makkah)'}
                    </ThemedText>
                  </View>
                </View>
                <Pressable
                  className="flex-row items-center gap-1.5 rounded-lg border px-3 py-2"
                  style={{
                    borderColor: profile.prayerSettings.notificationsEnabled
                      ? theme.accent
                      : theme.border,
                    backgroundColor: profile.prayerSettings.notificationsEnabled
                      ? 'transparent'
                      : theme.background,
                  }}
                  onPress={() => {
                    const next = !profile.prayerSettings.notificationsEnabled;
                    if (next) {
                      ensureNotificationPermission().catch(() => {});
                      const coords = profile.prayerSettings.location ?? DEFAULT_COORDS;
                      const times = getPrayerTimesFor(coords, new Date(), profile.prayerSettings);
                      schedulePrayerNotifications(times, true, (date) =>
                        getPrayerTimesFor(coords, date, profile.prayerSettings),
                      ).catch(() => {});
                    } else {
                      cancelScheduledPrayerNotifications().catch(() => {});
                    }
                    useUserStore.getState().patchProfile({
                      prayerSettings: { ...profile.prayerSettings, notificationsEnabled: next },
                    });
                  }}
                >
                  {profile.prayerSettings.notificationsEnabled ? (
                    <Bell size={14} color={theme.accent} />
                  ) : (
                    <BellOff size={14} color={theme.textSecondary} />
                  )}
                  <ThemedText
                    type="small"
                    bold
                    style={{
                      color: profile.prayerSettings.notificationsEnabled
                        ? theme.accent
                        : theme.textSecondary,
                    }}
                  >
                    {profile.prayerSettings.notificationsEnabled ? 'On' : 'Off'}
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          ) : null}
          </View>

          {/* Sleep */}
          <View>
            <View className="mb-2 flex-row items-center gap-2">
              <Moon size={15} color={theme.accent} />
              <ThemedText type="caption" tone="accent">
                Slumber — Sleep Target
              </ThemedText>
            </View>
            <View
              className="rounded-xl border px-4 py-3"
              style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}
            >
              <View className="flex-row items-center justify-between">
                <View className="pr-3">
                  <ThemedText type="body" bold>
                    Target sleep
                  </ThemedText>
                  <ThemedText type="caption" tone="secondary" className="mt-0.5">
                    Debt accrues below this amount.
                  </ThemedText>
                </View>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={() => setSleepTarget(Math.max(SLEEP_TARGET_MIN, sleepTarget - SLEEP_TARGET_STEP))}
                    style={{ padding: 4 }}
                  >
                    <Minus size={18} color={theme.textSecondary} />
                  </Pressable>
                  <ThemedText type="mono" tone="accent" style={{ width: 52, textAlign: 'center' }}>
                    {formatDuration(sleepTarget)}
                  </ThemedText>
                  <Pressable
                    onPress={() => setSleepTarget(Math.min(SLEEP_TARGET_MAX, sleepTarget + SLEEP_TARGET_STEP))}
                    style={{ padding: 4 }}
                  >
                    <Plus size={18} color={theme.textSecondary} />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* AI */}
          <View>
            <View className="mb-2 flex-row items-center gap-2">
              <Database size={15} color={theme.accent} />
              <ThemedText type="caption" tone="accent">
                Oracle — AI (arrives in V8)
              </ThemedText>
            </View>
            <Input
              label="OpenAI API key"
              value={apiKeyDraft}
              onChangeText={setApiKeyDraft}
              placeholder="sk-..."
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <Button
              variant="outline"
              shape="sharp"
              size="sm"
              className="mt-3 self-start"
              onPress={async () => {
                await patchProfile({
                  aiSettings: { ...profile!.aiSettings, apiKey: apiKeyDraft.trim() },
                });
                Alert.alert('Saved', 'API key stored locally on this device.');
              }}
            >
              Save Key
            </Button>
          </View>

          {/* Data */}
          <View>
            <View className="mb-2 flex-row items-center gap-2">
              <Download size={15} color={theme.accent} />
              <ThemedText type="caption" tone="accent">
                Data Sovereignty
              </ThemedText>
            </View>
            <View className="gap-2">
              <Button variant="secondary" shape="sharp" loading={exporting} onPress={onExport}>
                <Download size={16} color={theme.text} />
                Export Backup (JSON)
              </Button>
              <Button variant="secondary" shape="sharp" loading={importing} onPress={onImport}>
                <Upload size={16} color={theme.text} />
                Restore Latest Backup
              </Button>
              <Button variant="danger" shape="sharp" onPress={onReset}>
                <RotateCcw size={16} color="#fff" />
                Reset All Data
              </Button>
            </View>
            <ThemedText type="caption" tone="secondary" className="mt-3">
              Backups contain your entire realm — hero, ledger, and every module. Restoring auto-backs-up the current state first.
            </ThemedText>
          </View>

          <ThemedText type="caption" tone="secondary" className="text-center">
            GitGud — The Ascension · Local-first. No cloud.
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}