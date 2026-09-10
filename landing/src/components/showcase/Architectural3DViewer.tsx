'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCw, Sun, Moon, Eye, Maximize2, Layers, Sparkles } from 'lucide-react';

export default function Architectural3DViewer() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [wireframe, setWireframe] = useState(false);
    const [nightMode, setNightMode] = useState(true);
    const [autoRotate, setAutoRotate] = useState(true);
    const [loading, setLoading] = useState(true);

    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const lightsRef = useRef<{ ambient: THREE.AmbientLight; dir: THREE.DirectionalLight; interiors: THREE.PointLight[] } | null>(null);
    const materialsRef = useRef<THREE.Material[]>([]);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 420;

        // 1. Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(nightMode ? 0x070913 : 0xf1f5f9);
        scene.fog = new THREE.FogExp2(nightMode ? 0x070913 : 0xf1f5f9, 0.012);
        sceneRef.current = scene;

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 500);
        camera.position.set(24, 18, 30);

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        rendererRef.current = renderer;

        container.replaceChildren(renderer.domElement);

        // 4. OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
        controls.minDistance = 10;
        controls.maxDistance = 80;
        controls.target.set(0, 4, 0);
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 1.2;
        controlsRef.current = controls;

        // 5. Lighting
        const ambient = new THREE.AmbientLight(nightMode ? 0x1e293b : 0xffffff, nightMode ? 1.2 : 1.8);
        scene.add(ambient);

        const dir = new THREE.DirectionalLight(nightMode ? 0x60a5fa : 0xfffbeb, nightMode ? 2.0 : 3.5);
        dir.position.set(25, 40, 20);
        dir.castShadow = true;
        dir.shadow.mapSize.width = 1024;
        dir.shadow.mapSize.height = 1024;
        scene.add(dir);

        // Warm interior lights
        const interiorLights: THREE.PointLight[] = [];
        const warmLight1 = new THREE.PointLight(0xffa200, 3.5, 20);
        warmLight1.position.set(0, 3.5, 0);
        scene.add(warmLight1);
        interiorLights.push(warmLight1);

        const warmLight2 = new THREE.PointLight(0x38bdf8, 2.5, 22);
        warmLight2.position.set(4, 8, 2);
        scene.add(warmLight2);
        interiorLights.push(warmLight2);

        lightsRef.current = { ambient, dir, interiors: interiorLights };

        // 6. Build High-End Modern Architectural Villa
        const buildingGroup = new THREE.Group();
        const materialsList: THREE.Material[] = [];

        // Ground Foundation Plinth
        const plinthMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.1 });
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(26, 0.8, 22), plinthMat);
        plinth.position.y = 0.4;
        plinth.receiveShadow = true;
        buildingGroup.add(plinth);
        materialsList.push(plinthMat);

        // Technical Ground Grid
        const gridHelper = new THREE.GridHelper(40, 40, 0x3b82f6, 0x1e293b);
        gridHelper.position.y = 0.02;
        buildingGroup.add(gridHelper);

        // Water Reflection Pool (Front Terrace)
        const poolMat = new THREE.MeshPhysicalMaterial({
            color: 0x0ea5e9,
            roughness: 0.1,
            metalness: 0.2,
            transmission: 0.8,
            transparent: true,
            opacity: 0.85
        });
        const pool = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 6), poolMat);
        pool.position.set(-6, 0.5, 6);
        buildingGroup.add(pool);
        materialsList.push(poolMat);

        // Ground Floor Concrete Core
        const concreteMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.1 });
        const gfCore = new THREE.Mesh(new THREE.BoxGeometry(14, 4.5, 12), concreteMat);
        gfCore.position.set(-1, 3.05, -1);
        gfCore.castShadow = true;
        gfCore.receiveShadow = true;
        buildingGroup.add(gfCore);
        materialsList.push(concreteMat);

        // Ground Floor Glass Living Pavilion
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0x93c5fd,
            roughness: 0.05,
            metalness: 0.1,
            transmission: 0.75,
            transparent: true,
            opacity: 0.65
        });
        const gfGlass = new THREE.Mesh(new THREE.BoxGeometry(9, 4.2, 7), glassMat);
        gfGlass.position.set(3.5, 2.9, 3.5);
        gfGlass.castShadow = true;
        buildingGroup.add(gfGlass);
        materialsList.push(glassMat);

        // Structural Black Columns
        const columnMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3, metalness: 0.8 });
        const colGeom = new THREE.CylinderGeometry(0.2, 0.2, 4.5, 16);
        const colCoords = [
            [7.8, 3.05, 6.8],
            [7.8, 3.05, 0.2],
            [-0.8, 3.05, 6.8]
        ];
        colCoords.forEach(([x, y, z]) => {
            const col = new THREE.Mesh(colGeom, columnMat);
            col.position.set(x, y, z);
            col.castShadow = true;
            buildingGroup.add(col);
        });
        materialsList.push(columnMat);

        // Cantilevered First Floor Box (Upper Villa Floor)
        const cantileverMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.2 });
        const ffBox = new THREE.Mesh(new THREE.BoxGeometry(16, 4.2, 14), cantileverMat);
        ffBox.position.set(1.5, 7.4, 1);
        ffBox.castShadow = true;
        ffBox.receiveShadow = true;
        buildingGroup.add(ffBox);
        materialsList.push(cantileverMat);

        // Teak Wood Slat Screen (Warm Architectural Louvers)
        const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6, metalness: 0.05 });
        for (let i = 0; i < 12; i++) {
            const slat = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.8, 0.3), woodMat);
            slat.position.set(9.55, 7.4, -4.5 + i * 0.8);
            slat.castShadow = true;
            buildingGroup.add(slat);
        }
        materialsList.push(woodMat);

        // Upper Ribbon Window
        const ribbonWindow = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 0.2), glassMat);
        ribbonWindow.position.set(1.5, 7.8, 8.05);
        buildingGroup.add(ribbonWindow);

        // Balcony Glass Railing
        const balconyGlassMat = new THREE.MeshPhysicalMaterial({
            color: 0x38bdf8,
            roughness: 0.1,
            transmission: 0.8,
            transparent: true,
            opacity: 0.5
        });
        const balcony = new THREE.Mesh(new THREE.BoxGeometry(7, 1.1, 0.1), balconyGlassMat);
        balcony.position.set(-4, 6.0, 7.2);
        buildingGroup.add(balcony);

        // Modern Minimalist Flat Roof with Overhang
        const roofSlabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
        const roof = new THREE.Mesh(new THREE.BoxGeometry(17.5, 0.5, 15.5), roofSlabMat);
        roof.position.set(1.5, 9.75, 1);
        roof.castShadow = true;
        buildingGroup.add(roof);
        materialsList.push(roofSlabMat);

        // Rooftop Solar Pergola Canopy
        const pergolaMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.8 });
        for (let i = 0; i < 6; i++) {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(7, 0.15, 0.25), pergolaMat);
            beam.position.set(3.5, 11.2, -3 + i * 1.2);
            beam.castShadow = true;
            buildingGroup.add(beam);
        }

        // CAD Edge Highlights (Cyan blueprint outline accent)
        const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(16, 4.2, 14));
        const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
        const edgeLines = new THREE.LineSegments(edges, lineMat);
        edgeLines.position.set(1.5, 7.4, 1);
        buildingGroup.add(edgeLines);

        scene.add(buildingGroup);
        materialsRef.current = materialsList;
        setLoading(false);

        // 7. Animation Loop
        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // 8. Resize Listener
        const handleResize = () => {
            if (!container) return;
            const newW = container.clientWidth;
            const newH = container.clientHeight;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    // Toggle Wireframe
    useEffect(() => {
        materialsRef.current.forEach((mat) => {
            if ('wireframe' in mat) {
                (mat as THREE.MeshStandardMaterial).wireframe = wireframe;
            }
        });
    }, [wireframe]);

    // Toggle Night / Day Lighting
    useEffect(() => {
        if (!sceneRef.current || !lightsRef.current) return;
        const { ambient, dir, interiors } = lightsRef.current;

        if (nightMode) {
            sceneRef.current.background = new THREE.Color(0x070913);
            sceneRef.current.fog = new THREE.FogExp2(0x070913, 0.012);
            ambient.color.setHex(0x1e293b);
            ambient.intensity = 1.2;
            dir.color.setHex(0x60a5fa);
            dir.intensity = 2.0;
            interiors.forEach(light => { light.intensity = 3.5; });
        } else {
            sceneRef.current.background = new THREE.Color(0xf8fafc);
            sceneRef.current.fog = new THREE.FogExp2(0xf8fafc, 0.008);
            ambient.color.setHex(0xffffff);
            ambient.intensity = 2.0;
            dir.color.setHex(0xfffbeb);
            dir.intensity = 3.8;
            interiors.forEach(light => { light.intensity = 0.5; });
        }
    }, [nightMode]);

    // Toggle Auto Rotation
    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.autoRotate = autoRotate;
        }
    }, [autoRotate]);

    const handleResetView = () => {
        if (controlsRef.current) {
            controlsRef.current.reset();
            controlsRef.current.target.set(0, 4, 0);
        }
    };

    return (
        <div className="relative w-full h-[360px] sm:h-[460px] rounded-xl overflow-hidden border border-border bg-slate-950 select-none group">
            {/* 3D Canvas Mount */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Top Interactive Controls Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                {/* Status & Model Meta */}
                <div className="flex items-center gap-2 rounded-lg bg-black/75 backdrop-blur-md px-3 py-1.5 border border-white/10 text-white text-xs pointer-events-auto">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-medium">Live 3D WebGL</span>
                    <span className="text-white/40">|</span>
                    <span className="font-mono text-[11px] text-blue-400">NeeV Villa 3BHK</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center gap-1.5 pointer-events-auto">
                    <button
                        onClick={() => setAutoRotate(!autoRotate)}
                        title={autoRotate ? "Pause Rotation" : "Auto Rotate"}
                        className={`flex size-8 items-center justify-center rounded-lg border text-xs transition-all ${
                            autoRotate
                                ? 'bg-blue-600/90 text-white border-blue-400 shadow-sm'
                                : 'bg-black/75 text-white/80 border-white/10 hover:bg-black'
                        }`}
                    >
                        <RotateCw className={`size-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                    </button>

                    <button
                        onClick={() => setNightMode(!nightMode)}
                        title={nightMode ? "Switch to Day Lighting" : "Switch to Night Lighting"}
                        className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-black/75 text-white/80 hover:bg-black transition-all"
                    >
                        {nightMode ? <Sun className="size-3.5 text-amber-300" /> : <Moon className="size-3.5 text-blue-300" />}
                    </button>

                    <button
                        onClick={() => setWireframe(!wireframe)}
                        title={wireframe ? "Realistic Shading" : "Wireframe CAD"}
                        className={`flex size-8 items-center justify-center rounded-lg border text-xs transition-all ${
                            wireframe
                                ? 'bg-cyan-600 text-white border-cyan-400'
                                : 'bg-black/75 text-white/80 border-white/10 hover:bg-black'
                        }`}
                    >
                        <Layers className="size-3.5" />
                    </button>

                    <button
                        onClick={handleResetView}
                        title="Reset Camera Angle"
                        className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-black/75 text-white/80 hover:bg-black transition-all"
                    >
                        <Eye className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* Bottom Interaction Guide */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-[11px] text-white/70">
                <div className="flex items-center gap-2 rounded-lg bg-black/75 backdrop-blur-md px-3 py-1.5 border border-white/10 font-mono">
                    <span className="text-blue-400">🖱️ Drag:</span> Orbit 360°
                    <span className="text-white/30">•</span>
                    <span className="text-blue-400">Scroll:</span> Zoom
                    <span className="text-white/30">•</span>
                    <span className="text-blue-400">Right-Click:</span> Pan
                </div>

                <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-black/75 backdrop-blur-md px-3 py-1.5 border border-white/10 font-mono text-emerald-400">
                    <Sparkles className="size-3" />
                    <span>Real-Time Spatial Shader</span>
                </div>
            </div>
        </div>
    );
}
