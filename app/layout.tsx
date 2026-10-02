import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Task board',
  description: 'A simple task manager with boards, due dates and priorities.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
