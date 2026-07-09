import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'NusaMind AI V13.1',
  description: 'NusaMind AI V13.1: local intelligence with Quran Exact Guard, Universal RAG, coding/debug mode, workflow, memory, and monitoring',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
