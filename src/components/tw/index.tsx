import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from 'react-native-css';
import { Link as RouterLink } from 'expo-router';
import React from 'react';
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TextInput as RNTextInput,
  TouchableHighlight as RNTouchableHighlight,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CssElementProps<P> = P & { className?: string };

function useCssElementMapped<P>(
  component: React.ComponentType<any>,
  props: CssElementProps<P>,
  mapping?: { className: string; contentContainerClassName?: string },
) {
  return useCssElement(component as any, props as any, mapping ?? { className: 'style' });
}

export const Link = (props: React.ComponentProps<typeof RouterLink> & { className?: string }) => {
  return useCssElementMapped(RouterLink, props);
};

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

// CSS Variable hook
export const useCSSVariable =
  process.env.EXPO_OS !== 'web'
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

export type ViewProps = React.ComponentProps<typeof RNView> & { className?: string };

export const View = (props: ViewProps) => useCssElementMapped(RNView, props);
View.displayName = 'CSS(View)';

export type TextProps = React.ComponentProps<typeof RNText> & { className?: string };

export const Text = (props: TextProps) => useCssElementMapped(RNText, props);
Text.displayName = 'CSS(Text)';

export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  },
) => {
  return useCssElementMapped(RNScrollView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  });
};
ScrollView.displayName = 'CSS(ScrollView)';

export const Pressable = (props: React.ComponentProps<typeof RNPressable> & { className?: string }) =>
  useCssElementMapped(RNPressable, props);
Pressable.displayName = 'CSS(Pressable)';

export const TextInput = (props: React.ComponentProps<typeof RNTextInput> & { className?: string }) =>
  useCssElementMapped(RNTextInput, props);
TextInput.displayName = 'CSS(TextInput)';

export const TouchableHighlight = (
  props: React.ComponentProps<typeof RNTouchableHighlight> & { className?: string },
) => useCssElementMapped(RNTouchableHighlight, props);
TouchableHighlight.displayName = 'CSS(TouchableHighlight)';

export type SafeAreaEdge = 'top' | 'left' | 'right' | 'bottom';

export type SafeAreaViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
  edges?: readonly SafeAreaEdge[];
};

export const SafeAreaView = (props: SafeAreaViewProps) => {
  const insets = useSafeAreaInsets();
  const edges = props.edges ?? (['top', 'left', 'right', 'bottom'] as const);
  const insetPadding: ViewStyle = {};
  if (edges.includes('top')) insetPadding.paddingTop = insets.top;
  if (edges.includes('bottom')) insetPadding.paddingBottom = insets.bottom;
  if (edges.includes('left')) insetPadding.paddingLeft = insets.left;
  if (edges.includes('right')) insetPadding.paddingRight = insets.right;
  const { edges: _edges, style, ...rest } = props;
  return useCssElementMapped(RNView, { ...rest, style: [insetPadding, style] });
};
SafeAreaView.displayName = 'CSS(SafeAreaView)';