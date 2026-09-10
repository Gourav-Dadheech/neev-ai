'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import {
    Sparkles,
    Layers,
    Compass,
    Box,
    Calculator,
    MessageSquare,
    CheckCircle2,
    ArrowRight,
    ArrowUpRight,
    Sun,
    Moon,
    Maximize2,
    FileText,
    Check,
    ChevronDown,
    ShieldCheck,
    Cpu,
    Zap,
    Building2,
    Download,
    Eye,
    Activity,
    SlidersHorizontal
} from 'lucide-react';
import NeevLogo from '@/components/ui/NeevLogo';

// Dynamic client-side 3D modules
const Architectural3DViewer = dynamic(
    () => import('@/components/showcase/Architectural3DViewer'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[420px] w-full rounded-xl bg-slate-950 flex flex-col items-center justify-center gap-3 text-muted-foreground font-mono text-xs border border-border">
                <div className="size-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                <span>Initializing 3D WebGL Shader Pipeline...</span>
            </div>
        )
    }
);

const DottedStructureFlow = dynamic(
    () => import('@/components/showcase/DottedStructureFlow'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[280px] w-full rounded-xl bg-slate-950/60 animate-pulse flex items-center justify-center text-muted-foreground font-mono text-xs">
                <span>Loading Neural Spatial Field...</span>
            </div>
        )
    }
);

// ─── Corner Crosshair Accent (Intellune Signature) ───────────────────────────
function CornerPlus({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
    const pos = {
        'top-left': '-top-3 -left-3',
        'top-right': '-top-3 -right-3',
        'bottom-left': '-bottom-3 -left-3',
        'bottom-right': '-bottom-3 -right-3',
    }[position];

    return (
        <div className={`absolute ${pos} z-20 hidden sm:flex items-center justify-center size-6 pointer-events-none select-none text-muted-foreground/60`}>
            <div className="relative size-6">
                <div className="absolute left-3 top-0 h-6 w-px bg-border" />
                <div className="absolute top-3 left-0 w-6 h-px bg-border" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

// ─── Main Landing Page ───────────────────────────────────────────────────────
export default function NeevLandingPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'blueprint' | 'render3d' | 'vastu'>('render3d');
    const [renderSubTab, setRenderSubTab] = useState<'interactive3d' | 'photo4k'>('interactive3d');
    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleFaq = (idx: number) => {
        setFaqOpen(faqOpen === idx ? null : idx);
    };

    // Direct Studio URL
    const STUDIO_URL = "https://neev-ai-ri5z.onrender.com/";

    const handleLaunchStudio = (e: React.MouseEvent) => {
        window.open(STUDIO_URL, "_blank");
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-blue-600/20 selection:text-blue-400">
            {/* ─── Top Atmospheric Colour Beams (Intellune Style) ────────────── */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full bg-gradient-to-tr from-blue-600/20 via-cyan-400/15 to-purple-600/15 blur-[150px]" />
                <div className="absolute top-[40%] right-[-10%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-indigo-600/15 via-purple-500/10 to-transparent blur-[160px]" />
                <div className="absolute top-[65%] left-[-10%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-cyan-600/15 via-blue-500/10 to-transparent blur-[160px]" />
            </div>

            {/* ─── Sticky Intellune Header ──────────────────────────────────── */}
            <header className="sticky top-0 z-50 w-full border-b border-dashed border-border bg-background/85 backdrop-blur-md">
                <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:border-x border-dashed border-border lg:px-6">
                    {/* Brand */}
                    <a href="#" className="flex items-center gap-3 group">
                        <NeevLogo size={36} />
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold tracking-tight text-base sm:text-lg">NeeV<span className="text-blue-500">.ai</span></span>
                            <span className="rounded-full bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-medium text-blue-300">
                                v3.0 Spatial CAD
                            </span>
                        </div>
                    </a>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                        <a href="#features" className="transition-colors hover:text-foreground">Features</a>
                        <a href="#3d-model" className="transition-colors hover:text-foreground">3D Interactive</a>
                        <a href="#vastu" className="transition-colors hover:text-foreground">Vastu Engine</a>
                        <a href="#flux-wave" className="transition-colors hover:text-foreground">Spatial Flux</a>
                        <a href="#boq" className="transition-colors hover:text-foreground">Cost Estimator</a>
                        <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
                    </nav>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2.5 sm:gap-3.5">
                        {/* Status badge */}
                        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>FastAPI Core Active</span>
                        </div>

                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="flex size-8.5 items-center justify-center rounded-full border border-border bg-background/60 p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun className="size-4 text-amber-300" /> : <Moon className="size-4 text-blue-400" />}
                            </button>
                        )}

                        {/* CTA Studio Button */}
                        <button
                            onClick={handleLaunchStudio}
                            className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-95 group"
                        >
                            <span>Launch Studio</span>
                            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* ─── Hero Section ─────────────────────────────────────────────── */}
            <section className="relative z-10 w-full overflow-hidden">
                <div className="container relative mx-auto overflow-visible">
                    <div className="relative z-10 w-full border-dashed border-border sm:border-x px-4 pt-12 pb-16 sm:px-8 sm:pt-20 sm:pb-20 md:px-16 md:pt-24 text-center">
                        <CornerPlus position="top-left" />
                        <CornerPlus position="top-right" />
                        <CornerPlus position="bottom-left" />
                        <CornerPlus position="bottom-right" />

                        {/* Announcement Pill with Colorful Glow */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 px-4 py-1.5 text-xs text-cyan-300 mb-6 backdrop-blur-md shadow-lg shadow-cyan-500/10">
                            <Sparkles className="size-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                            <span className="font-medium">The World&apos;s First Vastu-Compliant Generative CAD Engine</span>
                        </div>

                        {/* Main Title with Colorful Gradient */}
                        <h1 className="mx-auto max-w-4xl text-3xl font-medium tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
                            Autonomous Architectural AI<br />
                            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
                                That Designs For You
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                            Input your plot dimensions and architectural intent. NeeV AI autonomously synthesizes
                            municipality-compliant 2D CAD blueprints, interactive 3D WebGL models, and CPWD civil BOQ material takeoffs in seconds.
                        </p>

                        {/* Primary CTAs */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
                            <button
                                onClick={handleLaunchStudio}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-7 py-3.5 text-sm sm:text-base font-semibold text-white shadow-xl shadow-blue-600/30 hover:shadow-cyan-500/25 hover:scale-[1.02] transition-all active:scale-95 group"
                            >
                                <Zap className="size-4 text-cyan-200" />
                                <span>Launch NeeV Studio ⚡</span>
                                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </button>

                            <a
                                href="#3d-model"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 px-6 py-3.5 text-sm sm:text-base font-medium text-foreground hover:bg-muted/70 transition-all backdrop-blur-sm"
                            >
                                <Eye className="size-4 text-blue-400" />
                                <span>Inspect 3D Model</span>
                            </a>
                        </div>

                        {/* Sub-note */}
                        <p className="mt-4 text-xs text-muted-foreground">
                            Free tier available • No AutoCAD or Revit license needed • Exports DXF, PDF & 3D WebGL
                        </p>

                        {/* ─── Centerpiece 3D Interactive Showcase ─────────────────── */}
                        <div id="3d-model" className="mt-14 w-full scroll-mt-20">
                            {/* Showcase Tab Selector */}
                            <div className="inline-flex items-center p-1 rounded-xl border border-border bg-background/80 backdrop-blur-md mb-6 shadow-sm">
                                <button
                                    onClick={() => setActiveTab('render3d')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                        activeTab === 'render3d'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Box className="size-4" />
                                    <span>3D Architectural Model</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('blueprint')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                        activeTab === 'blueprint'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <FileText className="size-4" />
                                    <span>2D CAD Blueprint</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('vastu')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                        activeTab === 'vastu'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Compass className="size-4" />
                                    <span>Vastu Purusha Grid</span>
                                </button>
                            </div>

                            {/* Main Active Card with Glowing Gradient Border */}
                            <div className="relative mx-auto max-w-4xl rounded-2xl p-[1px] bg-gradient-to-b from-blue-500/40 via-cyan-500/20 to-purple-500/30 shadow-2xl">
                                <div className="rounded-[15px] bg-card/95 p-4 sm:p-6 md:p-8 backdrop-blur-xl text-left">
                                    {/* TAB 1: 3D Facade & Elevation with Interactive Three.js Model */}
                                    {activeTab === 'render3d' && (
                                        <div className="space-y-4">
                                            {/* Sub-tab switcher: Interactive 3D WebGL vs 4K Photo Render */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2.5 rounded-full bg-cyan-400 animate-pulse" />
                                                        <h3 className="font-semibold text-base sm:text-lg">Generative 3D Spatial Architecture</h3>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                                        Real-time WebGL orbit with parametric walls, slabs, teak louvers &amp; cantilevered volumetric mass
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-muted/40 text-xs">
                                                    <button
                                                        onClick={() => setRenderSubTab('interactive3d')}
                                                        className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                                                            renderSubTab === 'interactive3d'
                                                                ? 'bg-blue-600 text-white shadow-sm'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        🎮 3D WebGL Orbit
                                                    </button>
                                                    <button
                                                        onClick={() => setRenderSubTab('photo4k')}
                                                        className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                                                            renderSubTab === 'photo4k'
                                                                ? 'bg-blue-600 text-white shadow-sm'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        🖼️ 4K Photorealistic
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Sub-tab 1: Interactive Three.js Model */}
                                            {renderSubTab === 'interactive3d' && (
                                                <div>
                                                    <Architectural3DViewer />
                                                </div>
                                            )}

                                            {/* Sub-tab 2: 4K Photorealistic Neural Render */}
                                            {renderSubTab === 'photo4k' && (
                                                <div className="relative h-[360px] sm:h-[460px] w-full rounded-xl overflow-hidden border border-border group">
                                                    <Image
                                                        src="/renders/living_room.jpg"
                                                        alt="NeeV AI Photorealistic Living Room Elevation"
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                        sizes="(max-width: 768px) 100vw, 800px"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-white">
                                                        <div>
                                                            <h4 className="font-semibold text-base">Double-Height Living &amp; Panoramic Glazing</h4>
                                                            <p className="text-xs text-white/70">Material Spec: Italian Travertine, Teak Louvers, Low-E Glass</p>
                                                        </div>
                                                        <span className="rounded bg-black/70 backdrop-blur-md px-3 py-1.5 text-xs font-mono text-cyan-300 border border-white/10">
                                                            Rendered in 1.8s
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB 2: 2D CAD Blueprint */}
                                    {activeTab === 'blueprint' && (
                                        <div className="space-y-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2.5 rounded-full bg-blue-500" />
                                                        <h3 className="font-semibold text-base sm:text-lg">Ground Floor Spatial Blueprint — 3BHK Executive</h3>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Plot Size: 40&apos; × 60&apos; (2,400 Sq.Ft) • Facing: East • Bylaw: NBC Compliant</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                                        Vastu Score: 96%
                                                    </span>
                                                    <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
                                                        Area: 1,840 sq.ft
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Blueprint Canvas SVG Simulation */}
                                            <div className="relative h-[320px] sm:h-[420px] w-full rounded-xl border border-blue-900/40 bg-slate-950 p-4 overflow-hidden blueprint-grid flex flex-col justify-between">
                                                <div className="flex justify-between items-start text-[11px] font-mono text-blue-400/80">
                                                    <div className="space-y-0.5">
                                                        <div>SCALE: 1/4&quot; = 1&apos;-0&quot;</div>
                                                        <div>SETBACK: F: 5&apos; | R: 4&apos; | S1: 3&apos; | S2: 3&apos;</div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 rounded border border-blue-500/30 bg-blue-950/60 px-2 py-1 text-blue-300">
                                                        <Compass className="size-3.5" />
                                                        <span>NORTH ▲</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2.5 my-auto max-w-xl mx-auto w-full">
                                                    <div className="h-24 sm:h-28 rounded border-2 border-dashed border-blue-500/60 bg-blue-950/30 p-2 flex flex-col justify-between hover:bg-blue-900/30 transition-colors">
                                                        <span className="text-[11px] font-mono text-blue-300 font-bold">PUJA ROOM</span>
                                                        <span className="text-[10px] font-mono text-muted-foreground">8&apos; × 6&apos; (Ishanya)</span>
                                                        <span className="text-[9px] text-emerald-400">✓ Vastu Perfect</span>
                                                    </div>
                                                    <div className="h-24 sm:h-28 rounded border-2 border-blue-500/60 bg-blue-950/30 p-2 flex flex-col justify-between col-span-2 hover:bg-blue-900/30 transition-colors">
                                                        <span className="text-[11px] font-mono text-blue-300 font-bold">LIVING &amp; DINING COURTYARD</span>
                                                        <span className="text-[10px] font-mono text-muted-foreground">22&apos; × 16&apos; (Double Height)</span>
                                                        <span className="text-[9px] text-blue-400">Natural Light 92%</span>
                                                    </div>
                                                    <div className="h-24 sm:h-28 rounded border-2 border-blue-500/60 bg-blue-950/30 p-2 flex flex-col justify-between hover:bg-blue-900/30 transition-colors">
                                                        <span className="text-[11px] font-mono text-blue-300 font-bold">MASTER BEDROOM</span>
                                                        <span className="text-[10px] font-mono text-muted-foreground">15&apos; × 14&apos; (Nairutya)</span>
                                                        <span className="text-[9px] text-emerald-400">Ensuite Bath</span>
                                                    </div>
                                                    <div className="h-24 sm:h-28 rounded border-2 border-dashed border-blue-500/40 bg-blue-950/20 p-2 flex flex-col justify-between hover:bg-blue-900/30 transition-colors">
                                                        <span className="text-[11px] font-mono text-blue-300 font-bold">CENTRAL ATRIUM</span>
                                                        <span className="text-[10px] font-mono text-muted-foreground">Brahmasthan Void</span>
                                                        <span className="text-[9px] text-sky-400">Open Sky</span>
                                                    </div>
                                                    <div className="h-24 sm:h-28 rounded border-2 border-blue-500/60 bg-blue-950/30 p-2 flex flex-col justify-between hover:bg-blue-900/30 transition-colors">
                                                        <span className="text-[11px] font-mono text-blue-300 font-bold">MODULAR KITCHEN</span>
                                                        <span className="text-[10px] font-mono text-muted-foreground">12&apos; × 10&apos; (Agneya)</span>
                                                        <span className="text-[9px] text-emerald-400">Fire Zone Align</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-blue-400/80 border-t border-blue-900/40 pt-2">
                                                    <div>WALLS: 9&quot; EXT / 4.5&quot; INT</div>
                                                    <div>CORRIDOR EFFICIENCY: 94.2%</div>
                                                    <div className="text-blue-300">AUTODESK DXF READY</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 3: Vastu Purusha Matrix */}
                                    {activeTab === 'vastu' && (
                                        <div className="space-y-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2.5 rounded-full bg-emerald-500" />
                                                        <h3 className="font-semibold text-base sm:text-lg">Vastu Purusha 9-Padma Energy Matrix</h3>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Automated directional energy compliance score for all spaces</p>
                                                </div>
                                                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-400">
                                                    96% Optimal Balance
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-emerald-400">Ishanya (North-East)</span>
                                                        <CheckCircle2 className="size-4 text-emerald-400" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Assigned: Puja Room &amp; Water Sump</p>
                                                    <div className="text-[11px] text-emerald-300/80 font-mono">100% Harmonic Flow</div>
                                                </div>

                                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-emerald-400">Agneya (South-East)</span>
                                                        <CheckCircle2 className="size-4 text-emerald-400" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Assigned: Modular Kitchen &amp; Cooktop</p>
                                                    <div className="text-[11px] text-emerald-300/80 font-mono">98% Fire Element Align</div>
                                                </div>

                                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-emerald-400">Nairutya (South-West)</span>
                                                        <CheckCircle2 className="size-4 text-emerald-400" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Assigned: Master Bedroom &amp; Vault</p>
                                                    <div className="text-[11px] text-emerald-300/80 font-mono">95% Earth Stability</div>
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground flex items-center justify-between">
                                                <span>Brahmasthan (Center): Preserved as zero-load central courtyard for unrestricted prana energy circulation.</span>
                                                <span className="font-semibold text-foreground">100% Compliant</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Middle Section: Animated 3D Dotted Structure Flow & Colourful Theme ── */}
            <section id="flux-wave" className="relative z-10 w-full border-b border-dashed border-border py-8 scroll-mt-20">
                <div className="container mx-auto sm:border-x border-dashed border-border px-4 sm:px-8">
                    <CornerPlus position="top-left" />
                    <CornerPlus position="top-right" />
                    <CornerPlus position="bottom-left" />
                    <CornerPlus position="bottom-right" />

                    {/* Dotted Structure Flow Component */}
                    <DottedStructureFlow />
                </div>
            </section>

            {/* ─── Social Proof & Technical Integrations Bar ────────────────── */}
            <section className="relative z-10 w-full border-b border-dashed border-border">
                <div className="container mx-auto sm:border-x border-dashed border-border py-8 px-4 sm:px-8">
                    <p className="text-center text-xs sm:text-sm text-muted-foreground mb-6">
                        Engineered for professional architects, structural engineers, and modern homeowners
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-muted-foreground/70 font-mono text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">AutoCAD DXF</span>
                            <span>Native Export</span>
                        </div>
                        <div className="size-1 rounded-full bg-border" />
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">Three.js WebGL</span>
                            <span>Real-Time 3D</span>
                        </div>
                        <div className="size-1 rounded-full bg-border" />
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">CPWD Schedule</span>
                            <span>Civil BOQ</span>
                        </div>
                        <div className="size-1 rounded-full bg-border" />
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">NBC India</span>
                            <span>Bylaw Solver</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Architectural Spotlight Quote ────────────────────────────── */}
            <section className="relative z-10 w-full border-b border-dashed border-border bg-gradient-to-r from-blue-950/20 via-slate-900/40 to-purple-950/20">
                <div className="container mx-auto sm:border-x border-dashed border-border py-14 px-4 sm:px-12 text-center">
                    <CornerPlus position="top-left" />
                    <CornerPlus position="top-right" />
                    <blockquote className="mx-auto max-w-3xl text-lg sm:text-2xl font-medium tracking-tight leading-snug">
                        &ldquo;The moment I typed the plot size, NeeV AI generated a fully compliant 3BHK layout with Vastu verification in 4 seconds. It replaces 3 full days of manual drafting and gives immediate client presentations.&rdquo;
                    </blockquote>
                    <div className="mt-4 flex flex-col items-center justify-center">
                        <span className="font-semibold text-sm">Ar. Rajesh Mehra</span>
                        <span className="text-xs text-muted-foreground">Principal Architect • Studio Form &amp; Space</span>
                    </div>
                </div>
            </section>

            {/* ─── Bento Grid Features Section ──────────────────────────────── */}
            <section id="features" className="relative z-10 w-full scroll-mt-20">
                <div className="container mx-auto sm:border-x border-dashed border-border">
                    {/* Section Header */}
                    <div className="border-b border-dashed border-border px-4 py-12 sm:px-8 sm:py-16 md:px-16">
                        <CornerPlus position="top-left" />
                        <CornerPlus position="top-right" />
                        <h2 className="text-2xl sm:text-4xl font-medium tracking-tight">
                            Built for Intelligent Architecture.<br />
                            <span className="text-muted-foreground">From plot sketch to municipal submission in under 60 seconds.</span>
                        </h2>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-b border-dashed border-border">
                        {/* Bento 1: 2D Generative CAD */}
                        <div className="p-6 sm:p-8 border-b md:border-r border-dashed border-border flex flex-col justify-between group hover:bg-blue-500/[0.03] transition-colors">
                            <div>
                                <div className="size-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                    <FileText className="size-5" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Automated CAD Layout Engine</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Converts plot dimensions and facing into clean, dimensioned room allocations with municipal setback compliance and zero corridor wastage.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-blue-400">
                                <span>Export: .DXF, .SVG, .PDF</span>
                                <ArrowRight className="size-3.5" />
                            </div>
                        </div>

                        {/* Bento 2: Vastu Engine */}
                        <div id="vastu" className="p-6 sm:p-8 border-b lg:border-r border-dashed border-border flex flex-col justify-between group hover:bg-emerald-500/[0.03] transition-colors">
                            <div>
                                <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                    <Compass className="size-5" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Vastu Shastra AI Verification</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Evaluates every room against the 9-padma Vastu Purusha Mandala. Gives actionable directional recommendations for maximum prosperity and light.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-emerald-400">
                                <span>Real-time Harmony Scoring</span>
                                <ArrowRight className="size-3.5" />
                            </div>
                        </div>

                        {/* Bento 3: 3D WebGL Orbit */}
                        <div className="p-6 sm:p-8 border-b md:border-r lg:border-r-0 border-dashed border-border flex flex-col justify-between group hover:bg-purple-500/[0.03] transition-colors">
                            <div>
                                <div className="size-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                    <Box className="size-5" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Interactive 3D WebGL Orbit</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Walk through generated floor plans in real-time 3D right inside your browser. Inspect wall heights, window cuts, and sunlight ingress angles.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-purple-400">
                                <span>No GPU setup required</span>
                                <ArrowRight className="size-3.5" />
                            </div>
                        </div>

                        {/* Bento 4: BOQ Cost Estimator */}
                        <div id="boq" className="p-6 sm:p-8 border-b md:border-r border-dashed border-border flex flex-col justify-between group hover:bg-amber-500/[0.03] transition-colors">
                            <div>
                                <div className="size-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                    <Calculator className="size-5" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">CPWD Schedule BOQ Estimator</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Get an immediate bill of quantities: cement bags, steel reinforcement tonnage, brick volume, plaster, and labor cost estimates broken down by square foot.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-amber-400">
                                <span>State-wise Rate Adjustment</span>
                                <ArrowRight className="size-3.5" />
                            </div>
                        </div>

                        {/* Bento 5: Conversational Co-Pilot (Span 2 cols on lg) */}
                        <div className="p-6 sm:p-8 border-b border-dashed border-border md:col-span-2 lg:col-span-2 flex flex-col justify-between group hover:bg-cyan-500/[0.03] transition-colors">
                            <div>
                                <div className="size-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                    <MessageSquare className="size-5" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Natural Language Architectural Co-Pilot</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Iterate and customize your design just by speaking. Type &ldquo;Shift master bedroom to South-West and add a 10ft balcony overlooking the garden&rdquo; and the AI re-solves the CAD model automatically.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-cyan-400">
                                <span>Powered by Spatial LLM Reasoning</span>
                                <ArrowRight className="size-3.5" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── How It Works (3 Steps) ───────────────────────────────────── */}
            <section className="relative z-10 w-full border-b border-dashed border-border py-16 sm:py-20">
                <div className="container mx-auto sm:border-x border-dashed border-border px-4 sm:px-8 md:px-16">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-xs font-mono text-blue-500 uppercase tracking-wider">Workflow</span>
                        <h2 className="text-2xl sm:text-4xl font-medium tracking-tight mt-1">From Idea to CAD in 3 Steps</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-xl border border-dashed border-border p-6 bg-card/60 relative hover:border-blue-500/40 transition-colors">
                            <span className="font-mono text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">01</span>
                            <h3 className="text-lg font-semibold mt-3 mb-2">Enter Plot &amp; Facing</h3>
                            <p className="text-sm text-muted-foreground">Provide plot dimensions (e.g. 30×50), road orientation, number of bedrooms, and preferred setbacks.</p>
                        </div>

                        <div className="rounded-xl border border-dashed border-border p-6 bg-card/60 relative hover:border-purple-500/40 transition-colors">
                            <span className="font-mono text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent">02</span>
                            <h3 className="text-lg font-semibold mt-3 mb-2">AI Synthesizes Blueprint</h3>
                            <p className="text-sm text-muted-foreground">The generative engine arranges rooms, validates Vastu energy alignment, and renders live 2D &amp; 3D models.</p>
                        </div>

                        <div className="rounded-xl border border-dashed border-border p-6 bg-card/60 relative hover:border-emerald-500/40 transition-colors">
                            <span className="font-mono text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-400 bg-clip-text text-transparent">03</span>
                            <h3 className="text-lg font-semibold mt-3 mb-2">Export &amp; Construct</h3>
                            <p className="text-sm text-muted-foreground">Download standard AutoCAD .DXF files, print presentation PDFs, and get an itemized civil bill of materials.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Interactive FAQ Accordion ─────────────────────────────────── */}
            <section id="faq" className="relative z-10 w-full border-b border-dashed border-border py-16 sm:py-20 scroll-mt-20">
                <div className="container mx-auto sm:border-x border-dashed border-border px-4 sm:px-8 md:px-16">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-10">
                            <span className="text-xs font-mono text-blue-500 uppercase tracking-wider">Frequently Asked Questions</span>
                            <h2 className="text-2xl sm:text-4xl font-medium tracking-tight mt-1">Answers to Common Questions</h2>
                        </div>

                        <div className="space-y-3">
                            {[
                                {
                                    q: "Can I open the NeeV AI Studio directly without visiting this landing page?",
                                    a: "Yes, 100%! Anyone who bookmarks or opens your direct link (https://neev-ai-ri5z.onrender.com/) lands directly inside the full AI Studio workspace without seeing any landing page."
                                },
                                {
                                    q: "Can I export drawings to AutoCAD or Revit?",
                                    a: "Yes. NeeV AI exports industry-standard .DXF files that can be opened directly in AutoCAD, Revit, ArchiCAD, and Blender with accurate millimeter scaling and layer separations."
                                },
                                {
                                    q: "How accurate is the Vastu Shastra engine?",
                                    a: "The Vastu engine implements the ancient 9-padma Vedic Purusha Mandala grid, calculating sub-quadrant directional alignments for water, fire, earth, air, and Brahmasthan elements with real-time scoring."
                                },
                                {
                                    q: "Does NeeV AI calculate municipal setbacks automatically?",
                                    a: "Yes. The engine applies National Building Code (NBC) standard setback allowances (front, rear, and sides) based on your road width and plot classification before allocating rooms."
                                },
                                {
                                    q: "How does the civil cost estimation work?",
                                    a: "Our BOQ estimator uses standard CPWD Schedule-of-Rates to calculate quantities of 43/53 grade cement bags, Fe500 TMT steel tonnage, brickwork cubic meters, and labor per square foot."
                                }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl border border-dashed border-border bg-card/60 transition-all overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-medium text-sm sm:text-base hover:text-blue-400 transition-colors"
                                    >
                                        <span>{item.q}</span>
                                        <ChevronDown className={`size-4 transition-transform duration-300 ${faqOpen === idx ? 'rotate-180 text-blue-500' : 'text-muted-foreground'}`} />
                                    </button>
                                    {faqOpen === idx && (
                                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-dashed border-border pt-3">
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Final Call To Action ─────────────────────────────────────── */}
            <section className="relative z-10 w-full border-b border-dashed border-border py-16 sm:py-24 overflow-hidden">
                <div className="container relative mx-auto sm:border-x border-dashed border-border px-4 sm:px-8 text-center">
                    <CornerPlus position="top-left" />
                    <CornerPlus position="top-right" />
                    <CornerPlus position="bottom-left" />
                    <CornerPlus position="bottom-right" />

                    <div className="mx-auto max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 px-4 py-1 text-xs text-blue-300 mb-4 shadow-sm">
                            <Sparkles className="size-3.5 text-cyan-400" />
                            <span>Start Designing For Free</span>
                        </div>

                        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight leading-tight">
                            Ready to Design Your Next Landmark?
                        </h2>

                        <p className="mt-4 text-sm sm:text-base text-muted-foreground">
                            Experience the future of generative spatial architecture. Launch the NeeV AI Studio and generate your first floor plan in under 60 seconds.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                onClick={handleLaunchStudio}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-8 py-3.5 text-sm sm:text-base font-semibold text-white shadow-xl shadow-blue-600/30 hover:shadow-cyan-500/25 hover:scale-[1.02] transition-all active:scale-95 group"
                            >
                                <Zap className="size-4 text-cyan-200" />
                                <span>Launch NeeV Studio Now ⚡</span>
                                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Footer ───────────────────────────────────────────────────── */}
            <footer className="relative z-10 w-full border-b border-dashed border-border py-8 text-xs text-muted-foreground">
                <div className="container mx-auto sm:border-x border-dashed border-border px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <NeevLogo size={22} showBadge={false} />
                        <span className="font-semibold text-foreground">NeeV.ai Spatial Studio</span>
                        <span>• © 2026 All Rights Reserved</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                        <a href="#3d-model" className="hover:text-foreground transition-colors">3D Model</a>
                        <a href="#vastu" className="hover:text-foreground transition-colors">Vastu</a>
                        <a href="#boq" className="hover:text-foreground transition-colors">BOQ Estimator</a>
                        <button onClick={handleLaunchStudio} className="text-blue-400 hover:text-blue-300 font-medium">
                            Studio Direct Link ↗
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
