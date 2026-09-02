import { useState } from 'react';
import { Modal } from 'react-native';
import { Plus, Trash2, X } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRelationStore } from '@/stores/useRelationStore';
import { RelationCard } from '@/components/relations/RelationCard';
import { ConstellationMap } from '@/components/relations/ConstellationMap';
import { HealthBar } from '@/components/relations/HealthBar';
import { ActivityLog } from '@/components/relations/ActivityLog';
import { MilestoneTree } from '@/components/relations/MilestoneTree';
import { ACTIVITY_META, RELATION_ACTIVITY_TYPES, RELATION_TYPE_LABELS, RELATION_TYPES } from '@/constants/relations';
import type { RelationType } from '@/types';

const QUICK_TYPES = RELATION_ACTIVITY_TYPES.filter((t) => t !== 'custom' && t !== 'reconcile');

function RelationForm({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: { name: string; relationType: RelationType }) => void;
}) {
  const { theme } = useAppTheme();
  const [name, setName] = useState('');
  const [type, setType] = useState<RelationType>('friend');
  const [error, setError] = useState('');

  const submit = () => {
    if (!name.trim()) {
      setError('Name the relation.');
      return;
    }
    onSubmit({ name: name.trim(), relationType: type });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-t-3xl border-t" style={{ borderColor: theme.border, backgroundColor: theme.background, maxHeight: '85%', overflow: 'hidden' }}>
          <SafeAreaView edges={['bottom']} className="px-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <ThemedText type="title">New Bond</ThemedText>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <X size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }} contentContainerClassName="pb-3">
              <View className="gap-3">
                <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Amira" />
                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">RELATION TYPE</ThemedText>
                  <View className="flex-row flex-wrap gap-2">
                    {RELATION_TYPES.map((t) => (
                      <Pressable key={t} onPress={() => setType(t)} className="rounded-lg border px-3 py-1.5" style={{ borderColor: type === t ? theme.borderFocus : theme.border, backgroundColor: type === t ? theme.accentSoft : theme.background }}>
                        <ThemedText type="small" bold style={{ color: type === t ? theme.accent : theme.textSecondary }}>{RELATION_TYPE_LABELS[t]}</ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>
                {error ? <ThemedText type="small" tone="danger">{error}</ThemedText> : null}
              </View>
            </ScrollView>
            <View className="pb-6 pt-3">
              <Button variant="primary" size="lg" onPress={submit}>Forge the Bond</Button>
            </View>
          </SafeAreaView>
        </View>
      </ThemedView>
    </Modal>
  );
}

export default function CovenantScreen() {
  const { theme } = useAppTheme();
  const relations = useRelationStore((s) => s.relations);
  const activities = useRelationStore((s) => s.activities);
  const milestones = useRelationStore((s) => s.milestones);
  const addRelation = useRelationStore((s) => s.addRelation);
  const deleteRelation = useRelationStore((s) => s.deleteRelation);
  const logActivity = useRelationStore((s) => s.logActivity);
  const deleteActivity = useRelationStore((s) => s.deleteActivity);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const selected = selectedId ? relations.find((r) => r.id === selectedId) ?? null : null;

  const relActivities = selected ? activities.filter((a) => a.relationId === selected.id) : [];
  const relMilestones = selected ? milestones.filter((m) => m.relationId === selected.id) : [];
  const estranged = selected ? selected.health <= 0 : false;

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4" edges={['top', 'bottom']}>
        <ScrollView contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
          <ScreenHeader title="The Covenant" subtitle="The bonds that anchor your soul." />

          {selected ? (
            <>
              <View className="mb-4 flex-row items-center justify-between">
                <Pressable onPress={() => setSelectedId(null)} className="rounded-lg border px-3 py-1.5" style={{ borderColor: theme.border }}>
                  <ThemedText type="small" tone="accent">← Back</ThemedText>
                </Pressable>
                <Pressable onPress={() => deleteRelation(selected.id)} style={{ padding: 4 }}>
                  <Trash2 size={18} color={theme.danger} />
                </Pressable>
              </View>

              <View className="mb-4 rounded-2xl border p-4" style={{ borderColor: estranged ? theme.danger : theme.border, backgroundColor: theme.backgroundElevated }}>
                <View className="flex-row items-center gap-3">
                  <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: estranged ? theme.danger : theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                    <ThemedText type="title" style={{ color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' }}>{selected.name[0]?.toUpperCase()}</ThemedText>
                  </View>
                  <View className="flex-1">
                    <ThemedText type="title">{selected.name}</ThemedText>
                    <ThemedText type="small" tone="secondary">{RELATION_TYPE_LABELS[selected.relationType]} · Level {selected.level} · {selected.xp} XP</ThemedText>
                  </View>
                </View>
                <View className="mt-3"><HealthBar health={selected.health} maxHealth={selected.maxHealth} /></View>
              </View>

              {/* Activities */}
              <View className="mb-4">
                <SectionHeader title="INTERACTIONS" />
                {estranged ? (
                  <Button variant="danger" size="lg" onPress={() => logActivity(selected.id, 'reconcile')}>
                    Reconciliation
                  </Button>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {QUICK_TYPES.map((t) => (
                      <Pressable
                        key={t}
                        onPress={() => logActivity(selected.id, t)}
                        accessibilityRole="button"
                        className="rounded-lg border px-3 py-2"
                        style={({ pressed }) => ({ borderColor: theme.border, backgroundColor: theme.backgroundElevated, opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}
                      >
                        <ThemedText type="small" bold tone="accent">{ACTIVITY_META[t].label}</ThemedText>
                        <ThemedText type="caption" tone="secondary" style={{ fontSize: 9 }}>+{ACTIVITY_META[t].health} h · +{ACTIVITY_META[t].xp} XP</ThemedText>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* Milestones */}
              <View className="mb-4">
                <SectionHeader title="MILESTONES" />
                <MilestoneTree milestones={relMilestones} activities={relActivities} />
              </View>

              {/* Activity log */}
              <View className="mb-5">
                <SectionHeader title="TIMELINE" right={<ThemedText type="caption" tone="secondary">{relActivities.length}</ThemedText>} />
                <ActivityLog activities={relActivities} onDelete={deleteActivity} />
              </View>
            </>
          ) : (
            <>
              <View className="mb-4">
                <SectionHeader
                  title="CONSTELLATION"
                  right={
                    <Button variant="ghost" shape="sharp" size="sm" onPress={() => setAddOpen(true)}>
                      <Plus size={14} color={theme.accent} /> Add
                    </Button>
                  }
                />
                {relations.length === 0 ? (
                  <View className="rounded-xl border px-4 py-4" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
                    <ThemedText type="small" tone="secondary">No bonds yet. Add the people who matter to keep the covenant strong.</ThemedText>
                  </View>
                ) : (
                  <ConstellationMap relations={relations} onOpen={setSelectedId} />
                )}
              </View>

              <View className="mb-5">
                <SectionHeader title="BONDS" right={<ThemedText type="caption" tone="secondary">{relations.length}</ThemedText>} />
                <View className="gap-2.5">
                  {relations.map((r) => (
                    <RelationCard key={r.id} relation={r} onOpen={() => setSelectedId(r.id)} />
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <RelationForm visible={addOpen} onClose={() => setAddOpen(false)} onSubmit={async (input) => { await addRelation(input); setAddOpen(false); }} />
    </ThemedView>
  );
}
