import { useState } from 'react';
import { Dumbbell, Salad, Trash2, type LucideIcon } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFitnessStore } from '@/stores/useFitnessStore';
import { ActivityRing } from '@/components/fitness/ActivityRing';
import { BodyDiagram } from '@/components/fitness/BodyDiagram';
import { WaterTracker } from '@/components/fitness/WaterTracker';
import { ExerciseForm } from '@/components/fitness/ExerciseForm';
import { MealForm } from '@/components/fitness/MealForm';
import { EXERCISE_TYPES, MEAL_QUALITY_META, WATER_GOAL } from '@/constants/fitness';
import { formatDuration } from '@/utils/sleep';

function dayKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function ActionTile({
  icon: Icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.backgroundElevated,
        padding: 16,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      })}
    >
      <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: `${color}26`, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </View>
      <ThemedText type="body" bold className="mt-3">
        {title}
      </ThemedText>
      <ThemedText type="caption" tone="secondary" className="mt-0.5">
        {subtitle}
      </ThemedText>
    </Pressable>
  );
}

export default function VesselScreen() {
  const { theme } = useAppTheme();
  const exercises = useFitnessStore((s) => s.exercises);
  const meals = useFitnessStore((s) => s.meals);
  const daily = useFitnessStore((s) => s.daily);
  const addWater = useFitnessStore((s) => s.addWater);
  const resetWater = useFitnessStore((s) => s.resetWater);
  const logExercise = useFitnessStore((s) => s.logExercise);
  const logMeal = useFitnessStore((s) => s.logMeal);
  const deleteExercise = useFitnessStore((s) => s.deleteExercise);
  const deleteMeal = useFitnessStore((s) => s.deleteMeal);

  const [exOpen, setExOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);

  const today = dayKey(new Date());
  const todayEx = exercises.filter((e) => e.date === today);
  const todayMeals = meals.filter((m) => m.date === today);
  const exMinutes = todayEx.reduce((a, e) => a + e.durationMinutes, 0);
  const calOut = todayEx.reduce((a, e) => a + (e.caloriesBurned ?? 0), 0);
  const calIn = todayMeals.reduce((a, m) => a + (m.calories ?? 0), 0);
  const water = daily?.waterGlasses ?? 0;

  // 7-day exercise minutes
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = dayKey(d);
    const minutes = exercises.filter((e) => e.date === key).reduce((a, e) => a + e.durationMinutes, 0);
    return { key, minutes, weekday: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d).slice(0, 2) };
  });
  const maxEx = Math.max(60, ...days.map((d) => d.minutes));

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4" edges={['top', 'bottom']}>
        <ScrollView contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
          <ScreenHeader title="The Vessel" subtitle="The body is a temple. Treat it so." />

          {/* Rings */}
          <View className="mb-5 flex-row justify-between rounded-2xl border p-4" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
            <ActivityRing label="Exercise" value={exMinutes} goal={30} color={theme.success} display={`${exMinutes}m`} />
            <ActivityRing label="Hydration" value={water} goal={WATER_GOAL} color={theme.info} />
            <ActivityRing label="Meals" value={todayMeals.length} goal={3} color={theme.warning} />
          </View>

          {/* Quick actions */}
          <View className="mb-5 flex-row gap-3">
            <ActionTile icon={Dumbbell} title="Log Exercise" subtitle="Strength · cardio · sport" color={theme.success} onPress={() => setExOpen(true)} />
            <ActionTile icon={Salad} title="Log Meal" subtitle="Fuel the temple" color={theme.warning} onPress={() => setMealOpen(true)} />
          </View>

          <View className="mb-5">
            <WaterTracker glasses={water} onAdd={addWater} onReset={resetWater} />
          </View>

          {/* Calorie in/out */}
          <View className="mb-5 flex-row gap-2">
            <View className="flex-1 rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
              <ThemedText type="caption" tone="secondary">CALORIES IN</ThemedText>
              <ThemedText type="title" tone="warning" className="mt-1">{calIn}</ThemedText>
            </View>
            <View className="flex-1 rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
              <ThemedText type="caption" tone="secondary">CALORIES OUT</ThemedText>
              <ThemedText type="title" tone="success" className="mt-1">{calOut}</ThemedText>
            </View>
          </View>

          {/* 7-day history */}
          <View className="mb-5 rounded-2xl border p-4" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
            <ThemedText type="caption" tone="accent" className="mb-3">7-DAY ACTION</ThemedText>
            <View className="flex-row items-end justify-between" style={{ height: 64 }}>
              {days.map((d) => (
                <View key={d.key} className="flex-1 items-center">
                  <ThemedText type="caption" tone="secondary" style={{ fontSize: 8 }}>{d.minutes > 0 ? `${d.minutes}m` : ''}</ThemedText>
                  <View className="mt-1 w-6 rounded-t-sm" style={{ height: Math.max(6, (d.minutes / maxEx) * 44), backgroundColor: d.minutes > 0 ? theme.info : theme.textSecondary, opacity: d.minutes > 0 ? 0.9 : 0.2 }} />
                </View>
              ))}
            </View>
            <View className="mt-1 flex-row">
              {days.map((d) => (
                <View key={d.key} className="flex-1 items-center">
                  <ThemedText type="caption" tone="secondary" style={{ fontSize: 9 }}>{d.weekday}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Muscle groups */}
          <View className="mb-5 rounded-2xl border p-4" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
            <ThemedText type="caption" tone="accent" className="mb-2">MUSCLE GROUPS</ThemedText>
            <BodyDiagram exercises={exercises} />
          </View>

          {/* Exercise log */}
          <View className="mb-5">
            <SectionHeader title="EXERCISE LOG" right={<ThemedText type="caption" tone="secondary">{todayEx.length}</ThemedText>} />
            {todayEx.length === 0 ? (
              <View className="rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
                <ThemedText type="small" tone="secondary">No exercise yet today. Move to strengthen the vessel.</ThemedText>
              </View>
            ) : (
              <View className="gap-2">
                {todayEx.map((e) => (
                  <View key={e.id} className="flex-row items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
                    <View className="flex-1">
                      <ThemedText type="body" bold>{e.subtype}</ThemedText>
                      <ThemedText type="caption" tone="secondary" className="mt-0.5">
                        {EXERCISE_TYPES[e.type]?.label ?? 'Exercise'} · {formatDuration(e.durationMinutes)} · +{e.xpEarned} XP
                        {e.distanceKm ? ` · ${e.distanceKm}km` : ''}
                      </ThemedText>
                    </View>
                    <Pressable onPress={() => deleteExercise(e.id)} style={{ padding: 4 }}>
                      <Trash2 size={15} color={theme.danger} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Meal log */}
          <View className="mb-5">
            <SectionHeader title="MEAL LOG" right={<ThemedText type="caption" tone="secondary">{todayMeals.length}</ThemedText>} />
            {todayMeals.length === 0 ? (
              <View className="rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
                <ThemedText type="small" tone="secondary">No meals logged today. Log them to track the fuel.</ThemedText>
              </View>
            ) : (
              <View className="gap-2">
                {todayMeals.map((m) => (
                  <View key={m.id} className="flex-row items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
                    <View className="flex-1">
                      <ThemedText type="body" bold>{m.name}</ThemedText>
                      <ThemedText type="caption" tone="secondary" className="mt-0.5">
                        {m.type} · {MEAL_QUALITY_META[m.quality]?.label ?? 'Meal'} · +{m.xpEarned} XP{m.calories ? ` · ${m.calories} kcal` : ''}
                      </ThemedText>
                    </View>
                    <Pressable onPress={() => deleteMeal(m.id)} style={{ padding: 4 }}>
                      <Trash2 size={15} color={theme.danger} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <ExerciseForm
        visible={exOpen}
        onClose={() => setExOpen(false)}
        onSubmit={async (input) => {
          await logExercise(input);
          setExOpen(false);
        }}
      />
      <MealForm
        visible={mealOpen}
        onClose={() => setMealOpen(false)}
        onSubmit={async (input) => {
          await logMeal(input);
          setMealOpen(false);
        }}
      />
    </ThemedView>
  );
}
