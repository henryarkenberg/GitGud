import { useState } from 'react';
import { Plus } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useForgeStore } from '@/stores/useForgeStore';
import { SprintTimer } from '@/components/projects/SprintTimer';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { FocusMode } from '@/components/projects/FocusMode';
import type { Project } from '@/types';

export default function ForgeScreen() {
  const { theme } = useAppTheme();
  const projects = useForgeStore((s) => s.projects);
  const tasks = useForgeStore((s) => s.tasks);
  const runningSprint = useForgeStore((s) => s.runningSprint);
  const startSprint = useForgeStore((s) => s.startSprint);
  const pauseSprint = useForgeStore((s) => s.pauseSprint);
  const resumeSprint = useForgeStore((s) => s.resumeSprint);
  const stopSprint = useForgeStore((s) => s.stopSprint);
  const addProject = useForgeStore((s) => s.addProject);
  const updateProject = useForgeStore((s) => s.updateProject);
  const setProjectStatus = useForgeStore((s) => s.setProjectStatus);
  const deleteProject = useForgeStore((s) => s.deleteProject);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<{ open: boolean; initial: Project | null }>({ open: false, initial: null });
  const [projectNonce, setProjectNonce] = useState(0);
  const [focusOpen, setFocusOpen] = useState(false);

  const selected = selectedId ? projects.find((p) => p.id === selectedId) ?? null : null;

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView contentContainerClassName="px-4 pb-12" showsVerticalScrollIndicator={false}>
          <View className="mb-5">
            <ThemedText type="caption" tone="accent">
              THE ANVIL DOES NOT LIE
            </ThemedText>
            <ThemedText type="display" className="mt-0.5">
              The Forge
            </ThemedText>
            <ThemedText type="small" tone="secondary" className="mt-1">
              Hours become mastery. Sprint. Focus. Build.
            </ThemedText>
          </View>

          <View className="mb-5">
            <SprintTimer
              runningSprint={runningSprint}
              projects={projects}
              onStart={startSprint}
              onPause={pauseSprint}
              onResume={resumeSprint}
              onStop={stopSprint}
              onFocus={() => setFocusOpen(true)}
            />
          </View>

          {selected ? (
            <ProjectDetail
              key={selected.id}
              project={selected}
              onBack={() => setSelectedId(null)}
              onEdit={() => { setProjectNonce((n) => n + 1); setProjectForm({ open: true, initial: selected }); }}
              onDelete={async () => {
                await deleteProject(selected.id);
                setSelectedId(null);
              }}
            />
          ) : (
            <>
              <View className="mt-6">
                <SectionHeader
                  title="PROJECTS"
                  right={
                    <Button variant="ghost" shape="sharp" size="sm" onPress={() => { setProjectNonce((n) => n + 1); setProjectForm({ open: true, initial: null }); }}>
                      <Plus size={14} color={theme.accent} />
                      New
                    </Button>
                  }
                />
                {projects.length === 0 ? (
                  <View className="rounded-xl border px-4 py-4" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
                    <ThemedText type="small" tone="secondary">
                      No projects yet. Forge one, add tasks, and start the timer.
                    </ThemedText>
                  </View>
                ) : (
                  <View className="gap-3">
                    {projects.map((p) => {
                      const pt = tasks.filter((t) => t.projectId === p.id);
                      return (
                        <ProjectCard
                          key={p.id}
                          project={p}
                          tasksDone={pt.filter((t) => t.status === 'done').length}
                          tasksTotal={pt.length}
                          onOpen={() => setSelectedId(p.id)}
                        />
                      );
                    })}
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <ProjectForm
        key={projectNonce}
        visible={projectForm.open}
        initial={projectForm.initial}
        onClose={() => setProjectForm({ open: false, initial: null })}
        onSubmit={async (input) => {
          const { status, ...rest } = input;
          if (projectForm.initial) {
            await updateProject(projectForm.initial.id, rest);
            if (status) await setProjectStatus(projectForm.initial.id, status);
          } else {
            await addProject(rest);
          }
          setProjectForm({ open: false, initial: null });
        }}
      />

      <FocusMode
        visible={focusOpen}
        sprint={runningSprint}
        project={runningSprint ? projects.find((p) => p.id === runningSprint.projectId) ?? null : null}
        onClose={() => setFocusOpen(false)}
        onPause={pauseSprint}
        onResume={resumeSprint}
        onStop={stopSprint}
      />
    </ThemedView>
  );
}
