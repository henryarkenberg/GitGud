import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface ActivityRingProps {
  label: string;
  value: number;
  goal: number;
  color: string;
  size?: number;
  display?: string;
}

export function ActivityRing({ label, value, goal, color, size = 92, display }: ActivityRingProps) {
  const { theme } = useAppTheme();
  const line = 10;
  const r = (size - line) / 2;
  const c = 2 * Math.PI * r;
  const ratio = Math.min(1, goal > 0 ? value / goal : 0);
  const offset = c * (1 - ratio);

  return (
    <View className="items-center" style={{ width: size }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.background} strokeWidth={line} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={line}
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ThemedText type="title" style={{ fontSize: 18 }}>
            {display ?? `${Math.round(ratio * 100)}%`}
          </ThemedText>
        </View>
      </View>
      <ThemedText type="caption" tone="secondary" className="mt-1">
        {label}
      </ThemedText>
    </View>
  );
}
