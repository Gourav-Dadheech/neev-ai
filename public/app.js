/**
 * NeeV - Generative Spatial Studio Frontend Controller
 * Coordinates Chat, 2D Floor Plan rendering, 3D WebGL Viewer, MEP Metrics & BOQ
 */

// Application State
const appState = {
  project_data: {
    project_type: null,
    plot_width: null,
    plot_length: null,
    unit: 'feet',
    location: null,
    road_direction: null,
    floors: null,
    bedrooms: null,
    bathrooms: null,
    living_room: null,
    dining_room: null,
    kitchen: null,
    parking_cars: null,
    parking_bikes: null,
    residents: null,
    special_requirements: null,
    architectural_style: null,
    natural_light: null,
    ventilation: null,
    garden: null,
    budget: null,
    project_specific_requirements: null
  },
  layout: null,
  boq: null,
  currentFloorIndex: 0,
  activeTab: 'tab-blueprint',
  isWaitingForAI: false,
  history: []
};

// DOM Elements
const chatViewport = document.getElementById('chatViewport');
const chatInput = document.getElementById('chatInput');
const chatForm = document.getElementById('chatForm');
const btnSendChat = document.getElementById('btnSendChat');
const btnForceGenerate = document.getElementById('btnForceGenerate');
const btnLoadPreset = document.getElementById('btnLoadPreset');
const selectDomainPreset = document.getElementById('selectDomainPreset');
const btnNewProject = document.getElementById('btnNewProject');
const btnToggleSpecs = document.getElementById('btnToggleSpecs');
const specDrawer = document.getElementById('specDrawer');
const specCountBadge = document.getElementById('specCountBadge');
const blueprintContainer = document.getElementById('blueprintContainer');
const blueprintFloorSelector = document.getElementById('blueprintFloorSelector');
const blueprintMetrics = document.getElementById('blueprintMetrics');
const btnDownloadSvg = document.getElementById('btnDownloadSvg');
const dynamicSuggestions = document.getElementById('dynamicSuggestions');

const btnSaveProject = document.getElementById('btnSaveProject');
const btnMyProjects = document.getElementById('btnMyProjects');
const btnProPlans = document.getElementById('btnProPlans');
const btnLogin = document.getElementById('btnLogin');
const btnSaveProfile = document.getElementById('btnSaveProfile');
const filterProjectsInput = document.getElementById('filterProjectsInput');
const btnToggleInteriorFurniture = document.getElementById('btnToggleInteriorFurniture');
const btnToggleRoofInterior = document.getElementById('btnToggleRoofInterior');

// 3D Control Buttons
const btn3dAll = document.getElementById('btn3dAll');
const btn3dGround = document.getElementById('btn3dGround');
const btn3dUpper = document.getElementById('btn3dUpper');
const btn3dRoofToggle = document.getElementById('btn3dRoofToggle');
const btn3dWireframe = document.getElementById('btn3dWireframe');
const btn3dResetCam = document.getElementById('btn3dResetCam');

// Initialize Studio
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupInteriorStudioListeners();
  setupProInteriorStudio();
  loadUserProfile();
  loadProStatus();
  updateSpecDrawer();
  checkUrlParamsAndInit();
});

function setupEventListeners() {
  // Chat submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleUserSendMessage();
  });

  // Force generate
  btnForceGenerate.addEventListener('click', () => {
    handleForceGenerate();
  });

  // Load domain presets (Bridge, Road, Mall, House)
  if (btnLoadPreset) {
    btnLoadPreset.addEventListener('click', () => {
      const ptype = selectDomainPreset?.value || 'house';
      loadDomainPreset(ptype);
    });
  }

  // Header modal triggers
  if (btnNewProject) {
    btnNewProject.addEventListener('click', () => openModal('modalNewProject'));
  }
  if (btnSaveProject) {
    btnSaveProject.addEventListener('click', openSaveProjectModal);
  }
  const btnShareProject = document.getElementById('btnShareProject');
  if (btnShareProject) {
    btnShareProject.addEventListener('click', shareCurrentProject);
  }
  const btnOpenFeedback = document.getElementById('btnOpenFeedback');
  if (btnOpenFeedback) {
    btnOpenFeedback.addEventListener('click', openFeedbackModal);
  }
  setupFeedbackStars();
  setupMobileResponsiveController();

  const btnConfirmSaveProject = document.getElementById('btnConfirmSaveProject');
  if (btnConfirmSaveProject) {
    btnConfirmSaveProject.addEventListener('click', saveCurrentProjectFromModal);
  }
  if (btnMyProjects) {
    btnMyProjects.addEventListener('click', openProjectsModal);
  }
  if (btnProPlans) {
    btnProPlans.addEventListener('click', () => openModal('modalPro'));
  }
  if (btnLogin) {
    btnLogin.addEventListener('click', () => openModal('modalLogin'));
  }
  if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', saveUserProfile);
  }
  if (filterProjectsInput) {
    filterProjectsInput.addEventListener('input', (e) => filterSavedProjects(e.target.value));
  }

  // Close modals on clicking overlay backdrop
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });

  // Toggle spec drawer
  btnToggleSpecs.addEventListener('click', () => {
    specDrawer.classList.toggle('collapsed');
  });

  // Tab switching
  document.querySelectorAll('.nav-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const targetTab = tabBtn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Export CAD SVG & Export BOQ CSV
  if (btnDownloadSvg) {
    btnDownloadSvg.addEventListener('click', downloadSvgBlueprint);
  }
  const btnExportBoq = document.getElementById('btnExportBoq');
  if (btnExportBoq) {
    btnExportBoq.addEventListener('click', exportBoqCsv);
  }

  // 3D Controls
  if (btn3dAll) btn3dAll.addEventListener('click', () => { set3dActive(btn3dAll); window.studio3D?.filterFloor('all'); });
  if (btn3dGround) btn3dGround.addEventListener('click', () => { set3dActive(btn3dGround); window.studio3D?.filterFloor('ground'); });
  if (btn3dUpper) btn3dUpper.addEventListener('click', () => { set3dActive(btn3dUpper); window.studio3D?.filterFloor('upper'); });
  if (btn3dRoofToggle) btn3dRoofToggle.addEventListener('click', () => { window.studio3D?.toggleRoof(); });
  if (btn3dResetCam) btn3dResetCam.addEventListener('click', () => { window.studio3D?.resetCamera(); });

  // 3D Render Presentation Style Pills (Realistic, AutoCAD 3D, Clay, X-Ray)
  document.querySelectorAll('#threeRenderStylePills .btn-variant').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#threeRenderStylePills .btn-variant').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const style = btn.getAttribute('data-style3d');
      if (style && window.studio3D?.setRenderStyle) {
        window.studio3D.setRenderStyle(style);
        showToast(`3D Render: ${style.toUpperCase()} mode enabled`, 'info', '🎨');
      }
    });
  });

  // 3D Camera Presets (Perspective, Isometric, Top Plan, Elevation, Walkthrough)
  document.querySelectorAll('#threeCameraPills .btn-variant').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#threeCameraPills .btn-variant').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cam = btn.getAttribute('data-cam');
      if (cam && window.studio3D?.setCameraPreset) {
        window.studio3D.setCameraPreset(cam);
        showToast(`Camera: ${cam.toUpperCase()} viewpoint`, 'info', '📷');
      }
    });
  });

  // 3D High-Res 4K Snapshot
  const btn3dSnapshot = document.getElementById('btn3dSnapshot');
  if (btn3dSnapshot) {
    btn3dSnapshot.addEventListener('click', () => {
      if (window.studio3D?.exportHighResRender) {
        window.studio3D.exportHighResRender();
        showToast('📸 4K Architectural Snapshot exported!', 'success', '📸');
      }
    });
  }

  // Architectural Concept Switcher Buttons (2D & 3D toolbars)
  document.querySelectorAll('#blueprintVariantPills .btn-variant, #threeVariantPills .btn-variant').forEach(vBtn => {
    vBtn.addEventListener('click', () => {
      const vKey = vBtn.getAttribute('data-variant');
      if (vKey) {
        switchDesignVariant(vKey);
      }
    });
  });
}

function setupMobileResponsiveController() {
  const btnMobileChat = document.getElementById('btnMobileChat');
  const btnMobileStudio = document.getElementById('btnMobileStudio');
  const workspace = document.querySelector('.studio-workspace');
  const mobileStudioBadge = document.getElementById('mobileStudioBadge');
  const btnMobileMenuToggle = document.getElementById('btnMobileMenuToggle');
  const mobileActionsPopover = document.getElementById('mobileActionsPopover');

  function setMobileView(viewMode) {
    if (!workspace) return;
    if (viewMode === 'studio') {
      workspace.classList.remove('mobile-view-chat');
      workspace.classList.add('mobile-view-studio');
      btnMobileChat?.classList.remove('active');
      btnMobileChat?.setAttribute('aria-selected', 'false');
      btnMobileStudio?.classList.add('active');
      btnMobileStudio?.setAttribute('aria-selected', 'true');
      if (mobileStudioBadge) mobileStudioBadge.style.display = 'none';

      // Ensure 3D viewport dimensions match new full screen
      setTimeout(() => {
        if (window.studio3D && typeof window.studio3D.onWindowResize === 'function') {
          window.studio3D.onWindowResize();
        }
      }, 60);
    } else {
      workspace.classList.remove('mobile-view-studio');
      workspace.classList.add('mobile-view-chat');
      btnMobileStudio?.classList.remove('active');
      btnMobileStudio?.setAttribute('aria-selected', 'false');
      btnMobileChat?.classList.add('active');
      btnMobileChat?.setAttribute('aria-selected', 'true');
    }
  }

  // Global helper for auto-switch after design generation
  window.switchMobileStudioView = (notifyOnly = false) => {
    if (window.innerWidth <= 900) {
      if (notifyOnly && workspace && workspace.classList.contains('mobile-view-chat')) {
        if (mobileStudioBadge) mobileStudioBadge.style.display = 'inline-block';
      } else {
        setMobileView('studio');
      }
    }
  };

  btnMobileChat?.addEventListener('click', () => setMobileView('chat'));
  btnMobileStudio?.addEventListener('click', () => setMobileView('studio'));

  // Mobile menu popover toggle
  if (btnMobileMenuToggle && mobileActionsPopover) {
    btnMobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileActionsPopover.classList.toggle('show');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileActionsPopover.contains(e.target) && e.target !== btnMobileMenuToggle) {
        mobileActionsPopover.classList.remove('show');
      }
    });

    // Hook popover items to existing modals
    document.getElementById('btnMobileNew')?.addEventListener('click', () => {
      mobileActionsPopover.classList.remove('show');
      openModal('modalNewProject');
    });
    document.getElementById('btnMobileSave')?.addEventListener('click', () => {
      mobileActionsPopover.classList.remove('show');
      openSaveProjectModal();
    });
    document.getElementById('btnMobileShare')?.addEventListener('click', () => {
      mobileActionsPopover.classList.remove('show');
      shareCurrentProject();
    });
    document.getElementById('btnMobileLibrary')?.addEventListener('click', () => {
      mobileActionsPopover.classList.remove('show');
      openProjectsModal();
    });
    document.getElementById('btnMobileFeedback')?.addEventListener('click', () => {
      mobileActionsPopover.classList.remove('show');
      openFeedbackModal();
    });
  }

  // Auto-scroll when chat input is focused on mobile
  const chatInput = document.getElementById('chatInput');
  const chatViewport = document.getElementById('chatViewport');
  if (chatInput && chatViewport) {
    chatInput.addEventListener('focus', () => {
      setTimeout(() => {
        chatViewport.scrollTop = chatViewport.scrollHeight;
      }, 300);
    });
  }

  // Auto-adapt when screen is resized
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      workspace?.classList.remove('mobile-view-studio');
      workspace?.classList.add('mobile-view-chat');
      mobileActionsPopover?.classList.remove('show');
    }
  });
}

function set3dActive(activeBtn) {
  [btn3dAll, btn3dGround, btn3dUpper].forEach(b => b?.classList.remove('active'));
  activeBtn.classList.add('active');
}

// Switch architectural concept typology
async function switchDesignVariant(variantKey) {
  if (appState.isWaitingForAI) return;

  // Snapshot before switching
  if (appState.layout && appState.boq) {
    if (!appState.history) appState.history = [];
    appState.history.push({
      project_data: JSON.parse(JSON.stringify(appState.project_data)),
      layout: appState.layout,
      boq: appState.boq,
      action: `Switch variant to ${variantKey}`
    });
    if (appState.history.length > 25) appState.history.shift();
  }
  
  // Set in project state
  appState.project_data.design_variant = variantKey;
  updateVariantPillStates(variantKey);

  // If no project dimensions set, supply default residential dimensions
  if (!appState.project_data.plot_width) {
    appState.project_data.plot_width = 30.0;
    appState.project_data.plot_length = 50.0;
    appState.project_data.floors = appState.project_data.floors || 2;
    appState.project_data.bedrooms = appState.project_data.bedrooms || 3;
    appState.project_data.bathrooms = appState.project_data.bathrooms || 3;
  }

  const typingElem = appendTypingIndicator();
  appState.isWaitingForAI = true;

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_data: appState.project_data
      })
    });

    const data = await response.json();
    typingElem.remove();

    if (data.layout && data.boq) {
      const vTitle = data.layout.summary?.variant_title || variantKey.replace('_', ' ').toUpperCase();
      const vDesc = data.layout.summary?.variant_desc || '';
      appendChatMessage('ai', `✨ Switched architectural concept to **${vTitle}**!\n\n${vDesc}\n\n*Updated 2D CAD blueprint, real-time 3D model, room finishes, door apertures, and furniture layout.*`);
      renderArchitecturalSuite(data.layout, data.boq);
    }
  } catch (err) {
    typingElem.remove();
    console.error('Failed to switch variant:', err);
    appendChatMessage('ai', `Failed to switch variant: ${err.message}`);
  } finally {
    appState.isWaitingForAI = false;
  }
}

function updateVariantPillStates(activeVariant) {
  document.querySelectorAll('.btn-variant').forEach(btn => {
    const isTarget = btn.getAttribute('data-variant') === activeVariant;
    btn.classList.toggle('active', isTarget);
  });
}

// Tab Switching
function switchTab(tabId) {
  appState.activeTab = tabId;
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === tabId);
  });

  // If 3D tab opened, trigger resize to ensure proper WebGL dimensions
  if (tabId === 'tab-3d' && window.studio3D) {
    setTimeout(() => {
      window.studio3D.onWindowResize();
    }, 50);
  }
}

// Quick reply click helper
window.quickSend = function(text) {
  chatInput.value = text;
  handleUserSendMessage();
};

// Send message to AI Architect
async function handleUserSendMessage() {
  const text = chatInput.value.trim();
  if (!text || appState.isWaitingForAI) return;

  // Append user message in UI
  appendChatMessage('user', text);
  chatInput.value = '';

  // 1. Instant Client-Side Undo / Reverse Command
  const isUndoCmd = /\b(reverse|undo|revert|go back|last step|previous state)\b/i.test(text);
  if (isUndoCmd) {
    if (appState.history && appState.history.length > 0) {
      const prev = appState.history.pop();
      appState.project_data = prev.project_data;
      appState.layout = prev.layout;
      appState.boq = prev.boq;
      renderArchitecturalSuite(prev.layout, prev.boq);
      updateSpecDrawer();
      appendChatMessage('ai', '↩️ **Reversed the last step!** Restored the previous architectural design state.');
      return;
    } else {
      appendChatMessage('ai', '↩️ Already at the earliest recorded design state.');
      return;
    }
  }

  // 2. Snapshot current state before executing a new change
  if (appState.layout && appState.boq) {
    if (!appState.history) appState.history = [];
    appState.history.push({
      project_data: JSON.parse(JSON.stringify(appState.project_data)),
      layout: appState.layout,
      boq: appState.boq,
      action: text
    });
    if (appState.history.length > 25) appState.history.shift();
  }

  // Show typing indicator
  const typingElem = appendTypingIndicator();
  appState.isWaitingForAI = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_message: text,
        project_data: appState.project_data,
        force_generate: false
      })
    });

    const data = await response.json();
    typingElem.remove();

    if (data.chat) {
      appState.project_data = data.project_data;
      updateSpecDrawer();

      // Render AI message & questions
      appendChatMessage('ai', data.chat.message, data.chat.next_questions);

      // If plan is generated or available, update 2D, 3D, and BOQ
      if (data.layout && data.boq) {
        renderArchitecturalSuite(data.layout, data.boq);
      }
    }
  } catch (err) {
    typingElem.remove();
    appendChatMessage('ai', `Sorry, an error occurred while consulting: ${err.message}`);
  } finally {
    appState.isWaitingForAI = false;
  }
}

// Force immediate generation
async function handleForceGenerate() {
  if (appState.isWaitingForAI) return;
  
  // If plot dimensions not set, ask for them or apply sensible default
  if (!appState.project_data.plot_width) {
    appState.project_data.plot_width = 30.0;
    appState.project_data.plot_length = 50.0;
    appState.project_data.floors = appState.project_data.floors || 2;
    appState.project_data.bedrooms = appState.project_data.bedrooms || 3;
    appState.project_data.bathrooms = appState.project_data.bathrooms || 3;
  }

  appendChatMessage('user', 'Please generate the full 2D blueprint, 3D model, and engineering BOQ now!');
  const typingElem = appendTypingIndicator();
  appState.isWaitingForAI = true;

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_data: appState.project_data
      })
    });

    const data = await response.json();
    typingElem.remove();

    if (data.layout && data.boq) {
      appendChatMessage('ai', '🚀 Your architectural suite is ready! I have generated the 2D CAD blueprint, interactive 3D model, electrical wiring calculations, plumbing pipelines, and full cost estimation.');
      renderArchitecturalSuite(data.layout, data.boq);
      switchTab('tab-blueprint');
    }
  } catch (err) {
    typingElem.remove();
    appendChatMessage('ai', `Generation failed: ${err.message}`);
  } finally {
    appState.isWaitingForAI = false;
  }
}

// Load Domain Preset Demo (Bridge, Road, Mall, House)
async function loadDomainPreset(type) {
  try {
    const res = await fetch(`/api/sample?type=${encodeURIComponent(type)}`);
    const data = await res.json();
    
    appState.project_data = data.project_data;
    updateSpecDrawer();

    const titles = {
      house: '🏠 Modern 30x50 Residential House',
      bridge: '🌉 120m Cable-Stayed River Bridge',
      road: '🛣️ 5 km 4-Lane Divided Highway',
      mall: '🛍️ Grand Galleria Shopping Mall'
    };

    appendChatMessage('ai', `Loaded **${titles[type] || type.toUpperCase()}**! Explore the 2D engineering blueprints, real-time 3D WebGL model, civil materials, pipeline runs, and itemized BOQ.`);
    renderArchitecturalSuite(data.layout, data.boq);
    switchTab('tab-blueprint');
  } catch (e) {
    alert('Failed to load preset: ' + e.message);
  }
}

function resetProject() {
  if (confirm('Start a fresh architectural/civil project?')) {
    location.reload();
  }
}

// Render complete architectural results
function renderArchitecturalSuite(layout, boq) {
  appState.layout = layout;
  appState.boq = boq;

  // 1. Render 2D Blueprint
  render2DBlueprint();

  // 2. Render 3D Model in Three.js
  if (window.studio3D && layout.scene_3d) {
    window.studio3D.loadBuildingScene(layout.scene_3d);
  }

  // 3. Render MEP (Electrical & Plumbing / Infrastructure)
  renderMEPMetrics(boq);

  // 4. Render BOQ & Cost Estimation
  renderBOQDashboard(boq);

  // 5. Render Construction Timeline
  renderConstructionTimeline(boq);

  // 6. Update Interior Studio inventory
  updateInteriorInventory();

  // 7. Synchronize Architectural Concept Variant Pills
  if (layout.design_variant) {
    updateVariantPillStates(layout.design_variant);
  }

  // On mobile viewports (< 900px), automatically switch to Studio view
  if (typeof window.switchMobileStudioView === 'function') {
    window.switchMobileStudioView(false);
  }
}

// 2D Blueprint Render
function render2DBlueprint() {
  if (!appState.layout || !appState.layout.floors) return;

  const floors = appState.layout.floors;
  
  // Floor selector buttons
  blueprintFloorSelector.innerHTML = '';
  floors.forEach((fl, idx) => {
    const btn = document.createElement('button');
    btn.className = `btn-chip ${idx === appState.currentFloorIndex ? 'active' : ''}`;
    let label = fl.floor_name || `Floor ${idx}`;
    if (label.toLowerCase().includes('ground')) label = 'Ground';
    else if (label.toLowerCase().includes('first') || label.toLowerCase().includes('level 1')) label = 'Level 1';
    else if (label.toLowerCase().includes('level 2')) label = 'Level 2';
    else if (label.toLowerCase().includes('roof') || label.toLowerCase().includes('terrace') || label.toLowerCase().includes('attic')) label = 'Terrace';
    btn.textContent = label;
    btn.title = fl.floor_name;
    btn.addEventListener('click', () => {
      appState.currentFloorIndex = idx;
      render2DBlueprint();
    });
    blueprintFloorSelector.appendChild(btn);
  });

  const curFloor = floors[appState.currentFloorIndex] || floors[0];
  
  // Metrics tag
  const domain = appState.layout.category || 'residential';
  if (domain === 'bridge') {
    blueprintMetrics.textContent = `Clear Span: ${appState.layout.plot.length}m • Deck Width: ${appState.layout.plot.width}m`;
  } else if (domain === 'road') {
    blueprintMetrics.textContent = `Length: ${appState.layout.plot.length / 1000} km • Lanes: ${appState.layout.plot.lanes} • Carriageway: ${appState.layout.plot.width}m`;
  } else if (domain === 'mall') {
    blueprintMetrics.textContent = `Floor Area: ${curFloor.total_area_sqft} sq.ft • Level ${curFloor.floor_number}`;
  } else {
    blueprintMetrics.textContent = `Built-up: ${curFloor.total_area_sqft} sq.ft • Carpet: ${curFloor.carpet_area_sqft} sq.ft`;
  }

  // Render SVG
  blueprintContainer.innerHTML = `<div class="blueprint-svg-wrapper">${curFloor.svg_blueprint}</div>`;
}

// Download SVG CAD Blueprint
function downloadSvgBlueprint() {
  if (!appState.layout || !appState.layout.floors) return;
  const curFloor = appState.layout.floors[appState.currentFloorIndex];
  if (!curFloor || !curFloor.svg_blueprint) return;

  const blob = new Blob([curFloor.svg_blueprint], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NeeV_${curFloor.floor_name.replace(/[^a-zA-Z0-9]/g, '_')}_Blueprint.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

// Render MEP: Electrical & Plumbing (Domain Adaptive)
function renderMEPMetrics(boq) {
  const domain = boq.domain || 'residential';
  const elec = boq.electrical_system || {};
  const plumb = boq.plumbing_system || {};
  const civil = boq.civil_materials || {};

  // Electrical values
  setText('mep-total-wire', `${(elec.total_electrical_wire_meters || 0).toLocaleString()} m`);
  setText('mep-total-wire-ft', `${(elec.total_electrical_wire_feet || 0).toLocaleString()} linear feet total electrical cabling`);

  // Plumbing & Pipeline values
  setText('mep-total-pipe', `${(plumb.total_pipeline_length_meters || 0).toLocaleString()} m`);
  setText('mep-total-pipe-ft', `${(plumb.total_pipeline_length_feet || 0).toLocaleString()} linear feet total pipeline networks`);

  if (domain === 'bridge') {
    setText('mep-wire-1mm', `Lighting Poles: ${elec.bridge_lighting_poles || 0} Units`);
    setText('mep-wire-25mm', `Navigational Beacons: ${elec.aviation_marine_nav_beacons || 4} Units`);
    setText('mep-wire-4mm', `High-Tension Steel Cables: ${civil.structural_steel_girders_mt || 0} MT`);
    setText('mep-wire-earth', `Crash Barriers: ${civil.crash_barriers_linear_m || 0} m`);
    setText('mep-conduits', `Deck Expansion Joints: ${civil.modular_expansion_joints_m || 0} m`);
    setText('mep-switches', `Elastomeric Pot Bearings: ${civil.elastomeric_bearings_units || 0} Units`);
    setText('mep-lights', `High-Grade Concrete: ${civil.high_grade_concrete_cum || 0} m³`);
    setText('mep-mdb', `Substructure Piers: ${boq.project_metrics?.piers_count || 0} River Piers`);

    setText('mep-freshwater-pipe', `Deck Scupper Drains: ${plumb.drainage_pvc_pipelines_meters || 0} m`);
    setText('mep-drainage-pipe', `Deck Asphalt: ${civil.deck_asphalt_metric_tons || 0} MT`);
    setText('mep-watertank', `Navigational Clearance: 12.0 Meters`);
    setText('mep-toilets', `Piers: ${boq.project_metrics?.piers_count || 0}`);
    setText('mep-basins', `Deck Area: ${boq.project_metrics?.deck_area_sqm || 0} m²`);
    setText('mep-showers', `Abutments: 2 Heavy RCC`);
    setText('mep-geysers', `Traffic Lanes: 4 Lanes`);
  } else if (domain === 'road') {
    setText('mep-wire-1mm', `Highway Streetlights: ${elec.highway_streetlights_count || 0} Poles`);
    setText('mep-wire-25mm', `High Mast Interchanges: ${elec.high_mast_interchange_lighting || 2} Towers`);
    setText('mep-wire-4mm', `Underground Feeder: ${(elec.total_electrical_wire_meters || 0).toLocaleString()} m`);
    setText('mep-wire-earth', `W-Beam Guardrails: ${civil.w_beam_guardrails_m || 0} m`);
    setText('mep-conduits', `Road Markings: ${civil.thermoplastic_markings_sqm || 0} m²`);
    setText('mep-switches', `Earthwork Cut/Fill: ${(civil.earthwork_excavation_cum || 0).toLocaleString()} m³`);
    setText('mep-lights', `GSB Sub-Base: ${(civil.granular_subbase_gsb_mt || 0).toLocaleString()} MT`);
    setText('mep-mdb', `Asphalt Bitumen: ${(civil.asphalt_bitumen_metric_tons || 0).toLocaleString()} MT`);

    setText('mep-freshwater-pipe', `Stormwater Culverts: ${(plumb.drainage_pvc_pipelines_meters || 0).toLocaleString()} m`);
    setText('mep-drainage-pipe', `Catch Basins: ${plumb.catch_basin_chambers_count || 0} Chambers`);
    setText('mep-watertank', `Carriageway Width: ${boq.project_metrics?.carriageway_width_m || 20}m`);
    setText('mep-toilets', `Travel Lanes: ${boq.project_metrics?.lanes_count || 4} Lanes`);
    setText('mep-basins', `Total Road Length: ${boq.project_metrics?.road_length_km || 5} km`);
    setText('mep-showers', `Standard: AASHTO / IRC`);
    setText('mep-geysers', `Median: 2.5m Green Barrier`);
  } else if (domain === 'mall') {
    setText('mep-wire-1mm', `Commercial Cabling: ${(elec.total_electrical_wire_meters || 0).toLocaleString()} m`);
    setText('mep-wire-25mm', `Substations: ${elec.commercial_substations_count || 1} 11kV Substation`);
    setText('mep-wire-4mm', `Diesel Generators: ${elec.diesel_generator_dg_sets || 2} Units`);
    setText('mep-wire-earth', `Atrium Steel Trusses: ${civil.structural_steel_atrium_mt || 0} MT`);
    setText('mep-conduits', `Commercial Flooring: ${(civil.commercial_flooring_sqft || 0).toLocaleString()} sq.ft`);
    setText('mep-switches', `Escalator Banks: ${plumb.escalators_units || 4} Escalators`);
    setText('mep-lights', `Commercial Luminaires: ${(elec.led_commercial_luminaires || 0).toLocaleString()} LED Fixtures`);
    setText('mep-mdb', `Passenger Elevators: ${plumb.passenger_elevators_units || 6} Elevators`);

    setText('mep-freshwater-pipe', `Fire Sprinkler Pipelines: ${(plumb.fire_sprinkler_pipeline_meters || 0).toLocaleString()} m`);
    setText('mep-drainage-pipe', `Public Restroom Pipelines: ${(plumb.public_restroom_pipeline_meters || 0).toLocaleString()} m`);
    setText('mep-watertank', `Fire Safety Sump: ${(plumb.underground_fire_sump_liters || 150000).toLocaleString()} Liters`);
    setText('mep-toilets', `HVAC Capacity: ${boq.project_metrics?.hvac_cooling_capacity_tr || 0} TR`);
    setText('mep-basins', `Commercial Levels: ${boq.project_metrics?.floors_count || 3} Floors`);
    setText('mep-showers', `Fire Standards: NFPA Compliant`);
    setText('mep-geysers', `Retail Promenades: 12-ft Wide`);
  } else {
    // Residential Default
    setText('mep-wire-1mm', `${elec.wire_lighting_1_0mm_meters || 0} m`);
    setText('mep-wire-25mm', `${elec.wire_power_sockets_2_5mm_meters || 0} m`);
    setText('mep-wire-4mm', `${elec.wire_heavy_load_ac_4_0mm_meters || 0} m`);
    setText('mep-wire-earth', `${elec.wire_grounding_earth_meters || 0} m`);
    setText('mep-conduits', `${elec.pvc_conduit_pipe_meters || 0} m (${elec.pvc_conduit_pipe_feet || 0} ft)`);
    setText('mep-switches', `${elec.modular_switch_plates || 0} Modular Plates & Points`);
    setText('mep-lights', `Downlights & Fans: ${elec.modular_switch_plates || 0} Points`);
    setText('mep-mdb', `Distribution Board: 1 Unit`);

    setText('mep-freshwater-pipe', `${plumb.freshwater_cpvc_pipelines_meters || 0} m (${plumb.freshwater_cpvc_pipelines_feet || 0} ft)`);
    setText('mep-drainage-pipe', `${plumb.drainage_pvc_pipelines_meters || 0} m (${plumb.drainage_pvc_pipelines_feet || 0} ft)`);
    setText('mep-watertank', `${(plumb.overhead_water_tank_capacity_liters || 0).toLocaleString()} Liters Tank`);
    setText('mep-toilets', `${plumb.toilets_ewc_count || 0} EWCs`);
    setText('mep-basins', `${plumb.wash_basins_count || 0} Vanity Basins`);
    setText('mep-showers', `Showers & Taps`);
    setText('mep-geysers', `Domestic Geysers`);
  }
}

// Render Cost & BOQ Dashboard
function renderBOQDashboard(boq) {
  const cost = boq.cost_estimation || {};
  const metrics = boq.project_metrics || {};

  setText('boqTotalCost', `$${(cost.total_estimated_cost || 0).toLocaleString()}`);
  setText('boqInrCost', `₹${(cost.cost_in_inr_equivalent || 0).toLocaleString()} INR Equivalent`);
  setText('boqCostPerSqft', `$${cost.cost_per_sqft || 0} / sqft`);
  setText('boqBuiltupArea', `${metrics.total_builtup_area_sqft || 0} sq.ft Total Built-up`);
  setText('boqLaborCost', `Labor: $${(cost.labor_total || 0).toLocaleString()} • Materials: $${(cost.materials_total || 0).toLocaleString()}`);

  // Table items
  const tbody = document.getElementById('boqTableBody');
  tbody.innerHTML = '';

  const items = cost.itemized || [];
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(item.item)}</strong></td>
      <td>${escapeHtml(item.qty)}</td>
      <td>$${(item.cost || 0).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Render Construction Timeline
function renderConstructionTimeline(boq) {
  const timeline = boq.timeline || {};
  const metrics = boq.project_metrics || {};

  setText('timelineTotalWeeks', timeline.total_duration_weeks || 0);
  setText('timelineTotalMonths', metrics.estimated_completion_months || 0);

  const container = document.getElementById('timelineStepper');
  container.innerHTML = '';

  const phases = timeline.phases || [];
  phases.forEach(p => {
    const div = document.createElement('div');
    div.className = 'timeline-step';
    div.innerHTML = `
      <div class="step-num-badge">${p.phase}</div>
      <div class="step-info">
        <div class="step-title">${escapeHtml(p.title)}</div>
        <div class="step-desc">${escapeHtml(p.description)}</div>
      </div>
      <div class="step-duration">${p.duration_weeks} Weeks</div>
    `;
    container.appendChild(div);
  });
}

// Helper: Append chat message
function appendChatMessage(sender, text, questions = []) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${sender}-message`;

  const avatar = document.createElement('div');
  avatar.className = `avatar ${sender}-avatar`;
  avatar.textContent = sender === 'ai' ? 'NV' : 'YOU';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  // Format paragraphs and bold
  let formatted = text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  bubble.innerHTML = `<p>${formatted}</p>`;

  // Render question-list whenever questions are provided
  if (questions && questions.length > 0) {
    const qList = document.createElement('ol');
    qList.className = 'question-list';
    questions.forEach(q => {
      const li = document.createElement('li');
      li.textContent = q;
      qList.appendChild(li);
    });
    bubble.appendChild(qList);
  }

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  chatViewport.appendChild(msgDiv);

  // Scroll to bottom
  chatViewport.scrollTop = chatViewport.scrollHeight;
}

// Typing Indicator
function appendTypingIndicator() {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message ai-message';
  msgDiv.innerHTML = `
    <div class="avatar ai-avatar">NV</div>
    <div class="message-bubble" style="color: #a1a1aa; font-style: italic;">
      NeeV is analyzing spatial architecture & planning...
    </div>
  `;
  chatViewport.appendChild(msgDiv);
  chatViewport.scrollTop = chatViewport.scrollHeight;
  return msgDiv;
}

// Update Collected Specifications Drawer (Domain-Adaptive)
function updateSpecDrawer() {
  const p = appState.project_data;
  const ptype = (p.project_type || '').toLowerCase();
  
  setText('spec-project_type', p.project_type ? p.project_type.toUpperCase() : '—');
  
  if (ptype.includes('bridge') || ptype.includes('flyover')) {
    setText('spec-plot_dimensions', p.plot_length ? `Span: ${p.plot_length}m • Deck: ${p.plot_width || 16}m` : '—');
    setText('spec-floors', p.floors ? `${p.floors} Piers` : 'Piers: 4 River Piers');
    setText('spec-bed_bath', 'Clearance: 12.0m Vertical');
    setText('spec-road_direction', 'Channel: River Crossing');
  } else if (ptype.includes('road') || ptype.includes('highway')) {
    setText('spec-plot_dimensions', p.plot_length ? `Length: ${p.plot_length} km` : '—');
    setText('spec-floors', p.floors ? `${p.floors} Travel Lanes` : '4 Lanes');
    setText('spec-bed_bath', 'Right-of-Way: 20.0m Divided');
    setText('spec-road_direction', 'Alignment: Highway Corridor');
  } else if (ptype.includes('mall') || ptype.includes('commercial')) {
    setText('spec-plot_dimensions', p.plot_width ? `${p.plot_width}' x ${p.plot_length}'` : '—');
    setText('spec-floors', p.floors ? `${p.floors} Commercial Levels` : '3 Floors');
    setText('spec-bed_bath', 'Retail Program: 2 Anchors + 18 Boutiques');
    setText('spec-road_direction', 'Facade: Grand Main Boulevard');
  } else {
    // Residential
    if (p.plot_width && p.plot_length) {
      setText('spec-plot_dimensions', `${p.plot_width}' x ${p.plot_length}' (${p.unit || 'feet'})`);
    } else {
      setText('spec-plot_dimensions', '—');
    }
    setText('spec-floors', p.floors ? `${p.floors} Floors` : '—');
    if (p.bedrooms || p.bathrooms) {
      setText('spec-bed_bath', `${p.bedrooms || 0} Beds / ${p.bathrooms || 0} Baths`);
    } else {
      setText('spec-bed_bath', '—');
    }
    setText('spec-road_direction', p.road_direction ? p.road_direction.toUpperCase() : '—');
  }

  setText('spec-architectural_style', p.architectural_style || 'Standard Architectural');

  const knownCount = Object.values(p).filter(v => v !== null && v !== '').length;
  specCountBadge.textContent = `${knownCount} Details Collected`;
}

// Utility Helpers
function setText(elemId, val) {
  const el = document.getElementById(elemId);
  if (el) el.textContent = val;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// =============================================================================
// MODAL SYSTEM
// =============================================================================
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
  }
};

// =============================================================================
// SAVE PROJECT & PROJECT LIBRARY
// =============================================================================
let cachedSavedProjects = [];
let activeProjectFilter = 'all';

window.openSaveProjectModal = function() {
  if (!appState.layout || !appState.boq) {
    showToast('Please generate or load an architectural project before saving.', 'warning', '⚠️');
    return;
  }
  const p = appState.project_data || {};
  let defaultName = 'Modern Architectural Design';
  let defaultDomain = p.project_type || 'residential';
  if (defaultDomain === 'house') defaultDomain = 'residential';

  if (p.project_type) {
    if (p.project_type.includes('house') || p.project_type.includes('residential')) {
      defaultName = `Residential Villa ${p.plot_width || 30}x${p.plot_length || 50}`;
      defaultDomain = 'residential';
    } else if (p.project_type.includes('bridge')) {
      defaultName = `Cable-Stayed Bridge ${p.plot_length || 120}m`;
      defaultDomain = 'bridge';
    } else if (p.project_type.includes('road') || p.project_type.includes('highway')) {
      defaultName = `Express Highway ${p.plot_length || 5}km`;
      defaultDomain = 'road';
    } else if (p.project_type.includes('mall')) {
      defaultName = `Commercial Shopping Mall ${p.floors || 3} Floors`;
      defaultDomain = 'mall';
    }
  }

  const nameInput = document.getElementById('saveProjectName');
  const domainInput = document.getElementById('saveProjectDomain');
  const clientInput = document.getElementById('saveProjectClient');
  const authorInput = document.getElementById('saveProjectAuthor');

  if (nameInput) nameInput.value = defaultName;
  if (domainInput) domainInput.value = defaultDomain;
  if (clientInput) clientInput.value = p.client_name || 'Client Direct';
  if (authorInput) {
    const profile = JSON.parse(localStorage.getItem('ai_architect_profile') || '{}');
    authorInput.value = profile.name || 'Ar. Elena Rostova';
  }

  openModal('modalSaveProject');
};

window.saveCurrentProjectFromModal = async function() {
  const name = document.getElementById('saveProjectName')?.value.trim();
  if (!name) {
    showToast('Please enter a project title.', 'warning', '⚠️');
    return;
  }
  const domain = document.getElementById('saveProjectDomain')?.value || 'residential';
  const client = document.getElementById('saveProjectClient')?.value.trim() || 'Direct Client';
  const notes = document.getElementById('saveProjectNotes')?.value.trim() || '';
  const author = document.getElementById('saveProjectAuthor')?.value.trim() || 'Studio Architect';

  try {
    const payload = {
      name: name,
      domain: domain,
      category: domain,
      client_name: client,
      notes: notes,
      author: author,
      tags: [domain.toUpperCase(), 'Verified CAD'],
      project_data: appState.project_data,
      layout: appState.layout,
      boq: appState.boq,
      interior: {
        theme: document.querySelector('.style-choice-card.active')?.getAttribute('data-style') || 'luxury',
        flooring: document.querySelector('.material-swatch-item.active')?.getAttribute('data-mat') || 'marble',
        wall: document.querySelector('.wall-swatch-item.active')?.getAttribute('data-wall') || 'limewash',
        mood: document.querySelector('.mood-btn.active')?.getAttribute('data-mood') || 'day'
      }
    };

    const res = await fetch('/api/projects/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.status === 'ok' || result.status === 'success') {
      showToast(`Project "${name}" successfully saved!`, 'success', '💾');
      closeModal('modalSaveProject');
      const modalProjects = document.getElementById('modalProjects');
      if (modalProjects && modalProjects.classList.contains('open')) {
        openProjectsModal();
      }
    } else {
      showToast('Failed to save project to server.', 'warning', '⚠️');
    }
  } catch (err) {
    console.error('Save error:', err);
    showToast('Error saving project to local storage.', 'warning', '⚠️');
  }
};

window.openProjectsModal = async function() {
  openModal('modalProjects');
  const container = document.getElementById('savedProjectsGrid');
  if (!container) return;
  container.innerHTML = '<div class="empty-state" style="padding:30px;"><p>Loading projects...</p></div>';

  try {
    const res = await fetch('/api/projects');
    const data = await res.json();
    cachedSavedProjects = Array.isArray(data) ? data : (data.projects || []);
    updateProjectFilterCounts(cachedSavedProjects);
    renderSavedProjectsGrid(filterProjectsByActiveCategory(cachedSavedProjects));
  } catch (err) {
    container.innerHTML = '<div class="empty-state" style="padding:30px;"><p>Error fetching saved projects.</p></div>';
  }
};

function updateProjectFilterCounts(projects) {
  const allCount = projects.length;
  const resCount = projects.filter(p => (p.domain || p.category || '').toLowerCase().includes('residential') || (p.domain || '').includes('house')).length;
  const bridgeCount = projects.filter(p => (p.domain || p.category || '').toLowerCase().includes('bridge')).length;
  const roadCount = projects.filter(p => (p.domain || p.category || '').toLowerCase().includes('road') || (p.domain || '').includes('highway')).length;
  const mallCount = projects.filter(p => (p.domain || p.category || '').toLowerCase().includes('mall') || (p.domain || '').includes('commercial')).length;

  setText('countAll', allCount);
  setText('countRes', resCount);
  setText('countBridge', bridgeCount);
  setText('countRoad', roadCount);
  setText('countMall', mallCount);
}

function filterProjectsByActiveCategory(projects) {
  if (activeProjectFilter === 'all') return projects;
  return projects.filter(p => {
    const dom = (p.domain || p.category || '').toLowerCase();
    if (activeProjectFilter === 'residential') return dom.includes('residential') || dom.includes('house');
    if (activeProjectFilter === 'bridge') return dom.includes('bridge');
    if (activeProjectFilter === 'road') return dom.includes('road') || dom.includes('highway');
    if (activeProjectFilter === 'mall') return dom.includes('mall') || dom.includes('commercial');
    return true;
  });
}

function renderSavedProjectsGrid(projects) {
  const container = document.getElementById('savedProjectsGrid');
  if (!container) return;

  if (!projects || projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 40px;">
        <div class="empty-state-icon">📁</div>
        <h3>No Projects Found</h3>
        <p>No projects match the selected category or search filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'saved-project-card';
    
    const domain = (p.domain || p.category || 'residential').toLowerCase();
    let domainTag = 'RESIDENTIAL';
    let domainIcon = '🏠';
    if (domain.includes('bridge')) { domainTag = 'BRIDGE'; domainIcon = '🌉'; }
    else if (domain.includes('road') || domain.includes('highway')) { domainTag = 'HIGHWAY'; domainIcon = '🛣️'; }
    else if (domain.includes('mall') || domain.includes('commercial')) { domainTag = 'COMMERCIAL'; domainIcon = '🛍️'; }

    const dateStr = p.timestamp || (p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent');
    const totalCost = p.boq?.cost_estimation?.total_estimated_cost_usd 
      ? `$${Number(p.boq.cost_estimation.total_estimated_cost_usd).toLocaleString()}` 
      : (p.project_data?.budget ? `$${Number(p.project_data.budget).toLocaleString()}` : 'Estimated');

    const clientStr = p.client_name || 'Direct Client';
    const authorStr = p.author || 'Studio Architect';
    const notesStr = p.notes ? `<div class="proj-card-notes">"${escapeHtml(p.notes)}"</div>` : '';

    card.innerHTML = `
      <div>
        <div class="proj-card-top">
          <span class="proj-domain-tag">${domainIcon} ${escapeHtml(domainTag)}</span>
          <span style="font-size:0.72rem; color:var(--text-dim);">${escapeHtml(dateStr)}</span>
        </div>
        <h4 class="proj-card-title">${escapeHtml(p.name)}</h4>
        <div class="proj-card-meta">
          <div class="meta-line"><span>Client:</span> <strong>${escapeHtml(clientStr)}</strong></div>
          <div class="meta-line"><span>Lead:</span> <strong>${escapeHtml(authorStr)}</strong></div>
          <div class="meta-line"><span>Est. Budget:</span> <strong style="color:#10b981;">${escapeHtml(totalCost)}</strong></div>
        </div>
        ${notesStr}
      </div>
      <div class="proj-card-actions">
        <button class="btn btn-sm btn-secondary" style="color:#ef4444;" onclick="deleteProjectById('${p.id}')" title="Delete Project">🗑️</button>
        <button class="btn btn-sm btn-secondary" onclick="exportProjectJson('${p.id}')" title="Export Project Data (JSON)">📥 JSON</button>
        <button class="btn btn-sm btn-primary" onclick="loadProjectById('${p.id}')">📂 Open Design</button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.filterSavedProjects = function(query) {
  const q = (query || '').toLowerCase().trim();
  const categoryFiltered = filterProjectsByActiveCategory(cachedSavedProjects);
  if (!q) {
    renderSavedProjectsGrid(categoryFiltered);
    return;
  }
  const filtered = categoryFiltered.filter(p => 
    (p.name && p.name.toLowerCase().includes(q)) || 
    (p.domain && p.domain.toLowerCase().includes(q)) ||
    (p.client_name && p.client_name.toLowerCase().includes(q)) ||
    (p.author && p.author.toLowerCase().includes(q)) ||
    (p.notes && p.notes.toLowerCase().includes(q))
  );
  renderSavedProjectsGrid(filtered);
};

window.exportProjectJson = function(id) {
  const p = cachedSavedProjects.find(item => item.id === id);
  if (!p) return;
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(p.name || 'project').toLowerCase().replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported "${p.name}" as JSON file!`, 'success', '📥');
};

window.loadProjectById = function(id) {
  const p = cachedSavedProjects.find(item => item.id === id);
  if (!p) return;

  if (p.project_data) appState.project_data = p.project_data;
  if (p.layout && p.boq) {
    renderArchitecturalSuite(p.layout, p.boq);
    updateSpecDrawer();
    updateInteriorInventory();
    updateInteriorCostBreakdown();
    closeModal('modalProjects');
    showToast(`Loaded "${p.name}"!`, 'success', '📂');
  }
};

window.deleteProjectById = async function(id) {
  if (!confirm('Are you sure you want to permanently delete this saved project?')) return;
  try {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.status === 'ok' || result.status === 'deleted') {
      showToast('Project permanently deleted.', 'info', '🗑️');
      openProjectsModal();
    }
  } catch (err) {
    showToast('Failed to delete project.', 'warning', '⚠️');
  }
};

// =============================================================================
// USER ACCOUNT, AUTHENTICATION & DIGITAL CAD SEAL
// =============================================================================
window.loadUserProfile = function() {
  const saved = localStorage.getItem('ai_architect_profile');
  let profile = {
    name: 'Guest Designer',
    firm: 'Personal Project',
    role: 'Homeowner / Client',
    license: 'GUEST'
  };
  if (saved) {
    try { profile = JSON.parse(saved); } catch (e) {}
  }

  const inputUserName = document.getElementById('inputUserName');
  const inputFirmName = document.getElementById('inputFirmName');
  const selectUserRole = document.getElementById('selectUserRole');
  const inputCouncilReg = document.getElementById('inputCouncilReg');

  if (inputUserName) inputUserName.value = profile.name || '';
  if (inputFirmName) inputFirmName.value = profile.firm || '';
  if (selectUserRole) selectUserRole.value = profile.role || 'Principal Architect';
  if (inputCouncilReg) inputCouncilReg.value = profile.license || '';

  // Digital Seal Stamping preference
  const sealSaved = localStorage.getItem('ai_architect_seal_enabled');
  const isSealEnabled = sealSaved === 'true';
  const toggleDigitalSeal = document.getElementById('toggleDigitalSeal');
  if (toggleDigitalSeal) toggleDigitalSeal.checked = isSealEnabled;
  applyDigitalSealDisplay(isSealEnabled, profile);

  updateHeaderUserDisplay(profile.name);
};

window.saveUserProfile = function() {
  const name = document.getElementById('inputUserName')?.value.trim() || 'Ar. User';
  const firm = document.getElementById('inputFirmName')?.value.trim() || '';
  const role = document.getElementById('selectUserRole')?.value || 'Principal Architect';
  const license = document.getElementById('inputCouncilReg')?.value.trim() || '';
  const isSealEnabled = document.getElementById('toggleDigitalSeal')?.checked ?? true;

  const profile = { name, firm, role, license };
  localStorage.setItem('ai_architect_profile', JSON.stringify(profile));
  localStorage.setItem('ai_architect_seal_enabled', String(isSealEnabled));

  updateHeaderUserDisplay(name);
  applyDigitalSealDisplay(isSealEnabled, profile);
  closeModal('modalLogin');
  showToast(`Architect credentials saved for ${name}!`, 'success', '🛡️');
};

function applyDigitalSealDisplay(isEnabled, profile) {
  const cadSealBadge = document.getElementById('cadSealBadge');
  const cadSealPreviewBox = document.getElementById('cadSealPreviewBox');
  const sealPreviewFirm = document.getElementById('sealPreviewFirm');
  const sealPreviewName = document.getElementById('sealPreviewName');

  if (cadSealBadge) {
    cadSealBadge.style.display = isEnabled ? 'inline-flex' : 'none';
  }
  if (cadSealPreviewBox) {
    cadSealPreviewBox.style.opacity = isEnabled ? '1' : '0.4';
  }
  if (sealPreviewFirm && profile) {
    sealPreviewFirm.textContent = profile.firm || 'Apex Civil & Architectural Studio';
  }
  if (sealPreviewName && profile) {
    sealPreviewName.textContent = `${profile.name || 'Ar. Elena Rostova'} • Reg: ${profile.license || 'CA/2021/89412'}`;
  }
}

function updateHeaderUserDisplay(name) {
  const userAccountName = document.getElementById('userAccountName');
  const userAvatarPill = document.getElementById('userAvatarPill');

  if (userAccountName) {
    if (!name || name === 'Guest Designer' || name === 'Login' || name === 'Sign In') {
      userAccountName.textContent = 'Sign In';
    } else {
      const parts = name.split(' ');
      const shortName = parts.length > 1 ? `${parts[0]} ${parts[1]}` : name;
      userAccountName.textContent = shortName;
    }
  }
  if (userAvatarPill) {
    const isGuest = !name || name === 'Sign In' || name === 'Login' || name === 'Guest Designer';
    if (isGuest) {
      userAvatarPill.textContent = 'NV';
    } else {
      const initials = name.replace(/[^A-Za-z ]/g, '').trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      userAvatarPill.textContent = initials || 'NV';
    }
  }
}

function setupAuthModal() {
  // Tab switching
  document.querySelectorAll('.auth-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.auth-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const tabKey = btn.getAttribute('data-authtab');
      const targetPane = document.getElementById(`pane-${tabKey}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // 1-Click Instant Guest / Demo Button
  const btnQuickGuest = document.getElementById('btnQuickGuest');
  if (btnQuickGuest) {
    btnQuickGuest.addEventListener('click', () => {
      const guestProfile = {
        name: 'Guest Designer',
        firm: 'Personal Project',
        role: 'Homeowner / Client',
        license: 'GUEST'
      };
      localStorage.setItem('ai_architect_profile', JSON.stringify(guestProfile));
      localStorage.setItem('ai_architect_seal_enabled', 'false');
      updateHeaderUserDisplay('Sign In');
      applyDigitalSealDisplay(false, guestProfile);
      closeModal('modalLogin');
      showToast('Welcome! You are browsing as Guest with full studio access.', 'success', '🚀');
    });
  }

  // 1-Click Demo Personas
  const demoPersonas = {
    homeowner: {
      name: 'Alex Morgan',
      firm: 'Personal Villa Project',
      role: 'Homeowner / Client',
      license: 'RESIDENTIAL'
    },
    elena: {
      name: 'Ar. Elena Rostova',
      firm: 'Apex Civil & Architectural Studio',
      role: 'Principal Architect',
      license: 'CA/2021/89412'
    },
    student: {
      name: 'Jordan Lee',
      firm: 'Dept. of Civil Engineering',
      role: 'Civil Engineering Student',
      license: 'ACADEMIC-BIM'
    }
  };

  document.querySelectorAll('.demo-persona-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pKey = btn.getAttribute('data-persona');
      const pData = demoPersonas[pKey];
      if (!pData) return;

      const isElena = pKey === 'elena';
      localStorage.setItem('ai_architect_profile', JSON.stringify(pData));
      localStorage.setItem('ai_architect_seal_enabled', String(isElena));
      updateHeaderUserDisplay(pData.name);
      applyDigitalSealDisplay(isElena, pData);

      const inputUserName = document.getElementById('inputUserName');
      const inputFirmName = document.getElementById('inputFirmName');
      const selectUserRole = document.getElementById('selectUserRole');
      const inputCouncilReg = document.getElementById('inputCouncilReg');
      const toggleDigitalSeal = document.getElementById('toggleDigitalSeal');

      if (inputUserName) inputUserName.value = pData.name;
      if (inputFirmName) inputFirmName.value = pData.firm;
      if (selectUserRole) selectUserRole.value = pData.role;
      if (inputCouncilReg) inputCouncilReg.value = pData.license;
      if (toggleDigitalSeal) toggleDigitalSeal.checked = isElena;

      closeModal('modalLogin');
      showToast(`Switched profile to: ${pData.name} (${pData.role})`, 'success', '👤');
    });
  });

  // Digital Seal Checkbox
  const toggleDigitalSeal = document.getElementById('toggleDigitalSeal');
  if (toggleDigitalSeal) {
    toggleDigitalSeal.addEventListener('change', (e) => {
      const profile = JSON.parse(localStorage.getItem('ai_architect_profile') || '{}');
      localStorage.setItem('ai_architect_seal_enabled', String(e.target.checked));
      applyDigitalSealDisplay(e.target.checked, profile);
    });
  }

  // Sign In Form Submission
  const btnSubmitSignIn = document.getElementById('btnSubmitSignIn');
  if (btnSubmitSignIn) {
    btnSubmitSignIn.addEventListener('click', () => {
      const emailInput = document.getElementById('loginEmail');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) {
        showToast('Please enter your email address to sign in.', 'warning', '⚠️');
        if (emailInput) emailInput.focus();
        return;
      }
      let rawName = email.split('@')[0];
      const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      const userProfile = {
        name: displayName || 'Studio Member',
        firm: 'Personal Studio',
        role: 'Homeowner / Client',
        license: 'MEMBER-' + Math.floor(1000 + Math.random() * 9000)
      };
      localStorage.setItem('ai_architect_profile', JSON.stringify(userProfile));
      updateHeaderUserDisplay(userProfile.name);
      closeModal('modalLogin');
      showToast(`Welcome back, ${userProfile.name}! Studio unlocked.`, 'success', '🔐');

      // Dispatch real-time user notification to backend & Telegram
      fetch('/api/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: userProfile.name,
          role: userProfile.role,
          is_pro: localStorage.getItem('ai_architect_is_pro') === 'true',
          source: 'Sign In Form'
        })
      }).catch(err => console.warn('User sync error:', err));
    });
  }

  // Create Account Form Submission
  const btnSubmitRegister = document.getElementById('btnSubmitRegister');
  if (btnSubmitRegister) {
    btnSubmitRegister.addEventListener('click', () => {
      const regName = document.getElementById('regName')?.value.trim() || 'New Designer';
      const regPurpose = document.getElementById('regPurpose')?.value || 'homeowner';
      let roleLabel = 'Property Owner / Client';
      if (regPurpose === 'architect') roleLabel = 'Principal Architect';
      else if (regPurpose === 'student') roleLabel = 'Civil Engineering Student';
      else if (regPurpose === 'builder') roleLabel = 'General Civil Contractor';

      const profile = {
        name: regName,
        firm: regPurpose === 'architect' ? 'Professional Architectural Studio' : 'Personal Studio',
        role: roleLabel,
        license: regPurpose === 'architect' ? 'CA/2026/0198' : 'USER-' + Date.now().toString().slice(-4)
      };
      localStorage.setItem('ai_architect_profile', JSON.stringify(profile));
      updateHeaderUserDisplay(regName);
      closeModal('modalLogin');
      showToast(`Account created! Welcome to NeeV, ${regName}!`, 'success', '✨');

      // Dispatch real-time account creation notification to backend & Telegram
      const regEmail = document.getElementById('regEmail')?.value.trim() || `${regName.toLowerCase().replace(/\s+/g, '')}@neev.ai`;
      fetch('/api/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          name: regName,
          role: roleLabel,
          is_pro: false,
          source: 'New Account Registration'
        })
      }).catch(err => console.warn('User registration sync error:', err));
    });
  }

  // Save Architect Credentials (Inside Pro Accordion)
  const btnSaveProfile = document.getElementById('btnSaveProfile');
  if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', saveUserProfile);
  }
}

// =============================================================================
// PRO PLANS & TIER SWITCHER
// =============================================================================
window.loadProStatus = function() {
  const isPro = localStorage.getItem('ai_architect_is_pro') === 'true';
  applyProStatus(isPro);
  setupProModal();
};

window.toggleProMembership = function() {
  const current = localStorage.getItem('ai_architect_is_pro') === 'true';
  const next = !current;
  localStorage.setItem('ai_architect_is_pro', String(next));
  applyProStatus(next);

  if (next) {
    showToast('⚡ PRO Suite Activated! 4K Raytracing & Certified CAD unlocked.', 'pro', '⚡');
  } else {
    showToast('PRO pass reverted to Standard tier.', 'info', 'ℹ️');
  }
};

function applyProStatus(isPro) {
  const btnProPlans = document.getElementById('btnProPlans');
  const proBtnText = document.getElementById('proBtnText');
  const proCardBtnText = document.getElementById('proCardBtnText');
  const proCtaBox = document.getElementById('proCtaBox');
  const headerProBadge = document.getElementById('headerProBadge');
  const proWatermarkOverlay = document.getElementById('proWatermarkOverlay');
  const proStudioStatusBadge = document.getElementById('proStudioStatusBadge');
  const proStudioStatusText = document.getElementById('proStudioStatusText');

  if (btnProPlans) {
    if (isPro) {
      btnProPlans.classList.add('active-pro');
      btnProPlans.innerHTML = '<span class="pro-sparkle">⚡</span> PRO ACTIVE';
    } else {
      btnProPlans.classList.remove('active-pro');
      btnProPlans.innerHTML = '<span class="pro-sparkle">⚡</span> PRO Plans';
    }
  }

  if (headerProBadge) {
    headerProBadge.style.display = isPro ? 'inline-flex' : 'none';
  }

  if (proBtnText) {
    proBtnText.textContent = isPro ? 'Deactivate PRO Demo' : 'Activate PRO Pass Now';
  }
  if (proCardBtnText) {
    proCardBtnText.textContent = isPro ? 'Deactivate PRO' : 'Activate PRO Pass';
  }

  if (proCtaBox) {
    const badge = proCtaBox.querySelector('.cta-price-badge');
    if (badge) {
      badge.textContent = isPro ? '⚡ PRO ACTIVE (DEMO PASS)' : 'INSTANT 1-CLICK DEMO ACCESS';
    }
  }

  // PRO Interior Studio Sync
  if (proWatermarkOverlay) {
    proWatermarkOverlay.style.display = isPro ? 'none' : 'flex';
  }
  if (proStudioStatusBadge && proStudioStatusText) {
    if (isPro) {
      proStudioStatusBadge.classList.remove('is-free');
      proStudioStatusText.textContent = 'PRO PASS ACTIVE';
    } else {
      proStudioStatusBadge.classList.add('is-free');
      proStudioStatusText.textContent = 'PRO PREVIEW (CLICK TO UNLOCK)';
    }
  }
}

function setupProModal() {
  const billingCycleToggle = document.getElementById('billingCycleToggle');
  const proPriceVal = document.getElementById('proPriceVal');
  const enterprisePriceVal = document.getElementById('enterprisePriceVal');
  const proPricePeriod = document.getElementById('proPricePeriod');
  const enterprisePricePeriod = document.getElementById('enterprisePricePeriod');
  const billingMonthlyLabel = document.getElementById('billingMonthlyLabel');
  const billingAnnualLabel = document.getElementById('billingAnnualLabel');

  if (billingCycleToggle) {
    billingCycleToggle.addEventListener('change', (e) => {
      const isAnnual = e.target.checked;
      if (isAnnual) {
        if (proPriceVal) proPriceVal.textContent = '36';
        if (enterprisePriceVal) enterprisePriceVal.textContent = '149';
        if (proPricePeriod) proPricePeriod.textContent = '/ mo (billed annually)';
        if (enterprisePricePeriod) enterprisePricePeriod.textContent = '/ mo (billed annually)';
        billingAnnualLabel?.classList.add('active');
        billingMonthlyLabel?.classList.remove('active');
      } else {
        if (proPriceVal) proPriceVal.textContent = '49';
        if (enterprisePriceVal) enterprisePriceVal.textContent = '199';
        if (proPricePeriod) proPricePeriod.textContent = '/ month';
        if (enterprisePricePeriod) enterprisePricePeriod.textContent = '/ month';
        billingMonthlyLabel?.classList.add('active');
        billingAnnualLabel?.classList.remove('active');
      }
    });
  }
}

// =============================================================================
// CAD BLUEPRINT & BOQ EXPORTS
// =============================================================================
function downloadSvgBlueprint() {
  const svgElem = document.querySelector('#blueprintContainer svg');
  if (!svgElem) {
    showToast('Please generate or load a floor plan blueprint first.', 'warning', '⚠️');
    return;
  }

  const clonedSvg = svgElem.cloneNode(true);
  const isSealEnabled = localStorage.getItem('ai_architect_seal_enabled') !== 'false';
  const isPro = localStorage.getItem('ai_architect_is_pro') === 'true';
  const profile = JSON.parse(localStorage.getItem('ai_architect_profile') || '{}');

  // Affix Certified CAD Digital Seal & PRO Watermark into the SVG
  if (isSealEnabled) {
    const width = parseInt(clonedSvg.getAttribute('width') || '1000', 10);
    const height = parseInt(clonedSvg.getAttribute('height') || '800', 10);
    const stampGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    stampGroup.setAttribute('id', 'cad-digital-seal');
    stampGroup.setAttribute('transform', `translate(${width - 240}, ${height - 100})`);

    stampGroup.innerHTML = `
      <rect width="220" height="85" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="2" opacity="0.95"/>
      <circle cx="35" cy="42" r="24" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,2"/>
      <circle cx="35" cy="42" r="18" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="1"/>
      <text x="35" y="46" text-anchor="middle" fill="#10b981" font-size="7" font-weight="bold" font-family="sans-serif">CERTIFIED</text>
      <text x="70" y="28" fill="#f8fafc" font-size="10" font-weight="bold" font-family="sans-serif">${escapeHtml(profile.firm || 'Apex Studio')}</text>
      <text x="70" y="44" fill="#94a3b8" font-size="8.5" font-family="sans-serif">${escapeHtml(profile.name || 'Ar. Elena Rostova')}</text>
      <text x="70" y="58" fill="#10b981" font-size="8" font-weight="bold" font-family="sans-serif">REG: ${escapeHtml(profile.license || 'CA/2021/89412')}</text>
      <text x="70" y="72" fill="#64748b" font-size="7" font-family="sans-serif">${isPro ? '⚡ PRO ARCHITECT LICENSE' : 'STANDARD AUTONOMOUS CAD'}</text>
    `;
    clonedSvg.appendChild(stampGroup);
  }

  const serializer = new XMLSerializer();
  const source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(clonedSvg);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const pName = (appState.project_data?.project_type || 'architectural_plan').toLowerCase();
  a.download = `${pName}_blueprint_${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Exported Scaled CAD Blueprint (SVG) with Verified Digital Seal!', 'success', '📐');
}

function exportBoqCsv() {
  if (!appState.boq) {
    showToast('Please generate or load a project to export the BOQ spreadsheet.', 'warning', '⚠️');
    return;
  }

  const profile = JSON.parse(localStorage.getItem('ai_architect_profile') || '{}');
  const isSealEnabled = localStorage.getItem('ai_architect_seal_enabled') !== 'false';
  const p = appState.project_data || {};
  const boq = appState.boq;

  let csvContent = 'NEEV - OFFICIAL BILL OF QUANTITIES (BOQ)\n';
  csvContent += `Project Name,"${p.name || 'Universal Architectural Design'}"\n`;
  csvContent += `Category / Domain,"${p.project_type || 'Residential'}"\n`;
  csvContent += `Author / Architect,"${profile.name || 'Ar. Elena Rostova'}"\n`;
  csvContent += `License / Council Reg,"${profile.license || 'CA/2021/89412'}"\n`;
  csvContent += `Export Date,"${new Date().toLocaleString()}"\n`;
  csvContent += `Digital Seal Verification,"${isSealEnabled ? 'VERIFIED CRYPTOGRAPHIC CAD STAMP ACTIVE' : 'STANDARD'}"\n\n`;

  csvContent += 'Category,Material / Item Description,Estimated Quantity,Unit Cost (USD),Subtotal (USD)\n';

  // Civil
  if (boq.civil_materials) {
    for (const [k, v] of Object.entries(boq.civil_materials)) {
      if (typeof v === 'object' && v !== null) {
        csvContent += `Civil Materials,"${k.replace(/_/g, ' ').toUpperCase()}",${v.total_bags || v.total_metric_tons || v.total_pieces || 1},Included,Included\n`;
      } else {
        csvContent += `Civil Materials,"${k.replace(/_/g, ' ').toUpperCase()}",${v},Included,Included\n`;
      }
    }
  }

  // MEP
  if (boq.electrical_system) {
    for (const [k, v] of Object.entries(boq.electrical_system)) {
      csvContent += `Electrical MEP,"${k.replace(/_/g, ' ').toUpperCase()}",${v},Included,Included\n`;
    }
  }
  if (boq.plumbing_system) {
    for (const [k, v] of Object.entries(boq.plumbing_system)) {
      csvContent += `Plumbing MEP,"${k.replace(/_/g, ' ').toUpperCase()}",${v},Included,Included\n`;
    }
  }

  // Cost Estimation
  if (boq.cost_estimation) {
    const cost = boq.cost_estimation;
    csvContent += '\nSUMMARY & TOTAL BUDGET ESTIMATION\n';
    csvContent += `Total Built-up Area,${cost.total_builtup_area_sqft || 0} sq.ft\n`;
    csvContent += `Cost per Sq.Ft,$${cost.cost_per_sqft_usd || 0}\n`;
    csvContent += `Materials Subtotal,$${cost.materials_cost_usd || 0}\n`;
    csvContent += `Labor Subtotal,$${cost.labor_cost_usd || 0}\n`;
    csvContent += `TOTAL ESTIMATED BUDGET (USD),$${cost.total_estimated_cost_usd || cost.total_estimated_cost || 0}\n`;
    csvContent += `INR Equivalent,₹${cost.total_estimated_cost_inr || 0}\n`;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `boq_estimate_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Exported Engineering BOQ Spreadsheet (CSV)!', 'success', '📊');
}

// =============================================================================
// INTERIOR STUDIO CONTROLS & TURNKEY CALCULATION
// =============================================================================
function setupInteriorStudioListeners() {
  // Room Focus Camera selector chips
  document.querySelectorAll('.room-focus-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.room-focus-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const room = chip.getAttribute('data-room');
      window.studio3D?.focusRoom(room);
      const label = chip.textContent.trim();
      showToast(`3D Camera focused on: ${label}`, 'info', '🎥');
    });
  });

  // Lighting mood buttons
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mood = btn.getAttribute('data-mood');
      window.studio3D?.setLightingMood(mood);

      // Diagnostics update
      const lumPrimary = document.getElementById('luminairePrimary');
      const lumSun = document.getElementById('luminaireSunAngle');
      if (mood === 'night') {
        if (lumPrimary) lumPrimary.textContent = 'Warm LED Cove Light (2700K Warm White)';
        if (lumSun) lumSun.textContent = 'Night Ambient Luminaire Simulation (0.15 lux)';
      } else if (mood === 'golden') {
        if (lumPrimary) lumPrimary.textContent = 'Sunset Warm Luminaire (3200K Ambient)';
        if (lumSun) lumSun.textContent = 'Low-Angle Solar Zenith 18° South-West (Golden Hour)';
      } else if (mood === 'cyber') {
        if (lumPrimary) lumPrimary.textContent = 'Neon Luminaire Matrix (Magenta/Cyan 6500K)';
        if (lumSun) lumSun.textContent = 'Cyberpunk Ambient Horizon Simulation (Dual Spectrum)';
      } else {
        if (lumPrimary) lumPrimary.textContent = 'Natural Daylight (5500K True Solar)';
        if (lumSun) lumSun.textContent = 'Solar Zenith 48° South-West (Clear Sky Simulation)';
      }
      updateInteriorCostBreakdown();
      showToast(`Lighting mood set to ${mood.toUpperCase()} mode.`, 'info', '💡');
    });
  });

  // Architectural style cards
  document.querySelectorAll('.style-choice-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.style-choice-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const style = card.getAttribute('data-style');

      const titleEl = document.getElementById('activeStyleTitleDisplay');
      const descEl = document.getElementById('activeStyleDescDisplay');

      let styleName = 'Modern Luxury';
      let derivedMat = 'marble';

      if (style === 'japandi') {
        styleName = 'Japandi Minimalist';
        derivedMat = 'wood';
        if (titleEl) titleEl.textContent = 'Japandi Minimalist Interior';
        if (descEl) descEl.textContent = 'Natural hinoki joinery, low-profile wabi-sabi seating, warm woven textiles, and organic diffuse luminaire balance.';
      } else if (style === 'nordic') {
        styleName = 'Warm Scandinavian';
        derivedMat = 'wood';
        if (titleEl) titleEl.textContent = 'Warm Scandinavian Interior';
        if (descEl) descEl.textContent = 'White oak flooring, boucle upholstery, ambient fluted wall panels, and soft warm cove illumination.';
      } else if (style === 'industrial') {
        styleName = 'Industrial Loft';
        derivedMat = 'concrete';
        if (titleEl) titleEl.textContent = 'Industrial Loft Interior';
        if (descEl) descEl.textContent = 'Burnished concrete slabs, matte black steel framing, exposed architectural ducting, and distressed leather modular seating.';
      } else {
        styleName = 'Modern Luxury';
        derivedMat = 'marble';
        if (titleEl) titleEl.textContent = 'Modern Luxury Villa Interior';
        if (descEl) descEl.textContent = 'Featuring Italian Carrara marble finishes, brushed brass architectural fittings, procedural modular sofas, and cove warm lighting at 2700K.';
      }

      // Sync flooring swatch & 3D material
      window.studio3D?.setFloorMaterial(derivedMat);
      document.querySelectorAll('.material-swatch-item').forEach(sw => {
        sw.classList.toggle('active', sw.getAttribute('data-mat') === derivedMat);
      });

      updateInteriorCostBreakdown();
      showToast(`Interior aesthetic switched to ${styleName}!`, 'info', '🛋️');
    });
  });

  // Flooring Material swatches
  document.querySelectorAll('.material-swatch-item').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.material-swatch-item').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const mat = swatch.getAttribute('data-mat');
      window.studio3D?.setFloorMaterial(mat);

      const roughnessEl = document.getElementById('luminaireRoughness');
      if (roughnessEl) {
        if (mat === 'marble') roughnessEl.textContent = '0.15 High-Polish Gloss Reflection';
        else if (mat === 'wood') roughnessEl.textContent = '0.45 Satin Timber Polyurethane';
        else if (mat === 'terrazzo') roughnessEl.textContent = '0.30 Polished Micro-Aggregate';
        else roughnessEl.textContent = '0.70 Matte Industrial Concrete';
      }
      updateInteriorCostBreakdown();
      showToast(`Flooring material set to ${mat.toUpperCase()}.`, 'info', '🪵');
    });
  });

  // Wall Accent Finish swatches
  document.querySelectorAll('.wall-swatch-item').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.wall-swatch-item').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const wall = swatch.getAttribute('data-wall');
      window.studio3D?.setWallFinish(wall);
      updateInteriorCostBreakdown();
      showToast(`Wall accent finish set to ${wall.toUpperCase()}.`, 'info', '🧱');
    });
  });

  // Biophilic Plants Toggle
  const btnToggleBiophilic = document.getElementById('btnToggleBiophilic');
  if (btnToggleBiophilic) {
    btnToggleBiophilic.addEventListener('click', () => {
      const isVisible = window.studio3D?.toggleBiophilic();
      btnToggleBiophilic.textContent = isVisible ? '🌿 Plants On' : '🌿 Plants Off';
      btnToggleBiophilic.classList.toggle('active-pill-toggle', isVisible);
      showToast(isVisible ? 'Biophilic indoor plants visible' : 'Biophilic plants hidden', 'info', '🌿');
    });
  }

  // Toggle interior furniture
  if (btnToggleInteriorFurniture) {
    btnToggleInteriorFurniture.addEventListener('click', () => {
      const isVisible = window.studio3D?.toggleFurniture();
      btnToggleInteriorFurniture.textContent = isVisible ? '🛋️ Furniture Visible' : '🛋️ Furniture Hidden';
      showToast(isVisible ? '3D Furniture shown' : '3D Furniture hidden', 'info', '🛋️');
    });
  }

  // Toggle interior roof
  if (btnToggleRoofInterior) {
    btnToggleRoofInterior.addEventListener('click', () => {
      window.studio3D?.toggleRoof();
      showToast('Roof toggled.', 'info', '🏛️');
    });
  }

  // Filter pills in Saved Projects modal
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeProjectFilter = pill.getAttribute('data-filter') || 'all';
      renderSavedProjectsGrid(filterProjectsByActiveCategory(cachedSavedProjects));
    });
  });

  setupAuthModal();
  updateInteriorCostBreakdown();
}

function updateInteriorCostBreakdown() {
  const activeStyle = document.querySelector('.style-choice-card.active')?.getAttribute('data-style') || 'luxury';
  const activeFloor = document.querySelector('.material-swatch-item.active')?.getAttribute('data-mat') || 'marble';
  const activeWall = document.querySelector('.wall-swatch-item.active')?.getAttribute('data-wall') || 'limewash';
  const activeMood = document.querySelector('.mood-btn.active')?.getAttribute('data-mood') || 'day';

  // Flooring costs
  const floorCostMap = { marble: 14200, wood: 10800, terrazzo: 9200, concrete: 6800 };
  const floorNameMap = { marble: 'Carrara Marble', wood: 'Herringbone Oak', terrazzo: 'Polished Terrazzo', concrete: 'Slate Concrete' };
  const floorCost = floorCostMap[activeFloor] || 12000;
  setText('interiorFlooringCost', `$${floorCost.toLocaleString()}`);
  setText('interiorFlooringTypeLabel', floorNameMap[activeFloor] || 'Marble');

  // Wall costs
  const wallCostMap = { limewash: 9400, slats: 14800, brick: 11500, felt: 13200 };
  const wallNameMap = { limewash: 'Smooth Limewash', slats: 'Fluted Walnut Slats', brick: 'Exposed Brick', felt: 'Acoustic Felt' };
  const wallCost = wallCostMap[activeWall] || 9400;
  setText('interiorWallCost', `$${wallCost.toLocaleString()}`);
  setText('interiorWallTypeLabel', wallNameMap[activeWall] || 'Limewash');

  // Furnishing costs
  const themeCostMap = { luxury: 28500, japandi: 19800, nordic: 22400, industrial: 18600 };
  const themeNameMap = { luxury: 'Modern Luxury', japandi: 'Japandi Minimalist', nordic: 'Warm Scandinavian', industrial: 'Industrial Loft' };
  const furnishingCost = themeCostMap[activeStyle] || 25000;
  setText('interiorFurnishingCost', `$${furnishingCost.toLocaleString()}`);
  setText('interiorThemeLabel', themeNameMap[activeStyle] || 'Modern Luxury');

  // Lighting & Smart Controls
  const moodCostMap = { day: 7200, golden: 7800, night: 8400, cyber: 9800 };
  const lightingCost = moodCostMap[activeMood] || 7500;
  setText('interiorLightingCost', `$${lightingCost.toLocaleString()}`);

  // Total
  const totalInterior = floorCost + wallCost + furnishingCost + lightingCost;
  setText('interiorTotalBudget', `$${totalInterior.toLocaleString()}`);
}

function updateInteriorInventory() {
  const p = appState.project_data || {};
  const beds = p.bedrooms || 3;
  const sofas = 2;
  const dining = 1;
  const kitchen = 1;
  const plants = 4;

  setText('invCountSofas', `${sofas} Suites`);
  setText('invCountBeds', `${beds} Beds`);
  setText('invCountDining', `${dining} Set`);
  setText('invCountKitchen', `${kitchen} Fitted`);
  setText('invCountPlants', `${plants} Planters`);
}

// =============================================================================
// NEW PROJECT WIZARD TEMPLATES
// =============================================================================
window.startProjectFromTemplate = function(type) {
  closeModal('modalNewProject');
  loadDomainPreset(type);
  showToast(`Loaded ${type.toUpperCase()} template!`, 'success', '✨');
};

window.startProjectBlankCanvas = function() {
  closeModal('modalNewProject');
  resetProject();
  showToast('Started new custom project session with NeeV!', 'info', '✏️');
};

// =============================================================================
// TOAST NOTIFICATIONS
// =============================================================================
window.showToast = function(msg, type = 'info', icon = '💡') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-item ${type === 'success' ? 'toast-success' : type === 'pro' ? 'toast-pro' : ''}`;
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-msg">${escapeHtml(msg)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3800);
};

// =============================================================================
// PRO INTERIOR STUDIO: AUTOCAD® BLUEPRINTS & 4K PHOTOREALISTIC RENDERS
// =============================================================================
const proRoomCatalog = {
  living_room: {
    id: 'living_room',
    name: 'Living Room & Foyer',
    renderSrc: '/static/renders/living_room.jpg',
    dimsText: 'Dims: 6.2m × 4.8m (29.8 m²)',
    finishText: 'Floor: Italian Carrara Marble',
    ceilingText: 'Ceiling: +3.00m Cove LED',
    cadDrawing: {
      widthMm: 6200,
      depthMm: 4800,
      doors: [{ x: 500, y: 4800, w: 1000, label: 'D1 1000×2100' }],
      windows: [{ x: 1800, y: 0, w: 2600, label: 'W1 2600×2400 GLASS' }],
      furniture: [
        { type: 'sofa_sectional', x: 1200, y: 1400, w: 2800, d: 2000, label: 'MODULAR SOFA' },
        { type: 'coffee_table', x: 2200, y: 2200, w: 1100, d: 700, label: 'COFFEE TBL' },
        { type: 'rug', x: 1000, y: 1200, w: 3200, d: 2400, label: 'WOOL RUG' },
        { type: 'media_console', x: 1200, y: 4400, w: 2200, d: 450, label: 'TV CONSOLE' },
        { type: 'planter', x: 400, y: 400, w: 350, d: 350, label: 'PLANT' }
      ],
      electrical: [
        { type: 'downlight', x: 1500, y: 1500 },
        { type: 'downlight', x: 4500, y: 1500 },
        { type: 'downlight', x: 1500, y: 3500 },
        { type: 'downlight', x: 4500, y: 3500 },
        { type: 'chandelier', x: 3000, y: 2400, label: 'CH-1' }
      ]
    }
  },
  master_bedroom: {
    id: 'master_bedroom',
    name: 'Master Suite',
    renderSrc: '/static/renders/master_bedroom.jpg',
    dimsText: 'Dims: 5.4m × 4.4m (23.8 m²)',
    finishText: 'Floor: Oak Herringbone Parquet',
    ceilingText: 'Ceiling: +2.85m Recessed Perimeter',
    cadDrawing: {
      widthMm: 5400,
      depthMm: 4400,
      doors: [{ x: 400, y: 4400, w: 900, label: 'D2 900×2100' }],
      windows: [{ x: 1600, y: 0, w: 2200, label: 'W2 2200×2200' }],
      furniture: [
        { type: 'bed_king', x: 1700, y: 1100, w: 2000, d: 2100, label: 'KING BED (2000×2100)' },
        { type: 'nightstand', x: 950, y: 1100, w: 600, d: 450, label: 'NS-L' },
        { type: 'nightstand', x: 3850, y: 1100, w: 600, d: 450, label: 'NS-R' },
        { type: 'wardrobe', x: 4600, y: 1400, w: 650, d: 2600, label: 'FULL-HT WARDROBE' },
        { type: 'rug', x: 1300, y: 1600, w: 2800, d: 2200, label: 'AREA RUG' }
      ],
      electrical: [
        { type: 'downlight', x: 1400, y: 1200 },
        { type: 'downlight', x: 4000, y: 1200 },
        { type: 'sconce', x: 1100, y: 950 },
        { type: 'sconce', x: 4100, y: 950 }
      ]
    }
  },
  kitchen: {
    id: 'kitchen',
    name: 'Modular Gourmet Kitchen',
    renderSrc: '/static/renders/kitchen.jpg',
    dimsText: 'Dims: 4.8m × 3.8m (18.2 m²)',
    finishText: 'Floor: Calacatta Quartz Slab',
    ceilingText: 'Ceiling: +2.80m Linear Task Lighting',
    cadDrawing: {
      widthMm: 4800,
      depthMm: 3800,
      doors: [{ x: 3600, y: 3800, w: 900, label: 'D3 900×2100' }],
      windows: [{ x: 200, y: 1200, w: 1800, orient: 'vert', label: 'W3 1800×1500' }],
      furniture: [
        { type: 'island_counter', x: 1200, y: 1800, w: 2400, d: 1100, label: 'WATERFALL ISLAND' },
        { type: 'hob', x: 1800, y: 1950, w: 800, d: 520, label: '4-ZONE INDUCTION' },
        { type: 'counter_wall', x: 400, y: 200, w: 4000, d: 650, label: 'FULL-HEIGHT CABINETRY' },
        { type: 'sink', x: 1600, y: 250, w: 850, d: 500, label: 'UNDERMOUNT SINK' },
        { type: 'stools', x: 1350, y: 3050, w: 2100, d: 400, label: 'BAR STOOLS' }
      ],
      electrical: [
        { type: 'downlight', x: 1000, y: 1000 },
        { type: 'downlight', x: 3800, y: 1000 },
        { type: 'pendant', x: 1600, y: 2350 },
        { type: 'pendant', x: 2400, y: 2350 },
        { type: 'pendant', x: 3200, y: 2350 }
      ]
    }
  },
  bathroom: {
    id: 'bathroom',
    name: 'Luxury Ensuite Bathroom',
    renderSrc: '/static/renders/bathroom.jpg',
    dimsText: 'Dims: 3.6m × 3.0m (10.8 m²)',
    finishText: 'Floor: Micro-Aggregate Terrazzo',
    ceilingText: 'Ceiling: +2.60m Moisture-Resistant',
    cadDrawing: {
      widthMm: 3600,
      depthMm: 3000,
      doors: [{ x: 2500, y: 3000, w: 800, label: 'D4 800×2100' }],
      windows: [{ x: 2400, y: 200, w: 1000, label: 'FROSTED GLASS' }],
      furniture: [
        { type: 'vanity_double', x: 300, y: 1200, w: 1800, d: 550, label: 'DUAL BASIN VANITY' },
        { type: 'tub_freestanding', x: 2100, y: 1300, w: 1400, d: 750, label: 'OVAL SOAKING TUB' },
        { type: 'shower_glass', x: 300, y: 200, w: 1400, d: 1000, label: 'RAIN SHOWER' },
        { type: 'wc', x: 2700, y: 2300, w: 450, d: 650, label: 'WALL-HUNG WC' }
      ],
      electrical: [
        { type: 'downlight', x: 1000, y: 800 },
        { type: 'downlight', x: 2600, y: 800 },
        { type: 'backlit_mirror', x: 600, y: 1150 },
        { type: 'backlit_mirror', x: 1400, y: 1150 }
      ]
    }
  },
  office: {
    id: 'office',
    name: 'Executive Study & Library',
    renderSrc: '/static/renders/office.jpg',
    dimsText: 'Dims: 4.6m × 3.8m (17.5 m²)',
    finishText: 'Floor: Walnut Herringbone Parquet',
    ceilingText: 'Ceiling: +2.90m Linear Cove Recess',
    cadDrawing: {
      widthMm: 4600,
      depthMm: 3800,
      doors: [{ x: 400, y: 3800, w: 900, label: 'D5 900×2100' }],
      windows: [{ x: 3950, y: 600, w: 2600, orient: 'vert', label: 'FULL-HEIGHT GLAZING' }],
      furniture: [
        { type: 'exec_desk', x: 1200, y: 1600, w: 2000, d: 900, label: 'WALNUT EXEC DESK' },
        { type: 'chair_exec', x: 2200, y: 1200, w: 600, d: 600, label: 'ERGONOMIC CHAIR' },
        { type: 'bookshelf', x: 400, y: 200, w: 3400, d: 450, label: 'FULL-HEIGHT BOOKSHELF' },
        { type: 'client_chairs', x: 1600, y: 2800, w: 1400, d: 600, label: 'CLIENT SEATING' },
        { type: 'rug', x: 900, y: 1100, w: 2600, d: 2300, label: 'ACCENT RUG' }
      ],
      electrical: [
        { type: 'downlight', x: 1200, y: 800 },
        { type: 'downlight', x: 3200, y: 800 },
        { type: 'chandelier', x: 2200, y: 2000, label: 'PENDANT-1' }
      ]
    }
  }
};

const proInteriorState = {
  activeRoom: 'living_room',
  viewMode: 'split',
  isDragging: false,
  splitPercent: 50,
  layers: {
    dims: true,
    furn: true,
    elec: true,
    hatch: true
  }
};

function setupProInteriorStudio() {
  const visualStage = document.getElementById('proVisualStage');
  const cadLayer = document.getElementById('stageCadLayer');
  const sliderDivider = document.getElementById('stageSliderDivider');
  const sliderHandle = document.getElementById('sliderDividerHandle');
  const renderImg = document.getElementById('renderImageView');

  if (!visualStage || !cadLayer || !sliderDivider) return;

  // 1. Initial CAD Blueprint Render
  updateProStudioDisplay();

  // 2. Room Tabs Handler
  document.querySelectorAll('#interiorRoomTabs .btn-room-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#interiorRoomTabs .btn-room-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const roomId = btn.getAttribute('data-room-id');
      if (roomId && proRoomCatalog[roomId]) {
        proInteriorState.activeRoom = roomId;
        updateProStudioDisplay();
        showToast(`Switched to: ${proRoomCatalog[roomId].name}`, 'info', '🛋️');
      }
    });
  });

  // 3. View Mode Pills Handler (Split, CAD Dark, Paper Space, 4K Render)
  document.querySelectorAll('#interiorViewModePills .btn-viewmode').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#interiorViewModePills .btn-viewmode').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-viewmode');
      proInteriorState.viewMode = mode;
      applyProViewMode(mode);
    });
  });

  // 4. CAD Layer Checkboxes
  ['chkCadDims', 'chkCadFurn', 'chkCadElec', 'chkCadHatch'].forEach(id => {
    const chk = document.getElementById(id);
    if (chk) {
      chk.addEventListener('change', () => {
        proInteriorState.layers.dims = document.getElementById('chkCadDims')?.checked ?? true;
        proInteriorState.layers.furn = document.getElementById('chkCadFurn')?.checked ?? true;
        proInteriorState.layers.elec = document.getElementById('chkCadElec')?.checked ?? true;
        proInteriorState.layers.hatch = document.getElementById('chkCadHatch')?.checked ?? true;
        updateProStudioDisplay();
      });
    }
  });

  // 5. Draggable Split Comparison Slider (Mouse & Touch)
  const onPointerMove = (clientX) => {
    if (!proInteriorState.isDragging || proInteriorState.viewMode !== 'split') return;
    const rect = visualStage.getBoundingClientRect();
    if (rect.width <= 0) return;
    let percent = ((clientX - rect.left) / rect.width) * 100;
    percent = Math.max(3, Math.min(97, percent));
    proInteriorState.splitPercent = percent;
    cadLayer.style.width = percent + '%';
    sliderDivider.style.left = percent + '%';
  };

  sliderDivider.addEventListener('mousedown', (e) => {
    e.preventDefault();
    proInteriorState.isDragging = true;
    document.body.style.cursor = 'ew-resize';
  });

  window.addEventListener('mousemove', (e) => {
    if (proInteriorState.isDragging) onPointerMove(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    if (proInteriorState.isDragging) {
      proInteriorState.isDragging = false;
      document.body.style.cursor = '';
    }
  });

  // Touch support for tablets and touch displays
  sliderDivider.addEventListener('touchstart', (e) => {
    proInteriorState.isDragging = true;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (proInteriorState.isDragging && e.touches.length > 0) {
      onPointerMove(e.touches[0].clientX);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    proInteriorState.isDragging = false;
  });

  // Click anywhere on visual stage to snap divider in split mode
  visualStage.addEventListener('click', (e) => {
    if (proInteriorState.viewMode !== 'split') return;
    if (e.target.closest('#stageSliderDivider') || e.target.closest('.pro-watermark-overlay')) return;
    onPointerMove(e.clientX);
  });

  // 6. Export Action: AutoCAD Drawing Sheet (SVG Vector Format)
  const btnDownloadCadSheet = document.getElementById('btnDownloadCadSheet');
  if (btnDownloadCadSheet) {
    btnDownloadCadSheet.addEventListener('click', () => {
      const svg = document.getElementById('cadSvgViewport');
      if (!svg) return;
      const room = proRoomCatalog[proInteriorState.activeRoom] || proRoomCatalog.living_room;
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NeeV_AutoCAD_${room.id}_Architectural_DWG.svg`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${room.name} AutoCAD® Architectural CAD Sheet!`, 'success', '📐');
    });
  }

  // 7. Export Action: 4K Photorealistic Render Image
  const btnDownloadRender4k = document.getElementById('btnDownloadRender4k');
  if (btnDownloadRender4k) {
    btnDownloadRender4k.addEventListener('click', () => {
      const room = proRoomCatalog[proInteriorState.activeRoom] || proRoomCatalog.living_room;
      const a = document.createElement('a');
      a.href = room.renderSrc;
      a.download = `NeeV_4K_Render_${room.id}.jpg`;
      a.click();
      showToast(`Downloaded 4K Photorealistic Render: ${room.name}`, 'success', '✨');
    });
  }
}

function applyProViewMode(mode) {
  const visualStage = document.getElementById('proVisualStage');
  const cadLayer = document.getElementById('stageCadLayer');
  const sliderDivider = document.getElementById('stageSliderDivider');
  if (!visualStage || !cadLayer || !sliderDivider) return;

  visualStage.classList.remove('mode-cad-full', 'mode-render-full', 'mode-paper-space');

  if (mode === 'cad_dark') {
    visualStage.classList.add('mode-cad-full');
  } else if (mode === 'cad_paper') {
    visualStage.classList.add('mode-cad-full', 'mode-paper-space');
  } else if (mode === 'render_4k') {
    visualStage.classList.add('mode-render-full');
  } else {
    // Split Mode
    cadLayer.style.width = (proInteriorState.splitPercent || 50) + '%';
    sliderDivider.style.left = (proInteriorState.splitPercent || 50) + '%';
  }

  updateProStudioDisplay();
}

function updateProStudioDisplay() {
  const room = proRoomCatalog[proInteriorState.activeRoom] || proRoomCatalog.living_room;

  // 1. Update Render Image
  const renderImg = document.getElementById('renderImageView');
  if (renderImg && renderImg.getAttribute('src') !== room.renderSrc) {
    renderImg.src = room.renderSrc;
  }

  // 2. Update Metrics
  const dimsEl = document.getElementById('roomMetricDimensions');
  const finishEl = document.getElementById('roomMetricFinish');
  const ceilEl = document.getElementById('roomMetricCeiling');
  if (dimsEl) dimsEl.textContent = room.dimsText;
  if (finishEl) finishEl.textContent = room.finishText;
  if (ceilEl) ceilEl.textContent = room.ceilingText;

  // 3. Render Vector AutoCAD Blueprint
  const isPaperSpace = proInteriorState.viewMode === 'cad_paper';
  renderAutoCadBlueprint(proInteriorState.activeRoom, proInteriorState.layers, isPaperSpace);
}

function renderAutoCadBlueprint(roomKey, layers, isPaperSpace) {
  const svg = document.getElementById('cadSvgViewport');
  if (!svg) return;

  const room = proRoomCatalog[roomKey] || proRoomCatalog.living_room;
  const data = room.cadDrawing;

  const bgFill = isPaperSpace ? '#ffffff' : '#0a0e17';
  const gridStroke = isPaperSpace ? 'rgba(0,0,0,0.06)' : 'rgba(56,189,248,0.08)';
  const wallStroke = isPaperSpace ? '#0f172a' : '#00ffff';
  const wallFill = isPaperSpace ? '#f1f5f9' : '#131b2e';
  const hatchStroke = isPaperSpace ? 'rgba(15,23,42,0.18)' : 'rgba(0,255,255,0.22)';
  const dimColor = isPaperSpace ? '#b91c1c' : '#f87171';
  const furnColor = isPaperSpace ? '#1e40af' : '#e879f9';
  const elecColor = isPaperSpace ? '#b45309' : '#facc15';
  const textMain = isPaperSpace ? '#0f172a' : '#f8fafc';
  const textMuted = isPaperSpace ? '#475569' : '#94a3b8';

  const scale = 0.058;
  const rw = data.widthMm * scale;
  const rd = data.depthMm * scale;
  const ox = 420 - rw / 2;
  const oy = 250 - rd / 2;

  let markup = `
    <defs>
      <pattern id="cadGridPat" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="${gridStroke}" stroke-width="0.8" />
        <circle cx="0" cy="0" r="1.2" fill="${gridStroke}" />
      </pattern>
      <pattern id="cadHatchPat" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="12" stroke="${hatchStroke}" stroke-width="1.2" />
      </pattern>
      <marker id="cadTick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <line x1="2" y1="8" x2="8" y2="2" stroke="${dimColor}" stroke-width="2" />
      </marker>
    </defs>

    <!-- Canvas Background -->
    <rect width="1000" height="562" fill="${bgFill}" />
    <rect width="1000" height="562" fill="url(#cadGridPat)" />

    <!-- AutoCAD Coordinate Crosshairs (UCS) -->
    <g transform="translate(35, 520)">
      <line x1="0" y1="0" x2="35" y2="0" stroke="#ef4444" stroke-width="2" />
      <line x1="0" y1="0" x2="0" y2="-35" stroke="#22c55e" stroke-width="2" />
      <text x="40" y="4" fill="#ef4444" font-size="9" font-family="monospace" font-weight="bold">X</text>
      <text x="-4" y="-40" fill="#22c55e" font-size="9" font-family="monospace" font-weight="bold">Y</text>
      <text x="8" y="-8" fill="${textMuted}" font-size="8" font-family="monospace">WCS</text>
    </g>

    <!-- Outer Structural Wall with Hatching -->
    <g class="cad-layer-wall">
      <rect x="${ox - 14}" y="${oy - 14}" width="${rw + 28}" height="${rd + 28}" fill="${layers.hatch ? 'url(#cadHatchPat)' : wallFill}" stroke="${wallStroke}" stroke-width="2.2" />
      <rect x="${ox}" y="${oy}" width="${rw}" height="${rd}" fill="${bgFill}" stroke="${wallStroke}" stroke-width="2" />
    </g>
  `;

  // Draw Windows
  (data.windows || []).forEach(w => {
    const wx = ox + (w.x || 0) * scale;
    const wy = oy + (w.y || 0) * scale;
    const ww = (w.w || 1800) * scale;
    if (w.orient === 'vert') {
      markup += `
        <rect x="${ox + rw - 14}" y="${wy}" width="14" height="${ww}" fill="${bgFill}" />
        <line x1="${ox + rw - 14}" y1="${wy}" x2="${ox + rw}" y2="${wy}" stroke="#38bdf8" stroke-width="1.8" />
        <line x1="${ox + rw - 14}" y1="${wy + ww}" x2="${ox + rw}" y2="${wy + ww}" stroke="#38bdf8" stroke-width="1.8" />
        <line x1="${ox + rw - 7}" y1="${wy}" x2="${ox + rw - 7}" y2="${wy + ww}" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,2" />
      `;
    } else {
      markup += `
        <rect x="${wx}" y="${oy - 14}" width="${ww}" height="14" fill="${bgFill}" />
        <line x1="${wx}" y1="${oy - 14}" x2="${wx}" y2="${oy}" stroke="#38bdf8" stroke-width="1.8" />
        <line x1="${wx + ww}" y1="${oy - 14}" x2="${wx + ww}" y2="${oy}" stroke="#38bdf8" stroke-width="1.8" />
        <line x1="${wx}" y1="${oy - 7}" x2="${wx + ww}" y2="${oy - 7}" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,2" />
        <text x="${wx + ww/2}" y="${oy - 18}" fill="#38bdf8" font-size="8" font-family="monospace" text-anchor="middle">${w.label || 'WINDOW'}</text>
      `;
    }
  });

  // Draw Doors with Swing Arc
  (data.doors || []).forEach(d => {
    const dx = ox + (d.x || 0) * scale;
    const dy = oy + rd;
    const dw = (d.w || 900) * scale;
    markup += `
      <rect x="${dx}" y="${dy - 2}" width="${dw}" height="18" fill="${bgFill}" />
      <rect x="${dx - 4}" y="${dy}" width="4" height="14" fill="${wallStroke}" />
      <rect x="${dx + dw}" y="${dy}" width="4" height="14" fill="${wallStroke}" />
      <line x1="${dx}" y1="${dy}" x2="${dx}" y2="${dy - dw}" stroke="#facc15" stroke-width="2.2" />
      <path d="M ${dx} ${dy - dw} A ${dw} ${dw} 0 0 1 ${dx + dw} ${dy}" fill="none" stroke="#facc15" stroke-width="1.2" stroke-dasharray="3,3" />
      <text x="${dx + dw/2}" y="${dy + 24}" fill="#facc15" font-size="8" font-family="monospace" text-anchor="middle">${d.label || 'DOOR'}</text>
    `;
  });

  // Layer: Furniture
  if (layers.furn) {
    (data.furniture || []).forEach(f => {
      const fx = ox + (f.x || 0) * scale;
      const fy = oy + (f.y || 0) * scale;
      const fw = (f.w || 500) * scale;
      const fd = (f.d || 500) * scale;

      if (f.type === 'sofa_sectional') {
        markup += `
          <rect x="${fx}" y="${fy}" width="${fw}" height="${fd}" fill="rgba(232,121,249,0.06)" stroke="${furnColor}" stroke-width="1.8" rx="4" />
          <line x1="${fx + fw * 0.4}" y1="${fy}" x2="${fx + fw * 0.4}" y2="${fy + fd}" stroke="${furnColor}" stroke-width="1.2" stroke-dasharray="3,3" />
          <rect x="${fx + 6}" y="${fy + 6}" width="${fw - 12}" height="18" fill="none" stroke="${furnColor}" stroke-width="1" rx="2" />
        `;
      } else if (f.type === 'bed_king') {
        markup += `
          <rect x="${fx}" y="${fy}" width="${fw}" height="${fd}" fill="rgba(232,121,249,0.08)" stroke="${furnColor}" stroke-width="2" rx="4" />
          <rect x="${fx}" y="${fy}" width="${fw}" height="14" fill="${furnColor}" opacity="0.3" stroke="${furnColor}" stroke-width="1.5" />
          <rect x="${fx + 10}" y="${fy + 20}" width="${fw/2 - 16}" height="28" fill="none" stroke="${furnColor}" stroke-width="1.2" rx="3" />
          <rect x="${fx + fw/2 + 6}" y="${fy + 20}" width="${fw/2 - 16}" height="28" fill="none" stroke="${furnColor}" stroke-width="1.2" rx="3" />
          <line x1="${fx}" y1="${fy + 65}" x2="${fx + fw}" y2="${fy + 65}" stroke="${furnColor}" stroke-width="1.4" />
        `;
      } else if (f.type === 'island_counter' || f.type === 'counter_wall') {
        markup += `
          <rect x="${fx}" y="${fy}" width="${fw}" height="${fd}" fill="rgba(74,222,128,0.08)" stroke="#4ade80" stroke-width="1.8" rx="2" />
        `;
      } else if (f.type === 'sink') {
        markup += `
          <rect x="${fx}" y="${fy}" width="${fw}" height="${fd}" fill="none" stroke="#38bdf8" stroke-width="1.6" rx="3" />
          <rect x="${fx + 6}" y="${fy + 6}" width="${fw/2 - 10}" height="${fd - 12}" fill="none" stroke="#38bdf8" stroke-width="1.2" rx="2" />
          <rect x="${fx + fw/2 + 4}" y="${fy + 6}" width="${fw/2 - 10}" height="${fd - 12}" fill="none" stroke="#38bdf8" stroke-width="1.2" rx="2" />
          <circle cx="${fx + fw/2}" cy="${fy + 14}" r="3" fill="#38bdf8" />
        `;
      } else if (f.type === 'hob') {
        markup += `
          <rect x="${fx}" y="${fy}" width="${fw}" height="${fd}" fill="none" stroke="#ef4444" stroke-width="1.5" rx="2" />
          <circle cx="${fx + fw*0.28}" cy="${fy + fd*0.35}" r="8" fill="none" stroke="#ef4444" stroke-width="1.2" />
          <circle cx="${fx + fw*0.72}" cy="${fy + fd*0.35}" r="11" fill="none" stroke="#ef4444" stroke-width="1.2" />
          <circle cx="${fx + fw*0.28}" cy="${fy + fd*0.72}" r="11" fill="none" stroke="#ef4444" stroke-width="1.2" />
          <circle cx="${fx + fw*0.72}" cy="${fy + fd*0.72}" r="8" fill="none" stroke="#ef4444" stroke-width="1.2" />
        `;
      } else if (f.type === 'tub_freestanding') {
        markup += `
          <rect x="${fx}" y="${fy}" width="${fw}" height="${fd}" fill="none" stroke="#38bdf8" stroke-width="2" rx="${fd/2}" />
          <circle cx="${fx + fw * 0.15}" cy="${fy + fd/2}" r="3.5" fill="#38bdf8" />
        `;
      } else if (f.type === 'shower_glass') {
        markup += `
          <rect x="${fx}" y="${fy}" width="${fw}" height="${fd}" fill="rgba(56,189,248,0.06)" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="5,2" />
          <circle cx="${fx + fw/2}" cy="${fy + fd/2}" r="12" fill="none" stroke="#38bdf8" stroke-width="1.2" />
          <circle cx="${fx + fw/2}" cy="${fy + fd/2}" r="2" fill="#38bdf8" />
        `;
      } else if (f.type === 'exec_desk') {
        markup += `
          <rect x="${fx}" y="${fy}" width="${fw}" height="${fd}" fill="rgba(245,158,11,0.06)" stroke="#fbbf24" stroke-width="2" rx="3" />
          <rect x="${fx + fw/2 - 18}" y="${fy + fd/2 - 12}" width="36" height="24" fill="none" stroke="#fbbf24" stroke-width="1" rx="2" />
        `;
      } else if (f.type === 'rug') {
        markup += `
          <rect x="${fx}" y="${fy}" width="${fw}" height="${fd}" fill="none" stroke="${furnColor}" stroke-width="1" stroke-dasharray="6,4" rx="6" />
        `;
      } else {
        markup += `
          <rect x="${fx}" y="${fy}" width="${fw}" height="${fd}" fill="none" stroke="${furnColor}" stroke-width="1.5" rx="2" />
        `;
      }

      if (f.label) {
        markup += `<text x="${fx + fw/2}" y="${fy + fd/2 + 3}" fill="${furnColor}" font-size="7.5" font-family="monospace" text-anchor="middle" font-weight="600">${f.label}</text>`;
      }
    });
  }

  // Layer: Electrical & Lighting
  if (layers.elec) {
    (data.electrical || []).forEach(e => {
      const ex = ox + (e.x || 0) * scale;
      const ey = oy + (e.y || 0) * scale;
      if (e.type === 'chandelier') {
        markup += `
          <circle cx="${ex}" cy="${ey}" r="16" fill="none" stroke="${elecColor}" stroke-width="1.6" />
          <circle cx="${ex}" cy="${ey}" r="6" fill="none" stroke="${elecColor}" stroke-width="1.4" />
          <line x1="${ex - 16}" y1="${ey}" x2="${ex + 16}" y2="${ey}" stroke="${elecColor}" stroke-width="1" />
          <line x1="${ex}" y1="${ey - 16}" x2="${ex}" y2="${ey + 16}" stroke="${elecColor}" stroke-width="1" />
          <text x="${ex}" y="${ey + 26}" fill="${elecColor}" font-size="7.5" font-family="monospace" text-anchor="middle">${e.label || 'CHANDELIER'}</text>
        `;
      } else if (e.type === 'sconce') {
        markup += `
          <polygon points="${ex},${ey-6} ${ex-6},${ey+6} ${ex+6},${ey+6}" fill="${elecColor}" stroke="${elecColor}" />
        `;
      } else {
        markup += `
          <circle cx="${ex}" cy="${ey}" r="6" fill="none" stroke="${elecColor}" stroke-width="1.2" />
          <line x1="${ex - 5}" y1="${ey - 5}" x2="${ex + 5}" y2="${ey + 5}" stroke="${elecColor}" stroke-width="1" />
          <line x1="${ex - 5}" y1="${ey + 5}" x2="${ex + 5}" y2="${ey - 5}" stroke="${elecColor}" stroke-width="1" />
        `;
      }
    });
  }

  // Layer: Architectural Dimensions (A-DIMS)
  if (layers.dims) {
    const dimY = oy - 42;
    const dimX = ox - 42;
    markup += `
      <line x1="${ox}" y1="${oy - 14}" x2="${ox}" y2="${dimY - 6}" stroke="${dimColor}" stroke-width="0.9" opacity="0.6" />
      <line x1="${ox + rw}" y1="${oy - 14}" x2="${ox + rw}" y2="${dimY - 6}" stroke="${dimColor}" stroke-width="0.9" opacity="0.6" />
      <line x1="${ox}" y1="${dimY}" x2="${ox + rw}" y2="${dimY}" stroke="${dimColor}" stroke-width="1.4" marker-start="url(#cadTick)" marker-end="url(#cadTick)" />
      <text x="${ox + rw/2}" y="${dimY - 6}" fill="${dimColor}" font-size="10.5" font-family="monospace" font-weight="700" text-anchor="middle">${data.widthMm.toLocaleString()} mm</text>

      <line x1="${ox - 14}" y1="${oy}" x2="${dimX - 6}" y2="${oy}" stroke="${dimColor}" stroke-width="0.9" opacity="0.6" />
      <line x1="${ox - 14}" y1="${oy + rd}" x2="${dimX - 6}" y2="${oy + rd}" stroke="${dimColor}" stroke-width="0.9" opacity="0.6" />
      <line x1="${dimX}" y1="${oy}" x2="${dimX}" y2="${oy + rd}" stroke="${dimColor}" stroke-width="1.4" marker-start="url(#cadTick)" marker-end="url(#cadTick)" />
      <text x="${dimX - 8}" y="${oy + rd/2}" fill="${dimColor}" font-size="10.5" font-family="monospace" font-weight="700" text-anchor="middle" transform="rotate(-90 ${dimX - 8} ${oy + rd/2})">${data.depthMm.toLocaleString()} mm</text>
    `;
  }

  // Room Identifier Tag Stamp
  markup += `
    <g transform="translate(${ox + rw/2}, ${oy + rd - 32})">
      <rect x="-85" y="-12" width="170" height="24" fill="${isPaperSpace ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.6)'}" stroke="${wallStroke}" stroke-width="1" rx="3" />
      <text x="0" y="3" fill="${textMain}" font-size="9" font-family="monospace" font-weight="bold" text-anchor="middle">${room.name.toUpperCase()}</text>
    </g>
  `;

  // AutoCAD Official Professional Title Block (Bottom-Right)
  markup += `
    <g transform="translate(680, 440)">
      <rect x="0" y="0" width="300" height="106" fill="${isPaperSpace ? '#ffffff' : '#080c14'}" stroke="${wallStroke}" stroke-width="1.8" />
      <line x1="0" y1="28" x2="300" y2="28" stroke="${wallStroke}" stroke-width="1" />
      <line x1="0" y1="54" x2="300" y2="54" stroke="${wallStroke}" stroke-width="1" />
      <line x1="0" y1="80" x2="300" y2="80" stroke="${wallStroke}" stroke-width="1" />
      <line x1="150" y1="54" x2="150" y2="106" stroke="${wallStroke}" stroke-width="1" />

      <text x="12" y="18" fill="#38bdf8" font-size="10" font-family="sans-serif" font-weight="bold">AUTODESK AutoCAD® 2026 FORMAT</text>
      <text x="288" y="18" fill="#facc15" font-size="8" font-family="monospace" font-weight="bold" text-anchor="end">DWG METRIC</text>

      <text x="12" y="44" fill="${textMain}" font-size="9" font-family="sans-serif" font-weight="bold">PROJECT: NEEV RESIDENTIAL ARCHITECTURE</text>

      <text x="12" y="70" fill="${textMuted}" font-size="8" font-family="monospace">DWG: INT-0${Object.keys(proRoomCatalog).indexOf(roomKey) + 1}</text>
      <text x="162" y="70" fill="${textMuted}" font-size="8" font-family="monospace">SCALE: 1:50 @ A1</text>

      <text x="12" y="96" fill="${textMuted}" font-size="8" font-family="monospace">STATUS: PRO APPROVED</text>
      <text x="162" y="96" fill="#10b981" font-size="8" font-family="monospace" font-weight="bold">✓ CAD VERIFIED</text>
    </g>
  `;

  svg.innerHTML = markup;
}

// =============================================================================
// ARCHITECT & PEER FEEDBACK SYSTEM (NeeV.ai)
// =============================================================================
window.openFeedbackModal = function() {
  openModal('modalFeedback');
  const successMsg = document.getElementById('feedbackSuccessMsg');
  const form = document.getElementById('formFeedback');
  if (successMsg) successMsg.style.display = 'none';
  if (form) form.style.display = 'block';
};

function setupFeedbackStars() {
  const container = document.getElementById('feedbackRatingStars');
  const hiddenInput = document.getElementById('feedbackRatingVal');
  if (!container || !hiddenInput) return;

  const stars = container.querySelectorAll('.star-btn');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-val') || '5', 10);
      hiddenInput.value = val;
      stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-val') || '0', 10);
        s.classList.toggle('active', sVal <= val);
      });
    });
  });
}

window.handleFeedbackSubmit = async function(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('feedbackName')?.value.trim() || 'Architect Reviewer';
  const role = document.getElementById('feedbackRole')?.value || 'Friend / Peer Reviewer';
  const rating = parseInt(document.getElementById('feedbackRatingVal')?.value || '5', 10);
  const category = document.getElementById('feedbackCategory')?.value || 'General Feedback';
  const feedback = document.getElementById('feedbackText')?.value.trim() || '';

  if (!feedback) {
    alert('Please enter your suggestions or critique before submitting.');
    return;
  }

  const submitBtn = document.getElementById('btnSubmitFeedback');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        role,
        rating,
        category,
        feedback,
        project_id: appState.project_data?.id || null
      })
    });

    if (res.ok) {
      const form = document.getElementById('formFeedback');
      const successMsg = document.getElementById('feedbackSuccessMsg');
      if (form) form.style.display = 'none';
      if (successMsg) successMsg.style.display = 'block';
      showToast('🎉 Feedback sent! Thank you for reviewing NeeV.ai.', 'success', '💬');
    } else {
      throw new Error('Server returned ' + res.status);
    }
  } catch (err) {
    console.error('Failed to submit feedback:', err);
    showToast('Failed to submit feedback: ' + err.message, 'error', '⚠️');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Feedback';
    }
  }
};

// =============================================================================
// SHARE PROJECT LINK WITH FRIENDS & ARCHITECTS
// =============================================================================
window.shareCurrentProject = function() {
  const p = appState.project_data || {};
  const variant = p.design_variant || 'courtyard';
  const ptype = p.project_type || 'house';
  
  const params = new URLSearchParams();
  if (ptype && ptype !== 'residential house' && ptype !== 'house') {
    params.set('type', ptype);
  } else {
    params.set('variant', variant);
  }

  const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('🔗 Project link copied to clipboard! Share with friends or architects.', 'success', '✨');
    }).catch(() => {
      prompt('Copy your NeeV.ai share link:', shareUrl);
    });
  } else {
    prompt('Copy your NeeV.ai share link:', shareUrl);
  }
};

// =============================================================================
// URL QUERY PARAMS CHECK (AUTO-LOAD FOR SHARED LINKS)
// =============================================================================
function checkUrlParamsAndInit() {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type') || urlParams.get('preset');
  const variant = urlParams.get('variant');

  if (type) {
    loadDomainPreset(type);
  } else if (variant) {
    switchDesignVariant(variant);
  }
}


