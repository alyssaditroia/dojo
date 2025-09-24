import type { Metadata } from 'next'
import '../index.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'pwn.college DOJO',
  description: 'Cybersecurity education platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const mode = localStorage.getItem('dojo-ui-theme') || 'system';
              let resolvedMode = mode;
              if (mode === 'system') {
                resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              document.documentElement.classList.add(resolvedMode === 'dark' ? 'dark' : 'light');
              document.documentElement.style.visibility = '';
            `
          }}
        />
        <div className="min-h-screen bg-background text-foreground">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  )
}
