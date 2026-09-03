import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'SKILLTRACK AI — Performance Engineering & Career Readiness',
  description:
    'AI-powered skill development and placement-readiness platform for engineering students.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-foreground transition-colors duration-200 antialiased selection:bg-[#FFD400] selection:text-black`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          <ReactQueryProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'var(--surface)',
                    border: '1px solid rgba(255, 212, 0, 0.35)',
                    color: 'var(--foreground)',
                  },
                }}
                closeButton
              />
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

