import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { pool } from '@/lib/db';

const TASK_FIELDS = `id, title, status, priority, to_char(due_date, 'YYYY-MM-DD') AS due_date`;
const STATUSES = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const updates: Record<string, unknown> = {};
  if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim();
  if (STATUSES.includes(body.status)) updates.status = body.status;
  if (PRIORITIES.includes(body.priority)) updates.priority = body.priority;
  if (body.due_date === null) updates.due_date = null;
  else if (/^\d{4}-\d{2}-\d{2}$/.test(body.due_date)) updates.due_date = body.due_date;

  const columns = Object.keys(updates);
  if (!columns.length) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  const assignments = columns.map((column, index) => `${column} = $${index + 1}`).join(', ');
  const values = [...columns.map((column) => updates[column]), id, user.id];

  const { rows } = await pool.query(
    `UPDATE tasks SET ${assignments}
      WHERE id = $${columns.length + 1} AND user_id = $${columns.length + 2}
      RETURNING ${TASK_FIELDS}`,
    values,
  );

  if (!rows.length) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
  return NextResponse.json({ task: rows[0] });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { id } = await params;
  const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [
    id,
    user.id,
  ]);

  if (!result.rowCount) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
