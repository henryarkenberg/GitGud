import { useState } from 'react';
import { Modal } from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAppTheme } from '@/hooks/useAppTheme';
import { HABIT_COLORS, HABIT_ICON_NAMES, HABIT_ICONS, HABIT_XP_BASE_DEFAULT } from '@/constants/rituals';
import { STAT_META } from '@/constants/theme';
import type { Habit, HabitRepeatPattern, StatName } from '@/types';
import { formatRepeatPattern } from '@/utils/rituals';

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_DATES = Array.from({ length: 31 }, (_, i) => i + 1);
const REPEAT_TYPES = ['daily', 'weekly', 'monthly', 'interval', 'custom'] as const;
type RepeatType = (typeof REPEAT_TYPES)[number];

export interface HabitFormProps {
  visible: boolean;
  initial?: Habit | null;
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    description: string;
    repeatPattern: HabitRepeatPattern;
    relatedStat: StatName;
    baseXp: number;
    color: string;
    icon: string;
  }) => void;
}

export function HabitForm({ visible, initial, onClose, onSubmit }: HabitFormProps) {
  const { theme } = useAppTheme();
  const initPattern = initial?.repeatPattern;
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [color, setColor] = useState(initial?.color ?? HABIT_COLORS[0]);
  const [icon, setIcon] = useState(initial?.icon ?? 'flame');
  const [stat, setStat] = useState<StatName>(initial?.relatedStat ?? 'discipline');
  const [baseXp, setBaseXp] = useState(initial?.baseXp ?? HABIT_XP_BASE_DEFAULT);
  const [repeatType, setRepeatType] = useState<RepeatType>(initPattern?.type ?? 'daily');
  const [days, setDays] = useState<number[]>(initPattern?.type === 'weekly' ? initPattern.days : []);
  const [dates, setDates] = useState<number[]>(initPattern?.type === 'monthly' ? initPattern.dates : []);
  const [everyDays, setEveryDays] = useState(initPattern?.type === 'interval' ? initPattern.everyDays : 2);
  const [rule, setRule] = useState(initPattern?.type === 'custom' ? initPattern.rule : '');
  const [error, setError] = useState('');

  const Icon = HABIT_ICONS[icon] ?? HABIT_ICONS.flame;

  const toggleIn = (list: number[], v: number, set: (l: number[]) => void) => {
    if (list.includes(v)) set(list.filter((x) => x !== v));
    else set([...list, v]);
  };

  const buildPattern = (): HabitRepeatPattern | null => {
    switch (repeatType) {
      case 'daily':
        return { type: 'daily' };
      case 'weekly': {
        if (days.length === 0) return null;
        return { type: 'weekly', days: [...days].sort((a, b) => a - b) };
      }
      case 'monthly': {
        if (dates.length === 0) return null;
        return { type: 'monthly', dates: [...dates].sort((a, b) => a - b) };
      }
      case 'interval':
        return { type: 'interval', everyDays: Math.max(1, everyDays) };
      case 'custom':
        return { type: 'custom', rule: rule.trim() };
    }
  };

  const submit = () => {
    if (!title.trim()) {
      setError('Give the ritual a name.');
      return;
    }
    const pattern = buildPattern();
    if (!pattern) {
      setError('Pick at least one day or date for the schedule.');
      return;
    }
    onSubmit({ title: title.trim(), description: description.trim(), repeatPattern: pattern, relatedStat: stat, baseXp, color, icon });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-t-3xl border-t" style={{ borderColor: theme.border, backgroundColor: theme.background, maxHeight: '85%', overflow: 'hidden' }}>
          <SafeAreaView edges={['bottom']} className="px-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <ThemedText type="title">{initial ? 'Edit Ritual' : 'New Ritual'}</ThemedText>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <X size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }} contentContainerClassName="pb-3">
              <View className="gap-3">
                <Input label="Name" value={title} onChangeText={setTitle} placeholder="e.g. Morning prayer" />
                <Input label="Description" value={description} onChangeText={setDescription} placeholder="Optional" multiline />

                {/* Icon + color */}
                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    ICON
                  </ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {HABIT_ICON_NAMES.map((name) => {
                        const IC = HABIT_ICONS[name];
                        const selected = name === icon;
                        return (
                          <Pressable
                            key={name}
                            onPress={() => setIcon(name)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: selected ? color : theme.border,
                              backgroundColor: selected ? theme.accentSoft : theme.background,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IC size={16} color={selected ? color : theme.textSecondary} />
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>

                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    COLOR
                  </ThemedText>
                  <View className="flex-row flex-wrap gap-2">
                    {HABIT_COLORS.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => setColor(c)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: c,
                          borderWidth: color === c ? 2 : 0,
                          borderColor: theme.text,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {color === c ? <Icon size={14} color="#FFFFFF" /> : null}
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Stat */}
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
                        style={{
                          borderColor: stat === s ? theme.borderFocus : theme.border,
                          backgroundColor: stat === s ? theme.accentSoft : theme.background,
                        }}
                      >
                        <ThemedText type="small" style={{ color: stat === s ? theme.accent : theme.textSecondary }} bold={stat === s}>
                          {STAT_META[s].label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Repeat pattern */}
                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    REPEATS
                  </ThemedText>
                  <View className="flex-row flex-wrap gap-2">
                    {REPEAT_TYPES.map((t) => (
                      <Pressable
                        key={t}
                        onPress={() => setRepeatType(t)}
                        className="rounded-lg border px-3 py-1.5"
                        style={{ borderColor: repeatType === t ? theme.borderFocus : theme.border, backgroundColor: repeatType === t ? theme.accentSoft : theme.background }}
                      >
                        <ThemedText type="small" bold style={{ color: repeatType === t ? theme.accent : theme.textSecondary }}>
                          {t}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {repeatType === 'weekly' ? (
                  <View className="flex-row justify-between">
                    {DAY_NAMES.map((label, i) => (
                      <Pressable
                        key={i}
                        onPress={() => toggleIn(days, i, setDays)}
                        className="h-9 w-9 items-center justify-center rounded-lg border"
                        style={{ borderColor: days.includes(i) ? theme.borderFocus : theme.border, backgroundColor: days.includes(i) ? theme.accentSoft : theme.background }}
                      >
                        <ThemedText type="small" bold style={{ color: days.includes(i) ? theme.accent : theme.textSecondary }}>
                          {label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                ) : null}

                {repeatType === 'monthly' ? (
                  <View className="flex-row flex-wrap gap-2">
                    {MONTH_DATES.map((d) => (
                      <Pressable
                        key={d}
                        onPress={() => toggleIn(dates, d, setDates)}
                        className="h-9 w-9 items-center justify-center rounded-lg border"
                        style={{ borderColor: dates.includes(d) ? theme.borderFocus : theme.border, backgroundColor: dates.includes(d) ? theme.accentSoft : theme.background }}
                      >
                        <ThemedText type="small" style={{ color: dates.includes(d) ? theme.accent : theme.textSecondary }}>
                          {d}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                ) : null}

                {repeatType === 'interval' ? (
                  <View className="flex-row items-center justify-between">
                    <ThemedText type="small" tone="secondary">
                      Every
                    </ThemedText>
                    <View className="flex-row items-center gap-2">
                      <Pressable onPress={() => setEveryDays(Math.max(1, everyDays - 1))} style={{ padding: 4 }}>
                        <Minus size={16} color={theme.textSecondary} />
                      </Pressable>
                      <ThemedText type="mono" style={{ width: 28, textAlign: 'center' }}>
                        {everyDays}
                      </ThemedText>
                      <Pressable onPress={() => setEveryDays(Math.min(365, everyDays + 1))} style={{ padding: 4 }}>
                        <Plus size={16} color={theme.textSecondary} />
                      </Pressable>
                    </View>
                    <ThemedText type="small" tone="secondary">
                      day(s)
                    </ThemedText>
                  </View>
                ) : null}

                {repeatType === 'custom' ? (
                  <Input label="Rule (e.g. dow:mon,wed, fri)" value={rule} onChangeText={setRule} placeholder="every:2 · dow:mon,tue" />
                ) : null}

                {/* Base XP */}
                <View className="flex-row items-center justify-between">
                  <ThemedText type="small" tone="secondary">
                    XP per completion
                  </ThemedText>
                  <View className="flex-row items-center gap-2">
                    <Pressable onPress={() => setBaseXp(Math.max(1, baseXp - 5))} style={{ padding: 4 }}>
                      <Minus size={16} color={theme.textSecondary} />
                    </Pressable>
                    <ThemedText type="mono" tone="accent" style={{ width: 32, textAlign: 'center' }}>
                      {baseXp}
                    </ThemedText>
                    <Pressable onPress={() => setBaseXp(Math.min(500, baseXp + 5))} style={{ padding: 4 }}>
                      <Plus size={16} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                </View>

                <ThemedText type="caption" tone="secondary">
                  {formatRepeatPattern(buildPattern() ?? { type: 'daily' })}
                </ThemedText>

                {error ? <ThemedText type="small" tone="danger">{error}</ThemedText> : null}
              </View>
            </ScrollView>

            <View className="pb-6 pt-3">
              <Button variant="primary" size="lg" onPress={submit}>
                {initial ? 'Save Changes' : 'Forge Ritual'}
              </Button>
            </View>
          </SafeAreaView>
        </View>
      </ThemedView>
    </Modal>
  );
}
