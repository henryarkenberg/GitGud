import { useState } from 'react';
import { Modal } from 'react-native';
import { X } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAppTheme } from '@/hooks/useAppTheme';
import { MEAL_OPTIONS, MEAL_QUALITY_META, MEAL_TYPES } from '@/constants/fitness';
import type { MealQuality, MealType } from '@/types';

export interface MealFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: { name: string; type: MealType; quality: MealQuality; calories?: number | null; protein?: number | null; carbs?: number | null; fat?: number | null }) => void;
}

export function MealForm({ visible, onClose, onSubmit }: MealFormProps) {
  const { theme } = useAppTheme();
  const [type, setType] = useState<MealType>('breakfast');
  const [quality, setQuality] = useState<MealQuality>('clean');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!name.trim()) {
      setError('Name the meal.');
      return;
    }
    onSubmit({
      name: name.trim(),
      type,
      quality,
      calories: calories.trim() ? Number(calories) : null,
      protein: protein.trim() ? Number(protein) : null,
      carbs: carbs.trim() ? Number(carbs) : null,
      fat: fat.trim() ? Number(fat) : null,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-t-3xl border-t" style={{ borderColor: theme.border, backgroundColor: theme.background, maxHeight: '85%', overflow: 'hidden' }}>
          <SafeAreaView edges={['bottom']} className="px-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <ThemedText type="title">Log Meal</ThemedText>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <X size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }} contentContainerClassName="pb-3">
              <View className="gap-3">
                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    MEAL TYPE
                  </ThemedText>
                  <View className="flex-row flex-wrap gap-2">
                    {MEAL_TYPES.map((t) => (
                      <Pressable
                        key={t}
                        onPress={() => setType(t)}
                        className="rounded-lg border px-3 py-1.5"
                        style={{ borderColor: type === t ? theme.borderFocus : theme.border, backgroundColor: type === t ? theme.accentSoft : theme.background }}
                      >
                        <ThemedText type="small" bold style={{ color: type === t ? theme.accent : theme.textSecondary }}>
                          {t}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    QUICK ADD
                  </ThemedText>
                  <View className="flex-row flex-wrap gap-2">
                    {MEAL_OPTIONS[type].map((o) => (
                      <Pressable
                        key={o}
                        onPress={() => setName(o)}
                        className="rounded-lg border px-3 py-1.5"
                        style={{ borderColor: name === o ? theme.borderFocus : theme.border, backgroundColor: name === o ? theme.accentSoft : theme.background }}
                      >
                        <ThemedText type="small" style={{ color: name === o ? theme.accent : theme.textSecondary }}>
                          {o}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Input label="Meal name" value={name} onChangeText={setName} placeholder="e.g. Oatmeal & fruit" />

                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    QUALITY
                  </ThemedText>
                  <View className="flex-row gap-2">
                    {(Object.keys(MEAL_QUALITY_META) as MealQuality[]).map((q) => (
                      <Pressable
                        key={q}
                        onPress={() => setQuality(q)}
                        className="flex-1 items-center rounded-lg border py-2"
                        style={{ borderColor: quality === q ? theme.borderFocus : theme.border, backgroundColor: quality === q ? theme.accentSoft : theme.background }}
                      >
                        <ThemedText type="small" bold style={{ color: quality === q ? theme.accent : theme.textSecondary, fontSize: 11 }}>
                          {MEAL_QUALITY_META[q].label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-2">
                  <View style={{ width: '48%' }}>
                    <Input label="Calories" value={calories} onChangeText={setCalories} placeholder="---" keyboardType="numeric" />
                  </View>
                  <View style={{ width: '48%' }}>
                    <Input label="Protein (g)" value={protein} onChangeText={setProtein} placeholder="---" keyboardType="numeric" />
                  </View>
                  <View style={{ width: '48%' }}>
                    <Input label="Carbs (g)" value={carbs} onChangeText={setCarbs} placeholder="---" keyboardType="numeric" />
                  </View>
                  <View style={{ width: '48%' }}>
                    <Input label="Fat (g)" value={fat} onChangeText={setFat} placeholder="---" keyboardType="numeric" />
                  </View>
                </View>

                {error ? <ThemedText type="small" tone="danger">{error}</ThemedText> : null}
              </View>
            </ScrollView>

            <View className="pb-6 pt-3">
              <Button variant="primary" size="lg" onPress={submit}>
                Log Meal
              </Button>
            </View>
          </SafeAreaView>
        </View>
      </ThemedView>
    </Modal>
  );
}
