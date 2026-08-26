import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AdaptiLab — Adaptive Learning Platform',
  description: 'Courses that adjust to you: Elo-based mastery, productive-struggle question picking, honest progress.',
  icons: { icon: '/logo.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="splash" className="splash-wrap">
          <img src="/logo.svg" alt="" width={84}/>
          <h1>ADAPTILAB</h1>
          <p>Every answer teaches.</p>
          <div className="splash-bar"><i></i></div>
        </div>
        {children}
      </body>
      <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('load', () => {
          setTimeout(() => document.getElementById('splash')?.classList.add('gone'), 900);
          setTimeout(() => document.getElementById('splash')?.remove(), 1600);
        });
      `}}/>
    </html>
  );
}
