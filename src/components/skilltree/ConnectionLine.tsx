import Svg, { Line } from 'react-native-svg';

export interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
  color: string;
}

export function ConnectionLine({ x1, y1, x2, y2, active, color }: ConnectionLineProps) {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.max(1, Math.abs(x2 - x1));
  const height = Math.max(1, Math.abs(y2 - y1));

  return (
    <Svg style={{ position: 'absolute', left, top, width, height }} width={width} height={height}>
      <Line
        x1={x1 - left}
        y1={y1 - top}
        x2={x2 - left}
        y2={y2 - top}
        stroke={active ? color : 'rgba(128,128,128,0.35)'}
        strokeWidth={active ? 3 : 1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
