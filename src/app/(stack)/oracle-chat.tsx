import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Check, Send, Sparkles, X } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable, TextInput } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { confirmTools, planTurn, type OpenAIMessage, type ToolDecision, type ToolIntent } from '@/services/ai/oracleChat';

interface Bubble {
  role: 'user' | 'assistant';
  content: string;
}

export default function OracleChatScreen() {
  const { theme } = useAppTheme();
  const [bubbles, setBubbles] = useState<Bubble[]>([
    { role: 'assistant', content: 'What can I do for you my lord?' },
  ]);
  const [wire, setWire] = useState<OpenAIMessage[]>([]);
  const [pending, setPending] = useState<ToolIntent[] | null>(null);
  const [decisions, setDecisions] = useState<Record<string, boolean>>({});
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setThinking(true);
    try {
      await fn();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setBubbles((m) => [...m, { role: 'assistant', content: `The Oracle could not reach you (${detail}). Check your key and connection.` }]);
    } finally {
      setThinking(false);
    }
  };

  const send = () => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput('');
    const userWire: OpenAIMessage = { role: 'user', content: text };
    setBubbles((m) => [...m, { role: 'user', content: text }]);
    setWire((w) => [...w, userWire]);
    run(async () => {
      const { wire: next, result } = await planTurn([...wire, userWire]);
      setWire(next);
      if (result.reply) {
        setBubbles((m) => [...m, { role: 'assistant', content: result.reply! }]);
      } else if (result.toolCalls) {
        if (result.lead.trim()) setBubbles((m) => [...m, { role: 'assistant', content: result.lead.trim() }]);
        setPending(result.toolCalls);
        setDecisions(Object.fromEntries(result.toolCalls.map((t) => [t.id, true])));
      }
    });
  };

  const confirm = () => {
    if (!pending || thinking) return;
    const acceptedCount = pending.filter((t) => decisions[t.id]).length;
    const decisionsArr: ToolDecision[] = pending.map((t) => ({ id: t.id, name: t.name, args: t.args, accepted: !!decisions[t.id] }));
    setPending(null);
    run(async () => {
      const { wire: next, reply } = await confirmTools(wire, decisionsArr);
      setWire(next);
      setBubbles((m) => [...m, { role: 'assistant', content: reply }]);
    });
    void acceptedCount;
  };

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4" edges={['top', 'bottom']}>
        <ScreenHeader title="The Oracle" subtitle="Speak, and the realm listens" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-3 pb-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {bubbles.map((m, i) => (
              <View
                key={`b${i}`}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  borderRadius: 18,
                  borderTopRightRadius: m.role === 'user' ? 6 : 18,
                  borderTopLeftRadius: m.role === 'assistant' ? 6 : 18,
                  borderWidth: m.role === 'assistant' ? 1 : 0,
                  borderColor: theme.border,
                  backgroundColor: m.role === 'user' ? theme.accent : theme.backgroundElevated,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <ThemedText
                  type="small"
                  style={{
                    lineHeight: 20,
                    color: m.role === 'user' ? (theme.name === 'dark' ? '#0B0F19' : '#FFFFFF') : theme.text,
                  }}
                >
                  {m.content}
                </ThemedText>
              </View>
            ))}

            {/* Proposed actions */}
            {pending ? (
              <View className="my-1 gap-2">
                <View className="flex-row items-center gap-2">
                  <Sparkles size={13} color={theme.accent} />
                  <ThemedText type="caption" tone="accent">THE ORACLE PROPOSES</ThemedText>
                </View>
                {pending.map((t) => {
                  const accepted = decisions[t.id];
                  return (
                    <View
                      key={t.id}
                      className="flex-row items-center justify-between gap-3 rounded-2xl border p-3"
                      style={{ borderColor: accepted ? theme.borderFocus : theme.border, backgroundColor: theme.backgroundElevated }}
                    >
                      <View className="flex-1 pr-2">
                        <ThemedText type="body" bold numberOfLines={2}>{t.label}</ThemedText>
                        <ThemedText type="caption" tone="secondary" style={{ fontSize: 9 }}>{t.name}</ThemedText>
                      </View>
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => setDecisions((d) => ({ ...d, [t.id]: true }))}
                          accessibilityRole="button"
                          style={({ pressed }) => ({
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1.5,
                            borderColor: accepted ? theme.success : theme.border,
                            backgroundColor: accepted ? theme.success : 'transparent',
                            opacity: pressed ? 0.8 : 1,
                          })}
                        >
                          <Check size={18} color={accepted ? (theme.name === 'dark' ? '#0B0F19' : '#FFFFFF') : theme.textSecondary} />
                        </Pressable>
                        <Pressable
                          onPress={() => setDecisions((d) => ({ ...d, [t.id]: false }))}
                          accessibilityRole="button"
                          style={({ pressed }) => ({
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1.5,
                            borderColor: accepted ? theme.border : theme.danger,
                            backgroundColor: accepted ? 'transparent' : theme.danger,
                            opacity: pressed ? 0.8 : 1,
                          })}
                        >
                          <X size={18} color={accepted ? theme.textSecondary : '#FFFFFF'} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
                {(() => {
                  const count = pending.filter((t) => decisions[t.id]).length;
                  return (
                    <Button variant="primary" size="lg" shape="sharp" onPress={confirm}>
                      Apply {count} action{count === 1 ? '' : 's'} to the Realm
                    </Button>
                  );
                })()}
              </View>
            ) : null}

            {thinking ? (
              <View
                className="flex-row items-center gap-2"
                style={{
                  alignSelf: 'flex-start',
                  borderRadius: 18,
                  borderTopLeftRadius: 6,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.backgroundElevated,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <Sparkles size={13} color={theme.accent} />
                <ThemedText type="small" tone="secondary">The Oracle is pondering…</ThemedText>
              </View>
            ) : null}
          </ScrollView>

          {/* Input bar */}
          <View
            className="flex-row items-center gap-2 rounded-2xl border px-3 py-2"
            style={{ borderColor: theme.borderFocus, backgroundColor: theme.backgroundElevated, marginBottom: 4 }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask the Oracle…"
              placeholderTextColor={theme.textSecondary}
              selectionColor={theme.accent}
              onSubmitEditing={send}
              returnKeyType="send"
              multiline
              style={{ flex: 1, maxHeight: 100, color: theme.text, fontSize: 14, paddingVertical: 0, fontFamily: 'Inter_400Regular' }}
            />
            <Pressable
              onPress={send}
              disabled={!input.trim() || thinking}
              accessibilityRole="button"
              style={({ pressed }) => ({
                width: 38,
                height: 38,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.accent,
                opacity: pressed ? 0.85 : !input.trim() || thinking ? 0.45 : 1,
              })}
            >
              <Send size={16} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
