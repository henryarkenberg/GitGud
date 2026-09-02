import { useEffect, useMemo, useState } from 'react';
import { Flame, Pause, Play, Square, type LucideIcon } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Project, Sprint } from '@/types';
import { formatElapsed } from '@/utils/forge';

export interface SprintTimerProps {
  runningSprint: Sprint | null;
  projects: Project[];
  onStart: (projectId: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
  onFocus: () => void;
}

function ForgeButton({
  tone,
  flex = false,
  onPress,
  icon: Icon,
  label,
  disabled = false,
}: {
  tone: 'primary' | 'accent' | 'danger';
  flex?: boolean;
  onPress: () => void;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
}) {
  const { theme } = useAppTheme();
  const tones = {
    primary: { bg: theme.accent, color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' },
    accent: { bg: theme.backgroundSecondary, color: theme.accent },
    danger: { bg: theme.danger, color: '#FFFFFF' },
  } as const;
  const t = tones[tone];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flex: flex ? 1 : undefined,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: t.bg,
        opacity: pressed ? 0.85 : disabled ? 0.5 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Icon size={16} color={t.color} />
      <ThemedText type="body" bold style={{ color: t.color }}>{label}</ThemedText>
    </Pressable>
  );
}

export function SprintTimer({ runningSprint, projects, onStart, onPause, onResume, onStop, onFocus }: SprintTimerProps) {
  const { theme } = useAppTheme();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const projectName = runningSprint ? projects.find((p) => p.id === runningSprint.projectId)?.name ?? 'Unknown' : '';

  const elapsed = useMemo(() => {
    if (!runningSprint) return 0;
    if (!runningSprint.isRunning) return runningSprint.accumulatedSeconds;
    const start = new Date(runningSprint.startTime).getTime();
    if (Number.isNaN(start)) return runningSprint.accumulatedSeconds;
    return runningSprint.accumulatedSeconds + Math.max(0, Math.floor((now - start) / 1000));
  }, [runningSprint, now]);

  const [selected, setSelected] = useState<string | null>(projects[0]?.id ?? null);
  const activeSelected = selected && projects.some((p) => p.id === selected) ? selected : projects[0]?.id ?? null;
  const available = projects.filter((p) => p.status === 'active' || p.status === 'paused');

  return (
    <View
      className="rounded-2xl border p-5"
      style={{
        borderColor: theme.border,
        backgroundColor: runningSprint ? theme.accentSoft : theme.backgroundElevated,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <View className="mb-3 flex-row items-center justify-between">
        {runningSprint ? (
          <View className="flex-row items-center gap-2">
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent }} />
            <ThemedText type="caption" tone="accent">RUNNING</ThemedText>
          </View>
        ) : (
          <View />
        )}
        {runningSprint ? (
          <ThemedText type="caption" tone="secondary">Focus mode</ThemedText>
        ) : null}
      </View>

      {runningSprint ? (
        <>
          <View style={{ alignItems: 'center', paddingVertical: 14 }}>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 6,
                bottom: 6,
                borderRadius: 24,
                backgroundColor: `${theme.accent}12`,
              }}
            />
            <ThemedText type="display" tone="accent" className="text-center">
              {formatElapsed(elapsed)}
            </ThemedText>
            <ThemedText type="small" tone="secondary" className="mt-1">
              {projectName}
            </ThemedText>
          </View>

          <View className="mt-2 flex-row gap-2">
            <ForgeButton tone="accent" flex onPress={() => (runningSprint.isRunning ? onPause(runningSprint.id) : onResume(runningSprint.id))} icon={runningSprint.isRunning ? Pause : Play} label={runningSprint.isRunning ? 'Pause' : 'Resume'} />
            <ForgeButton tone="primary" flex onPress={onFocus} icon={Flame} label="Focus" />
            <ForgeButton tone="danger" flex onPress={() => onStop(runningSprint.id)} icon={Square} label="End" />
          </View>
          <ThemedText type="caption" tone="secondary" className="mt-2 text-center">
            +5 XP per 25 minutes · auto-saved
          </ThemedText>
        </>
      ) : (
        <>
          {available.length === 0 ? (
            <ThemedText type="small" tone="secondary">
              No projects yet. Create one to begin forging hours into mastery.
            </ThemedText>
          ) : (
            <>
              <ThemedText type="caption" tone="secondary" className="mb-2">
                Pick a project to start a sprint
              </ThemedText>
              <View className="mb-4 flex-row flex-wrap gap-2">
                {available.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => setSelected(p.id)}
                    accessibilityRole="button"
                    className="rounded-full border px-3.5 py-1.5"
                    style={({ pressed }) => ({
                      borderColor: activeSelected === p.id ? p.color : theme.border,
                      backgroundColor: activeSelected === p.id ? `${p.color}22` : theme.background,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <ThemedText type="small" bold style={{ color: activeSelected === p.id ? p.color : theme.textSecondary }}>
                      {p.name}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
              <ForgeButton tone="primary" onPress={() => (activeSelected ? onStart(activeSelected) : undefined)} icon={Flame} label="Enter the Forge" />
            </>
          )}
        </>
      )}
    </View>
  );
}
