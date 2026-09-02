import Svg, { Circle, Line, Path } from 'react-native-svg';

import { View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';

const GREEN = '#22C55E';
const DASH = '2 4';

interface Point {
  x: number;
  y: number;
}

function arcPoints(fromPhi: number, toPhi: number, cx: number, cy: number, rx: number, ry: number, steps = 36): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const phi = fromPhi + ((toPhi - fromPhi) * i) / steps;
    const x = cx - rx * Math.cos(phi);
    const y = cy - ry * Math.sin(phi);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M ${pts[0]} ${pts.slice(1).map((p) => `L ${p}`).join(' ')}`;
}

function pointAt(phi: number, cx: number, cy: number, rx: number, ry: number): Point {
  return { x: cx - rx * Math.cos(phi), y: cy - ry * Math.sin(phi) };
}

export interface SunriseGaugeProps {
  progress: number;
  qada: number;
  width?: number;
}

export function SunriseGauge({ progress, qada, width = 168 }: SunriseGaugeProps) {
  const { theme } = useAppTheme();
  const height = 96;
  const cx = width / 2;
  const cy = height - 6;
  const rx = width / 2 - 10;
  const ry = Math.round(rx * 0.72);

  const p = Math.min(1, Math.max(0, progress));
  const q = Math.min(1, Math.max(0, qada));

  const phiP = p * Math.PI;
  const phiQ = q * Math.PI;

  const dot = pointAt(phiP, cx, cy, rx, ry);
  const qadaPt = pointAt(phiQ, cx, cy, rx, ry);
  const leftPt = pointAt(0, cx, cy, rx, ry);
  const rightPt = pointAt(Math.PI, cx, cy, rx, ry);

  const segA = arcPoints(0, phiQ, cx, cy, rx, ry);
  const segB = arcPoints(phiQ, Math.PI, cx, cy, rx, ry);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Path d={segA} stroke={theme.text} strokeWidth={2} strokeDasharray={DASH} fill="none" strokeLinecap="round" />
        <Path d={segB} stroke={theme.danger} strokeWidth={2} strokeDasharray={DASH} fill="none" strokeLinecap="round" />
        <Circle cx={leftPt.x} cy={leftPt.y} r={4} fill={theme.text} />
        <Circle cx={rightPt.x} cy={rightPt.y} r={4} fill={theme.text} />
        <Circle cx={dot.x} cy={dot.y} r={6} fill={GREEN} stroke={theme.background} strokeWidth={2.5} />
        <Line x1={qadaPt.x} y1={qadaPt.y - 7} x2={qadaPt.x} y2={qadaPt.y + 7} stroke={theme.danger} strokeWidth={3} strokeLinecap="round" />
      </Svg>

      <View style={{ position: 'absolute', left: qadaPt.x - 22, top: qadaPt.y - 26, width: 44, alignItems: 'center' }}>
        <ThemedText type="caption" bold style={{ color: theme.danger, fontSize: 9 }}>Qada</ThemedText>
      </View>
    </View>
  );
}
