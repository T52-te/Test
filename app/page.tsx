import { redirect } from 'next/navigation';
import TaskBoard from '@/components/TaskBoard';
import { getCurrentUser } from '@/lib/auth';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { rows } = await pool.query(
    `SELECT id, title, status, priority, to_char(due_date, 'YYYY-MM-DD') AS due_date
       FROM tasks
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [user.id],
  );

  return <TaskBoard initialTasks={rows} email={user.email} />;
}
