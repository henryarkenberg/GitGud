import { useState } from 'react';
import { Modal } from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAppTheme } from '@/hooks/useAppTheme';
import { EXERCISE_SUBTYPES, EXERCISE_TYPES, EXERCISE_TYPES_LIST } from '@/constants/fitness';
import type { ExerciseType } from '@/types';

export interface ExerciseFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: { type: ExerciseType; subtype: string; durationMinutes: number; distanceKm?: number | null; caloriesBurned?: number | null }) => void;
}

const QUICK: { label: string; type: ExerciseType; subtype: string; duration: number }[] = [
  { label: '5k Run', type: 'run', subtype: '5k run', duration: 30 },
  { label: 'Yoga 30m', type: 'flexibility', subtype: 'Yoga', duration: 30 },
  { label: 'Gym 45m', type: 'strength', subtype: 'Bench press', duration: 45 },
  { label: 'Walk 30m', type: 'walk', subtype: 'Brisk walk', duration: 30 },
];

export function ExerciseForm({ visible, onClose, onSubmit }: ExerciseFormProps) {
  const { theme } = useAppTheme();
  const [type, setType] = useState<ExerciseType>('run');
  const [subtype, setSubtype] = useState<string>(EXERCISE_SUBTYPES.run[0]);
  const [duration, setDuration] = useState(30);
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [error, setError] = useState('');

  const types = EXERCISE_TYPES_LIST;

  const pickType = (t: ExerciseType) => {
    setType(t);
    setSubtype(EXERCISE_SUBTYPES[t][0]);
  };

  const submit = () => {
    if (duration <= 0) {
      setError('Duration must be at least 1 minute.');
      return;
    }
    onSubmit({
      type,
      subtype,
      durationMinutes: duration,
      distanceKm: distance.trim() ? Number(distance) : null,
      caloriesBurned: calories.trim() ? Number(calories) : null,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-t-3xl border-t" style={{ borderColor: theme.border, backgroundColor: theme.background, maxHeight: '85%', overflow: 'hidden' }}>
          <SafeAreaView edges={['bottom']} className="px-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <ThemedText type="title">Log Exercise</ThemedText>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <X size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }} contentContainerClassName="pb-3">
              {/* Quick add */}
              <View className="mb-4 flex-row flex-wrap gap-2">
                {QUICK.map((q) => (
                  <Pressable
                    key={q.label}
                    onPress={() => onSubmit({ type: q.type, subtype: q.subtype, durationMinutes: q.duration })}
                    className="rounded-lg border px-3 py-2"
                    style={{ borderColor: theme.borderFocus, backgroundColor: theme.accentSoft }}
                  >
                    <ThemedText type="small" bold tone="accent">
                      {q.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <View className="gap-3">
                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    TYPE
                  </ThemedText>
                  <View className="flex-row flex-wrap gap-2">
                    {types.map((t) => (
                      <Pressable
                        key={t}
                        onPress={() => pickType(t)}
                        className="rounded-lg border px-3 py-1.5"
                        style={{ borderColor: type === t ? theme.borderFocus : theme.border, backgroundColor: type === t ? theme.accentSoft : theme.background }}
                      >
                        <ThemedText type="small" bold style={{ color: type === t ? theme.accent : theme.textSecondary }}>
                          {EXERCISE_TYPES[t].label} · {EXERCISE_TYPES[t].xp} XP
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    SUBTYPE
                  </ThemedText>
                  <View className="flex-row flex-wrap gap-2">
                    {EXERCISE_SUBTYPES[type].map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => setSubtype(s)}
                        className="rounded-lg border px-3 py-1.5"
                        style={{ borderColor: subtype === s ? theme.borderFocus : theme.border, backgroundColor: subtype === s ? theme.accentSoft : theme.background }}
                      >
                        <ThemedText type="small" style={{ color: subtype === s ? theme.accent : theme.textSecondary }}>
                          {s}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <ThemedText type="small" tone="secondary">Duration (minutes)</ThemedText>
                  <View className="flex-row items-center gap-2">
                    <Pressable onPress={() => setDuration(Math.max(5, duration - 5))} style={{ padding: 4 }}>
                      <Minus size={16} color={theme.textSecondary} />
                    </Pressable>
                    <ThemedText type="mono" tone="accent" style={{ width: 36, textAlign: 'center' }}>{duration}</ThemedText>
                    <Pressable onPress={() => setDuration(Math.min(600, duration + 5))} style={{ padding: 4 }}>
                      <Plus size={16} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                </View>

                {type === 'run' || type === 'walk' ? (
                  <Input label="Distance (km)" value={distance} onChangeText={setDistance} placeholder="Optional" keyboardType="numeric" />
                ) : null}
                <Input label="Calories burned" value={calories} onChangeText={setCalories} placeholder="Optional" keyboardType="numeric" />

                {error ? <ThemedText type="small" tone="danger">{error}</ThemedText> : null}
              </View>
            </ScrollView>

            <View className="pb-6 pt-3">
              <Button variant="primary" size="lg" onPress={submit}>
                Log Exercise
              </Button>
            </View>
          </SafeAreaView>
        </View>
      </ThemedView>
    </Modal>
  );
}
