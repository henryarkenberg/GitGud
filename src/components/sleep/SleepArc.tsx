import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatDuration, minuteOfDay } from '@/utils/sleep';
import type { SleepSession } from '@/types';

export interface SleepArcProps {
  session: SleepSession | null;
  size?: number;
}

interface Point {
  x: number;
  y: number;
}

function polar(cx: number, cy: number, r: number, minutes: number): Point {
  const angle = ((minutes / 1440) * 360 - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

export function SleepArc({ session, size = 230 }: SleepArcProps) {
  const { theme } = useAppTheme();
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const tickR = r + 8;

  const tickFor = (minutes: number) => polar(cx, cy, tickR, minutes);
  const labelPos = (minutes: number) => polar(cx, cy, r + 22, minutes);

  const hasSession = session !== null && (session.durationMinutes ?? 0) > 0;
  let arcPath: string | null = null;
  if (hasSession) {
    const start = polar(cx, cy, r, minuteOfDay(session!.sleepStart));
    const sweep = ((session!.durationMinutes / 1440) * 360);
    const end = polar(cx, cy, r, minuteOfDay(session!.sleepStart) + session!.durationMinutes);
    const largeArc = sweep > 180 ? 1 : 0;
    arcPath = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Dial track */}
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={theme.border} strokeWidth={16} />
        {hasSession ? (
          <Path d={arcPath!} fill="none" stroke={theme.accent} strokeWidth={16} strokeLinecap="round" />
        ) : null}

        {/* Hour ticks */}
        {[0, 6, 12, 18].map((h) => {
          const a = tickFor(h * 60);
          const b = polar(cx, cy, r + 14, h * 60);
          return <Line key={h} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={theme.textSecondary} strokeWidth={2} />;
        })}

        {/* Start marker */}
        {hasSession ? (
          <Circle
            cx={polar(cx, cy, r, minuteOfDay(session!.sleepStart)).x}
            cy={polar(cx, cy, r, minuteOfDay(session!.sleepStart)).y}
            r={5}
            fill={theme.accent}
          />
        ) : null}

        {/* Quadrant labels */}
        {[
          { h: 0, label: '12a' },
          { h: 6, label: '6a' },
          { h: 12, label: '12p' },
          { h: 18, label: '6p' },
        ].map((q) => {
          const p = labelPos(q.h * 60);
          return (
            <SvgText
              key={q.h}
              x={p.x}
              y={p.y}
              fill={theme.textSecondary}
              fontSize={10}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {q.label}
            </SvgText>
          );
        })}
      </Svg>

      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <ThemedText type="caption" tone="secondary" style={{ fontSize: 11 }}>
          LAST NIGHT
        </ThemedText>
        <ThemedText type="title" tone="accent">
          {hasSession ? formatDuration(session!.durationMinutes) : '—'}
        </ThemedText>
      </View>
    </View>
  );
}
