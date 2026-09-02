import { useEffect, useState } from 'react';
import { Modal, StatusBar, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Pause, Play, Square, X } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Project, Sprint } from '@/types';
import { formatElapsed } from '@/utils/forge';

const POMODORO_SEC = 25 * 60;

export interface FocusModeProps {
  visible: boolean;
  sprint: Sprint | null;
  project: Project | null;
  onClose: () => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
}

export function FocusMode({ visible, sprint, project, onClose, onPause, onResume, onStop }: FocusModeProps) {
  const { theme } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!visible || !sprint) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [visible, sprint]);

  const elapsed = sprint
    ? sprint.isRunning
      ? sprint.accumulatedSeconds + Math.max(0, Math.floor((now - new Date(sprint.startTime).getTime()) / 1000))
      : sprint.accumulatedSeconds
    : 0;
  const block = Math.floor(elapsed / POMODORO_SEC);
  const inBreak = elapsed % POMODORO_SEC >= POMODORO_SEC - 60;

  const ringSize = Math.min(280, Math.max(200, width - 96), height * 0.45);
  const line = 6;
  const cx = ringSize / 2;
  const cy = ringSize / 2;
  const r = ringSize / 2 - 18;
  const c = 2 * Math.PI * r;
  const blockProgress = Math.min(1, Math.max(0, (elapsed % POMODORO_SEC) / POMODORO_SEC));
  const offset = c * (1 - blockProgress);

  const idle = !!sprint && !sprint.isRunning;
  const timerFont = Math.max(28, Math.min(48, Math.round((ringSize - 52) / 4.8)));

  if (!visible || !sprint) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <StatusBar barStyle={theme.name === 'dark' ? 'light-content' : 'dark-content'} />

        {/* Top bar */}
        <View className="flex-row items-center justify-between px-5 pt-6">
          <View className="flex-1 pr-4">
            <ThemedText type="caption" tone="accent">FOCUS MODE</ThemedText>
            <ThemedText type="subtitle" className="mt-0.5" numberOfLines={1}>
              {project?.name ?? 'The Forge'}
            </ThemedText>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.backgroundElevated,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <X size={18} color={theme.textSecondary} />
          </Pressable>
        </View>

        {/* Timer ring */}
        <View className="flex-1 items-center justify-center px-6">
          <View style={{ width: ringSize, height: ringSize }}>
            <Svg width={ringSize} height={ringSize}>
              <Circle cx={cx} cy={cy} r={r} stroke={theme.border} strokeWidth={line} fill="none" />
              <Circle
                cx={cx}
                cy={cy}
                r={r}
                stroke={theme.accent}
                strokeWidth={line}
                fill="none"
                strokeDasharray={c}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            </Svg>
            <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', padding: 22 }}>
              <ThemedText
                type="mono"
                tone="accent"
                numberOfLines={1}
                style={{ fontSize: timerFont, lineHeight: Math.round(timerFont * 1.15) }}
              >
                {formatElapsed(elapsed)}
              </ThemedText>
              <ThemedText type="small" tone="secondary" className="mt-1.5">
                {idle ? 'Paused' : inBreak ? 'Break time — breathe' : `Focus block ${block + 1}`}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row items-end justify-center gap-10 pb-8">
          <View className="items-center gap-2">
            <Pressable
              onPress={() => (sprint.isRunning ? onPause(sprint.id) : onResume(sprint.id))}
              accessibilityRole="button"
              style={({ pressed }) => ({
                width: 74,
                height: 74,
                borderRadius: 37,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.accent,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              {sprint.isRunning ? <Pause size={26} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} /> : <Play size={26} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} />}
            </Pressable>
            <ThemedText type="caption" tone="secondary">{sprint.isRunning ? 'Pause' : 'Resume'}</ThemedText>
          </View>

          <View className="items-center gap-2">
            <Pressable
              onPress={() => onStop(sprint.id)}
              accessibilityRole="button"
              style={({ pressed }) => ({
                width: 74,
                height: 74,
                borderRadius: 37,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1.5,
                borderColor: theme.border,
                backgroundColor: theme.backgroundElevated,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Square size={22} color={theme.textSecondary} />
            </Pressable>
            <ThemedText type="caption" tone="secondary">End</ThemedText>
          </View>
        </View>

        <ThemedText type="caption" tone="secondary" className="mb-8 text-center">
          The minutes you spend here become mastery.
        </ThemedText>
      </View>
    </Modal>
  );
}
