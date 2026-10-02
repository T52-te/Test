import { NextResponse } from 'next/server';
import { createSession, hashPassword } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.' },
      { status: 400 },
    );
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount) {
    return NextResponse.json({ error: 'That email is already registered.' }, { status: 409 });
  }

  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
    [email, await hashPassword(password)],
  );

  await createSession(rows[0].id);
  return NextResponse.json({ ok: true });
}
