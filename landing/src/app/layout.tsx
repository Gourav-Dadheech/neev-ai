import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { getMessages, getLocale } from 'next-intl/server';
import { ThemeProvider, I18nProvider, SmoothScrollProvider } from '@/providers';

import '@/styles/globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'NeeV.ai — Autonomous Architectural AI Platform',
        template: '%s | NeeV.ai Spatial Studio',
    },
    description: 'Transform plot dimensions and architectural intent into municipality-compliant 2D CAD blueprints, interactive 3D WebGL models, and CPWD civil BOQ material estimations.',
    keywords: ['NeeV.ai', 'AI architecture', 'generative CAD', 'autonomous BIM', 'civil BOQ', 'Vastu Shastra', 'Three.js WebGL', 'FastAPI'],
    authors: [{ name: 'NeeV.ai Spatial Studio' }],
    creator: 'NeeV.ai',
    metadataBase: new URL('https://neev-ai.vercel.app'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://neev-ai.vercel.app',
        title: 'NeeV.ai — Autonomous Architectural AI Platform',
        description: 'Instant 2D CAD blueprints, Vastu Shastra compliance analysis, 3D photorealistic elevations, and structural BoQ takeoffs.',
        siteName: 'NeeV.ai',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'NeeV.ai — Autonomous Architectural AI Platform',
        description: 'Instant 2D CAD blueprints, Vastu Shastra compliance analysis, 3D photorealistic elevations, and structural BoQ takeoffs.',
        creator: '@neev_ai',
    },
    icons: {
        icon: [
            { url: '/favicon.svg', type: 'image/svg+xml' }
        ],
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#09090b' },
    ],
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans relative bg-background text-foreground antialiased selection:bg-blue-500/20 selection:text-blue-400`}>
                <ThemeProvider>
                    <I18nProvider locale={locale} messages={messages}>
                        <SmoothScrollProvider>
                            <main className="min-h-screen flex flex-col">
                                {children}
                            </main>
                        </SmoothScrollProvider>
                    </I18nProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
