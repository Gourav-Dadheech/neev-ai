'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Cpu, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function DottedStructureFlow() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth || 900;
        const height = container.clientHeight || 340;

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(55, width / height, 1, 1000);
        camera.position.set(0, 18, 38);
        camera.lookAt(0, 0, 0);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.replaceChildren(renderer.domElement);

        // Create 3D Dotted Grid Wave Structure
        const countX = 55;
        const countZ = 45;
        const numParticles = countX * countZ;
        const positions = new Float32Array(numParticles * 3);
        const colors = new Float32Array(numParticles * 3);

        const colorA = new THREE.Color(0x06b6d4); // Cyan
        const colorB = new THREE.Color(0x3b82f6); // Blue
        const colorC = new THREE.Color(0xa855f7); // Purple
        const colorD = new THREE.Color(0xec4899); // Magenta

        let i = 0;
        for (let ix = 0; ix < countX; ix++) {
            for (let iz = 0; iz < countZ; iz++) {
                // X & Z spread
                const x = (ix - countX / 2) * 1.5;
                const z = (iz - countZ / 2) * 1.5;
                positions[i * 3] = x;
                positions[i * 3 + 1] = 0; // Y will animate
                positions[i * 3 + 2] = z;

                // Color gradient based on coordinates
                const factor = (ix / countX + iz / countZ) / 2;
                const c = new THREE.Color();
                if (factor < 0.33) {
                    c.lerpColors(colorA, colorB, factor * 3);
                } else if (factor < 0.66) {
                    c.lerpColors(colorB, colorC, (factor - 0.33) * 3);
                } else {
                    c.lerpColors(colorC, colorD, (factor - 0.66) * 3);
                }

                colors[i * 3] = c.r;
                colors[i * 3 + 1] = c.g;
                colors[i * 3 + 2] = c.b;
                i++;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Circle Particle Texture
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, 'rgba(255,255,255,1)');
            grad.addColorStop(0.4, 'rgba(255,255,255,0.8)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 32, 32);
        }
        const particleTexture = new THREE.CanvasTexture(canvas);

        const material = new THREE.PointsMaterial({
            size: 1.2,
            vertexColors: true,
            map: particleTexture,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        // Animation Loop
        let animationFrameId: number;
        let count = 0;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            count += 0.035;

            const posAttr = geometry.attributes.position;
            const posArray = posAttr.array as Float32Array;

            let idx = 0;
            for (let ix = 0; ix < countX; ix++) {
                for (let iz = 0; iz < countZ; iz++) {
                    const wave1 = Math.sin(ix * 0.25 + count) * 2.2;
                    const wave2 = Math.cos(iz * 0.2 + count * 0.8) * 1.8;
                    const wave3 = Math.sin((ix + iz) * 0.15 + count * 1.2) * 1.2;
                    posArray[idx * 3 + 1] = wave1 + wave2 + wave3;
                    idx++;
                }
            }

            posAttr.needsUpdate = true;
            particleSystem.rotation.y = Math.sin(count * 0.2) * 0.08;
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            particleTexture.dispose();
        };
    }, []);

    return (
        <div className="relative w-full overflow-hidden py-8 my-4 rounded-2xl border border-dashed border-border bg-gradient-to-b from-slate-950/60 via-slate-950/90 to-slate-950/60 backdrop-blur-xl">
            {/* Top Atmospheric Colour Beams */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-1/4 w-[380px] h-[220px] rounded-full bg-cyan-500/15 blur-[90px]" />
                <div className="absolute -top-20 right-1/4 w-[380px] h-[220px] rounded-full bg-purple-600/15 blur-[90px]" />
            </div>

            {/* Header Text overlay */}
            <div className="relative z-10 text-center px-4 mb-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 mb-2">
                    <Activity className="size-3 animate-pulse" />
                    <span>NeeV Neural Spatial Wave Engine</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-medium tracking-tight">
                    Continuous Mathematical Topography &amp; Vastu Flux
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mt-1">
                    Every floor plan is synthesized over a continuous energy flux grid, balancing daylight, thermal loads, and directional prana flow.
                </p>
            </div>

            {/* 3D Wave Mount */}
            <div ref={containerRef} className="relative w-full h-[240px] sm:h-[300px] cursor-pointer" />

            {/* Floating Live Architectural Telemetry Nodes */}
            <div className="relative z-10 px-4 sm:px-8 mt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
                    <div className="flex items-center gap-2.5 rounded-xl border border-cyan-500/20 bg-black/50 p-2.5 backdrop-blur-md">
                        <span className="relative flex size-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex rounded-full size-2.5 bg-cyan-500" />
                        </span>
                        <div>
                            <div className="text-[10px] font-mono text-muted-foreground uppercase">Graph Solver</div>
                            <div className="text-xs font-semibold text-cyan-300">0.04s Latency</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-black/50 p-2.5 backdrop-blur-md">
                        <span className="relative flex size-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full size-2.5 bg-blue-500" />
                        </span>
                        <div>
                            <div className="text-[10px] font-mono text-muted-foreground uppercase">Vastu Purusha</div>
                            <div className="text-xs font-semibold text-blue-300">9-Padma Sync</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl border border-purple-500/20 bg-black/50 p-2.5 backdrop-blur-md">
                        <span className="relative flex size-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                            <span className="relative inline-flex rounded-full size-2.5 bg-purple-300" />
                        </span>
                        <div>
                            <div className="text-[10px] font-mono text-muted-foreground uppercase">3D CAD Mesh</div>
                            <div className="text-xs font-semibold text-purple-300">Auto PBR Shading</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl border border-pink-500/20 bg-black/50 p-2.5 backdrop-blur-md">
                        <span className="relative flex size-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                            <span className="relative inline-flex rounded-full size-2.5 bg-pink-300" />
                        </span>
                        <div>
                            <div className="text-[10px] font-mono text-muted-foreground uppercase">CPWD Takeoff</div>
                            <div className="text-xs font-semibold text-pink-300">₹42.8L Estimated</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
