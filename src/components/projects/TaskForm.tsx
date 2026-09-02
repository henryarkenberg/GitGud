import { useState } from 'react';
import { Modal } from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { HabitRepeatPattern, ProjectTaskType } from '@/types';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DATES = Array.from({ length: 31 }, (_, i) => i + 1);
const REPEATS: ProjectTaskType[] = ['once', 'recurring'];

export interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: { title: string; type: ProjectTaskType; repeatPattern: HabitRepeatPattern; deadline: string | null; xpReward: number }) => void;
}

export function TaskForm({ visible, onClose, onSubmit }: TaskFormProps) {
  const { theme } = useAppTheme();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ProjectTaskType>('once');
  const [repeat, setRepeat] = useState<'daily' | 'weekly' | 'monthly' | 'interval'>('daily');
  const [weekly, setWeekly] = useState<number[]>([]);
  const [monthly, setMonthly] = useState<number[]>([]);
  const [everyDays, setEveryDays] = useState(2);
  const [xp, setXp] = useState(10);
  const [delayDays, setDelayDays] = useState(0);
  const [error, setError] = useState('');

  const toggleIn = (list: number[], v: number, set: (l: number[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const pattern = (): HabitRepeatPattern => {
    switch (repeat) {
      case 'daily':
        return { type: 'daily' };
      case 'weekly':
        return { type: 'weekly', days: weekly };
      case 'monthly':
        return { type: 'monthly', dates: monthly };
      case 'interval':
        return { type: 'interval', everyDays };
    }
  };

  const deadline = ((): string | null => {
    if (type !== 'once') return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    now.setDate(now.getDate() + delayDays);
    const d = new Date(now);
    d.setHours(20, 0, 0, 0);
    return d.toISOString();
  })();

  const submit = () => {
    if (!title.trim()) {
      setError('Name the task.');
      return;
    }
    if (type === 'recurring' && repeat === 'weekly' && weekly.length === 0) {
      setError('Pick at least one day.');
      return;
    }
    if (type === 'recurring' && repeat === 'monthly' && monthly.length === 0) {
      setError('Pick at least one date.');
      return;
    }
    onSubmit({ title: title.trim(), type, repeatPattern: type === 'recurring' ? pattern() : { type: 'daily' }, deadline, xpReward: xp });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-t-3xl border-t" style={{ borderColor: theme.border, backgroundColor: theme.background, maxHeight: '85%', overflow: 'hidden' }}>
          <SafeAreaView edges={['bottom']} className="px-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <ThemedText type="title">New Task</ThemedText>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <X size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }} contentContainerClassName="pb-3">
              <View className="gap-3">
                <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Draft the intro" />

                <View className="flex-row gap-2">
                  {REPEATS.map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setType(t)}
                      className="flex-1 items-center rounded-lg border py-2"
                      style={{ borderColor: type === t ? theme.borderFocus : theme.border, backgroundColor: type === t ? theme.accentSoft : theme.background }}
                    >
                      <ThemedText type="small" bold style={{ color: type === t ? theme.accent : theme.textSecondary }}>
                        {t}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>

                {type === 'recurring' ? (
                  <>
                    <View>
                      <ThemedText type="caption" tone="secondary" className="mb-1.5">
                        REPEATS
                      </ThemedText>
                      <View className="flex-row flex-wrap gap-2">
                        {(['daily', 'weekly', 'monthly', 'interval'] as const).map((r) => (
                          <Pressable
                            key={r}
                            onPress={() => setRepeat(r)}
                            className="rounded-lg border px-3 py-1.5"
                            style={{ borderColor: repeat === r ? theme.borderFocus : theme.border, backgroundColor: repeat === r ? theme.accentSoft : theme.background }}
                          >
                            <ThemedText type="small" bold style={{ color: repeat === r ? theme.accent : theme.textSecondary }}>
                              {r}
                            </ThemedText>
                          </Pressable>
                        ))}
                      </View>
                    </View>

                    {repeat === 'weekly' ? (
                      <View className="flex-row justify-between">
                        {DOW.map((label, i) => (
                          <Pressable
                            key={i}
                            onPress={() => toggleIn(weekly, i, setWeekly)}
                            className="h-9 w-9 items-center justify-center rounded-lg border"
                            style={{ borderColor: weekly.includes(i) ? theme.borderFocus : theme.border, backgroundColor: weekly.includes(i) ? theme.accentSoft : theme.background }}
                          >
                            <ThemedText type="small" bold style={{ color: weekly.includes(i) ? theme.accent : theme.textSecondary }}>
                              {label}
                            </ThemedText>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}

                    {repeat === 'monthly' ? (
                      <View className="flex-row flex-wrap gap-2">
                        {DATES.map((d) => (
                          <Pressable
                            key={d}
                            onPress={() => toggleIn(monthly, d, setMonthly)}
                            className="h-9 w-9 items-center justify-center rounded-lg border"
                            style={{ borderColor: monthly.includes(d) ? theme.borderFocus : theme.border, backgroundColor: monthly.includes(d) ? theme.accentSoft : theme.background }}
                          >
                            <ThemedText type="small" style={{ color: monthly.includes(d) ? theme.accent : theme.textSecondary }}>
                              {d}
                            </ThemedText>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}

                    {repeat === 'interval' ? (
                      <View className="flex-row items-center justify-between">
                        <ThemedText type="small" tone="secondary">Every</ThemedText>
                        <View className="flex-row items-center gap-2">
                          <Pressable onPress={() => setEveryDays(Math.max(1, everyDays - 1))} style={{ padding: 4 }}>
                            <Minus size={16} color={theme.textSecondary} />
                          </Pressable>
                          <ThemedText type="mono" style={{ width: 28, textAlign: 'center' }}>{everyDays}</ThemedText>
                          <Pressable onPress={() => setEveryDays(Math.min(365, everyDays + 1))} style={{ padding: 4 }}>
                            <Plus size={16} color={theme.textSecondary} />
                          </Pressable>
                        </View>
                        <ThemedText type="small" tone="secondary">day(s)</ThemedText>
                      </View>
                    ) : null}
                  </>
                ) : (
                  <View className="flex-row items-center justify-between">
                    <ThemedText type="small" tone="secondary">Due in</ThemedText>
                    <View className="flex-row items-center gap-2">
                      <Pressable onPress={() => setDelayDays(Math.max(0, delayDays - 1))} style={{ padding: 4 }}>
                        <Minus size={16} color={theme.textSecondary} />
                      </Pressable>
                      <ThemedText type="mono" style={{ width: 28, textAlign: 'center' }}>{delayDays}</ThemedText>
                      <Pressable onPress={() => setDelayDays(Math.min(365, delayDays + 1))} style={{ padding: 4 }}>
                        <Plus size={16} color={theme.textSecondary} />
                      </Pressable>
                    </View>
                    <ThemedText type="small" tone="secondary">day(s)</ThemedText>
                  </View>
                )}

                <View className="flex-row items-center justify-between">
                  <ThemedText type="small" tone="secondary">XP reward</ThemedText>
                  <View className="flex-row items-center gap-2">
                    <Pressable onPress={() => setXp(Math.max(0, xp - 5))} style={{ padding: 4 }}>
                      <Minus size={16} color={theme.textSecondary} />
                    </Pressable>
                    <ThemedText type="mono" tone="accent" style={{ width: 32, textAlign: 'center' }}>{xp}</ThemedText>
                    <Pressable onPress={() => setXp(Math.min(500, xp + 5))} style={{ padding: 4 }}>
                      <Plus size={16} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                </View>

                {error ? <ThemedText type="small" tone="danger">{error}</ThemedText> : null}
              </View>
            </ScrollView>

            <View className="pb-6 pt-3">
              <Button variant="primary" size="lg" onPress={submit}>
                Add Task
              </Button>
            </View>
          </SafeAreaView>
        </View>
      </ThemedView>
    </Modal>
  );
}
