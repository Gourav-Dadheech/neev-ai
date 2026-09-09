/**
 * Three.js 3D WebGL Multi-Domain Architectural & Civil Viewer
 * Renders:
 * 1. Bridges & Flyovers (deck, piers, abutments, pylons, cables, water)
 * 2. Roads & Highways (asphalt lanes, median, streetlights, guardrails)
 * 3. Shopping Malls (atrium cutaways, glass skylight, retail promenades, escalators)
 * 4. Residential Buildings (walls, slabs, doors, windows, roof)
 */

class Studio3DViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    this.modelGroup = null;
    this.floorGroups = [];
    this.roofGroup = null;
    
    this.wireframeMode = false;
    this.showRoof = true;
    this.showFurniture = true;
    this.showBiophilic = true;
    this.floorMaterialType = 'marble';
    this.wallFinishType = 'limewash';
    this.currentMood = 'day';
    this.currentDomain = 'residential';
    this.renderStyle = 'realistic'; // 'realistic' | 'autocad' | 'clay' | 'xray'
    this.edgeSegments = [];
    this.roomLights = [];

    // Procedural PBR Canvas Textures (Marble, Herringbone Wood, Terrazzo, Slats, Brick, Concrete, Tiles)
    this.textures = this.createProceduralTextures();

    // AutoCAD & Technical Linework Materials
    this.cadEdgeMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 1.5, transparent: true, opacity: 0.95 });
    this.clayEdgeMaterial = new THREE.LineBasicMaterial({ color: 0x334155, linewidth: 1.2, transparent: true, opacity: 0.75 });
    this.xrayEdgeMaterial = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 1.5, transparent: true, opacity: 0.95 });
    this.currentEdgeMaterial = this.cadEdgeMaterial;

    this.init();
  }

  init() {
    if (!this.container || typeof THREE === 'undefined') return;

    this.container.innerHTML = '';
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x09090b);
    this.scene.fog = new THREE.FogExp2(0x09090b, 0.012);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 2000);
    this.camera.position.set(32, 28, 42);

    // 3. Renderer with Cinematic ACES Tone Mapping & Soft PCF Shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (typeof THREE.sRGBEncoding !== 'undefined') {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    if (typeof THREE.ACESFilmicToneMapping !== 'undefined') {
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.16;
    }
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.id = 'threeCanvas';
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
      this.controls.minDistance = 4;
      this.controls.maxDistance = 300;
      this.controls.target.set(0, 3.5, 0);
    }

    // 5. Lighting
    this.setupLighting();

    // 6. Base Ground / Grid
    this.setupGround();

    // 7. Window Resize
    window.addEventListener('resize', () => this.onWindowResize());

    // 8. Animation Loop
    this.animate();
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xf4f4f5, 0.7);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x18181b, 0.55);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.05);
    this.sunLight.position.set(45, 60, 35);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 300;
    const d = 50;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.00015;
    if (this.sunLight.shadow.normalBias !== undefined) {
      this.sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.sunLight);

    this.fillLight = new THREE.DirectionalLight(0xd4d4d8, 0.4);
    this.fillLight.position.set(-35, 30, -35);
    this.scene.add(this.fillLight);
  }

  // ===========================================================================
  // PROCEDURAL HIGH-RES PBR TEXTURES (Zero external CDN dependency)
  // ===========================================================================
  createProceduralTextures() {
    if (typeof document === 'undefined') return {};
    const textures = {};

    // 1. Carrara Italian Marble
    try {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 512, 512);

      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, 'rgba(241, 245, 249, 0.9)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(1, 'rgba(226, 232, 240, 0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      const drawVein = (startX, startY, color, width) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        let x = startX, y = startY;
        ctx.moveTo(x, y);
        for (let i = 0; i < 16; i++) {
          x += (Math.random() - 0.45) * 45 + 15;
          y += (Math.random() - 0.4) * 45 + 18;
          ctx.lineTo(x, y);
          if (Math.random() > 0.65) {
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 30, y + Math.random() * 25);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
          }
        }
        ctx.stroke();
      };

      for (let v = 0; v < 4; v++) drawVein(-20, v * 130 + 30, 'rgba(148, 163, 184, 0.35)', 2.2);
      for (let v = 0; v < 5; v++) drawVein(Math.random() * 250, Math.random() * 450, 'rgba(203, 213, 225, 0.4)', 1.2);
      for (let v = 0; v < 2; v++) drawVein(Math.random() * 300, Math.random() * 450, 'rgba(217, 119, 6, 0.12)', 1.0);

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      textures.marble = tex;
    } catch (e) {
      console.warn('Procedural marble texture fallback', e);
    }

    // 2. Oak Herringbone Wood Parquet
    try {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#a16207';
      ctx.fillRect(0, 0, 512, 512);

      const pW = 32, pH = 96;
      for (let y = -pH; y < 512 + pH; y += pH) {
        for (let x = -pW; x < 512 + pW; x += pW * 2) {
          const s1 = 0.9 + (Math.sin(x * 0.1 + y * 0.05) * 0.12);
          ctx.fillStyle = `rgb(${Math.round(168 * s1)}, ${Math.round(98 * s1)}, ${Math.round(45 * s1)})`;
          ctx.fillRect(x, y, pW - 2, pH - 2);

          const s2 = 0.85 + (Math.cos(x * 0.08 + y * 0.1) * 0.14);
          ctx.fillStyle = `rgb(${Math.round(150 * s2)}, ${Math.round(82 * s2)}, ${Math.round(35 * s2)})`;
          ctx.fillRect(x + pW, y + pH / 2, pW - 2, pH - 2);
        }
      }

      ctx.strokeStyle = 'rgba(60, 25, 8, 0.18)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 512; i += 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i + (Math.sin(i * 0.1) * 3));
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      textures.wood = tex;
    } catch (e) {
      console.warn('Procedural wood texture fallback', e);
    }

    // 3. Polished Terrazzo
    try {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 512, 512);

      const colors = ['#64748b', '#475569', '#334155', '#94a3b8', '#d97706', '#0f766e', '#f8fafc'];
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * 512, y = Math.random() * 512, r = Math.random() * 4 + 1.5;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.beginPath();
        ctx.moveTo(x - r, y - r);
        ctx.lineTo(x + r * 1.2, y - r * 0.7);
        ctx.lineTo(x + r, y + r);
        ctx.lineTo(x - r * 0.8, y + r * 1.1);
        ctx.closePath();
        ctx.fill();
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      textures.terrazzo = tex;
    } catch (e) {
      console.warn('Procedural terrazzo texture fallback', e);
    }

    // 4. Acoustic Fluted Wood Slats
    try {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 256, 256);

      const sW = 16, gap = 8;
      for (let x = 0; x < 256; x += sW + gap) {
        const sg = ctx.createLinearGradient(x, 0, x + sW, 0);
        sg.addColorStop(0, '#92400e');
        sg.addColorStop(0.2, '#d97706');
        sg.addColorStop(0.8, '#d97706');
        sg.addColorStop(1, '#78350f');
        ctx.fillStyle = sg;
        ctx.fillRect(x, 0, sW, 256);
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 2);
      textures.slats = tex;
    } catch (e) {
      console.warn('Procedural slats texture fallback', e);
    }

    // 5. Architectural Brick
    try {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 0, 512, 512);

      const bW = 64, bH = 24, m = 4;
      let row = 0;
      for (let y = 0; y < 512; y += bH + m) {
        const offset = (row % 2 === 0) ? 0 : bW / 2;
        for (let x = -bW; x < 512 + bW; x += bW + m) {
          const s = 0.85 + Math.random() * 0.3;
          ctx.fillStyle = `rgb(${Math.round(168 * s)}, ${Math.round(62 * s)}, ${Math.round(40 * s)})`;
          ctx.fillRect(x + offset, y, bW, bH);
        }
        row++;
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      textures.brick = tex;
    } catch (e) {
      console.warn('Procedural brick texture fallback', e);
    }

    // 6. Monolithic Polished Concrete
    try {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 1200; i++) {
        const x = Math.random() * 512, y = Math.random() * 512;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(x, y, Math.random() * 3 + 1, Math.random() * 3 + 1);
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      textures.concrete = tex;
    } catch (e) {
      console.warn('Procedural concrete texture fallback', e);
    }

    // 7. Green Lawn Grass
    try {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 1500; i++) {
        const x = Math.random() * 512, y = Math.random() * 512;
        ctx.fillStyle = Math.random() > 0.5 ? '#16a34a' : '#14532d';
        ctx.fillRect(x, y, 2, Math.random() * 4 + 2);
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(5, 5);
      textures.grass = tex;
    } catch (e) {
      console.warn('Procedural grass texture fallback', e);
    }

    return textures;
  }

  setLightingMood(mood) {
    this.lightingMood = mood;
    if (!this.sunLight || !this.ambientLight || !this.scene) return;

    if (this.roomLights) {
      this.roomLights.forEach(l => this.scene.remove(l));
    }
    this.roomLights = [];

    if (mood === 'night') {
      this.scene.background = new THREE.Color(0x02050e);
      this.scene.fog = new THREE.FogExp2(0x02050e, 0.02);
      this.ambientLight.color.setHex(0x1e293b);
      this.ambientLight.intensity = 0.2;
      this.sunLight.intensity = 0.15;
      this.sunLight.color.setHex(0x38bdf8);

      // Add warm glowing ceiling point lights inside rooms
      if (this.currentSceneData && this.currentSceneData.levels) {
        const pw = this.currentSceneData.plot_dimensions_m?.width || 9.14;
        const pl = this.currentSceneData.plot_dimensions_m?.length || 15.24;
        this.currentSceneData.levels.forEach(lvl => {
          const elev = lvl.elevation_y_m || 0;
          (lvl.rooms || []).forEach(r => {
            if (r.type === 'terrace') return;
            const b = r.bounds_m;
            if (b) {
              const light = new THREE.PointLight(0xfef08a, 2.2, 9);
              light.position.set(b.x + b.width / 2 - pw / 2, elev + 2.4, b.z + b.depth / 2 - pl / 2);
              this.scene.add(light);
              this.roomLights.push(light);
            }
          });
        });
      }
    } else if (mood === 'golden') {
      this.scene.background = new THREE.Color(0x1a0d18);
      this.scene.fog = new THREE.FogExp2(0x1a0d18, 0.015);
      this.ambientLight.color.setHex(0xfde68a);
      this.ambientLight.intensity = 0.65;
      this.sunLight.intensity = 1.35;
      this.sunLight.color.setHex(0xf59e0b);
      this.sunLight.position.set(55, 18, 20);
    } else {
      // Day (Minimalist Studio Environment)
      this.scene.background = new THREE.Color(0x09090b);
      this.scene.fog = new THREE.FogExp2(0x09090b, 0.012);
      this.ambientLight.color.setHex(0xf4f4f5);
      this.ambientLight.intensity = 0.65;
      this.sunLight.intensity = 0.95;
      this.sunLight.color.setHex(0xffffff);
      this.sunLight.position.set(45, 60, 35);
    }
  }

  setupGround() {
    const groundGeo = new THREE.PlaneGeometry(240, 240);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.92, metalness: 0.05 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(160, 80, 0x3f3f46, 0x18181b);
    grid.position.y = 0;
    this.scene.add(grid);
  }

  loadBuildingScene(sceneData) {
    if (!this.scene) this.init();

    if (this.modelGroup) {
      this.scene.remove(this.modelGroup);
    }

    this.modelGroup = new THREE.Group();
    this.floorGroups = [];
    this.roofGroup = new THREE.Group();
    this.currentDomain = sceneData.domain || 'residential';

    this.currentSceneData = sceneData;

    if (this.currentDomain === 'bridge') {
      this.buildBridge3D(sceneData);
    } else if (this.currentDomain === 'road') {
      this.buildRoad3D(sceneData);
    } else if (this.currentDomain === 'mall') {
      this.buildMall3D(sceneData);
    } else {
      this.buildResidential3D(sceneData);
    }

    this.scene.add(this.modelGroup);
    this.resetCamera();
    this.updateVariantHud(sceneData);
  }

  updateVariantHud(sceneData) {
    if (!this.container) return;
    let badge = document.getElementById('three3dVariantHud');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'three3dVariantHud';
      badge.className = 'three-variant-hud';
      this.container.appendChild(badge);
    }
    if (sceneData && sceneData.variant_title) {
      const v = sceneData.variant || 'courtyard';
      const icon = v === 'courtyard' ? '🌿' : (v === 'l_shaped' ? '📐' : (v === 'manor' ? '🏛️' : '🏙️'));
      badge.innerHTML = `
        <span class="hud-dot"></span>
        <span class="hud-icon">${icon}</span>
        <div class="hud-info">
          <span class="hud-sub">CONCEPT TYPOLOGY</span>
          <strong class="hud-title">${sceneData.variant_title}</strong>
        </div>
      `;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  // ===========================================================================
  // 1. 3D BRIDGE BUILDER
  // ===========================================================================
  buildBridge3D(data) {
    const span = data.span_m || 120.0;
    const width = data.width_m || 16.0;
    const piers = data.piers_count || 4;
    const clearance = data.clearance_m || 12.0;

    // River Plane
    const riverGeo = new THREE.PlaneGeometry(span * 1.5, span * 1.2);
    const riverMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.15, metalness: 0.8, transparent: true, opacity: 0.85 });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, 0.2, 0);
    this.modelGroup.add(river);

    // Bridge Roadway Deck
    const deckGeo = new THREE.BoxGeometry(span, 1.2, width);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, wireframe: this.wireframeMode });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, clearance, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    this.modelGroup.add(deck);

    // Lane Markings on Deck
    const lineGeo = new THREE.BoxGeometry(span * 0.95, 0.05, 0.2);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const centerLine = new THREE.Mesh(lineGeo, lineMat);
    centerLine.position.set(0, clearance + 0.65, 0);
    this.modelGroup.add(centerLine);

    // Concrete Abutments
    const abGeo = new THREE.BoxGeometry(10, clearance + 2, width + 4);
    const abMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const ab1 = new THREE.Mesh(abGeo, abMat);
    ab1.position.set(-span / 2 + 5, clearance / 2, 0);
    const ab2 = new THREE.Mesh(abGeo, abMat);
    ab2.position.set(span / 2 - 5, clearance / 2, 0);
    this.modelGroup.add(ab1, ab2);

    // River Piers
    const pierSpacing = span / (piers + 1);
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 });

    for (let i = 1; i <= piers; i++) {
      const px = -span / 2 + (i * pierSpacing);
      // Double column pier
      const colGeo = new THREE.CylinderGeometry(1.6, 2.0, clearance, 16);
      const col1 = new THREE.Mesh(colGeo, pierMat);
      col1.position.set(px, clearance / 2, -width / 3);
      const col2 = new THREE.Mesh(colGeo, pierMat);
      col2.position.set(px, clearance / 2, width / 3);

      // Pier Cap
      const capGeo = new THREE.BoxGeometry(4.5, 1.5, width);
      const cap = new THREE.Mesh(capGeo, pierMat);
      cap.position.set(px, clearance - 0.75, 0);

      this.modelGroup.add(col1, col2, cap);
    }

    // Pylon & Cables (Cable Stayed)
    const pylonH = 32.0;
    const pylonGeo = new THREE.BoxGeometry(2.5, pylonH, 2.5);
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.3 });
    const pylon1 = new THREE.Mesh(pylonGeo, pylonMat);
    pylon1.position.set(0, clearance + pylonH / 2, -width / 2 - 1);
    const pylon2 = new THREE.Mesh(pylonGeo, pylonMat);
    pylon2.position.set(0, clearance + pylonH / 2, width / 2 + 1);
    this.modelGroup.add(pylon1, pylon2);

    // Stay Cables (thin cylinders)
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let c = -span / 2 + 15; c <= span / 2 - 15; c += 15) {
      if (Math.abs(c) < 5) continue;
      this.createCable(0, clearance + pylonH - 2, -width / 2 - 1, c, clearance + 0.6, -width / 2, cableMat);
      this.createCable(0, clearance + pylonH - 2, width / 2 + 1, c, clearance + 0.6, width / 2, cableMat);
    }
  }

  createCable(x1, y1, z1, x2, y2, z2, mat) {
    const p1 = new THREE.Vector3(x1, y1, z1);
    const p2 = new THREE.Vector3(x2, y2, z2);
    const dist = p1.distanceTo(p2);
    const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, dist, 6);
    const cyl = new THREE.Mesh(cylGeo, mat);

    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    cyl.position.copy(mid);
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(p2, p1).normalize());
    this.modelGroup.add(cyl);
  }

  // ===========================================================================
  // 2. 3D HIGHWAY / ROAD BUILDER
  // ===========================================================================
  buildRoad3D(data) {
    const length = 120.0;
    const width = data.total_width_m || 20.0;
    const lanes = data.lanes || 4;

    // Asphalt Road Surface
    const roadGeo = new THREE.BoxGeometry(length, 0.3, width);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85, wireframe: this.wireframeMode });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(0, 0.15, 0);
    road.receiveShadow = true;
    this.modelGroup.add(road);

    // Green Median Barrier
    const medianGeo = new THREE.BoxGeometry(length, 0.6, 2.2);
    const medianMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.9 });
    const median = new THREE.Mesh(medianGeo, medianMat);
    median.position.set(0, 0.45, 0);
    this.modelGroup.add(median);

    // Lane Markings
    const lineGeo = new THREE.BoxGeometry(length * 0.95, 0.05, 0.18);
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lane1 = new THREE.Mesh(lineGeo, whiteMat);
    lane1.position.set(0, 0.32, -width / 4);
    const lane2 = new THREE.Mesh(lineGeo, whiteMat);
    lane2.position.set(0, 0.32, width / 4);
    this.modelGroup.add(lane1, lane2);

    // Street Lighting Poles along shoulders
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const lightHeadMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    for (let x = -length / 2 + 10; x <= length / 2 - 10; x += 20) {
      // Left Pole
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 8, 8), poleMat);
      p1.position.set(x, 4, -width / 2 - 0.8);
      const head1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 1.2), lightHeadMat);
      head1.position.set(x, 8, -width / 2);

      // Right Pole
      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 8, 8), poleMat);
      p2.position.set(x, 4, width / 2 + 0.8);
      const head2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 1.2), lightHeadMat);
      head2.position.set(x, 8, width / 2);

      this.modelGroup.add(p1, head1, p2, head2);
    }
  }

  // ===========================================================================
  // 3. 3D SHOPPING MALL BUILDER
  // ===========================================================================
  buildMall3D(data) {
    const pw = (data.plot_w || 140.0) * 0.3048;
    const pl = (data.plot_l || 220.0) * 0.3048;
    const floors = data.floors_count || 3;
    const flH = data.floor_height_m || 4.5;

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6, wireframe: this.wireframeMode });
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.5 });
    const storeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });

    for (let f = 0; f < floors; f++) {
      const flGroup = new THREE.Group();
      const elev = f * flH;

      // Floor Slab
      const slab = new THREE.Mesh(new THREE.BoxGeometry(pw, 0.4, pl), slabMat);
      slab.position.set(0, elev + 0.2, 0);
      flGroup.add(slab);

      // Exterior Glass & Concrete Facade
      const wallFront = this.createWall(pw, flH - 0.4, 0.3, 0, elev + flH / 2, -pl / 2, wallMat);
      const wallBack = this.createWall(pw, flH - 0.4, 0.3, 0, elev + flH / 2, pl / 2, wallMat);
      const wallLeft = this.createWall(0.3, flH - 0.4, pl, -pw / 2, elev + flH / 2, 0, wallMat);
      const wallRight = this.createWall(0.3, flH - 0.4, pl, pw / 2, elev + flH / 2, 0, wallMat);
      flGroup.add(wallFront, wallBack, wallLeft, wallRight);

      // Central Atrium Cutout Void & Glass Railing
      const aw = pw * 0.35;
      const al = pl * 0.40;
      const atriumRailing = new THREE.Mesh(new THREE.BoxGeometry(aw, 1.1, al), glassMat);
      atriumRailing.position.set(0, elev + 0.75, 0);
      flGroup.add(atriumRailing);

      // Retail Storefront Display Cubes
      const shop1 = new THREE.Mesh(new THREE.BoxGeometry(pw * 0.22, flH - 0.8, pl * 0.25), storeMat);
      shop1.position.set(-pw / 3, elev + flH / 2, -pl / 4);
      const shop2 = new THREE.Mesh(new THREE.BoxGeometry(pw * 0.22, flH - 0.8, pl * 0.25), storeMat);
      shop2.position.set(pw / 3, elev + flH / 2, pl / 4);
      flGroup.add(shop1, shop2);

      this.floorGroups.push(flGroup);
      this.modelGroup.add(flGroup);
    }

    // Grand Skylight Glass Dome / Pyramid Roof over Atrium
    const roofElev = floors * flH;
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(pw, 0.4, pl), slabMat);
    roofSlab.position.set(0, roofElev + 0.2, 0);
    this.roofGroup.add(roofSlab);

    // Skylight Glass Pyramid
    const pyrGeo = new THREE.ConeGeometry(pw * 0.25, 4.0, 4);
    const pyrMesh = new THREE.Mesh(pyrGeo, glassMat);
    pyrMesh.rotation.y = Math.PI / 4;
    pyrMesh.position.set(0, roofElev + 2.2, 0);
    this.roofGroup.add(pyrMesh);

    this.modelGroup.add(this.roofGroup);
  }

  // ===========================================================================
  // ===========================================================================
  // 4. 3D RESIDENTIAL HOUSE BUILDER (REAL 2D-TO-3D ARCHITECTURAL SYNTHESIS)
  // ===========================================================================
  buildResidential3D(sceneData) {
    const levels = sceneData.levels || [];
    const plotW = sceneData.plot_dimensions_m ? sceneData.plot_dimensions_m.width : 9.14;
    const plotL = sceneData.plot_dimensions_m ? sceneData.plot_dimensions_m.length : 15.24;

    const offsetX = -plotW / 2;
    const offsetZ = -plotL / 2;

    // Architectural Material Palette with Procedural PBR Textures
    const t = this.textures || {};
    const mats = {
      // Floor Finishes with High-Resolution Procedural Surfaces
      carrara_marble: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: t.marble || null,
        roughness: 0.14,
        metalness: 0.08,
        wireframe: this.wireframeMode
      }),
      herringbone_wood: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: t.wood || null,
        roughness: 0.36,
        metalness: 0.02,
        wireframe: this.wireframeMode
      }),
      terrazzo: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: t.terrazzo || null,
        roughness: 0.28,
        metalness: 0.06,
        wireframe: this.wireframeMode
      }),
      slate_stone: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        map: t.concrete || null,
        roughness: 0.70,
        metalness: 0.08,
        wireframe: this.wireframeMode
      }),
      deck_timber: new THREE.MeshStandardMaterial({
        color: 0xd97706,
        map: t.wood || null,
        roughness: 0.48,
        metalness: 0.03,
        wireframe: this.wireframeMode
      }),
      grass_turf: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: t.grass || null,
        roughness: 0.88,
        metalness: 0.0,
        wireframe: this.wireframeMode
      }),
      stone_pavers: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: t.concrete || null,
        roughness: 0.78,
        metalness: 0.05,
        wireframe: this.wireframeMode
      }),
      concrete: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: t.concrete || null,
        roughness: 0.62,
        metalness: 0.05,
        wireframe: this.wireframeMode
      }),

      // Wall Finishes & Feature Accents
      limewash: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.84,
        metalness: 0.03,
        wireframe: this.wireframeMode
      }),
      slats: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: t.slats || null,
        roughness: 0.38,
        metalness: 0.06,
        wireframe: this.wireframeMode
      }),
      brick: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: t.brick || null,
        roughness: 0.76,
        metalness: 0.04,
        wireframe: this.wireframeMode
      }),
      felt: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.92,
        metalness: 0.05,
        wireframe: this.wireframeMode
      }),

      // Glazing & Metal Trims
      glass: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.04, metalness: 0.88, transparent: true, opacity: 0.42 }),
      glassBalustrade: new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.06, metalness: 0.75, transparent: true, opacity: 0.52 }),
      slidingGlassDoor: new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.04, metalness: 0.22, transparent: true, opacity: 0.38 }),
      aluminumMullion: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.85 }),
      doorFrame: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.6 }),
      accentTrim: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.5 }),
      soffitWood: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5, metalness: 0.05 }),
      roofTile: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.82, metalness: 0.1, wireframe: this.wireframeMode }),

      // Indo-Contemporary Heritage Stone & Jaali
      sandstone: new THREE.MeshStandardMaterial({
        color: 0xdfb784,
        roughness: 0.72,
        metalness: 0.04,
        wireframe: this.wireframeMode
      }),
      jaali: new THREE.MeshStandardMaterial({
        color: 0xc29762,
        roughness: 0.65,
        metalness: 0.08,
        wireframe: this.wireframeMode
      }),
      balconyLed: new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    };

    // 1. Site Landscaping (Lawn, Driveway, Walkway, Setbacks)
    if (sceneData.site) {
      this.buildSiteLandscaping(sceneData.site, plotW, plotL, offsetX, offsetZ, mats);
    }

    let globalMinX = 999, globalMaxX = -999, globalMinZ = 999, globalMaxZ = -999;
    let maxElevY = 0;

    // 2. Levels / Floors
    levels.forEach((lvl, lvlIdx) => {
      const flGroup = new THREE.Group();
      flGroup.userData = { floorNumber: lvl.floor_number, name: lvl.floor_name, roomCenters: {} };

      const elevY = lvl.elevation_y_m || 0;
      maxElevY = Math.max(maxElevY, elevY + 3.0);
      const rooms = lvl.rooms || [];

      rooms.forEach(r => {
        const b = r.bounds_m;
        if (!b) return;

        globalMinX = Math.min(globalMinX, b.x);
        globalMaxX = Math.max(globalMaxX, b.x + b.width);
        globalMinZ = Math.min(globalMinZ, b.z);
        globalMaxZ = Math.max(globalMaxZ, b.z + b.depth);

        const rx = b.x + offsetX;
        const rz = b.z + offsetZ;
        const rw = b.width;
        const rl = b.depth;
        const rh = b.height || 3.0;

        flGroup.userData.roomCenters[r.type] = { x: rx + rw / 2, y: elevY + 1.2, z: rz + rl / 2 };

        // 2a. Per-Room Floor Finish Slab
        const floorMat = mats[r.flooring_material] || mats.carrara_marble;
        const roomFloorGeo = new THREE.BoxGeometry(rw, 0.18, rl);
        const roomFloor = new THREE.Mesh(roomFloorGeo, floorMat);
        roomFloor.position.set(rx + rw / 2, elevY + 0.09, rz + rl / 2);
        roomFloor.receiveShadow = true;
        roomFloor.userData = { isFloorSlab: true, roomType: r.type, originalMat: floorMat };
        flGroup.add(roomFloor);

        // If outdoor space (terrace / courtyard / patio / balcony), handle with open air or railings
        const isOutdoor = (r.type === 'terrace' || r.type === 'patio' || r.type === 'courtyard' || r.type === 'balcony');

        if (r.type === 'balcony' || r.type === 'terrace') {
          // Glass Balustrades or Heritage Jaali around perimeter
          this.createBalustrade(rx, elevY + 0.18, rz, rw, rl, mats, flGroup, r, sceneData.variant);
        } else if (r.type === 'courtyard') {
          // Central Lightwell Greenery
          const plant1 = this.createBiophilicPlant(rx + rw * 0.35, elevY + 0.18, rz + rl * 0.35);
          const plant2 = this.createBiophilicPlant(rx + rw * 0.65, elevY + 0.18, rz + rl * 0.65);
          flGroup.add(plant1, plant2);
        } else {
          // 2b. Interior Room Walls with Real Door Openings & Glass Windows
          const wallMat = mats[r.wall_finish] || mats.limewash;
          const accentWallKey = r.accent_wall || 'north';
          const accentMat = mats[r.wall_finish === 'slats' ? 'slats' : (r.wall_finish === 'brick' ? 'brick' : 'felt')];

          // Filter doors and windows by wall
          const doorsByWall = { north: [], south: [], west: [], east: [] };
          (r.doors || []).forEach(d => {
            if (doorsByWall[d.wall]) doorsByWall[d.wall].push(d);
          });

          const winsByWall = { north: [], south: [], west: [], east: [] };
          (r.windows || []).forEach(w => {
            if (winsByWall[w.wall]) winsByWall[w.wall].push(w);
          });

          const wallThick = 0.20;

          // North Wall (runs along X at z = rz)
          this.createWallWithApertures(
            'X', rw, rh, wallThick,
            rx, elevY, rz,
            doorsByWall.north, winsByWall.north,
            (accentWallKey === 'north' ? accentMat : wallMat),
            mats, flGroup
          );

          // South Wall (runs along X at z = rz + rl)
          this.createWallWithApertures(
            'X', rw, rh, wallThick,
            rx, elevY, rz + rl,
            doorsByWall.south, winsByWall.south,
            (accentWallKey === 'south' ? accentMat : wallMat),
            mats, flGroup
          );

          // West Wall (runs along Z at x = rx)
          this.createWallWithApertures(
            'Z', rl, rh, wallThick,
            rx, elevY, rz,
            doorsByWall.west, winsByWall.west,
            (accentWallKey === 'west' ? accentMat : wallMat),
            mats, flGroup
          );

          // East Wall (runs along Z at x = rx + rw)
          this.createWallWithApertures(
            'Z', rl, rh, wallThick,
            rx + rw, elevY, rz,
            doorsByWall.east, winsByWall.east,
            (accentWallKey === 'east' ? accentMat : wallMat),
            mats, flGroup
          );
        }

        // Biophilic Indoor Greenery for living and dining
        if (r.type === 'living' || r.type === 'foyer') {
          const plant = this.createBiophilicPlant(rx + 0.7, elevY + 0.20, rz + 0.7);
          flGroup.add(plant);
        }

        // 2c. Rich Procedural 3D Furniture
        (r.furniture || []).forEach(f => {
          const fx = f.x + offsetX + f.w / 2;
          const fz = f.z + offsetZ + f.d / 2;
          const fy = elevY + 0.18;

          if (f.type === 'sofa') {
            this.createSofa3D(f, fx, fy, fz, flGroup);
          } else if (f.type === 'bed') {
            this.createBed3D(f, fx, fy, fz, flGroup);
          } else if (f.type === 'dining_set' || f.type === 'table') {
            this.createDining3D(f, fx, fy, fz, flGroup);
          } else if (f.type === 'counter' || f.type === 'kitchen_island') {
            this.createKitchenIsland3D(f, fx, fy, fz, flGroup);
          } else if (f.type === 'vanity') {
            this.createVanity3D(f, fx, fy, fz, flGroup);
          } else if (f.type === 'lounger') {
            this.createOutdoorLounger3D(f, fx, fy, fz, flGroup);
          } else if (f.type === 'tv') {
            this.createMediaConsole3D(f, fx, fy, fz, flGroup);
          } else if (f.type === 'wardrobe') {
            this.createWardrobe3D(f, fx, fy, fz, flGroup);
          }
        });
      });

      this.floorGroups.push(flGroup);
      this.modelGroup.add(flGroup);
    });

    // 3. Style-Responsive Roof Architecture (Gable Pitch vs Floating Flat vs Sky Pergola)
    if (sceneData.roof && globalMinX !== 999) {
      this.buildRoof3D(
        sceneData.roof,
        globalMinX + offsetX, globalMaxX + offsetX,
        globalMinZ + offsetZ, globalMaxZ + offsetZ,
        maxElevY, mats
      );
    }

    this.modelGroup.add(this.roofGroup);
  }

  // ===========================================================================
  // SITE LANDSCAPING (Lawn, Driveway, Walkway, Setbacks)
  // ===========================================================================
  buildSiteLandscaping(site, plotW, plotL, offsetX, offsetZ, mats) {
    const siteGroup = new THREE.Group();

    // 1. Lush Green Lawn Base
    const lawnGeo = new THREE.BoxGeometry(plotW + 2.0, 0.10, plotL + 2.0);
    const lawnMesh = new THREE.Mesh(lawnGeo, mats.grass_turf);
    lawnMesh.position.set(0, 0.05, 0);
    lawnMesh.receiveShadow = true;
    siteGroup.add(lawnMesh);

    // 2. Stone Paver Driveway leading from road to building
    const b = site.build_bounds_m || { x: 1.0, z: 2.0, width: 7.0, depth: 10.0 };
    const driveW = Math.min(plotW * 0.40, 4.2);
    const driveL = Math.max(2.5, b.z);
    const driveGeo = new THREE.BoxGeometry(driveW, 0.04, driveL);
    const driveMesh = new THREE.Mesh(driveGeo, mats.stone_pavers);
    driveMesh.position.set(offsetX + driveW / 2 + 0.5, 0.12, offsetZ + driveL / 2);
    driveMesh.receiveShadow = true;
    siteGroup.add(driveMesh);

    // 3. Stepping Stone Pathway to Front Entrance
    const stepCount = 5;
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    for (let s = 0; s < stepCount; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.03, 0.55), stepMat);
      step.position.set(
        offsetX + driveW + 1.2,
        0.12,
        offsetZ + (s * (driveL / stepCount)) + 0.3
      );
      step.receiveShadow = true;
      siteGroup.add(step);
    }

    // 4. Low Modern Boundary Marker
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const curbN = new THREE.Mesh(new THREE.BoxGeometry(plotW + 2.2, 0.25, 0.18), curbMat);
    curbN.position.set(0, 0.12, offsetZ - 1.0);
    const curbS = new THREE.Mesh(new THREE.BoxGeometry(plotW + 2.2, 0.25, 0.18), curbMat);
    curbS.position.set(0, 0.12, -offsetZ + 1.0);
    const curbW = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, plotL + 2.2), curbMat);
    curbW.position.set(offsetX - 1.0, 0.12, 0);
    const curbE = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, plotL + 2.2), curbMat);
    curbE.position.set(-offsetX + 1.0, 0.12, 0);
    siteGroup.add(curbN, curbS, curbW, curbE);

    this.modelGroup.add(siteGroup);
  }

  // ===========================================================================
  // WALL WITH REAL APERTURES (Real Door Cutouts & Glass Windows)
  // ===========================================================================
  // ===========================================================================
  // WALL WITH REAL APERTURES (Real Door Cutouts & Glass Windows)
  // ===========================================================================
  createWallWithApertures(axis, length, height, thick, startX, baseY, startZ, doors, windows, wallMat, mats, parentGroup) {
    // Collect and sort openings along length
    const ops = [];
    (doors || []).forEach(d => {
      const off = Math.max(0.1, Math.min(length - 0.9, d.offset_m || 0.5));
      const w = Math.min(length - off - 0.1, d.width_m || 1.1);
      const h = Math.min(height - 0.3, d.height_m || 2.2);
      if (w > 0.4) ops.push({ type: 'door', offset: off, width: w, height: h, doorType: d.type });
    });

    (windows || []).forEach(w => {
      const off = Math.max(0.1, Math.min(length - 0.9, w.offset_m || 0.5));
      const ww = Math.min(length - off - 0.1, w.width_m || 1.4);
      const wh = Math.min(height - 0.6, w.height_m || 1.4);
      const sill = Math.min(height - wh - 0.2, w.sill_m || 0.9);
      if (ww > 0.4) ops.push({ type: 'window', offset: off, width: ww, height: wh, sill: sill });
    });

    ops.sort((a, b) => a.offset - b.offset);

    const isX = (axis === 'X');

    const makeSegment = (u1, u2, elev, h, mat) => {
      const segLen = u2 - u1;
      if (segLen < 0.05 || h < 0.05) return;
      const centerU = u1 + segLen / 2;
      const cx = isX ? (startX + centerU) : startX;
      const cz = isX ? startZ : (startZ + centerU);
      const cy = baseY + elev + h / 2;
      const gw = isX ? segLen : thick;
      const gd = isX ? thick : segLen;

      const wall = this.createWall(gw, h, gd, cx, cy, cz, mat);
      parentGroup.add(wall);
    };

    if (ops.length === 0) {
      // Solid continuous wall
      makeSegment(0, length, 0, height, wallMat);
      return;
    }

    let curU = 0;
    ops.forEach(op => {
      const opStart = op.offset;
      const opEnd = op.offset + op.width;

      // Solid wall before opening
      if (opStart > curU + 0.04) {
        makeSegment(curU, opStart, 0, height, wallMat);
      }

      if (op.type === 'door') {
        // Lintel above door (leaves walk-through open doorway!)
        const lintelH = Math.max(0.15, height - op.height);
        makeSegment(opStart, opEnd, op.height, lintelH, wallMat);

        if (op.doorType === 'sliding_glass_balcony') {
          // Full architectural sliding glass balcony door with frame, track, glass panels and handle
          this.createSlidingBalconyDoor(axis, opStart, op.width, op.height, startX, baseY, startZ, thick, mats, parentGroup);
        } else {
          // Slim architectural door frame
          this.createDoorFrame(axis, opStart, op.width, op.height, startX, baseY, startZ, thick, mats.doorFrame, parentGroup);
        }
      } else if (op.type === 'window') {
        // Sill wall below window
        if (op.sill > 0.05) {
          makeSegment(opStart, opEnd, 0, op.sill, wallMat);
        }
        // Lintel wall above window
        const topH = Math.max(0.15, height - (op.sill + op.height));
        if (topH > 0.05) {
          makeSegment(opStart, opEnd, op.sill + op.height, topH, wallMat);
        }
        // Glass Glazing Unit + Aluminum Mullions
        this.createWindowGlazing(axis, opStart, op.width, op.sill, op.height, startX, baseY, startZ, thick, mats, parentGroup);
      }

      curU = Math.max(curU, opEnd);
    });

    // Final wall segment to end of wall
    if (curU < length - 0.04) {
      makeSegment(curU, length, 0, height, wallMat);
    }
  }

  createSlidingBalconyDoor(axis, offset, width, height, startX, baseY, startZ, thick, mats, parentGroup) {
    const isX = (axis === 'X');
    const group = new THREE.Group();
    group.userData = { isDoor: true, isBalconyDoor: true };

    const fThick = 0.06;
    const fDepth = thick + 0.02;
    const frameMat = mats.aluminumMullion || mats.doorFrame;

    // 1. Sleek Outer Frame (Left Jamb, Right Jamb, Top Header, Bottom Threshold)
    const j1x = isX ? (startX + offset + fThick / 2) : startX;
    const j1z = isX ? startZ : (startZ + offset + fThick / 2);
    const j1 = this.createWall(isX ? fThick : fDepth, height, isX ? fDepth : fThick, j1x, baseY + height / 2, j1z, frameMat);

    const j2x = isX ? (startX + offset + width - fThick / 2) : startX;
    const j2z = isX ? startZ : (startZ + offset + width - fThick / 2);
    const j2 = this.createWall(isX ? fThick : fDepth, height, isX ? fDepth : fThick, j2x, baseY + height / 2, j2z, frameMat);

    const headX = isX ? (startX + offset + width / 2) : startX;
    const headZ = isX ? startZ : (startZ + offset + width / 2);
    const head = this.createWall(isX ? width : fDepth, fThick, isX ? fDepth : width, headX, baseY + height - fThick / 2, headZ, frameMat);

    const sill = this.createWall(isX ? width : fDepth, 0.03, isX ? fDepth : width, headX, baseY + 0.015, headZ, frameMat);
    group.add(j1, j2, head, sill);

    // 2. Dual Sliding Glass Panels
    const panelW = (width - fThick * 2) * 0.53;
    const panelH = height - fThick - 0.03;
    const glassMat = mats.slidingGlassDoor || mats.glass;

    // Fixed Outer Glass Pane
    const p1Center = offset + fThick + panelW / 2;
    const p1x = isX ? (startX + p1Center) : (startX - 0.02);
    const p1z = isX ? (startZ - 0.02) : (startZ + p1Center);
    const p1Glass = new THREE.Mesh(new THREE.BoxGeometry(isX ? panelW : 0.025, panelH, isX ? 0.025 : panelW), glassMat);
    p1Glass.position.set(p1x, baseY + 0.03 + panelH / 2, p1z);

    // Sliding Inner Glass Pane (slightly offset for depth)
    const p2Center = offset + width - fThick - panelW / 2;
    const p2x = isX ? (startX + p2Center) : (startX + 0.02);
    const p2z = isX ? (startZ + 0.02) : (startZ + p2Center);
    const p2Glass = new THREE.Mesh(new THREE.BoxGeometry(isX ? panelW : 0.025, panelH, isX ? 0.025 : panelW), glassMat);
    p2Glass.position.set(p2x, baseY + 0.03 + panelH / 2, p2z);

    // Central Vertical Mullion / Track Divider
    const div = new THREE.Mesh(new THREE.BoxGeometry(isX ? 0.05 : 0.07, panelH, isX ? 0.07 : 0.05), frameMat);
    div.position.set(headX, baseY + 0.03 + panelH / 2, headZ);

    // 3. Ergonomic Architectural Pull Handle (Brushed Nickel)
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.9 });
    const hx = isX ? (startX + offset + width / 2 - 0.08) : (startX + 0.04);
    const hz = isX ? (startZ + 0.04) : (startZ + offset + width / 2 - 0.08);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.70, 12), handleMat);
    handle.position.set(hx, baseY + 1.05, hz);

    group.add(p1Glass, p2Glass, div, handle);
    parentGroup.add(group);
  }

  createDoorFrame(axis, offset, width, height, startX, baseY, startZ, thick, frameMat, parentGroup) {
    const isX = (axis === 'X');
    const fThick = 0.06;
    const fDepth = thick + 0.02;

    // Left Jamb
    const j1x = isX ? (startX + offset + fThick / 2) : startX;
    const j1z = isX ? startZ : (startZ + offset + fThick / 2);
    const j1 = this.createWall(isX ? fThick : fDepth, height, isX ? fDepth : fThick, j1x, baseY + height / 2, j1z, frameMat);

    // Right Jamb
    const j2x = isX ? (startX + offset + width - fThick / 2) : startX;
    const j2z = isX ? startZ : (startZ + offset + width - fThick / 2);
    const j2 = this.createWall(isX ? fThick : fDepth, height, isX ? fDepth : fThick, j2x, baseY + height / 2, j2z, frameMat);

    // Top Head
    const hx = isX ? (startX + offset + width / 2) : startX;
    const hz = isX ? startZ : (startZ + offset + width / 2);
    const th = this.createWall(isX ? width : fDepth, fThick, isX ? fDepth : width, hx, baseY + height - fThick / 2, hz, frameMat);

    parentGroup.add(j1, j2, th);
  }

  createWindowGlazing(axis, offset, width, sill, height, startX, baseY, startZ, thick, mats, parentGroup) {
    const isX = (axis === 'X');
    const cx = isX ? (startX + offset + width / 2) : startX;
    const cz = isX ? startZ : (startZ + offset + width / 2);
    const cy = baseY + sill + height / 2;

    // 1. Transparent Glass Pane
    const gw = isX ? (width - 0.04) : 0.04;
    const gd = isX ? 0.04 : (width - 0.04);
    const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(gw, height - 0.04, gd), mats.glass);
    glassMesh.position.set(cx, cy, cz);
    parentGroup.add(glassMesh);

    // 2. Aluminum Frame Border
    const frameGeo = new THREE.BoxGeometry(isX ? width : thick + 0.01, height, isX ? thick + 0.01 : width);
    // Center Mullion divider bar
    const mullionGeo = new THREE.BoxGeometry(isX ? 0.05 : thick + 0.02, height, isX ? thick + 0.02 : 0.05);
    const mullion = new THREE.Mesh(mullionGeo, mats.aluminumMullion);
    mullion.position.set(cx, cy, cz);
    parentGroup.add(mullion);
  }

  createBalustrade(x, y, z, w, d, mats, parentGroup, roomData, variantKey) {
    const railH = 0.95;
    const glassMat = mats.glassBalustrade || mats.glass;
    const railMat = mats.aluminumMullion;
    const isRajasthan = (variantKey === 'rajasthan_heritage' || (roomData && roomData.has_jaali));

    const balGroup = new THREE.Group();
    balGroup.userData = { isBalconyDeck: true };

    if (isRajasthan) {
      // -------------------------------------------------------------
      // Traditional Indo-Contemporary Rajasthan Haveli:
      // Jharokha Balcony with Intricate Geometric Jaali Lattice Screens & Stone Corbels
      // -------------------------------------------------------------
      const stoneMat = mats.sandstone || mats.slate_stone;
      const jaaliMat = mats.jaali || stoneMat;

      // 1. Carved Sandstone Cantilever Corbels / Brackets supporting the balcony
      const corbelCount = Math.max(2, Math.floor(w / 1.5));
      for (let c = 0; c < corbelCount; c++) {
        const cx = x + 0.3 + (c / Math.max(1, corbelCount - 1)) * (w - 0.6);
        const corbel = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.35), stoneMat);
        corbel.position.set(cx, y - 0.21, z + d - 0.1);
        corbel.castShadow = true;
        balGroup.add(corbel);
      }

      // 2. Geometric Jaali Lattice Screen on Front
      const jaaliH = railH + 0.12;
      const jaaliFront = new THREE.Mesh(new THREE.BoxGeometry(w, jaaliH, 0.08), jaaliMat);
      jaaliFront.position.set(x + w / 2, y + jaaliH / 2, z);
      jaaliFront.castShadow = true;
      jaaliFront.receiveShadow = true;

      // Side Jaali Screen Wings
      const jaaliL = new THREE.Mesh(new THREE.BoxGeometry(0.08, jaaliH, d), jaaliMat);
      jaaliL.position.set(x, y + jaaliH / 2, z + d / 2);
      const jaaliR = new THREE.Mesh(new THREE.BoxGeometry(0.08, jaaliH, d), jaaliMat);
      jaaliR.position.set(x + w, y + jaaliH / 2, z + d / 2);

      // Carved Sandstone Coping / Top Rail
      const coping = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.08, 0.14), stoneMat);
      coping.position.set(x + w / 2, y + jaaliH + 0.04, z);

      balGroup.add(jaaliFront, jaaliL, jaaliR, coping);

    } else {
      // -------------------------------------------------------------
      // Modern Luxury / Cantilevered / Courtyard:
      // Frameless Tempered Glass Balustrades with Polished Stainless Steel Cap Rail
      // -------------------------------------------------------------
      // Front Glass
      const gF = new THREE.Mesh(new THREE.BoxGeometry(w, railH, 0.04), glassMat);
      gF.position.set(x + w / 2, y + railH / 2, z);
      const rF = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, 0.06), railMat);
      rF.position.set(x + w / 2, y + railH, z);

      // Left Glass
      const gL = new THREE.Mesh(new THREE.BoxGeometry(0.04, railH, d), glassMat);
      gL.position.set(x, y + railH / 2, z + d / 2);
      const rL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, d), railMat);
      rL.position.set(x, y + railH, z + d / 2);

      // Right Glass
      const gR = new THREE.Mesh(new THREE.BoxGeometry(0.04, railH, d), glassMat);
      gR.position.set(x + w, y + railH / 2, z + d / 2);
      const rR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, d), railMat);
      rR.position.set(x + w, y + railH, z + d / 2);

      // Warm Recessed Architectural LED Base Strip
      const ledMat = mats.balconyLed || new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, 0.025, 0.025), ledMat);
      ledStrip.position.set(x + w / 2, y + 0.015, z + 0.03);

      balGroup.add(gF, rF, gL, rL, gR, rR, ledStrip);
    }

    // 3. Outdoor Balcony Bistro Furniture
    if (w >= 2.8 && d >= 1.8) {
      this.createBalconyBistroFurniture(x + w * 0.5, y + 0.02, z + d * 0.45, balGroup, mats);
    }

    parentGroup.add(balGroup);
  }

  createBalconyBistroFurniture(cx, cy, cz, parentGroup, mats) {
    const furnitureGroup = new THREE.Group();
    furnitureGroup.userData = { isFurniture: true };

    const metalMat = mats.aluminumMullion || new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const woodMat = mats.deck_timber || new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });

    // Round Bistro Coffee Table
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 16), woodMat);
    tableTop.position.set(0, 0.55, 0);
    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.54, 8), metalMat);
    tableLeg.position.set(0, 0.27, 0);
    const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.02, 16), metalMat);
    tableBase.position.set(0, 0.01, 0);
    furnitureGroup.add(tableTop, tableLeg, tableBase);

    // Two Modern Cafe Chairs
    [-0.55, 0.55].forEach(side => {
      const chair = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.03, 0.36), woodMat);
      seat.position.set(0, 0.40, 0);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.35, 0.03), metalMat);
      back.position.set(0, 0.58, (side > 0 ? -0.16 : 0.16));
      chair.add(seat, back);
      chair.position.set(side, 0, 0);
      furnitureGroup.add(chair);
    });

    furnitureGroup.position.set(cx, cy, cz);
    parentGroup.add(furnitureGroup);
  }

  // ===========================================================================
  // RICH PROCEDURAL 3D INTERIOR FURNITURE BUILDERS
  // ===========================================================================
  createSofa3D(f, fx, fy, fz, flGroup) {
    const sofa = new THREE.Group();
    sofa.userData = { isFurniture: true };

    // 1. Textured Area Rug Underneath
    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(f.w * 1.25, 0.02, f.d * 1.3),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 })
    );
    rug.position.set(0, 0.01, 0);
    sofa.add(rug);

    // 2. Base Cushion
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(f.w, 0.42, f.d * 0.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 })
    );
    base.position.set(0, 0.21, 0.05);

    // 3. Backrest Cushion
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(f.w, 0.65, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    back.position.set(0, 0.52, -f.d * 0.4 + 0.12);

    // 4. Armrests
    const armMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.52, f.d * 0.8), armMat);
    armL.position.set(-f.w / 2 + 0.11, 0.32, 0.05);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.52, f.d * 0.8), armMat);
    armR.position.set(f.w / 2 - 0.11, 0.32, 0.05);

    // 5. Decorative Throw Cushions
    const throwMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.12), throwMat);
    c1.position.set(-f.w * 0.3, 0.45, -f.d * 0.25);
    c1.rotation.y = 0.2;
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.12), throwMat);
    c2.position.set(f.w * 0.3, 0.45, -f.d * 0.25);
    c2.rotation.y = -0.2;

    // 6. Sculptural Walnut Coffee Table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.45 });
    const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(f.w * 0.5, 0.32, f.d * 0.35), tableMat);
    coffeeTable.position.set(0, 0.16, f.d * 0.55);

    sofa.add(base, back, armL, armR, c1, c2, coffeeTable);
    sofa.position.set(fx, fy, fz);
    flGroup.add(sofa);
  }

  createBed3D(f, fx, fy, fz, flGroup) {
    const bed = new THREE.Group();
    bed.userData = { isFurniture: true };

    // 1. Low Platform Base Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(f.w, 0.28, f.d),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    frame.position.set(0, 0.14, 0);

    // 2. White Linen Mattress
    const mat = new THREE.Mesh(
      new THREE.BoxGeometry(f.w - 0.12, 0.28, f.d - 0.15),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 })
    );
    mat.position.set(0, 0.38, 0.05);

    // 3. Navy Accent Duvet Fold Runner
    const duvet = new THREE.Mesh(
      new THREE.BoxGeometry(f.w - 0.10, 0.08, f.d * 0.55),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.75 })
    );
    duvet.position.set(0, 0.54, f.d * 0.20);

    // 4. Twin Pillows
    const pilMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
    const pil1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.48), pilMat);
    pil1.position.set(-f.w * 0.24, 0.56, -f.d * 0.32);
    pil1.rotation.x = 0.12;
    const pil2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.48), pilMat);
    pil2.position.set(f.w * 0.24, 0.56, -f.d * 0.32);
    pil2.rotation.x = 0.12;

    // 5. Extended Upholstered Headboard
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(f.w + 1.2, 1.25, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 })
    );
    head.position.set(0, 0.68, -f.d / 2 - 0.05);

    // 6. Floating Nightstands with Bedside Glow Lamps
    const nsMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-1, 1].forEach(side => {
      const ns = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.36, 0.45), nsMat);
      ns.position.set(side * (f.w / 2 + 0.42), 0.24, -f.d * 0.3);

      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.22, 12), nsMat);
      lampBase.position.set(side * (f.w / 2 + 0.42), 0.48, -f.d * 0.3);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.2, 12), lampMat);
      shade.position.set(side * (f.w / 2 + 0.42), 0.64, -f.d * 0.3);

      bed.add(ns, lampBase, shade);
    });

    bed.add(frame, mat, duvet, pil1, pil2, head);
    bed.position.set(fx, fy, fz);
    flGroup.add(bed);
  }

  createDining3D(f, fx, fy, fz, flGroup) {
    const group = new THREE.Group();
    group.userData = { isFurniture: true };

    // 1. Solid Walnut Table Top
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.35, metalness: 0.05 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(f.w, 0.06, f.d), tableMat);
    top.position.set(0, 0.74, 0);

    // 2. Table Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.7 });
    const legOffsetW = f.w / 2 - 0.15;
    const legOffsetD = f.d / 2 - 0.15;
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.72, 8), legMat);
      leg.position.set(sx * legOffsetW, 0.36, sz * legOffsetD);
      group.add(leg);
    });

    // 3. Dining Chairs (4 to 6 chairs)
    const chairSeatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const numChairs = Math.max(2, Math.floor(f.w / 0.8));
    for (let c = 0; c < numChairs; c++) {
      const cx = -f.w / 2 + (c + 0.5) * (f.w / numChairs);
      [-1, 1].forEach(side => {
        const chair = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.42), chairSeatMat);
        seat.position.set(0, 0.44, 0);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.05), chairSeatMat);
        back.position.set(0, 0.65, side * 0.18);
        chair.add(seat, back);
        chair.position.set(cx, 0, side * (f.d / 2 + 0.28));
        group.add(chair);
      });
    }

    // 4. Centerpiece Vase
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.14, 0.25, 12), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 }));
    vase.position.set(0, 0.89, 0);

    group.add(top, vase);
    group.position.set(fx, fy, fz);
    flGroup.add(group);
  }

  createKitchenIsland3D(f, fx, fy, fz, flGroup) {
    const island = new THREE.Group();
    island.userData = { isFurniture: true };

    // 1. Cabinet Body
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
    const cab = new THREE.Mesh(new THREE.BoxGeometry(f.w - 0.1, 0.84, f.d - 0.1), cabMat);
    cab.position.set(0, 0.42, 0);

    // 2. Quartz Waterfall Countertop
    const quartzMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.05 });
    const counter = new THREE.Mesh(new THREE.BoxGeometry(f.w, 0.06, f.d), quartzMat);
    counter.position.set(0, 0.87, 0);

    // 3. Recessed Stainless Steel Sink
    const sinkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.85 });
    const sink = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.02, 0.42), sinkMat);
    sink.position.set(-f.w * 0.25, 0.90, 0);

    // Faucet
    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8), sinkMat);
    faucet.position.set(-f.w * 0.25, 1.02, -0.15);

    // 4. Black Induction Cooktop Zone
    const cooktopMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.1, metalness: 0.9 });
    const cooktop = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.015, 0.45), cooktopMat);
    cooktop.position.set(f.w * 0.25, 0.90, 0);

    // 5. Breakfast Barstools
    const stoolMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
    const postMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const numStools = Math.max(2, Math.floor(f.w / 0.8));
    for (let i = 0; i < numStools; i++) {
      const sx = -f.w / 2 + (i + 0.5) * (f.w / numStools);
      const stoolSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16), stoolMat);
      stoolSeat.position.set(sx, 0.62, f.d / 2 + 0.32);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.60, 8), postMat);
      post.position.set(sx, 0.30, f.d / 2 + 0.32);
      island.add(stoolSeat, post);
    }

    island.add(cab, counter, sink, faucet, cooktop);
    island.position.set(fx, fy, fz);
    flGroup.add(island);
  }

  createVanity3D(f, fx, fy, fz, flGroup) {
    const vanity = new THREE.Group();
    vanity.userData = { isFurniture: true };

    // Floating Cabinet
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const cab = new THREE.Mesh(new THREE.BoxGeometry(f.w, 0.55, f.d), cabMat);
    cab.position.set(0, 0.55, 0);

    // White Ceramic Basin
    const basinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const basin = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.38), basinMat);
    basin.position.set(0, 0.88, 0);

    // Backlit LED Mirror
    const mirrorMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.05, metalness: 0.95 });
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.03), mirrorMat);
    mirror.position.set(0, 1.45, -f.d / 2);

    vanity.add(cab, basin, mirror);
    vanity.position.set(fx, fy, fz);
    flGroup.add(vanity);
  }

  createOutdoorLounger3D(f, fx, fy, fz, flGroup) {
    const lounger = new THREE.Group();
    lounger.userData = { isFurniture: true };

    // Teak Frame
    const teakMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.55 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(f.w, 0.22, f.d), teakMat);
    base.position.set(0, 0.11, 0);

    // Linen Sun Cushion
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const cush = new THREE.Mesh(new THREE.BoxGeometry(f.w * 0.9, 0.10, f.d * 0.9), cushionMat);
    cush.position.set(0, 0.27, 0);

    // Cocktail Side Table
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.38, 16), teakMat);
    table.position.set(f.w / 2 + 0.35, 0.19, 0);

    lounger.add(base, cush, table);
    lounger.position.set(fx, fy, fz);
    flGroup.add(lounger);
  }

  createMediaConsole3D(f, fx, fy, fz, flGroup) {
    const unit = new THREE.Group();
    unit.userData = { isFurniture: true };

    const credenzaMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const credenza = new THREE.Mesh(new THREE.BoxGeometry(f.w, 0.45, f.d), credenzaMat);
    credenza.position.set(0, 0.225, 0);

    // Slim OLED Screen
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(f.w * 0.75, 0.75, 0.04), screenMat);
    screen.position.set(0, 0.85, 0);

    unit.add(credenza, screen);
    unit.position.set(fx, fy, fz);
    flGroup.add(unit);
  }

  createWardrobe3D(f, fx, fy, fz, flGroup) {
    const wardrobe = new THREE.Group();
    wardrobe.userData = { isFurniture: true };

    const wMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(f.w, 2.4, f.d), wMat);
    body.position.set(0, 1.2, 0);

    wardrobe.add(body);
    wardrobe.position.set(fx, fy, fz);
    flGroup.add(wardrobe);
  }

  // ===========================================================================
  // 5. STYLE-RESPONSIVE ROOF ARCHITECTURE (Gable Pitch vs Flat Soffit vs Pergola)
  // ===========================================================================
  buildRoof3D(roofInfo, minX, maxX, minZ, maxZ, roofElev, mats) {
    const style = roofInfo.style || 'floating_flat';
    const spanW = maxX - minX;
    const spanD = maxZ - minZ;
    const centerX = minX + spanW / 2;
    const centerZ = minZ + spanD / 2;

    if (style === 'gable_pitch') {
      // -------------------------------------------------------------
      // Typology C: Pitched Symmetrical Gable Roof
      // -------------------------------------------------------------
      const pitchH = 2.4;
      const overhang = 0.6;
      const roofW = spanW + overhang * 2;
      const roofD = spanD + overhang * 2;

      // Two sloping planes meeting at central ridge
      const slopeLen = Math.sqrt(Math.pow(roofW / 2, 2) + Math.pow(pitchH, 2));
      const slopeAngle = Math.atan2(pitchH, roofW / 2);

      // Left Roof Plane
      const leftSlope = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.15, roofD), mats.roofTile);
      leftSlope.position.set(centerX - roofW / 4, roofElev + pitchH / 2, centerZ);
      leftSlope.rotation.z = slopeAngle;

      // Right Roof Plane
      const rightSlope = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.15, roofD), mats.roofTile);
      rightSlope.position.set(centerX + roofW / 4, roofElev + pitchH / 2, centerZ);
      rightSlope.rotation.z = -slopeAngle;

      this.roofGroup.add(leftSlope, rightSlope);

      // Gable End Triangular Walls
      const gableGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        centerX - roofW / 2, roofElev, centerZ - roofD / 2,
        centerX + roofW / 2, roofElev, centerZ - roofD / 2,
        centerX, roofElev + pitchH, centerZ - roofD / 2,

        centerX - roofW / 2, roofElev, centerZ + roofD / 2,
        centerX + roofW / 2, roofElev, centerZ + roofD / 2,
        centerX, roofElev + pitchH, centerZ + roofD / 2
      ]);
      gableGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      gableGeo.computeVertexNormals();
      const gableMesh = new THREE.Mesh(gableGeo, mats.limewash);
      this.roofGroup.add(gableMesh);

      // Glazed Roof Skylight on Slope
      if (roofInfo.has_skylight) {
        const skylight = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 2.5), mats.glass);
        skylight.position.set(centerX - roofW / 4, roofElev + pitchH / 2 + 0.1, centerZ);
        skylight.rotation.z = slopeAngle;
        this.roofGroup.add(skylight);
      }
    } else if (style === 'floating_flat') {
      // -------------------------------------------------------------
      // Typology A & B: Modern Floating Flat Roof with Wood Soffit
      // -------------------------------------------------------------
      const overhang = 0.7;
      const slabW = spanW + overhang * 2;
      const slabD = spanD + overhang * 2;

      // 1. Floating Roof Slab
      const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(slabW, 0.28, slabD), mats.roofTile);
      roofSlab.position.set(centerX, roofElev + 0.14, centerZ);

      // 2. Warm Wood Soffit Underside
      const soffit = new THREE.Mesh(new THREE.BoxGeometry(slabW - 0.1, 0.04, slabD - 0.1), mats.soffitWood);
      soffit.position.set(centerX, roofElev - 0.02, centerZ);

      // 3. Perimeter Fascia Trim
      const fascia = new THREE.Mesh(new THREE.BoxGeometry(slabW + 0.04, 0.32, slabD + 0.04), mats.aluminumMullion);
      fascia.position.set(centerX, roofElev + 0.14, centerZ);

      this.roofGroup.add(roofSlab, soffit, fascia);

      // 4. Rooftop Pergola Trellis Zone
      if (roofInfo.has_pergola) {
        this.createRooftopPergola(centerX, roofElev + 0.3, centerZ, spanW * 0.45, spanD * 0.40, mats);
      }
    } else if (style === 'rajasthan_chhatri') {
      // -------------------------------------------------------------
      // Typology E: Traditional Indo-Contemporary Rajasthan Haveli
      // Rooftop Terrace with Sandstone Parapet, Mumty & Carved Chhatri Pavilion
      // -------------------------------------------------------------
      const slabW = spanW + 0.8;
      const slabD = spanD + 0.8;
      const stoneMat = mats.sandstone || mats.slate_stone;
      const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(slabW, 0.25, slabD), stoneMat);
      roofSlab.position.set(centerX, roofElev + 0.125, centerZ);
      this.roofGroup.add(roofSlab);

      // Sandstone Parapets
      const parapetH = 0.90;
      const pN = this.createWall(slabW, parapetH, 0.2, centerX, roofElev + 0.25 + parapetH / 2, centerZ - slabD / 2 + 0.1, stoneMat);
      const pS = this.createWall(slabW, parapetH, 0.2, centerX, roofElev + 0.25 + parapetH / 2, centerZ + slabD / 2 - 0.1, stoneMat);
      const pW = this.createWall(0.2, parapetH, slabD, centerX - slabW / 2 + 0.1, roofElev + 0.25 + parapetH / 2, centerZ, stoneMat);
      const pE = this.createWall(0.2, parapetH, slabD, centerX + slabW / 2 - 0.1, roofElev + 0.25 + parapetH / 2, centerZ, stoneMat);
      this.roofGroup.add(pN, pS, pW, pE);

      // Carved Rajasthan Chhatri Sky Pavilion
      this.createRajasthanChhatriPavilion(centerX, roofElev + 0.25, centerZ, spanW, spanD, mats);
    } else if (style === 'pergola_garden') {
      // -------------------------------------------------------------
      // Typology F & Custom: Sky Garden with Architectural Timber Pergola
      // -------------------------------------------------------------
      const slabW = spanW + 0.8;
      const slabD = spanD + 0.8;
      const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(slabW, 0.25, slabD), mats.roofTile);
      roofSlab.position.set(centerX, roofElev + 0.125, centerZ);
      this.roofGroup.add(roofSlab);

      // Glass perimeter safety railing
      const railH = 1.0;
      const gN = new THREE.Mesh(new THREE.BoxGeometry(slabW, railH, 0.04), mats.glass);
      gN.position.set(centerX, roofElev + 0.25 + railH / 2, centerZ - slabD / 2 + 0.05);
      const gS = new THREE.Mesh(new THREE.BoxGeometry(slabW, railH, 0.04), mats.glass);
      gS.position.set(centerX, roofElev + 0.25 + railH / 2, centerZ + slabD / 2 - 0.05);
      this.roofGroup.add(gN, gS);

      // Sky Garden with Pergola, Decking & Planters
      this.createRooftopSkyGarden(centerX, roofElev + 0.25, centerZ, spanW, spanD, mats);
    } else {
      // -------------------------------------------------------------
      // Typology D: Urban Smart Flat Roof & Solar Canopy
      // -------------------------------------------------------------
      const slabW = spanW + 0.6;
      const slabD = spanD + 0.6;
      const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(slabW, 0.25, slabD), mats.roofTile);
      roofSlab.position.set(centerX, roofElev + 0.125, centerZ);
      this.roofGroup.add(roofSlab);

      // Parapet Walls
      const parapetH = 0.85;
      const pN = this.createWall(slabW, parapetH, 0.2, centerX, roofElev + 0.25 + parapetH / 2, centerZ - slabD / 2 + 0.1, mats.limewash);
      const pS = this.createWall(slabW, parapetH, 0.2, centerX, roofElev + 0.25 + parapetH / 2, centerZ + slabD / 2 - 0.1, mats.limewash);
      this.roofGroup.add(pN, pS);
    }
  }

  createRajasthanChhatriPavilion(x, y, z, w, d, mats) {
    const chhatri = new THREE.Group();
    chhatri.userData = { isChhatri: true };
    const stoneMat = mats.sandstone || mats.slate_stone;
    const domeMat = mats.sandstone || new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });

    const pw = Math.min(w * 0.45, 4.2);
    const pd = Math.min(d * 0.45, 4.2);
    const pillarH = 2.4;

    // 1. Plinth Platform
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.6, 0.25, pd + 0.6), stoneMat);
    plinth.position.set(0, 0.125, 0);
    chhatri.add(plinth);

    // 2. Four Carved Stone Pillars with molded bases and capital brackets
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
      const px = sx * (pw / 2 - 0.2);
      const pz = sz * (pd / 2 - 0.2);

      // Base
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.15, 0.32), stoneMat);
      base.position.set(px, 0.25 + 0.075, pz);
      // Shaft
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, pillarH - 0.3, 12), stoneMat);
      shaft.position.set(px, 0.25 + 0.15 + (pillarH - 0.3) / 2, pz);
      // Capital bracket
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.15, 0.36), stoneMat);
      cap.position.set(px, 0.25 + pillarH - 0.075, pz);

      chhatri.add(base, shaft, cap);
    });

    // 3. Cantilevered Stone Chhajja Eaves (sloping overhanging sunshade)
    const chhajjaW = pw + 0.9;
    const chhajjaD = pd + 0.9;
    const chhajja = new THREE.Mesh(new THREE.BoxGeometry(chhajjaW, 0.12, chhajjaD), stoneMat);
    chhajja.position.set(0, 0.25 + pillarH + 0.06, 0);
    chhatri.add(chhajja);

    // 4. Domed Canopy
    const domeR = Math.min(pw, pd) * 0.45;
    const domeGeo = new THREE.SphereGeometry(domeR, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, 0.25 + pillarH + 0.12, 0);
    chhatri.add(dome);

    // 5. Ornamental Brass Kalash Finial on Apex
    const finialPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.6, 8), brassMat);
    finialPole.position.set(0, 0.25 + pillarH + 0.12 + domeR + 0.3, 0);
    const finialBall = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), brassMat);
    finialBall.position.set(0, 0.25 + pillarH + 0.12 + domeR + 0.45, 0);
    chhatri.add(finialPole, finialBall);

    // 6. Warm Lantern Light
    const lantern = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 0),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    lantern.position.set(0, 0.25 + pillarH - 0.35, 0);
    chhatri.add(lantern);

    chhatri.position.set(x, y, z);
    this.roofGroup.add(chhatri);
  }

  createRooftopSkyGarden(x, y, z, w, d, mats) {
    const gardenGroup = new THREE.Group();
    gardenGroup.userData = { isSkyGarden: true };

    // Timber Decking Zone
    const deckW = Math.min(w * 0.75, 5.5);
    const deckD = Math.min(d * 0.75, 5.5);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(deckW, 0.06, deckD), mats.deck_timber);
    deck.position.set(0, 0.03, 0);
    gardenGroup.add(deck);

    // Architectural Timber Pergola covering one half
    this.createRooftopPergola(0, 0.06, 0, Math.min(deckW * 0.85, 4.5), Math.min(deckD * 0.85, 4.0), mats);

    // Lush Perimeter Planter Boxes with Shrubs
    const planterMat = mats.limewash || new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const planterH = 0.55;
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(deckW, planterH, 0.45), planterMat);
    p1.position.set(0, planterH / 2 + 0.06, -deckD / 2 + 0.25);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(deckW, planterH, 0.45), planterMat);
    p2.position.set(0, planterH / 2 + 0.06, deckD / 2 - 0.25);
    gardenGroup.add(p1, p2);

    // Shrubs in planters
    [-deckW * 0.3, 0, deckW * 0.3].forEach(offX => {
      const pl1 = this.createBiophilicPlant(offX, planterH + 0.06, -deckD / 2 + 0.25);
      const pl2 = this.createBiophilicPlant(offX, planterH + 0.06, deckD / 2 - 0.25);
      gardenGroup.add(pl1, pl2);
    });

    // Balcony Bistro Furniture on the deck
    this.createBalconyBistroFurniture(0, 0.06, 0, gardenGroup, mats);

    gardenGroup.position.set(x, y, z);
    this.roofGroup.add(gardenGroup);
  }

  createRooftopPergola(x, y, z, w, d, mats) {
    const pergola = new THREE.Group();
    const timberMat = mats.deck_timber;
    const postH = 2.4;

    // 4 Corner Posts
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, postH, 0.14), timberMat);
      post.position.set(sx * (w / 2 - 0.1), postH / 2, sz * (d / 2 - 0.1));
      pergola.add(post);
    });

    // Perimeter Header Beams
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, 0.12), timberMat);
    b1.position.set(0, postH - 0.08, -d / 2 + 0.1);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, 0.12), timberMat);
    b2.position.set(0, postH - 0.08, d / 2 - 0.1);
    pergola.add(b1, b2);

    // 7 Louvred Rafters casting architectural shadows
    const rafterCount = 7;
    for (let r = 0; r < rafterCount; r++) {
      const rx = -w / 2 + (r + 0.5) * (w / rafterCount);
      const rafter = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, d + 0.3), timberMat);
      rafter.position.set(rx, postH + 0.07, 0);
      pergola.add(rafter);
    }

    pergola.position.set(x, y, z);
    this.roofGroup.add(pergola);
  }

  createWall(w, h, d, x, y, z, mat) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = { isWall: true, originalMat: mat };
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Attach AutoCAD technical linework overlay
    if (typeof THREE.EdgesGeometry !== 'undefined' && typeof THREE.LineSegments !== 'undefined') {
      const edgesGeo = new THREE.EdgesGeometry(geo, 22);
      const edgeLine = new THREE.LineSegments(edgesGeo, this.currentEdgeMaterial);
      edgeLine.userData = { isCadEdge: true };
      edgeLine.visible = (this.renderStyle === 'autocad' || this.renderStyle === 'clay' || this.renderStyle === 'xray');
      mesh.add(edgeLine);
      this.edgeSegments.push(edgeLine);
    }

    return mesh;
  }



  createBiophilicPlant(x, y, z) {
    const group = new THREE.Group();
    // Planter Pot
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.18, 0.45, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    pot.position.set(0, 0.225, 0);
    // Dark Organic Soil
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.23, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0x271c19, roughness: 0.9 })
    );
    soil.position.set(0, 0.43, 0);
    // Green Foliage Clusters
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.55 });
    const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), foliageMat);
    leaf1.position.set(0, 0.7, 0);
    leaf1.scale.set(1, 1.3, 1);
    const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), foliageMat);
    leaf2.position.set(0.12, 0.9, -0.05);
    const leaf3 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), foliageMat);
    leaf3.position.set(-0.1, 0.85, 0.08);

    group.add(pot, soil, leaf1, leaf2, leaf3);
    group.position.set(x, y, z);
    group.userData = { isFurniture: true, isBiophilic: true };
    return group;
  }

  toggleBiophilic() {
    this.showBiophilic = this.showBiophilic === undefined ? false : !this.showBiophilic;
    if (!this.modelGroup) return this.showBiophilic;
    this.modelGroup.traverse(child => {
      if (child.userData && child.userData.isBiophilic) {
        child.visible = this.showBiophilic;
      }
    });
    return this.showBiophilic;
  }

  filterFloor(floorFilter) {
    this.floorGroups.forEach(grp => {
      const flNum = grp.userData.floorNumber;
      if (floorFilter === 'all') {
        grp.visible = true;
      } else if (floorFilter === 'ground') {
        grp.visible = (flNum === 0);
      } else if (floorFilter === 'upper') {
        grp.visible = (flNum === 1);
      }
    });

    if (this.roofGroup) {
      this.roofGroup.visible = (floorFilter === 'all') && this.showRoof;
    }
  }

  toggleRoof() {
    this.showRoof = !this.showRoof;
    if (this.roofGroup) this.roofGroup.visible = this.showRoof;
  }

  toggleFurniture() {
    this.showFurniture = !this.showFurniture;
    if (!this.modelGroup) return this.showFurniture;
    this.modelGroup.traverse(child => {
      if (child.userData && child.userData.isFurniture) {
        child.visible = this.showFurniture;
      }
    });
    return this.showFurniture;
  }

  setFloorMaterial(matKey) {
    this.floorMaterialType = matKey;
    if (!this.modelGroup) return;
    let color = 0xf8fafc;
    let roughness = 0.2;
    if (matKey === 'wood') {
      color = 0x92400e;
      roughness = 0.5;
    } else if (matKey === 'terrazzo') {
      color = 0x64748b;
      roughness = 0.35;
    } else if (matKey === 'concrete') {
      color = 0x334155;
      roughness = 0.7;
    } else {
      // marble
      color = 0xf8fafc;
      roughness = 0.15;
    }
    this.modelGroup.traverse(child => {
      if (child.isMesh && child.userData && child.userData.isFloorSlab) {
        if (child.material) {
          child.material.color.setHex(color);
          child.material.roughness = roughness;
          child.material.needsUpdate = true;
        }
      }
    });
  }

  setWallFinish(finishKey) {
    this.wallFinishType = finishKey;
    if (!this.modelGroup) return;

    let color = 0xf1f5f9;
    let roughness = 0.85;
    let metalness = 0.05;

    if (finishKey === 'slats') {
      color = 0x78350f;
      roughness = 0.45;
      metalness = 0.1;
    } else if (finishKey === 'brick') {
      color = 0x9a3412;
      roughness = 0.75;
    } else if (finishKey === 'felt') {
      color = 0x334155;
      roughness = 0.95;
    } else {
      // limewash
      color = 0xf1f5f9;
      roughness = 0.85;
    }

    this.modelGroup.traverse(child => {
      if (child.isMesh && child.userData && child.userData.isWall) {
        if (child.material) {
          child.material.color.setHex(color);
          child.material.roughness = roughness;
          child.material.metalness = metalness;
          child.material.needsUpdate = true;
        }
      }
    });
  }

  setLightingMood(mood) {
    if (!this.scene) return;
    this.currentMood = mood;
    if (!this.ambientLight || !this.sunLight || !this.hemiLight) return;

    if (mood === 'night') {
      this.scene.background = new THREE.Color(0x030712);
      if (this.scene.fog) this.scene.fog.color.setHex(0x030712);
      this.ambientLight.color.setHex(0x1e1b4b);
      this.ambientLight.intensity = 0.35;
      this.hemiLight.color.setHex(0x312e81);
      this.hemiLight.groundColor.setHex(0x020617);
      this.hemiLight.intensity = 0.3;
      this.sunLight.color.setHex(0x60a5fa);
      this.sunLight.intensity = 0.25;
      this.sunLight.position.set(20, 30, 20);
    } else if (mood === 'golden') {
      this.scene.background = new THREE.Color(0x18101e);
      if (this.scene.fog) this.scene.fog.color.setHex(0x18101e);
      this.ambientLight.color.setHex(0xfef3c7);
      this.ambientLight.intensity = 0.65;
      this.hemiLight.color.setHex(0xf59e0b);
      this.hemiLight.groundColor.setHex(0x78350f);
      this.hemiLight.intensity = 0.6;
      this.sunLight.color.setHex(0xfb923c);
      this.sunLight.intensity = 1.3;
      this.sunLight.position.set(50, 18, 25);
    } else if (mood === 'cyber') {
      this.scene.background = new THREE.Color(0x050515);
      if (this.scene.fog) this.scene.fog.color.setHex(0x050515);
      this.ambientLight.color.setHex(0x3b0764);
      this.ambientLight.intensity = 0.55;
      this.hemiLight.color.setHex(0x06b6d4);
      this.hemiLight.groundColor.setHex(0xd946ef);
      this.hemiLight.intensity = 0.75;
      this.sunLight.color.setHex(0xec4899);
      this.sunLight.intensity = 1.1;
      this.sunLight.position.set(30, 45, 35);
    } else {
      // Day
      this.scene.background = new THREE.Color(0x0a101f);
      if (this.scene.fog) this.scene.fog.color.setHex(0x0a101f);
      this.ambientLight.color.setHex(0xdbeafe);
      this.ambientLight.intensity = 0.6;
      this.hemiLight.color.setHex(0x38bdf8);
      this.hemiLight.groundColor.setHex(0x1e293b);
      this.hemiLight.intensity = 0.45;
      this.sunLight.color.setHex(0xfff7ed);
      this.sunLight.intensity = 0.95;
      this.sunLight.position.set(45, 60, 35);
    }
  }

  focusRoom(roomType) {
    if (!this.camera || !this.controls) return;

    if (roomType === 'all') {
      this.resetCamera();
      return;
    }

    let targetPos = null;
    for (const grp of this.floorGroups) {
      if (grp.userData && grp.userData.roomCenters) {
        if (roomType === 'living_room' && (grp.userData.roomCenters['living'] || grp.userData.roomCenters['living_room'])) {
          targetPos = grp.userData.roomCenters['living'] || grp.userData.roomCenters['living_room'];
          break;
        } else if (roomType === 'bedroom' && (grp.userData.roomCenters['bedroom'] || grp.userData.roomCenters['master_bedroom'])) {
          targetPos = grp.userData.roomCenters['bedroom'] || grp.userData.roomCenters['master_bedroom'];
          break;
        } else if (roomType === 'kitchen' && (grp.userData.roomCenters['kitchen'] || grp.userData.roomCenters['dining'])) {
          targetPos = grp.userData.roomCenters['kitchen'] || grp.userData.roomCenters['dining'];
          break;
        }
      }
    }

    if (!targetPos) {
      if (roomType === 'living_room') targetPos = { x: -2, y: 1.5, z: -1 };
      else if (roomType === 'bedroom') targetPos = { x: 2, y: 4.5, z: 2 };
      else if (roomType === 'kitchen') targetPos = { x: 3, y: 1.5, z: 1 };
      else targetPos = { x: 0, y: 2, z: 0 };
    }

    this.controls.target.set(targetPos.x, targetPos.y, targetPos.z);
    this.camera.position.set(targetPos.x + 7, targetPos.y + 5, targetPos.z + 8);
    this.controls.update();
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    if (!this.modelGroup) return;

    this.modelGroup.traverse(child => {
      if (child.isMesh && child.material) {
        child.material.wireframe = this.wireframeMode;
      }
    });
  }

  // ===========================================================================
  // ARCHITECTURAL RENDER PRESENTATION STYLES (Realistic, AutoCAD 3D, Clay, X-Ray)
  // ===========================================================================
  setRenderStyle(style) {
    this.renderStyle = style; // 'realistic' | 'autocad' | 'clay' | 'xray'
    if (!this.modelGroup || !this.scene) return;

    if (style === 'autocad') {
      // AutoCAD Technical Linework: Dark AutoCAD Model Space + Shaded Slate + Vibrant Cyan Lines
      this.scene.background = new THREE.Color(0x0a0e17);
      if (this.scene.fog) this.scene.fog.color.setHex(0x0a0e17);

      this.currentEdgeMaterial = this.cadEdgeMaterial;
      this.edgeSegments.forEach(edge => {
        edge.material = this.cadEdgeMaterial;
        edge.visible = true;
      });

      this.modelGroup.traverse(child => {
        if (child.isMesh && child.userData && (child.userData.isWall || child.userData.isFloorSlab)) {
          if (!child.userData.savedMat) child.userData.savedMat = child.material;
          child.material = new THREE.MeshStandardMaterial({
            color: child.userData.isFloorSlab ? 0x0f172a : 0x1e293b,
            roughness: 0.6,
            metalness: 0.2
          });
        }
      });
    } else if (style === 'clay') {
      // Architectural White Clay / Plaster Presentation Model
      this.scene.background = new THREE.Color(0x18181b);
      if (this.scene.fog) this.scene.fog.color.setHex(0x18181b);

      this.currentEdgeMaterial = this.clayEdgeMaterial;
      this.edgeSegments.forEach(edge => {
        edge.material = this.clayEdgeMaterial;
        edge.visible = true;
      });

      const clayMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f5, roughness: 0.88, metalness: 0.02 });
      this.modelGroup.traverse(child => {
        if (child.isMesh && child.userData && (child.userData.isWall || child.userData.isFloorSlab)) {
          if (!child.userData.savedMat) child.userData.savedMat = child.material;
          child.material = clayMat;
        }
      });
    } else if (style === 'xray') {
      // X-Ray Blueprint Mode: Glowing Blue Semi-Transparent Surfaces
      this.scene.background = new THREE.Color(0x020817);
      if (this.scene.fog) this.scene.fog.color.setHex(0x020817);

      this.currentEdgeMaterial = this.xrayEdgeMaterial;
      this.edgeSegments.forEach(edge => {
        edge.material = this.xrayEdgeMaterial;
        edge.visible = true;
      });

      const xrayMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.3,
        metalness: 0.8,
        transparent: true,
        opacity: 0.38
      });
      this.modelGroup.traverse(child => {
        if (child.isMesh && child.userData && (child.userData.isWall || child.userData.isFloorSlab)) {
          if (!child.userData.savedMat) child.userData.savedMat = child.material;
          child.material = xrayMat;
        }
      });
    } else {
      // Realistic PBR Mode (Default with Filmic Shadows & Textures)
      this.setLightingMood(this.lightingMood || 'day');

      this.edgeSegments.forEach(edge => {
        edge.visible = false;
      });

      this.modelGroup.traverse(child => {
        if (child.isMesh && child.userData && child.userData.savedMat) {
          child.material = child.userData.savedMat;
        }
      });
    }
  }

  // ===========================================================================
  // CAMERA PRESETS (Perspective, Top-Down CAD, Front Elevation, Isometric, Walkthrough)
  // ===========================================================================
  setCameraPreset(preset) {
    if (!this.camera || !this.controls) return;
    if (preset === 'top') {
      this.camera.position.set(0, 48, 0.01);
      this.controls.target.set(0, 0, 0);
    } else if (preset === 'front') {
      this.camera.position.set(0, 5, 36);
      this.controls.target.set(0, 3.5, 0);
    } else if (preset === 'isometric') {
      this.camera.position.set(32, 32, 32);
      this.controls.target.set(0, 3, 0);
    } else if (preset === 'walkthrough') {
      let tx = 0, ty = 1.6, tz = 0;
      if (this.floorGroups.length > 0 && this.floorGroups[0].userData && this.floorGroups[0].userData.roomCenters) {
        const rc = this.floorGroups[0].userData.roomCenters;
        const targetRoom = rc['living'] || rc['living_room'] || rc['foyer'] || Object.values(rc)[0];
        if (targetRoom) {
          tx = targetRoom.x;
          ty = targetRoom.y || 1.6;
          tz = targetRoom.z;
        }
      }
      this.camera.position.set(tx - 2.5, ty + 0.1, tz + 2.5);
      this.controls.target.set(tx + 2.0, ty, tz - 1.5);
    } else {
      // Perspective default
      this.resetCamera();
    }
    this.controls.update();
  }

  // ===========================================================================
  // 4K HIGH-RES RENDER SNAPSHOT EXPORT
  // ===========================================================================
  exportHighResRender() {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.renderer.render(this.scene, this.camera);
    const canvas = this.renderer.domElement;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width * 2;
    exportCanvas.height = canvas.height * 2;
    const ctx = exportCanvas.getContext('2d');

    // Draw 3D scene scaled up
    ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    // Architectural Title Block Banner at Bottom
    const barH = Math.max(56, Math.round(exportCanvas.height * 0.065));
    ctx.fillStyle = 'rgba(9, 9, 11, 0.94)';
    ctx.fillRect(0, exportCanvas.height - barH, exportCanvas.width, barH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, exportCanvas.height - barH);
    ctx.lineTo(exportCanvas.width, exportCanvas.height - barH);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(barH * 0.38)}px sans-serif`;
    ctx.fillText('NeeV | SPATIAL INTELLIGENCE & ARCHITECTURAL 3D STUDIO', 24, exportCanvas.height - (barH * 0.38));

    ctx.fillStyle = '#38bdf8';
    ctx.font = `${Math.round(barH * 0.30)}px monospace`;
    const tag = `VIEW: ${this.renderStyle.toUpperCase()} | DOMAIN: ${(this.currentDomain || 'RESIDENTIAL').toUpperCase()} | 4K RENDER`;
    const tagW = ctx.measureText(tag).width;
    ctx.fillText(tag, exportCanvas.width - tagW - 24, exportCanvas.height - (barH * 0.38));

    const link = document.createElement('a');
    link.download = `NeeV_3D_Render_${this.renderStyle}_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }

  resetCamera() {
    if (!this.camera || !this.controls) return;
    if (this.currentDomain === 'bridge') {
      this.camera.position.set(0, 35, 95);
      this.controls.target.set(0, 10, 0);
    } else if (this.currentDomain === 'road') {
      this.camera.position.set(-60, 25, 45);
      this.controls.target.set(0, 2, 0);
    } else if (this.currentDomain === 'mall') {
      this.camera.position.set(45, 40, 55);
      this.controls.target.set(0, 8, 0);
    } else {
      this.camera.position.set(26, 22, 28);
      this.controls.target.set(0, 3.5, 0);
    }
    this.controls.update();
  }

  onWindowResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.studio3D = null;
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('threeContainer');
  if (container) {
    window.studio3D = new Studio3DViewer('threeContainer');
  }
});
