import { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import { Award } from 'lucide-react-native';

import { View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface UnlockAnimationProps {
  active: boolean;
  name: string | null;
  onFinish: () => void;
}

export function UnlockAnimation({ active, name, onFinish }: UnlockAnimationProps) {
  const { theme } = useAppTheme();
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.8));

  useEffect(() => {
    if (!active) return;
    opacity.setValue(0);
    scale.setValue(0.8);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
    ]).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(onFinish);
    }, 1400);
    return () => clearTimeout(timer);
  }, [active, opacity, scale, onFinish]);

  if (!active || !name) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: [{ scale }],
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
      pointerEvents="none"
    >
      <View style={{ alignItems: 'center' }}>
        <Award size={64} color={theme.accent} />
        <ThemedText type="caption" tone="accent" className="mt-3">NODE UNLOCKED</ThemedText>
        <ThemedText type="title" className="mt-1">{name}</ThemedText>
      </View>
    </Animated.View>
  );
}

