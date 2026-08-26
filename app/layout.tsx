import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AdaptiLab — Adaptive Learning Platform',
  description: 'Courses that adjust to you: Elo-based mastery, productive-struggle question picking, honest progress.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
