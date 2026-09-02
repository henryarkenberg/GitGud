import { useState } from 'react';
import { Modal } from 'react-native';
import { Minus, Moon, Plus, Sun, Trash2, X } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SLEEP_QUALITY_META } from '@/constants/sleep';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSleepStore } from '@/stores/useSleepStore';
import { SleepArc } from '@/components/sleep/SleepArc';
import { SleepDebtMeter } from '@/components/sleep/SleepDebtMeter';
import { SleepHistoryChart } from '@/components/sleep/SleepHistoryChart';
import type { SleepQuality, SleepSession } from '@/types';
import { dayOffset, formatClock, formatDuration } from '@/utils/sleep';
import { todayISO } from '@/utils/id';

interface TimeParts {
  dayOffset: number;
  hour: number;
  minute: number;
}

function parseISO(iso: string): TimeParts {
  const d = new Date(iso);
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayOf = new Date(d);
  dayOf.setHours(0, 0, 0, 0);
  return {
    dayOffset: Math.min(14, Math.max(0, Math.round((dayStart.getTime() - dayOf.getTime()) / 86400000))),
    hour: d.getHours(),
    minute: d.getMinutes(),
  };
}

function buildISO(parts: TimeParts): string {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  dayStart.setDate(dayStart.getDate() - parts.dayOffset);
  const d = new Date(dayStart);
  d.setHours(parts.hour, parts.minute, 0, 0);
  return d.toISOString();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
  step,
  display,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
}) {
  const { theme } = useAppTheme();
  return (
    <View className="flex-1 flex-row items-center justify-between">
      <ThemedText type="caption" tone="secondary" style={{ fontSize: 10 }}>
        {label}
      </ThemedText>
      <View className="flex-row items-center gap-2">
        <Pressable onPress={() => onChange(clamp(value - step, min, max))} style={{ padding: 4 }}>
          <Minus size={16} color={theme.textSecondary} />
        </Pressable>
        <ThemedText type="mono" style={{ width: 72, textAlign: 'center', fontSize: 12 }}>
          {display}
        </ThemedText>
        <Pressable onPress={() => onChange(clamp(value + step, min, max))} style={{ padding: 4 }}>
          <Plus size={16} color={theme.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

function TimeInputRow({
  label,
  iso,
  onChange,
}: {
  label: string;
  iso: string;
  onChange: (iso: string) => void;
}) {
  const { theme } = useAppTheme();
  const [parts, setParts] = useState<TimeParts>(() => parseISO(iso));
  const update = (patch: Partial<TimeParts>) => {
    const next = { ...parts, ...patch };
    setParts(next);
    onChange(buildISO(next));
  };
  const dayLabel =
    parts.dayOffset === 0
      ? 'Today'
      : parts.dayOffset === 1
        ? 'Yesterday'
        : parts.dayOffset === 2
          ? '2 days ago'
          : `${parts.dayOffset} days ago`;

  return (
    <View className="gap-2 rounded-xl border p-3" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
      <ThemedText type="caption" tone="accent">
        {label}
      </ThemedText>
      <Stepper
        label="Day"
        value={parts.dayOffset}
        onChange={(v) => update({ dayOffset: v })}
        min={0}
        max={14}
        step={1}
        display={dayLabel}
      />
      <Stepper
        label="Hour"
        value={parts.hour}
        onChange={(v) => update({ hour: v })}
        min={0}
        max={23}
        step={1}
        display={`${parts.hour}`.padStart(2, '0')}
      />
      <Stepper
        label="Minute"
        value={parts.minute}
        onChange={(v) => update({ minute: v })}
        min={0}
        max={55}
        step={5}
        display={`${parts.minute}`.padStart(2, '0')}
      />
    </View>
  );
}

function QualitySelector({
  value,
  onSelect,
}: {
  value: SleepQuality | null;
  onSelect: (q: SleepQuality) => void;
}) {
  const { theme } = useAppTheme();
  return (
    <View className="flex-row flex-wrap justify-between" style={{ rowGap: 8 }}>
      {(Object.keys(SLEEP_QUALITY_META) as SleepQuality[]).map((q) => {
        const meta = SLEEP_QUALITY_META[q];
        const selected = value === q;
        return (
          <Pressable
            key={q}
            onPress={() => onSelect(q)}
            accessibilityRole="button"
            className="items-center rounded-lg border px-2 py-2"
            style={{
              width: '48%',
              borderColor: selected ? theme.borderFocus : theme.border,
              backgroundColor: selected ? theme.accentSoft : theme.background,
            }}
          >
            <ThemedText type="caption" style={{ color: selected ? theme.accent : theme.textSecondary, fontSize: 10 }}>
              {meta.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SlumberScreen() {
  const { theme } = useAppTheme();
  const sessions = useSleepStore((s) => s.sessions);
  const latestSession = useSleepStore((s) => s.latestSession);
  const debtMinutes = useSleepStore((s) => s.debtMinutes);
  const targetMinutes = useSleepStore((s) => s.targetMinutes);
  const activeSleepStart = useSleepStore((s) => s.activeSleepStart);
  const prepareForSleep = useSleepStore((s) => s.prepareForSleep);
  const markAwake = useSleepStore((s) => s.markAwake);
  const addManualSession = useSleepStore((s) => s.addManualSession);
  const updateSession = useSleepStore((s) => s.updateSession);
  const deleteSession = useSleepStore((s) => s.deleteSession);
  const setQuality = useSleepStore((s) => s.setQuality);
  const setTarget = useSleepStore((s) => s.setTarget);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SleepSession | null>(null);
  const [formNonce, setFormNonce] = useState(0);
  const [formStart, setFormStart] = useState(() =>
    buildISO({ dayOffset: 1, hour: 23, minute: 0 }),
  );
  const [formEnd, setFormEnd] = useState(() => buildISO({ dayOffset: 0, hour: 7, minute: 0 }));
  const [formQuality, setFormQuality] = useState<SleepQuality | null>(null);

  const avgMinutes =
    sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.durationMinutes, 0) / sessions.length) : 0;

  const asleep = !!activeSleepStart;
  const todayKey = todayISO();
  const todayRest = sessions
    .filter((s) => dayOffset(s.sleepEnd) === todayKey || dayOffset(s.sleepStart) === todayKey)
    .reduce((acc, s) => acc + s.durationMinutes, 0);
  const restRatio = targetMinutes > 0 ? Math.min(1, todayRest / targetMinutes) : 0;

  const openAdd = () => {
    setEditing(null);
    setFormStart(buildISO({ dayOffset: 1, hour: 23, minute: 0 }));
    setFormEnd(buildISO({ dayOffset: 0, hour: 7, minute: 0 }));
    setFormQuality(null);
    setFormNonce((n) => n + 1);
    setFormOpen(true);
  };

  const openEdit = (s: SleepSession) => {
    setEditing(s);
    setFormStart(s.sleepStart);
    setFormEnd(s.sleepEnd);
    setFormQuality(s.quality);
    setFormNonce((n) => n + 1);
    setFormOpen(true);
  };

  const saveForm = async () => {
    if (new Date(formEnd).getTime() <= new Date(formStart).getTime()) return;
    if (editing) {
      await updateSession(editing.id, {
        sleepStart: formStart,
        sleepEnd: formEnd,
        quality: formQuality ?? undefined,
      });
    } else {
      await addManualSession({ sleepStart: formStart, sleepEnd: formEnd, quality: formQuality ?? undefined });
    }
    setFormOpen(false);
  };

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4" edges={['top', 'bottom']}>
        <ScrollView contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
          <ScreenHeader title="The Slumber" subtitle="The body is the vessel of the soul" />

          {/* Current state */}
          <View
            className="mb-4 rounded-2xl border p-5"
            style={{
              borderColor: asleep ? theme.accent : theme.borderFocus,
              backgroundColor: theme.backgroundElevated,
              shadowColor: theme.accent,
              shadowOpacity: 0.12,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
          >
            <View className="mb-4 flex-row items-center gap-3">
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: asleep ? theme.accentSoft : theme.backgroundSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {asleep ? <Moon size={22} color={theme.accent} /> : <Sun size={22} color={theme.warning} />}
              </View>
              <View className="flex-1">
                <ThemedText type="title">{asleep ? 'You are asleep' : 'You are awake'}</ThemedText>
                <ThemedText type="small" tone="secondary">
                  {asleep ? `Resting since ${formatClock(activeSleepStart)}` : 'The night is yours to reclaim.'}
                </ThemedText>
              </View>
            </View>

            {asleep ? (
              <Button variant="primary" size="lg" onPress={() => markAwake()}>
                <Sun size={18} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} />
                I am awake
              </Button>
            ) : (
              <Button variant="primary" size="lg" onPress={prepareForSleep}>
                <Moon size={18} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} />
                Preparing to Sleep
              </Button>
            )}
            <ThemedText type="caption" tone="secondary" className="mt-2 text-center">
              {asleep ? 'Wake to record the night’s sleep.' : 'Sets your sleep start to 10 minutes from now.'}
            </ThemedText>
          </View>

          {/* Rest tracker */}
          <View className="mb-4 rounded-2xl border p-5" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
            <View className="mb-3 flex-row items-center justify-between">
              <ThemedText type="caption" tone="accent">REST TODAY</ThemedText>
              <ThemedText type="mono" tone="accent" style={{ fontSize: 13 }}>
                {formatDuration(todayRest)} / {formatDuration(targetMinutes)}
              </ThemedText>
            </View>
            <View className="h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: theme.background }}>
              <View style={{ width: `${restRatio * 100}%`, height: '100%', backgroundColor: theme.accent, borderRadius: 999 }} />
            </View>

            <View className="mt-4 flex-row items-center justify-between">
              <ThemedText type="small" tone="secondary">Daily target</ThemedText>
              <View className="flex-row items-center gap-2">
                <Pressable onPress={() => setTarget(clamp(targetMinutes - 30, 360, 720))} style={{ padding: 6 }}>
                  <Minus size={16} color={theme.textSecondary} />
                </Pressable>
                <ThemedText type="mono" tone="accent" style={{ width: 56, textAlign: 'center' }}>
                  {formatDuration(targetMinutes)}
                </ThemedText>
                <Pressable onPress={() => setTarget(clamp(targetMinutes + 30, 360, 720))} style={{ padding: 6 }}>
                  <Plus size={16} color={theme.textSecondary} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Quality rating for latest unrated */}
          {latestSession && latestSession.quality === null && latestSession.durationMinutes > 0 ? (
            <View
              className="mt-5 rounded-2xl border p-4"
              style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}
            >
              <ThemedText type="caption" tone="accent" className="mb-2">
                HOW DID YOU SLEEP?
              </ThemedText>
              <QualitySelector value={null} onSelect={(q) => setQuality(latestSession.id, q)} />
            </View>
          ) : null}

          {/* Debt meter */}
          <View className="mt-5">
            <SleepDebtMeter debtMinutes={debtMinutes} targetMinutes={targetMinutes} />
          </View>

          {/* Arc */}
          <View className="mt-5 items-center">
            <SleepArc session={latestSession} />
            {latestSession ? (
              <ThemedText type="small" tone="secondary" className="mt-2">
                {formatClock(latestSession.sleepStart)} → {formatClock(latestSession.sleepEnd)}
                {latestSession.quality ? ` · ${SLEEP_QUALITY_META[latestSession.quality].label}` : ''}
              </ThemedText>
            ) : null}
          </View>

          {/* History */}
          <View className="mt-5 rounded-2xl border p-4" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
            <View className="mb-3 flex-row items-center justify-between">
              <ThemedText type="caption" tone="accent">
                7-DAY PATTERN
              </ThemedText>
              <ThemedText type="caption" tone="secondary">
                Avg {formatDuration(avgMinutes)}
              </ThemedText>
            </View>
            <SleepHistoryChart sessions={sessions} targetMinutes={targetMinutes} />
          </View>

          {/* Session list */}
          <View className="mt-5">
            <SectionHeader
              title="HISTORY"
              right={
                <Button variant="ghost" shape="sharp" size="sm" onPress={openAdd}>
                  <Plus size={14} color={theme.accent} />
                  Add
                </Button>
              }
            />
            {sessions.length === 0 ? (
              <View className="rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
                <ThemedText type="small" tone="secondary">
                  No sleep recorded yet. Tap &quot;Preparing to Sleep&quot; tonight, then &quot;I am awake&quot; in the morning.
                </ThemedText>
              </View>
            ) : (
              <View className="gap-2">
                {sessions.map((s) => (
                  <View
                    key={s.id}
                    className="flex-row items-center gap-3 rounded-xl border px-4 py-3"
                    style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}
                  >
                    <View className="flex-1">
                      <ThemedText type="body" bold>
                        {formatDuration(s.durationMinutes)}
                      </ThemedText>
                      <ThemedText type="caption" tone="secondary" className="mt-0.5">
                        {formatClock(s.sleepStart)} → {formatClock(s.sleepEnd)}
                        {s.quality ? ` · ${SLEEP_QUALITY_META[s.quality].label}` : ''}
                      </ThemedText>
                    </View>
                    <Pressable onPress={() => openEdit(s)} style={{ padding: 6 }}>
                      <ThemedText type="caption" tone="accent">
                        Edit
                      </ThemedText>
                    </Pressable>
                    <Pressable onPress={() => deleteSession(s.id)} style={{ padding: 6 }}>
                      <Trash2 size={16} color={theme.danger} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Form modal */}
      <Modal visible={formOpen} transparent animationType="slide" onRequestClose={() => setFormOpen(false)}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className="rounded-t-3xl border-t px-5 pt-5"
            style={{ borderColor: theme.border, backgroundColor: theme.background, maxHeight: '85%', overflow: 'hidden' }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <ThemedText type="title">{editing ? 'Edit Session' : 'Add Past Sleep'}</ThemedText>
              <Pressable onPress={() => setFormOpen(false)} style={{ padding: 4 }}>
                <X size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }} contentContainerClassName="pb-3">
              <TimeInputRow key={`start-${formNonce}`} label="Fell asleep" iso={formStart} onChange={setFormStart} />
              <View className="h-3" />
              <TimeInputRow key={`end-${formNonce}`} label="Woke up" iso={formEnd} onChange={setFormEnd} />

              <View className="mt-5">
                <ThemedText type="caption" tone="secondary" className="mb-1.5">
                  QUALITY
                </ThemedText>
                <QualitySelector value={formQuality} onSelect={setFormQuality} />
              </View>

              {new Date(formEnd).getTime() <= new Date(formStart).getTime() ? (
                <ThemedText type="small" tone="danger" className="mt-3">
                  Wake time must be after fall-asleep time.
                </ThemedText>
              ) : null}
            </ScrollView>

            <View className="pb-6 pt-3">
              <Button variant="primary" size="lg" onPress={saveForm}>
                Save Session
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
