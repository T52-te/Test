'use client';

type Task = {
  id: number;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
};

type Props = {
  task: Task;
  onMove: (id: number, status: Task['status']) => void;
  onDelete: (id: number) => void;
};

const STATUS_ORDER: Task['status'][] = ['todo', 'in_progress', 'done'];

export default function TaskCard({ task, onMove, onDelete }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const overdue = Boolean(task.due_date && task.due_date < today && task.status !== 'done');

  const index = STATUS_ORDER.indexOf(task.status);
  const previous = index > 0 ? STATUS_ORDER[index - 1] : null;
  const next = index < STATUS_ORDER.length - 1 ? STATUS_ORDER[index + 1] : null;

  return (
    <article className={`task-card${task.status === 'done' ? ' is-done' : ''}`}>
      <div className="task-title">{task.title}</div>

      <div className="task-meta">
        <span className={`badge ${task.priority}`}>{task.priority}</span>
        {task.due_date && (
          <span className={`due${overdue ? ' overdue' : ''}`}>
            {overdue ? 'Overdue · ' : 'Due '}
            {task.due_date}
          </span>
        )}
      </div>

      <div className="card-actions">
        <button
          className="btn tiny"
          type="button"
          aria-label="Move back"
          disabled={!previous}
          onClick={() => previous && onMove(task.id, previous)}
        >
          ←
        </button>
        <button
          className="btn tiny"
          type="button"
          aria-label="Move forward"
          disabled={!next}
          onClick={() => next && onMove(task.id, next)}
        >
          →
        </button>
        <button
          className="btn tiny danger"
          type="button"
          aria-label="Delete task"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
