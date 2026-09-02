import { useState } from 'react';
import { Modal } from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAppTheme } from '@/hooks/useAppTheme';
import { OBJECTIVE_DIFFICULTIES } from '@/constants/rituals';
import { STAT_META } from '@/constants/theme';
import type { Objective, ObjectiveDifficulty, StatName } from '@/types';

const DIFFICULTIES = Object.keys(OBJECTIVE_DIFFICULTIES) as ObjectiveDifficulty[];

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function Stepper({ value, onChange, min, max, label }: { value: number; onChange: (v: number) => void; min: number; max: number; label: string }) {
  const { theme } = useAppTheme();
  return (
    <View className="flex-row items-center justify-between">
      <ThemedText type="caption" tone="secondary" style={{ fontSize: 10 }}>
        {label}
      </ThemedText>
      <View className="flex-row items-center gap-2">
        <Pressable onPress={() => onChange(clamp(value - 1, min, max))} style={{ padding: 4 }}>
          <Minus size={16} color={theme.textSecondary} />
        </Pressable>
        <ThemedText type="mono" style={{ width: 36, textAlign: 'center' }}>
          {value}
        </ThemedText>
        <Pressable onPress={() => onChange(clamp(value + 1, min, max))} style={{ padding: 4 }}>
          <Plus size={16} color={theme.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

function buildDeadline(dayOffset: number, hour: number, minute: number): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  now.setDate(now.getDate() + dayOffset);
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export interface QuestFormProps {
  visible: boolean;
  initial?: Objective | null;
  onClose: () => void;
  onSubmit: (input: { title: string; description: string; deadline: string | null; difficulty: ObjectiveDifficulty; relatedStat: StatName; tags: string[] }) => void;
}

export function QuestForm({ visible, initial, onClose, onSubmit }: QuestFormProps) {
  const { theme } = useAppTheme();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [difficulty, setDifficulty] = useState<ObjectiveDifficulty>(initial?.difficulty ?? 'medium');
  const [stat, setStat] = useState<StatName>(initial?.relatedStat ?? 'focus');
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [hasDeadline, setHasDeadline] = useState(!!initial?.deadline);
  const [dayOffset, setDayOffset] = useState(() => initial?.deadline ? Math.max(0, Math.ceil((new Date(initial.deadline).getTime() - Date.now()) / (24 * 60 * 60 * 1000))) : 3);
  const [hour, setHour] = useState(() => (initial?.deadline ? new Date(initial.deadline).getHours() : 20));
  const [minute, setMinute] = useState(() => (initial?.deadline ? new Date(initial.deadline).getMinutes() : 0));
  const [error, setError] = useState('');

  const submit = () => {
    if (!title.trim()) {
      setError('Give the quest a name.');
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      deadline: hasDeadline ? buildDeadline(dayOffset, hour, minute) : null,
      difficulty,
      relatedStat: stat,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-t-3xl border-t" style={{ borderColor: theme.border, backgroundColor: theme.background, maxHeight: '85%', overflow: 'hidden' }}>
          <SafeAreaView edges={['bottom']} className="px-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <ThemedText type="title">{initial ? 'Edit Quest' : 'New Quest'}</ThemedText>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <X size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }} contentContainerClassName="pb-3">
              <View className="gap-3">
                <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Finish the project report" />
                <Input label="Description" value={description} onChangeText={setDescription} placeholder="Optional" multiline />

                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    DIFFICULTY
                  </ThemedText>
                  <View className="flex-row flex-wrap gap-2">
                    {DIFFICULTIES.map((d) => (
                      <Pressable
                        key={d}
                        onPress={() => setDifficulty(d)}
                        className="rounded-lg border px-3 py-2"
                        style={{ borderColor: difficulty === d ? theme.borderFocus : theme.border, backgroundColor: difficulty === d ? theme.accentSoft : theme.background }}
                      >
                        <ThemedText type="small" bold style={{ color: difficulty === d ? theme.accent : theme.textSecondary }}>
                          {OBJECTIVE_DIFFICULTIES[d].label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    RELATED STAT
                  </ThemedText>
                  <View className="flex-row flex-wrap gap-2">
                    {(Object.keys(STAT_META) as StatName[]).map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => setStat(s)}
                        className="rounded-lg border px-3 py-1.5"
                        style={{ borderColor: stat === s ? theme.borderFocus : theme.border, backgroundColor: stat === s ? theme.accentSoft : theme.background }}
                      >
                        <ThemedText type="small" style={{ color: stat === s ? theme.accent : theme.textSecondary }} bold={stat === s}>
                          {STAT_META[s].label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Input label="Tags (comma separated)" value={tags} onChangeText={setTags} placeholder="work, draft" />

                <Pressable onPress={() => setHasDeadline(!hasDeadline)} className="flex-row items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: hasDeadline ? theme.borderFocus : theme.border, backgroundColor: theme.background }}>
                  <ThemedText type="body" bold>
                    Set deadline
                  </ThemedText>
                  <View className="h-6 w-6 items-center justify-center rounded-full border" style={{ borderColor: hasDeadline ? theme.accent : theme.border, backgroundColor: hasDeadline ? theme.accent : 'transparent' }}>
                    {hasDeadline ? <Plus size={14} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} /> : null}
                  </View>
                </Pressable>

                {hasDeadline ? (
                  <View className="gap-2 rounded-xl border p-3" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
                    <Stepper label="Days from now" value={dayOffset} onChange={setDayOffset} min={0} max={365} />
                    <Stepper label="Hour" value={hour} onChange={setHour} min={0} max={23} />
                    <Stepper label="Minute" value={minute} onChange={setMinute} min={0} max={59} />
                  </View>
                ) : null}

                <View className="flex-row items-center justify-between">
                  <ThemedText type="small" tone="secondary">
                    Reward
                  </ThemedText>
                  <ThemedText type="mono" tone="accent">
                    {OBJECTIVE_DIFFICULTIES[difficulty].xp} XP
                  </ThemedText>
                </View>

                {error ? <ThemedText type="small" tone="danger">{error}</ThemedText> : null}
              </View>
            </ScrollView>

            <View className="pb-6 pt-3">
              <Button variant="primary" size="lg" onPress={submit}>
                {initial ? 'Save Changes' : 'Set Quest'}
              </Button>
            </View>
          </SafeAreaView>
        </View>
      </ThemedView>
    </Modal>
  );
}
