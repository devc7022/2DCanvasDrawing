import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '2D Drawing Tool - CAD Canvas Vector Editor',
  description:
    'A high-performance 2D drawing application built with Next.js, TypeScript, and raw HTML5 Canvas 2D API.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
