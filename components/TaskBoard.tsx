'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import TaskCard from './TaskCard';

type Status = 'todo' | 'in_progress' | 'done';
type Priority = 'low' | 'medium' | 'high';

type Task = {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  due_date: string | null;
};

const COLUMNS: { key: Status; label: string }[] = [
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'done', label: 'Done' },
];

export default function TaskBoard({
  initialTasks,
  email,
}: {
  initialTasks: Task[];
  email: string;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError('A title is required.');
      return;
    }

    setError('');
    setBusy(true);
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority, due_date: dueDate || null }),
    });
    setBusy(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'Could not save the task.');
      return;
    }

    const { task } = await response.json();
    setTasks((current) => [task, ...current]);
    setTitle('');
    setDueDate('');
    setPriority('medium');
  }

  async function handleMove(id: number, status: Status) {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return;

    const { task } = await response.json();
    setTasks((current) => current.map((item) => (item.id === id ? task : item)));
  }

  async function handleDelete(id: number) {
    const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!response.ok) return;

    setTasks((current) => current.filter((item) => item.id !== id));
  }

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <main className="board-page">
      <header className="board-header">
        <div>
          <h1>Task board</h1>
          <p className="muted">{email}</p>
        </div>
        <button className="btn ghost" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </header>

      <form className="task-form" onSubmit={handleCreate}>
        <input
          className="input"
          placeholder="What needs doing?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="Task title"
        />
        <select
          className="input"
          value={priority}
          onChange={(event) => setPriority(event.target.value as Priority)}
          aria-label="Priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          className="input"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          aria-label="Due date"
        />
        <button className="btn primary" type="submit" disabled={busy}>
          Add task
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="columns">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.key);
          return (
            <section className="column" key={column.key}>
              <h2>
                {column.label}
                <span className="count">{columnTasks.length}</span>
              </h2>
              <div className="task-list">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onMove={handleMove}
                    onDelete={handleDelete}
                  />
                ))}
                {!columnTasks.length && <p className="muted empty">No tasks here yet.</p>}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
