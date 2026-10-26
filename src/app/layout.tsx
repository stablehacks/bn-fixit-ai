import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FixIt AI — Autonomous Maintenance Operations Agent',
  description: 'AI-powered maintenance triage, deterministic safety escalation, SurrealDB agent memory, and work-order management for property managers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
