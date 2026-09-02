import { Modal } from 'react-native';
import { Check, RotateCcw, X } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { PRAYER_META, XP_PRAYER_LATE, XP_PRAYER_ON_TIME, XP_PRAYER_QADA } from '@/constants/prayers';
import { usePrayerStore } from '@/stores/usePrayerStore';
import type { PrayerName, PrayerStatus } from '@/types';
import { todayISO } from '@/utils/id';
import { windowEndFor, type PrayerTimesMap } from '@/utils/prayerTimes';
import { formatClock } from '@/utils/sleep';

export interface PrayerConfirmModalProps {
  visible: boolean;
  name: PrayerName | null;
  status: PrayerStatus | null;
  started: boolean;
  now: Date;
  times: PrayerTimesMap;
  onClose: () => void;
}

export function PrayerConfirmModal({ visible, name, status, started, now, times, onClose }: PrayerConfirmModalProps) {
  const { theme } = useAppTheme();
  const markPrayed = usePrayerStore((s) => s.markPrayed);
  const completeQada = usePrayerStore((s) => s.completeQada);
  const unpray = usePrayerStore((s) => s.unpray);

  const meta = name ? PRAYER_META[name] : null;
  const color = meta?.color ?? theme.accent;

  if (!name || !status || !meta) return null;

  const isQada = status === 'missed';
  const isPrayed = status === 'on-time' || status === 'late';
  const notYet = status === 'pending' && !started;
  const onTime = isPrayed ? status === 'on-time' : now.getTime() <= windowEndFor(name, times).getTime();
  const xp = isQada ? XP_PRAYER_QADA : isPrayed ? (status === 'on-time' ? XP_PRAYER_ON_TIME : XP_PRAYER_LATE) : onTime ? XP_PRAYER_ON_TIME : XP_PRAYER_LATE;
  const faith = isQada ? 1 : status === 'on-time' ? 2 : 1;

  const confirmPray = async () => {
    if (isQada) {
      const q = usePrayerStore.getState().qada.find((r) => r.prayerName === name && r.originalDate === todayISO());
      if (q) await completeQada(q.id);
    } else if (status === 'pending') {
      await markPrayed(name, times);
    }
    onClose();
  };

  const confirmUndo = async () => {
    await unpray(name);
    onClose();
  };

  const message = notYet
    ? `It is not the time for ${meta.label} yet. It begins at ${formatClock(times[name].toISOString())}.`
    : isQada
      ? `You missed ${meta.label}. Pray it now as Qada to clear it from your queue.`
      : isPrayed
        ? `You recorded ${meta.label} as ${status === 'on-time' ? 'on time' : 'late'}. Undo this?`
        : `Confirm you have prayed ${meta.label} now.`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
        <View className="w-full rounded-3xl border p-6" style={{ borderColor: color, backgroundColor: theme.backgroundElevated }}>
          <View className="mb-4 flex-row items-center gap-3">
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: `${color}26`, alignItems: 'center', justifyContent: 'center' }}>
              <meta.icon size={24} color={color} />
            </View>
            <View className="flex-1">
              <ThemedText type="title" style={{ color }}>{meta.label}</ThemedText>
              <ThemedText type="caption" tone="secondary">{meta.subtitle}</ThemedText>
            </View>
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <X size={18} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ThemedText type="small" tone="secondary" className="mb-4">
            {meta.reason}
          </ThemedText>

          <View className="mb-4 rounded-xl border px-4 py-3" style={{ borderColor: color, backgroundColor: `${color}1a` }}>
            <ThemedText type="caption" tone="accent">{isPrayed ? 'RECORDED' : 'REWARD'}</ThemedText>
            <ThemedText type="mono" tone="accent" style={{ fontSize: 18 }}>
              +{xp} XP · +{faith} Faith
            </ThemedText>
          </View>

          <ThemedText type="body" className="mb-4">
            {message}
          </ThemedText>

          {notYet ? (
            <Pressable onPress={onClose} className="items-center rounded-xl py-3" style={{ backgroundColor: theme.backgroundSecondary }}>
              <ThemedText type="body" bold>Close</ThemedText>
            </Pressable>
          ) : isPrayed ? (
            <View className="flex-row gap-3">
              <Pressable onPress={onClose} className="flex-1 items-center rounded-xl py-3" style={{ backgroundColor: theme.backgroundSecondary }}>
                <ThemedText type="body" bold>Close</ThemedText>
              </Pressable>
              <Pressable onPress={confirmUndo} className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3" style={{ backgroundColor: theme.accent }}>
                <RotateCcw size={16} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} />
                <ThemedText type="body" bold style={{ color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' }}>
                  Undo Prayer
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row gap-3">
              <Pressable onPress={onClose} className="flex-1 items-center rounded-xl py-3" style={{ backgroundColor: theme.backgroundSecondary }}>
                <ThemedText type="body" bold>Cancel</ThemedText>
              </Pressable>
              <Pressable onPress={confirmPray} className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3" style={{ backgroundColor: color }}>
                <Check size={16} color="#FFFFFF" />
                <ThemedText type="body" bold style={{ color: '#FFFFFF' }}>
                  {isQada ? 'Pray it' : 'I prayed'}
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
