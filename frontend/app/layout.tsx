import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SkillTrack AI — Know your skills. Find your gaps. Build your future.',
  description:
    'AI-powered skill development and placement-readiness platform for engineering students (SIH Problem Statement PS26135).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ReactQueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
