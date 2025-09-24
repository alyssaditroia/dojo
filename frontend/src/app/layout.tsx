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
              (function() {
                // Theme definitions - must match src/themes/definitions
                const themes = {
                  amethyst: {
                    light: {
                      background: '#ffffff',
                      foreground: '#1f2937',
                      card: '#ffffff',
                      cardForeground: '#1f2937',
                      popover: '#ffffff',
                      popoverForeground: '#1f2937',
                      primary: '#a855f7',
                      primaryForeground: '#ffffff',
                      secondary: '#f3f4f6',
                      secondaryForeground: '#1f2937',
                      muted: '#f9fafb',
                      mutedForeground: '#6b7280',
                      accent: '#e879f9',
                      accentForeground: '#1f2937',
                      destructive: '#ef4444',
                      destructiveForeground: '#ffffff',
                      border: '#e5e7eb',
                      input: '#f9fafb',
                      ring: '#a855f7',
                      chart1: '#a855f7',
                      chart2: '#e879f9',
                      chart3: '#06b6d4',
                      chart4: '#f59e0b',
                      chart5: '#10b981',
                      sidebar: '#f8fafc',
                      sidebarForeground: '#1f2937',
                      sidebarPrimary: '#a855f7',
                      sidebarPrimaryForeground: '#ffffff',
                      sidebarAccent: '#e879f9',
                      sidebarAccentForeground: '#1f2937',
                      sidebarBorder: '#e2e8f0',
                      sidebarRing: '#a855f7',
                      serviceBg: '#ffffff'
                    },
                    dark: {
                      background: '#111827',
                      foreground: '#f9fafb',
                      card: '#1f2937',
                      cardForeground: '#f9fafb',
                      popover: '#1f2937',
                      popoverForeground: '#f9fafb',
                      primary: '#a855f7',
                      primaryForeground: '#ffffff',
                      secondary: '#374151',
                      secondaryForeground: '#f9fafb',
                      muted: '#1f2937',
                      mutedForeground: '#9ca3af',
                      accent: '#c084fc',
                      accentForeground: '#ffffff',
                      destructive: '#dc2626',
                      destructiveForeground: '#ffffff',
                      border: '#374151',
                      input: '#1f2937',
                      ring: '#a855f7',
                      chart1: '#a855f7',
                      chart2: '#c084fc',
                      chart3: '#06b6d4',
                      chart4: '#f59e0b',
                      chart5: '#10b981',
                      sidebar: '#0f172a',
                      sidebarForeground: '#f9fafb',
                      sidebarPrimary: '#a855f7',
                      sidebarPrimaryForeground: '#ffffff',
                      sidebarAccent: '#c084fc',
                      sidebarAccentForeground: '#ffffff',
                      sidebarBorder: '#1e293b',
                      sidebarRing: '#a855f7',
                      serviceBg: '#1f2937'
                    }
                  },
                  everforest: {
                    light: {
                      background: '#fdf6e3',
                      foreground: '#5c6a72',
                      card: '#f4f0d9',
                      cardForeground: '#5c6a72',
                      popover: '#f4f0d9',
                      popoverForeground: '#5c6a72',
                      primary: '#8da101',
                      primaryForeground: '#fdf6e3',
                      secondary: '#bdc3af',
                      secondaryForeground: '#5c6a72',
                      muted: '#efebd4',
                      mutedForeground: '#829181',
                      accent: '#3a94c5',
                      accentForeground: '#fdf6e3',
                      destructive: '#f85552',
                      destructiveForeground: '#fdf6e3',
                      border: '#e6e2cc',
                      input: '#efebd4',
                      ring: '#8da101',
                      chart1: '#8da101',
                      chart2: '#f57d26',
                      chart3: '#35a77c',
                      chart4: '#df69ba',
                      chart5: '#3a94c5',
                      sidebar: '#f4f0d9',
                      sidebarForeground: '#5c6a72',
                      sidebarPrimary: '#8da101',
                      sidebarPrimaryForeground: '#fdf6e3',
                      sidebarAccent: '#3a94c5',
                      sidebarAccentForeground: '#fdf6e3',
                      sidebarBorder: '#e0dcc7',
                      sidebarRing: '#8da101',
                      serviceBg: '#fdf6e3'
                    },
                    dark: {
                      background: '#2d353b',
                      foreground: '#d3c6aa',
                      card: '#343f44',
                      cardForeground: '#d3c6aa',
                      popover: '#343f44',
                      popoverForeground: '#d3c6aa',
                      primary: '#a7c080',
                      primaryForeground: '#2d353b',
                      secondary: '#56635f',
                      secondaryForeground: '#d3c6aa',
                      muted: '#3d484d',
                      mutedForeground: '#9da9a0',
                      accent: '#7fbbb3',
                      accentForeground: '#2d353b',
                      destructive: '#e67e80',
                      destructiveForeground: '#d3c6aa',
                      border: '#475258',
                      input: '#3d484d',
                      ring: '#a7c080',
                      chart1: '#a7c080',
                      chart2: '#e69875',
                      chart3: '#83c092',
                      chart4: '#d699b6',
                      chart5: '#7fbbb3',
                      sidebar: '#232a2e',
                      sidebarForeground: '#d3c6aa',
                      sidebarPrimary: '#a7c080',
                      sidebarPrimaryForeground: '#2d353b',
                      sidebarAccent: '#7fbbb3',
                      sidebarAccentForeground: '#2d353b',
                      sidebarBorder: '#4f585e',
                      sidebarRing: '#a7c080',
                      serviceBg: '#232A2E'
                    }
                  },
                  gruvbox: {
                    light: {
                      background: '#fbf1c7',
                      foreground: '#3c3836',
                      card: '#f9f5d7',
                      cardForeground: '#3c3836',
                      popover: '#f9f5d7',
                      popoverForeground: '#3c3836',
                      primary: '#b57614',
                      primaryForeground: '#fbf1c7',
                      secondary: '#ebdbb2',
                      secondaryForeground: '#3c3836',
                      muted: '#d5c4a1',
                      mutedForeground: '#665c54',
                      accent: '#d79921',
                      accentForeground: '#3c3836',
                      destructive: '#cc241d',
                      destructiveForeground: '#fbf1c7',
                      border: '#d5c4a1',
                      input: '#ebdbb2',
                      ring: '#b57614',
                      chart1: '#b57614',
                      chart2: '#d79921',
                      chart3: '#458588',
                      chart4: '#b16286',
                      chart5: '#689d6a',
                      sidebar: '#f2e5bc',
                      sidebarForeground: '#3c3836',
                      sidebarPrimary: '#b57614',
                      sidebarPrimaryForeground: '#fbf1c7',
                      sidebarAccent: '#d79921',
                      sidebarAccentForeground: '#3c3836',
                      sidebarBorder: '#d5c4a1',
                      sidebarRing: '#b57614',
                      serviceBg: '#fbf1c7'
                    },
                    dark: {
                      background: '#282828',
                      foreground: '#ebdbb2',
                      card: '#3c3836',
                      cardForeground: '#ebdbb2',
                      popover: '#3c3836',
                      popoverForeground: '#ebdbb2',
                      primary: '#fabd2f',
                      primaryForeground: '#282828',
                      secondary: '#504945',
                      secondaryForeground: '#ebdbb2',
                      muted: '#504945',
                      mutedForeground: '#a89984',
                      accent: '#fe8019',
                      accentForeground: '#282828',
                      destructive: '#fb4934',
                      destructiveForeground: '#282828',
                      border: '#665c54',
                      input: '#504945',
                      ring: '#fabd2f',
                      chart1: '#fabd2f',
                      chart2: '#fe8019',
                      chart3: '#83a598',
                      chart4: '#d3869b',
                      chart5: '#8ec07c',
                      sidebar: '#1d2021',
                      sidebarForeground: '#ebdbb2',
                      sidebarPrimary: '#fabd2f',
                      sidebarPrimaryForeground: '#282828',
                      sidebarAccent: '#fe8019',
                      sidebarAccentForeground: '#282828',
                      sidebarBorder: '#504945',
                      sidebarRing: '#fabd2f',
                      serviceBg: '#282828'
                    }
                  },
                  solarized: {
                    light: {
                      background: '#fdf6e3',
                      foreground: '#657b83',
                      card: '#eee8d5',
                      cardForeground: '#657b83',
                      popover: '#eee8d5',
                      popoverForeground: '#657b83',
                      primary: '#268bd2',
                      primaryForeground: '#fdf6e3',
                      secondary: '#eee8d5',
                      secondaryForeground: '#657b83',
                      muted: '#eee8d5',
                      mutedForeground: '#93a1a1',
                      accent: '#2aa198',
                      accentForeground: '#fdf6e3',
                      destructive: '#dc322f',
                      destructiveForeground: '#fdf6e3',
                      border: '#93a1a1',
                      input: '#eee8d5',
                      ring: '#268bd2',
                      chart1: '#268bd2',
                      chart2: '#2aa198',
                      chart3: '#859900',
                      chart4: '#d33682',
                      chart5: '#cb4b16',
                      sidebar: '#eee8d5',
                      sidebarForeground: '#657b83',
                      sidebarPrimary: '#268bd2',
                      sidebarPrimaryForeground: '#fdf6e3',
                      sidebarAccent: '#2aa198',
                      sidebarAccentForeground: '#fdf6e3',
                      sidebarBorder: '#93a1a1',
                      sidebarRing: '#268bd2',
                      serviceBg: '#fdf6e3'
                    },
                    dark: {
                      background: '#002b36',
                      foreground: '#839496',
                      card: '#073642',
                      cardForeground: '#839496',
                      popover: '#073642',
                      popoverForeground: '#839496',
                      primary: '#268bd2',
                      primaryForeground: '#fdf6e3',
                      secondary: '#073642',
                      secondaryForeground: '#839496',
                      muted: '#073642',
                      mutedForeground: '#586e75',
                      accent: '#2aa198',
                      accentForeground: '#fdf6e3',
                      destructive: '#dc322f',
                      destructiveForeground: '#fdf6e3',
                      border: '#586e75',
                      input: '#073642',
                      ring: '#268bd2',
                      chart1: '#268bd2',
                      chart2: '#2aa198',
                      chart3: '#859900',
                      chart4: '#d33682',
                      chart5: '#cb4b16',
                      sidebar: '#073642',
                      sidebarForeground: '#839496',
                      sidebarPrimary: '#268bd2',
                      sidebarPrimaryForeground: '#fdf6e3',
                      sidebarAccent: '#2aa198',
                      sidebarAccentForeground: '#fdf6e3',
                      sidebarBorder: '#586e75',
                      sidebarRing: '#268bd2',
                      serviceBg: '#002b36'
                    }
                  },
                  matrix: {
                    light: {
                      background: '#ffffff',
                      foreground: '#003300',
                      card: '#f0fff0',
                      cardForeground: '#003300',
                      popover: '#f0fff0',
                      popoverForeground: '#003300',
                      primary: '#00cc00',
                      primaryForeground: '#001100',
                      secondary: '#e6ffe6',
                      secondaryForeground: '#003300',
                      muted: '#ccffcc',
                      mutedForeground: '#006600',
                      accent: '#00ff00',
                      accentForeground: '#001100',
                      destructive: '#ff3333',
                      destructiveForeground: '#ffffff',
                      border: '#99ff99',
                      input: '#e6ffe6',
                      ring: '#00cc00',
                      chart1: '#00cc00',
                      chart2: '#00ff00',
                      chart3: '#009900',
                      chart4: '#33ff33',
                      chart5: '#66ff66',
                      sidebar: '#f0fff0',
                      sidebarForeground: '#003300',
                      sidebarPrimary: '#00cc00',
                      sidebarPrimaryForeground: '#001100',
                      sidebarAccent: '#00ff00',
                      sidebarAccentForeground: '#001100',
                      sidebarBorder: '#99ff99',
                      sidebarRing: '#00cc00',
                      serviceBg: '#ffffff'
                    },
                    dark: {
                      background: '#0a0a0a',
                      foreground: '#00ff00',
                      card: '#001100',
                      cardForeground: '#00ff00',
                      popover: '#001100',
                      popoverForeground: '#00ff00',
                      primary: '#00ff00',
                      primaryForeground: '#0a0a0a',
                      secondary: '#003300',
                      secondaryForeground: '#00ff00',
                      muted: '#002200',
                      mutedForeground: '#00cc00',
                      accent: '#00ff00',
                      accentForeground: '#0a0a0a',
                      destructive: '#ff0000',
                      destructiveForeground: '#ffffff',
                      border: '#004400',
                      input: '#002200',
                      ring: '#00ff00',
                      chart1: '#00ff00',
                      chart2: '#00cc00',
                      chart3: '#009900',
                      chart4: '#33ff33',
                      chart5: '#66ff66',
                      sidebar: '#001100',
                      sidebarForeground: '#00ff00',
                      sidebarPrimary: '#00ff00',
                      sidebarPrimaryForeground: '#0a0a0a',
                      sidebarAccent: '#00cc00',
                      sidebarAccentForeground: '#0a0a0a',
                      sidebarBorder: '#003300',
                      sidebarRing: '#00ff00',
                      serviceBg: '#0a0a0a'
                    }
                  }
                };

                // Get stored values
                const palette = localStorage.getItem('theme-palette') || 'amethyst';
                const mode = localStorage.getItem('dojo-ui-theme') || 'system';

                // Resolve mode
                let resolvedMode = mode;
                if (mode === 'system') {
                  resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }

                // Apply theme class
                document.documentElement.classList.add(resolvedMode === 'dark' ? 'dark' : 'light');

                // Get theme colors
                const theme = themes[palette] || themes.amethyst;
                const colors = resolvedMode === 'dark' ? theme.dark : theme.light;

                // Apply CSS variables
                const root = document.documentElement;
                root.style.setProperty('--background', colors.background);
                root.style.setProperty('--foreground', colors.foreground);
                root.style.setProperty('--card', colors.card);
                root.style.setProperty('--card-foreground', colors.cardForeground);
                root.style.setProperty('--popover', colors.popover);
                root.style.setProperty('--popover-foreground', colors.popoverForeground);
                root.style.setProperty('--primary', colors.primary);
                root.style.setProperty('--primary-foreground', colors.primaryForeground);
                root.style.setProperty('--secondary', colors.secondary);
                root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
                root.style.setProperty('--muted', colors.muted);
                root.style.setProperty('--muted-foreground', colors.mutedForeground);
                root.style.setProperty('--accent', colors.accent);
                root.style.setProperty('--accent-foreground', colors.accentForeground);
                root.style.setProperty('--destructive', colors.destructive);
                root.style.setProperty('--destructive-foreground', colors.destructiveForeground);
                root.style.setProperty('--border', colors.border);
                root.style.setProperty('--input', colors.input);
                root.style.setProperty('--ring', colors.ring);
                root.style.setProperty('--chart-1', colors.chart1);
                root.style.setProperty('--chart-2', colors.chart2);
                root.style.setProperty('--chart-3', colors.chart3);
                root.style.setProperty('--chart-4', colors.chart4);
                root.style.setProperty('--chart-5', colors.chart5);
                root.style.setProperty('--sidebar', colors.sidebar);
                root.style.setProperty('--sidebar-foreground', colors.sidebarForeground);
                root.style.setProperty('--sidebar-primary', colors.sidebarPrimary);
                root.style.setProperty('--sidebar-primary-foreground', colors.sidebarPrimaryForeground);
                root.style.setProperty('--sidebar-accent', colors.sidebarAccent);
                root.style.setProperty('--sidebar-accent-foreground', colors.sidebarAccentForeground);
                root.style.setProperty('--sidebar-border', colors.sidebarBorder);
                root.style.setProperty('--sidebar-ring', colors.sidebarRing);
                root.style.setProperty('--service-bg', colors.serviceBg || colors.background);
              })();
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
