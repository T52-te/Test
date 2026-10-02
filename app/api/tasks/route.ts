import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { pool } from '@/lib/db';

const TASK_FIELDS = `id, title, status, priority, to_char(due_date, 'YYYY-MM-DD') AS due_date`;
const PRIORITIES = ['low', 'medium', 'high'];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { rows } = await pool.query(
    `SELECT ${TASK_FIELDS} FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
    [user.id],
  );

  return NextResponse.json({ tasks: rows });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? '').trim();
  if (!title) {
    return NextResponse.json({ error: 'A title is required.' }, { status: 400 });
  }

  const priority = PRIORITIES.includes(body.priority) ? body.priority : 'medium';
  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(body.due_date) ? body.due_date : null;

  const { rows } = await pool.query(
    `INSERT INTO tasks (user_id, title, priority, due_date)
     VALUES ($1, $2, $3, $4)
     RETURNING ${TASK_FIELDS}`,
    [user.id, title, priority, dueDate],
  );

  return NextResponse.json({ task: rows[0] }, { status: 201 });
}
