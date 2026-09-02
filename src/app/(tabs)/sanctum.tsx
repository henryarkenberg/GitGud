import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, useWindowDimensions } from 'react-native';
import { Flame, ListChecks, Plus, X } from 'lucide-react-native';

import { View, SafeAreaView, ScrollView, Pressable } from '@/components/tw';
import { PrayerCard } from '@/components/prayers/PrayerCard';
import { PrayerConfirmModal } from '@/components/prayers/PrayerConfirmModal';
import { ExtraPrayerModal } from '@/components/prayers/ExtraPrayerModal';
import { SunriseGauge } from '@/components/prayers/SunriseGauge';
import { QadaQueue } from '@/components/prayers/QadaQueue';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { PRAYER_META } from '@/constants/prayers';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { usePrayerStore } from '@/stores/usePrayerStore';
import type { PrayerName, PrayerStatus } from '@/types';
import { formatHeroTime, getPrayerCountdown, prayerGauge, prayerSlotsFor, type PrayerTimesMap } from '@/utils/prayerTimes';

interface ConfirmState {
  name: PrayerName;
  status: PrayerStatus;
  started: boolean;
}

export default function SanctumScreen() {
  const { theme } = useAppTheme();
  const { times, loading, locationLabel } = usePrayerTimes();
  const records = usePrayerStore((state) => state.records);
  const qada = usePrayerStore((state) => state.qada);
  const hydrate = usePrayerStore((state) => state.hydrate);
  const completeQada = usePrayerStore((state) => state.completeQada);
  const completeAllQada = usePrayerStore((state) => state.completeAllQada);
  const reconcile = usePrayerStore((state) => state.reconcile);
  const [now, setNow] = useState(() => Date.now());
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [extraOpen, setExtraOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);

  const effectTimes = times;
  useEffect(() => {
    if (!effectTimes) return;
    hydrate(effectTimes);
    reconcile(effectTimes);
    const interval = setInterval(() => {
      setNow(Date.now());
      reconcile(effectTimes);
    }, 60_000);
    return () => clearInterval(interval);
  }, [effectTimes, hydrate, reconcile]);

  const statusFor = (name: PrayerName): PrayerStatus => records.find((r) => r.name === name)?.status ?? 'pending';
  const countdown = times ? getPrayerCountdown(new Date(now), times) : null;
  const gauge = times ? prayerGauge(new Date(now), times) : null;
  const screenW = useWindowDimensions().width;

  const openConfirm = (name: PrayerName, time: number) => {
    setConfirm({ name, status: statusFor(name), started: now >= time });
  };

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="mb-5 px-4">
            <ThemedText type="caption" tone="accent">
              THE SOUL&apos;S COMPASS
            </ThemedText>
            <ThemedText type="display" className="mt-0.5">
              The Sanctum
            </ThemedText>
            <ThemedText type="small" tone="secondary" className="mt-1">
              {times ? `${locationLabel ?? 'Auto-located'} · ${records.filter((r) => r.status === 'pending').length} remaining` : loading ? 'Locating the horizon…' : 'Times unavailable'}
            </ThemedText>
          </View>

          {!times ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator color={theme.accent} />
              <ThemedText type="small" tone="secondary" className="mt-3">
                {loading ? 'Calculating prayer times…' : 'Open Settings to review prayer calculation.'}
              </ThemedText>
            </View>
          ) : (
            <View className="px-4">
              {/* Countdown hero */}
              {countdown ? (
                <View
                  style={{
                    position: 'relative',
                    marginBottom: 24,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: theme.accent,
                    backgroundColor: theme.backgroundElevated,
                    overflow: 'hidden',
                    height: 148,
                    shadowColor: theme.accent,
                    shadowOpacity: 0.14,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: 5 },
                    elevation: 4,
                  }}
                >
                  <View style={{ position: 'absolute', left: 20, top: '50%', transform: [{ translateY: -26 }], right: 182 }}>
                    {countdown.kind === 'time' ? (
                      <>
                        <ThemedText type="display" tone="accent" numberOfLines={1} adjustsFontSizeToFit>
                          It&apos;s {PRAYER_META[countdown.prayer].label}
                        </ThemedText>
                        <ThemedText type="small" tone="secondary" className="mt-0.5">
                          prayer time — the moment is now
                        </ThemedText>
                      </>
                    ) : (
                      <>
                        <ThemedText type="display" tone="accent" numberOfLines={1} adjustsFontSizeToFit>
                          {formatHeroTime(countdown.ms)}
                        </ThemedText>
                        <ThemedText type="small" tone="secondary" className="mt-0.5">
                          {countdown.kind === 'qaza' ? `remaining until Qaza · ${PRAYER_META[countdown.prayer].label}` : `until ${PRAYER_META[countdown.prayer].label}`}
                        </ThemedText>
                      </>
                    )}
                  </View>
                  <View style={{ position: 'absolute', right: 12, bottom: 0 }}>
                    <SunriseGauge width={168} progress={gauge?.progress ?? 0} qada={gauge?.qada ?? 0} />
                  </View>
                </View>
              ) : null}

              {/* Prayer cards — carousel with spacing */}
              <ScrollView
                horizontal
                decelerationRate="fast"
                snapToInterval={screenW - 80 + 16}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              >
                {prayerSlotsFor(times).map((slot) => (
                  <View key={slot.name} style={{ width: screenW - 80, marginRight: 16 }}>
                    <PrayerCard
                      name={slot.name}
                      time={slot.time}
                      windowEnd={slot.windowEnd}
                      status={statusFor(slot.name)}
                      now={new Date(now)}
                      width={screenW - 80}
                      onPress={() => openConfirm(slot.name, slot.time.getTime())}
                    />
                  </View>
                ))}
              </ScrollView>

              {/* Extra prayers */}
              <Button variant="outline" shape="sharp" className="mt-4 self-start" onPress={() => setExtraOpen(true)}>
                <Plus size={16} color={theme.accent} />
                <Flame size={16} color={theme.accent} />
                Pray Extra (Nafl & Sunnah)
              </Button>

              {/* Queue */}
              <Button
                variant="secondary"
                shape="sharp"
                className="mt-2 self-start"
                onPress={() => setQueueOpen(true)}
              >
                <ListChecks size={16} color={theme.text} />
                Missed Queue ({qada.length})
              </Button>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <PrayerConfirmModal
        visible={confirm !== null}
        name={confirm?.name ?? null}
        status={confirm?.status ?? null}
        started={confirm?.started ?? false}
        now={new Date(now)}
        times={times as PrayerTimesMap}
        onClose={() => setConfirm(null)}
      />
      <ExtraPrayerModal visible={extraOpen} onClose={() => setExtraOpen(false)} />

      {/* Queue modal */}
      <Modal visible={queueOpen} transparent animationType="slide" onRequestClose={() => setQueueOpen(false)}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <View className="rounded-t-3xl border-t p-5 pb-8" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
            <SafeAreaView edges={['bottom']}>
              <View className="mb-4 flex-row items-center justify-between">
                <ThemedText type="title">The Queue</ThemedText>
                <Pressable onPress={() => setQueueOpen(false)} style={{ padding: 4 }}>
                  <X size={20} color={theme.textSecondary} />
                </Pressable>
              </View>
              <QadaQueue items={qada} onComplete={completeQada} onCompleteAll={completeAllQada} />
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
