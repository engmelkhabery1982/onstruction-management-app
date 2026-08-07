import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import type { Project, Task, ViewKey } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { ProjectsView } from '@/components/ProjectsView';
import { TasksView } from '@/components/TasksView';

export default function App() {
  const [view, setView] = useState<ViewKey>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as Project[];
  }, []);

  const loadTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { setError(error.message); return []; }
    return (data || []) as Task[];
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, t] = await Promise.all([loadProjects(), loadTasks()]);
      setProjects(p);
      setTasks(t);
      setLoading(false);
    })();
  }, [loadProjects, loadTasks]);

  // Project CRUD
  const updateProjectCell = useCallback(async (id: string, key: string, value: string | number) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: value } : p))
    );
    const update: Record<string, string | number> = { [key]: value };
    if (key === 'progress') update.progress = Math.min(100, Math.max(0, Number(value) || 0));
    const { error } = await supabase.from('projects').update(update).eq('id', id);
    if (error) {
      setError(error.message);
      setProjects(await loadProjects());
    }
  }, [loadProjects]);

  const addProjectRow = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: 'New Project', status: 'Planning', budget: 0, spent: 0, progress: 0 })
      .select()
      .single();
    if (error) { setError(error.message); return; }
    setProjects((prev) => [data as Project, ...prev]);
  }, []);

  const deleteProjectRow = useCallback(async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.project_id !== id));
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportProjects = useCallback(async (rows: Partial<Project>[]) => {
    const valid = rows.filter((r) => r.name && r.name.trim());
    if (valid.length === 0) return;
    const insert = valid.map((r) => ({
      name: r.name,
      client: r.client || '',
      location: r.location || '',
      category: r.category || 'Residential',
      start_date: r.start_date,
      end_date: r.end_date,
      budget: r.budget || 0,
      spent: r.spent || 0,
      status: r.status || 'Planning',
      progress: r.progress || 0,
      notes: r.notes || '',
    }));
    const { data, error } = await supabase.from('projects').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setProjects((prev) => [...(data as Project[]), ...prev]);
  }, []);

  // Task CRUD
  const updateTaskCell = useCallback(async (id: string, key: string, value: string | number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [key]: value } : t))
    );
    const update: Record<string, string | number> = { [key]: value };
    if (key === 'progress') update.progress = Math.min(100, Math.max(0, Number(value) || 0));
    const { error } = await supabase.from('tasks').update(update).eq('id', id);
    if (error) {
      setError(error.message);
      setTasks(await loadTasks());
    }
  }, [loadTasks]);

  const addTaskRow = useCallback(async () => {
    if (projects.length === 0) {
      setError('Create a project first before adding tasks.');
      return;
    }
    const { data, error } = await supabase
      .from('tasks')
      .insert({ name: 'New Task', project_id: projects[0].id, status: 'Not Started', cost: 0, progress: 0 })
      .select()
      .single();
    if (error) { setError(error.message); return; }
    setTasks((prev) => [data as Task, ...prev]);
  }, [projects]);

  const deleteTaskRow = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { setError(error.message); }
  }, []);

  const bulkImportTasks = useCallback(async (rows: Partial<Task>[]) => {
    const valid = rows.filter((r) => r.name && r.name.trim() && r.project_id);
    if (valid.length === 0) {
      setError('Imported tasks need a Task Name. Also ensure at least one project exists.');
      return;
    }
    const insert = valid.map((r) => ({
      name: r.name,
      project_id: r.project_id,
      assignee: r.assignee || '',
      category: r.category || '',
      start_date: r.start_date,
      end_date: r.end_date,
      cost: r.cost || 0,
      status: r.status || 'Not Started',
      progress: r.progress || 0,
    }));
    const { data, error } = await supabase.from('tasks').insert(insert).select();
    if (error) { setError(error.message); return; }
    if (data) setTasks((prev) => [...(data as Task[]), ...prev]);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-primary-500 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Loading your construction data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-neutral-50 overflow-hidden">
      <Sidebar
        active={view}
        onNavigate={setView}
        projectCount={projects.length}
        taskCount={tasks.length}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="bg-error-50 border-b border-error-200 px-4 py-2 flex items-center justify-between">
            <p className="text-sm text-error-700">{error}</p>
            <button onClick={() => setError(null)} className="text-error-500 hover:text-error-700 text-sm">Dismiss</button>
          </div>
        )}
        {view === 'dashboard' && <Dashboard projects={projects} tasks={tasks} onNavigate={setView} />}
        {view === 'projects' && (
          <ProjectsView
            projects={projects}
            onCellChange={updateProjectCell}
            onAddRow={addProjectRow}
            onDeleteRow={deleteProjectRow}
            onBulkImport={bulkImportProjects}
          />
        )}
        {view === 'tasks' && (
          <TasksView
            tasks={tasks}
            projects={projects}
            onCellChange={updateTaskCell}
            onAddRow={addTaskRow}
            onDeleteRow={deleteTaskRow}
            onBulkImport={bulkImportTasks}
          />
        )}
      </main>
    </div>
  );
}
