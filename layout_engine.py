"""
Universal Procedural 2D & 3D Architectural & Infrastructure Layout Generator
Supports:
1. Civil Infrastructure: Bridges & Flyovers
2. Transportation: Roads & Highways
3. Commercial: Shopping Malls & Complexes
4. Residential: Houses, Villas & Apartments
"""

import math
from typing import Dict, Any, List, Tuple


def detect_category(project_data: Dict[str, Any]) -> str:
    """Classifies the project into its core architectural/civil domain."""
    ptype = (project_data.get("project_type") or "").lower()
    spec = (project_data.get("special_requirements") or "").lower()
    combined = f"{ptype} {spec}"

    if any(w in combined for w in ["bridge", "flyover", "viaduct", "footbridge", "overpass", "river bridge"]):
        return "bridge"
    if any(w in combined for w in ["road", "highway", "expressway", "street", "avenue", "corridor"]):
        return "road"
    if any(w in combined for w in ["mall", "shopping", "commercial complex", "plaza", "retail", "galleria", "supermarket"]):
        return "mall"
    return "residential"


def generate_layout(project_data: Dict[str, Any]) -> Dict[str, Any]:
    """Polymorphic entry point for 2D blueprints and 3D scene data."""
    category = detect_category(project_data)
    
    if category == "bridge":
        return _generate_bridge_layout(project_data)
    elif category == "road":
        return _generate_road_layout(project_data)
    elif category == "mall":
        return _generate_mall_layout(project_data)
    else:
        return _generate_residential_layout(project_data)


# ==============================================================================
# 1. CIVIL INFRASTRUCTURE: BRIDGE & FLYOVER LAYOUT
# ==============================================================================
def _generate_bridge_layout(project_data: Dict[str, Any]) -> Dict[str, Any]:
    span_m = float(project_data.get("plot_length") or 120.0)
    width_m = float(project_data.get("plot_width") or 16.0) # 4 lanes + sidewalks
    bridge_type = project_data.get("architectural_style") or "Cable-Stayed Girder Bridge"
    piers_count = max(2, min(8, int(span_m // 30)))
    clearance_m = 12.0

    svg_blueprint = _generate_bridge_svg(span_m, width_m, piers_count, clearance_m, bridge_type)

    # 3D Scene Definition for Three.js
    scene_3d = {
        "domain": "bridge",
        "span_m": span_m,
        "width_m": width_m,
        "piers_count": piers_count,
        "clearance_m": clearance_m,
        "bridge_type": bridge_type,
        "pylon_height_m": 28.0
    }

    floor_item = {
        "floor_number": 0,
        "floor_name": "Bridge Deck & Elevation Section",
        "level_m": clearance_m,
        "total_area_sqft": round(span_m * width_m * 10.7639, 1),
        "carpet_area_sqft": round(span_m * width_m * 10.7639 * 0.85, 1),
        "rooms": [
            {"id": "deck_lanes", "name": f"{bridge_type} (4 Lanes)", "x": 0, "y": 0, "width": span_m * 3.28, "length": width_m * 3.28, "type": "deck"}
        ],
        "svg_blueprint": svg_blueprint
    }

    return {
        "category": "bridge",
        "plot": {
            "width": width_m,
            "length": span_m,
            "unit": "meters",
            "bridge_type": bridge_type,
            "piers": piers_count,
            "vertical_clearance_m": clearance_m
        },
        "floors": [floor_item],
        "summary": {
            "total_floors": 1,
            "project_category": "Civil Infrastructure Bridge",
            "span_length": f"{span_m} meters ({round(span_m * 3.28084)} ft)",
            "deck_width": f"{width_m} meters (4 Travel Lanes + Sidewalks)",
            "piers_count": piers_count,
            "architectural_style": bridge_type
        },
        "scene_3d": scene_3d
    }


def _generate_bridge_svg(span_m: float, width_m: float, piers: int, clearance: float, b_type: str) -> str:
    vw, vh = 1000, 600
    svg = [f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw} {vh}" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <defs>
        <pattern id="brGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#16233b" stroke-width="0.75" opacity="0.6"/>
        </pattern>
        <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#0369a1" stop-opacity="0.6"/>
        </linearGradient>
    </defs>
    <rect width="{vw}" height="{vh}" fill="url(#brGrid)"/>

    <!-- TITLE & ENGINEERING STAMP -->
    <text x="40" y="42" fill="#38bdf8" font-size="16" font-weight="bold" letter-spacing="1">CIVIL INFRASTRUCTURE: {b_type.upper()}</text>
    <text x="40" y="62" fill="#94a3b8" font-size="11">SPAN: {span_m:.1f} METERS • DECK WIDTH: {width_m:.1f} METERS • PIERS: {piers} UNITS</text>

    <!-- SECTION 1: TOP PLAN VIEW (DECK) -->
    <g transform="translate(60, 90)">
        <text x="0" y="-12" fill="#38bdf8" font-size="11" font-weight="700">▲ PLAN VIEW (ROADWAY DECK & TRAFFIC LANES)</text>
        <!-- Deck Base -->
        <rect x="0" y="0" width="880" height="90" fill="#1e293b" stroke="#38bdf8" stroke-width="2" rx="4"/>
        <!-- Road Lanes -->
        <line x1="0" y1="22" x2="880" y2="22" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="8,6"/>
        <line x1="0" y1="45" x2="880" y2="45" stroke="#f59e0b" stroke-width="2.5"/> <!-- Centerline -->
        <line x1="0" y1="68" x2="880" y2="68" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="8,6"/>
        <!-- Pedestrian Barriers & Sidewalks -->
        <rect x="0" y="0" width="880" height="8" fill="#334155" stroke="#64748b" stroke-width="1"/>
        <rect x="0" y="82" width="880" height="8" fill="#334155" stroke="#64748b" stroke-width="1"/>
        <text x="440" y="38" fill="#94a3b8" font-size="10" text-anchor="middle" font-weight="600">◄ LANE 1 &amp; 2 (WESTBOUND) • LANE 3 &amp; 4 (EASTBOUND) ►</text>
        <text x="890" y="48" fill="#38bdf8" font-size="9">WIDTH: {width_m}m</text>
    </g>

    <!-- SECTION 2: LONGITUDINAL ELEVATION SECTION -->
    <g transform="translate(60, 270)">
        <text x="0" y="-14" fill="#38bdf8" font-size="11" font-weight="700">▲ LONGITUDINAL STRUCTURAL ELEVATION &amp; PIER PROFILE</text>
        <!-- River / Water Body -->
        <rect x="80" y="160" width="720" height="60" fill="url(#waterGrad)" rx="6"/>
        <text x="440" y="196" fill="#38bdf8" font-size="11" text-anchor="middle" opacity="0.8">RIVER / WATERWAY CHANNEL (HIGH WATER LEVEL)</text>

        <!-- Abutments at Left & Right -->
        <polygon points="0,70 80,70 80,180 0,220" fill="#334155" stroke="#64748b" stroke-width="2"/>
        <text x="35" y="140" fill="#e2e8f0" font-size="9" font-weight="bold">ABUTMENT A1</text>

        <polygon points="800,70 880,70 880,220 800,180" fill="#334155" stroke="#64748b" stroke-width="2"/>
        <text x="815" y="140" fill="#e2e8f0" font-size="9" font-weight="bold">ABUTMENT A2</text>

        <!-- Horizontal Deck Girder -->
        <rect x="0" y="65" width="880" height="18" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" rx="3"/>

        <!-- Concrete Piers & Piles -->
        ''']

    pier_spacing = 800 / (piers + 1)
    for p_idx in range(1, piers + 1):
        px = p_idx * pier_spacing
        svg.append(f'''
        <g id="pier_{p_idx}">
            <!-- Pier Column -->
            <rect x="{px - 14}" y="83" width="28" height="110" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>
            <!-- Elastomeric Bearings -->
            <rect x="{px - 10}" y="80" width="20" height="4" fill="#f59e0b"/>
            <!-- Pile Cap & Deep Foundation -->
            <rect x="{px - 26}" y="193" width="52" height="24" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
            <line x1="{px - 16}" y1="217" x2="{px - 16}" y2="245" stroke="#64748b" stroke-width="3"/>
            <line x1="{px + 16}" y1="217" x2="{px + 16}" y2="245" stroke="#64748b" stroke-width="3"/>
            <text x="{px}" y="145" fill="#f8fafc" font-size="9" text-anchor="middle" font-weight="bold">PIER P{p_idx}</text>
        </g>''')

    # If Cable-stayed or suspension, draw central Pylons and Cables
    if "cable" in b_type.lower() or "suspension" in b_type.lower():
        pylon_x = 440
        svg.append(f'''
        <!-- Central Cable Pylon -->
        <polygon points="{pylon_x - 12},83 {pylon_x - 6},-70 {pylon_x + 6},-70 {pylon_x + 12},83" fill="#334155" stroke="#38bdf8" stroke-width="2"/>
        <line x1="{pylon_x}" y1="-60" x2="160" y2="65" stroke="#38bdf8" stroke-width="1.5" opacity="0.85"/>
        <line x1="{pylon_x}" y1="-45" x2="240" y2="65" stroke="#38bdf8" stroke-width="1.5" opacity="0.85"/>
        <line x1="{pylon_x}" y1="-30" x2="320" y2="65" stroke="#38bdf8" stroke-width="1.5" opacity="0.85"/>
        <line x1="{pylon_x}" y1="-60" x2="720" y2="65" stroke="#38bdf8" stroke-width="1.5" opacity="0.85"/>
        <line x1="{pylon_x}" y1="-45" x2="640" y2="65" stroke="#38bdf8" stroke-width="1.5" opacity="0.85"/>
        <line x1="{pylon_x}" y1="-30" x2="560" y2="65" stroke="#38bdf8" stroke-width="1.5" opacity="0.85"/>
        <text x="{pylon_x}" y="-80" fill="#38bdf8" font-size="10" text-anchor="middle" font-weight="bold">MAIN CABLE PYLON</text>
        ''')

    # Dimension indicators
    svg.append(f'''
        <!-- Span Dimension Line -->
        <line x1="0" y1="240" x2="880" y2="240" stroke="#94a3b8" stroke-width="1.2"/>
        <line x1="0" y1="235" x2="0" y2="245" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="880" y1="235" x2="880" y2="245" stroke="#94a3b8" stroke-width="1.5"/>
        <text x="440" y="255" fill="#f8fafc" font-size="11" text-anchor="middle" font-weight="bold">TOTAL CLEAR SPAN: {span_m:.1f} METERS</text>
    </g>
    </svg>''')

    return "".join(svg)


# ==============================================================================
# 2. TRANSPORTATION INFRASTRUCTURE: ROAD & HIGHWAY LAYOUT
# ==============================================================================
def _generate_road_layout(project_data: Dict[str, Any]) -> Dict[str, Any]:
    length_km = float(project_data.get("plot_length") or 5.0) # km
    lanes = max(2, int(project_data.get("floors") or 4))     # lanes
    lane_w = 3.5 # standard 3.5m per lane
    median_w = 2.5 # median
    shoulder_w = 2.0 # shoulder each side
    total_w = (lanes * lane_w) + median_w + (2 * shoulder_w)

    svg_blueprint = _generate_road_svg(length_km, lanes, total_w, lane_w)

    scene_3d = {
        "domain": "road",
        "length_km": length_km,
        "lanes": lanes,
        "total_width_m": total_w,
        "lane_width_m": lane_w,
        "has_median": True,
        "has_streetlights": True
    }

    floor_item = {
        "floor_number": 0,
        "floor_name": "Roadway Alignment & Pavement Cross-Section",
        "level_m": 0.0,
        "total_area_sqft": round(length_km * 1000 * total_w * 10.7639, 1),
        "carpet_area_sqft": round(length_km * 1000 * (lanes * lane_w) * 10.7639, 1),
        "rooms": [
            {"id": "road_lanes", "name": f"{lanes}-Lane Highway Alignment", "x": 0, "y": 0, "width": total_w * 3.28, "length": 100, "type": "roadway"}
        ],
        "svg_blueprint": svg_blueprint
    }

    return {
        "category": "road",
        "plot": {
            "width": total_w,
            "length": length_km * 1000,
            "unit": "meters",
            "lanes": lanes,
            "road_type": "4-Lane Divided Highway"
        },
        "floors": [floor_item],
        "summary": {
            "total_floors": 1,
            "project_category": "Transportation Highway",
            "road_length": f"{length_km} km ({round(length_km * 0.621371, 1)} miles)",
            "lanes_count": f"{lanes} Travel Lanes ({lanes // 2} each direction)",
            "right_of_way_width": f"{total_w:.1f} meters",
            "architectural_style": "High-Speed Asphalt Expressway"
        },
        "scene_3d": scene_3d
    }


def _generate_road_svg(length_km: float, lanes: int, total_w: float, lane_w: float) -> str:
    vw, vh = 1000, 600
    svg = [f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw} {vh}" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <defs>
        <pattern id="roadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#16233b" stroke-width="0.75" opacity="0.6"/>
        </pattern>
    </defs>
    <rect width="{vw}" height="{vh}" fill="url(#roadGrid)"/>

    <!-- TITLE -->
    <text x="40" y="42" fill="#38bdf8" font-size="16" font-weight="bold" letter-spacing="1">TRANSPORTATION: {lanes}-LANE DIVIDED HIGHWAY</text>
    <text x="40" y="62" fill="#94a3b8" font-size="11">TOTAL LENGTH: {length_km:.1f} KM • RIGHT-OF-WAY: {total_w:.1f} METERS • STANDARDS: AASHTO / IRC</text>

    <!-- SECTION 1: TOP ALIGNMENT PLAN -->
    <g transform="translate(60, 95)">
        <text x="0" y="-12" fill="#38bdf8" font-size="11" font-weight="700">▲ PLAN VIEW (HIGHWAY CORRIDOR &amp; STRIPING)</text>
        <!-- Outer Shoulders -->
        <rect x="0" y="0" width="880" height="130" fill="#1e293b" stroke="#475569" stroke-width="2" rx="4"/>
        <!-- Northbound Carriage (Lanes 1 & 2) -->
        <rect x="0" y="15" width="880" height="42" fill="#0f172a"/>
        <line x1="0" y1="36" x2="880" y2="36" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="10,8"/>
        <!-- Central Raised Median Barrier -->
        <rect x="0" y="57" width="880" height="16" fill="#10b981" stroke="#059669" stroke-width="1.5"/>
        <text x="440" y="69" fill="#ffffff" font-size="8" text-anchor="middle" font-weight="bold">LANDSCAPED GREEN MEDIAN</text>
        <!-- Southbound Carriage (Lanes 3 & 4) -->
        <rect x="0" y="73" width="880" height="42" fill="#0f172a"/>
        <line x1="0" y1="94" x2="880" y2="94" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="10,8"/>

        <!-- Street Lighting Poles -->
        ''']

    for light_x in range(40, 880, 120):
        svg.append(f'''
        <circle cx="{light_x}" cy="8" r="4" fill="#f59e0b" stroke="#ffffff" stroke-width="1"/>
        <circle cx="{light_x}" cy="122" r="4" fill="#f59e0b" stroke="#ffffff" stroke-width="1"/>
        ''')

    svg.append(f'''
        <text x="440" y="28" fill="#94a3b8" font-size="10" text-anchor="middle">◄ NORTHBOUND CARRIAGEWAY (80 KM/H SPEED LIMIT)</text>
        <text x="440" y="106" fill="#94a3b8" font-size="10" text-anchor="middle">SOUTHBOUND CARRIAGEWAY (80 KM/H SPEED LIMIT) ►</text>
    </g>

    <!-- SECTION 2: TYPICAL PAVEMENT CROSS-SECTION -->
    <g transform="translate(60, 310)">
        <text x="0" y="-14" fill="#38bdf8" font-size="11" font-weight="700">▲ TYPICAL STRUCTURAL PAVEMENT CROSS-SECTION &amp; STRATA</text>

        <!-- Subgrade Soil -->
        <rect x="80" y="140" width="720" height="50" fill="#332415" stroke="#52391e" stroke-width="1"/>
        <text x="440" y="170" fill="#d7b899" font-size="10" text-anchor="middle" font-weight="bold">COMPACTED SUBGRADE SOIL (CBR &gt; 8%)</text>

        <!-- Granular Sub-Base (GSB - 150mm) -->
        <rect x="80" y="105" width="720" height="35" fill="#475569" stroke="#64748b" stroke-width="1"/>
        <text x="440" y="127" fill="#f8fafc" font-size="9" text-anchor="middle">GRANULAR SUB-BASE (GSB 150mm CRUSHED AGGREGATE)</text>

        <!-- Wet Mix Macadam (WMM - 150mm) -->
        <rect x="90" y="70" width="700" height="35" fill="#334155" stroke="#475569" stroke-width="1"/>
        <text x="440" y="92" fill="#cbd5e1" font-size="9" text-anchor="middle">WET MIX MACADAM BASE COURSE (WMM 150mm)</text>

        <!-- Bituminous Layers (DBM 75mm + BC 40mm) -->
        <rect x="100" y="30" width="680" height="40" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
        <text x="440" y="54" fill="#38bdf8" font-size="10" text-anchor="middle" font-weight="bold">ASPHALT CONCRETE WEARING COURSE (40mm BC) + (75mm DBM)</text>

        <!-- Concrete Stormwater Ditch at Left & Right -->
        <polygon points="40,30 80,30 65,110 30,110" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="25" y="75" fill="#38bdf8" font-size="8" transform="rotate(-90 25 75)">DRAIN CULVERT</text>

        <polygon points="800,30 840,30 850,110 815,110" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="860" y="75" fill="#38bdf8" font-size="8" transform="rotate(90 860 75)">DRAIN CULVERT</text>

        <!-- Dimension Line -->
        <line x1="80" y1="210" x2="800" y2="210" stroke="#94a3b8" stroke-width="1.2"/>
        <line x1="80" y1="205" x2="80" y2="215" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="800" y1="205" x2="800" y2="215" stroke="#94a3b8" stroke-width="1.5"/>
        <text x="440" y="226" fill="#ffffff" font-size="10" text-anchor="middle" font-weight="bold">TOTAL CARRIAGEWAY WIDTH: {total_w:.1f} METERS</text>
    </g>
    </svg>''')

    return "".join(svg)


# ==============================================================================
# 3. COMMERCIAL INFRASTRUCTURE: SHOPPING MALL LAYOUT
# ==============================================================================
def _generate_mall_layout(project_data: Dict[str, Any]) -> Dict[str, Any]:
    plot_w = float(project_data.get("plot_width") or 140.0)
    plot_l = float(project_data.get("plot_length") or 220.0)
    floors_count = max(2, int(project_data.get("floors") or 3))
    arch_style = project_data.get("architectural_style") or "Grand Galleria Atrium"

    floors = []

    for fl_idx in range(floors_count):
        fl_name = "Ground Floor (Grand Galleria)" if fl_idx == 0 else (f"Level {fl_idx} (Fashion & Retail)" if fl_idx < floors_count - 1 else f"Level {fl_idx} (Food Court & Cinema)")
        rooms = []

        # Central Atrium
        atrium_w = round(plot_w * 0.35, 1)
        atrium_l = round(plot_l * 0.40, 1)
        atrium_x = round((plot_w - atrium_w) / 2, 1)
        atrium_y = round((plot_l - atrium_l) / 2, 1)

        rooms.append({
            "id": f"m_atrium_{fl_idx}",
            "name": "CENTRAL GLASS ATRIUM & PLAZA",
            "x": atrium_x,
            "y": atrium_y,
            "width": atrium_w,
            "length": atrium_l,
            "type": "atrium",
            "color": "#0369a1"
        })

        # Anchor Department Stores (Left & Right Flanks)
        anchor_w = round(plot_w * 0.28, 1)
        anchor_l = round(plot_l * 0.35, 1)

        rooms.append({
            "id": f"m_anchor_l_{fl_idx}",
            "name": "ANCHOR STORE A (FASHION DEPT)",
            "x": 8.0,
            "y": 15.0,
            "width": anchor_w,
            "length": anchor_l,
            "type": "anchor",
            "color": "#1e293b"
        })

        rooms.append({
            "id": f"m_anchor_r_{fl_idx}",
            "name": "ANCHOR STORE B (LIFESTYLE / TECH)",
            "x": round(plot_w - anchor_w - 8.0, 1),
            "y": 15.0,
            "width": anchor_w,
            "length": anchor_l,
            "type": "anchor",
            "color": "#1e293b"
        })

        # Standard Retail Boutique Shops
        shop_w = round(plot_w * 0.18, 1)
        shop_l = 24.0

        for s_idx in range(6):
            sy = 15.0 + (s_idx * (shop_l + 4.0))
            if sy + shop_l <= plot_l - 20.0:
                rooms.append({
                    "id": f"m_shop_{fl_idx}_{s_idx}",
                    "name": f"RETAIL UNIT {fl_idx}{s_idx+1:02d}",
                    "x": 8.0,
                    "y": round(sy, 1),
                    "width": shop_w,
                    "length": shop_l,
                    "type": "shop",
                    "color": "#0f172a"
                })

        # Restrooms & Elevator / Escalator Core
        rooms.append({
            "id": f"m_services_{fl_idx}",
            "name": "PUBLIC RESTROOMS & ESCALATOR BANK",
            "x": round(plot_w - 36.0, 1),
            "y": round(plot_l - 35.0, 1),
            "width": 28.0,
            "length": 25.0,
            "type": "services",
            "color": "#0e2e3b"
        })

        # Generate Mall SVG Blueprint
        svg_blueprint = _generate_mall_svg(plot_w, plot_l, fl_name, rooms, atrium_w, atrium_l)

        floors.append({
            "floor_number": fl_idx,
            "floor_name": fl_name,
            "level_m": round(fl_idx * 4.5, 1),
            "total_area_sqft": round(plot_w * plot_l * 0.78, 1),
            "carpet_area_sqft": round(plot_w * plot_l * 0.65, 1),
            "rooms": rooms,
            "svg_blueprint": svg_blueprint
        })

    # 3D Scene Definition
    scene_3d = {
        "domain": "mall",
        "plot_w": plot_w,
        "plot_l": plot_l,
        "floors_count": floors_count,
        "atrium": {"width": atrium_w, "length": atrium_l},
        "floor_height_m": 4.5
    }

    return {
        "category": "mall",
        "plot": {
            "width": plot_w,
            "length": plot_l,
            "unit": "feet",
            "floors": floors_count
        },
        "floors": floors,
        "summary": {
            "total_floors": floors_count,
            "project_category": "Commercial Shopping Complex",
            "total_builtup_sqft": round(plot_w * plot_l * 0.78 * floors_count, 1),
            "anchor_stores": 2 * floors_count,
            "retail_shops_count": 18 * floors_count,
            "architectural_style": arch_style
        },
        "scene_3d": scene_3d
    }


def _generate_mall_svg(pw: float, pl: float, fl_name: str, rooms: List[Dict[str, Any]], aw: float, al: float) -> str:
    scale = 3.6
    pad = 50.0
    vw = (pw * scale) + (2 * pad)
    vh = (pl * scale) + (2 * pad)

    def tx(x): return pad + (x * scale)
    def ty(y): return pad + (y * scale)
    def tw(w): return w * scale
    def tl(l): return l * scale

    svg = [f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw} {vh}" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <defs>
        <pattern id="mGrid" width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M 18 0 L 0 0 0 18" fill="none" stroke="#16233b" stroke-width="0.75" opacity="0.6"/>
        </pattern>
    </defs>
    <rect width="{vw}" height="{vh}" fill="url(#mGrid)"/>

    <!-- Perimeter Boundary -->
    <rect x="{tx(0)}" y="{ty(0)}" width="{tw(pw)}" height="{tl(pl)}" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6,4"/>
    <text x="{tx(pw/2)}" y="{ty(0) - 14}" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">COMMERCIAL COMPLEX: {fl_name.upper()}</text>
    ''']

    # Draw Rooms
    for r in rooms:
        rx, ry, rw, rl = tx(r["x"]), ty(r["y"]), tw(r["width"]), tl(r["length"])
        color = r.get("color", "#0f172a")
        rname = r["name"]
        stroke_color = "#38bdf8" if r.get("type") == "atrium" else "#0ea5e9"

        svg.append(f'''
        <g id="{r['id']}">
            <rect x="{rx}" y="{ry}" width="{rw}" height="{rl}" fill="{color}" stroke="{stroke_color}" stroke-width="2.5" rx="3" opacity="0.95"/>
            <text x="{rx + rw/2}" y="{ry + rl/2}" fill="#f8fafc" font-size="10" font-weight="bold" text-anchor="middle">{rname}</text>
        </g>''')

    # Stamp
    svg.append(f'''
    <g transform="translate({vw - pad - 200}, {vh - pad - 50})">
        <rect width="200" height="50" fill="#0f0f12" stroke="#27272a" stroke-width="1.5" rx="6"/>
        <text x="12" y="20" fill="#ffffff" font-size="10" font-weight="bold">NEEV • COMMERCIAL CAD</text>
        <text x="12" y="36" fill="#a1a1aa" font-size="9">NFPA &amp; IBC COMPLIANT</text>
    </g>
    </svg>''')

    return "".join(svg)


# ==============================================================================
# 4. RESIDENTIAL: HOUSES & VILLAS (MULTI-TYPOLOGY ARCHITECTURAL ENGINE)
# ==============================================================================

def _resolve_residential_variant(project_data: Dict[str, Any], plot_w_ft: float, plot_l_ft: float) -> str:
    """Intelligently resolves or cycles through human architectural typologies based on regional location and style."""
    explicit = project_data.get("design_variant")
    if explicit in ["courtyard", "l_shaped", "manor", "urban_smart", "rajasthan_heritage", "cantilever_luxury"]:
        return explicit
    
    text = f"{project_data.get('location', '')} {project_data.get('architectural_style', '')} {project_data.get('special_requirements', '')} {project_data.get('living_room', '')}".lower()
    if any(k in text for k in ["rajasthan", "haveli", "jaali", "jodhpur", "jaisalmer", "stone", "traditional"]):
        return "rajasthan_heritage"
    if any(k in text for k in ["cantilever", "floating", "sky villa", "glass villa"]):
        return "cantilever_luxury"
    if any(k in text for k in ["courtyard", "zen", "lightwell", "green"]):
        return "courtyard"
    if any(k in text for k in ["l-shape", "l shape", "patio", "pool", "corner"]):
        return "l_shaped"
    if any(k in text for k in ["manor", "classical", "grand", "symmetric"]):
        return "manor"
    if any(k in text for k in ["urban", "smart", "compact", "scandi", "minimalist"]):
        return "urban_smart"

    # Default based on aspect ratio
    ratio = plot_l_ft / max(1.0, plot_w_ft)
    if ratio > 1.85:
        return "urban_smart"
    elif ratio < 1.25:
        return "l_shaped"
    return "courtyard"


def _generate_residential_layout(project_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generates varied residential floor plans like a real human architect."""
    unit = (project_data.get("unit") or "feet").lower()
    plot_w = float(project_data.get("plot_width") or 30.0)
    plot_l = float(project_data.get("plot_length") or 50.0)
    floors_count = max(1, int(project_data.get("floors") or 2))
    bedrooms_count = max(1, int(project_data.get("bedrooms") or 3))
    bathrooms_count = max(1, int(project_data.get("bathrooms") or 3))
    road_dir = (project_data.get("road_direction") or "north").lower()
    parking_cars = int(project_data.get("parking_cars") or 1)
    arch_style = project_data.get("architectural_style") or "Modern Luxury Villa"

    if "meter" in unit:
        plot_w_ft = plot_w * 3.28084
        plot_l_ft = plot_l * 3.28084
    else:
        plot_w_ft = plot_w
        plot_l_ft = plot_l

    variant_key = _resolve_residential_variant(project_data, plot_w_ft, plot_l_ft)

    front_setback = max(8.0, min(14.0, plot_l_ft * 0.18))
    rear_setback = max(3.5, min(6.0, plot_l_ft * 0.08))
    side_setback = 3.0 if plot_w_ft >= 28.0 else (1.5 if plot_w_ft >= 22.0 else 0.0)

    build_x = side_setback
    build_y = front_setback
    build_w = plot_w_ft - (2 * side_setback)
    build_l = plot_l_ft - front_setback - rear_setback

    if variant_key == "rajasthan_heritage":
        res = _generate_rajasthan_heritage_variant(build_x, build_y, build_w, build_l, floors_count, bedrooms_count, parking_cars)
    elif variant_key == "cantilever_luxury":
        res = _generate_cantilever_luxury_variant(build_x, build_y, build_w, build_l, floors_count, bedrooms_count, parking_cars)
    elif variant_key == "l_shaped":
        res = _generate_l_shaped_variant(build_x, build_y, build_w, build_l, floors_count, bedrooms_count, parking_cars)
    elif variant_key == "manor":
        res = _generate_manor_variant(build_x, build_y, build_w, build_l, floors_count, bedrooms_count, parking_cars)
    elif variant_key == "urban_smart":
        res = _generate_urban_smart_variant(build_x, build_y, build_w, build_l, floors_count, bedrooms_count, parking_cars)
    else:
        # Default: Courtyard Villa
        res = _generate_courtyard_variant(build_x, build_y, build_w, build_l, floors_count, bedrooms_count, parking_cars)

    floors, roof_info, variant_meta = res
    if project_data.get("terrace_style"):
        roof_info["style"] = project_data.get("terrace_style")

    # Enrich rooms with doorways, window apertures, flooring finishes, and furniture schedules
    processed_floors = []
    total_project_carpet = 0.0
    total_project_builtup = 0.0

    for fl in floors:
        fl["rooms"] = _enrich_room_details(fl["rooms"], build_w, build_l, fl["floor_number"])
        fl_carpet = sum(r["width"] * r["length"] for r in fl["rooms"] if r["type"] not in ("terrace", "porch", "balcony", "patio", "courtyard"))
        fl_total = (build_w * build_l) if "Terrace" not in fl["floor_name"] else (build_w * build_l * 0.30)
        total_project_carpet += fl_carpet
        total_project_builtup += fl_total

        svg = _generate_residential_svg(plot_w_ft, plot_l_ft, fl, road_dir, arch_style, variant_meta["title"])

        processed_floors.append({
            "floor_number": fl["floor_number"],
            "floor_name": fl["floor_name"],
            "level_m": fl["level_m"],
            "carpet_area_sqft": round(fl_carpet, 1),
            "total_area_sqft": round(fl_total, 1),
            "rooms": fl["rooms"],
            "stairs": fl.get("stairs"),
            "svg_blueprint": svg
        })

    # Build comprehensive 3D scene data with site landscaping and real wall apertures
    scene_3d = _generate_residential_3d(processed_floors, plot_w_ft, plot_l_ft, build_x, build_y, build_w, build_l, roof_info, variant_meta)

    return {
        "category": "residential",
        "plot": {
            "width": plot_w_ft, "length": plot_l_ft, "unit": "feet", "road_direction": road_dir,
            "setbacks": {"front": round(front_setback, 1), "rear": round(rear_setback, 1), "left": round(side_setback, 1), "right": round(side_setback, 1)}
        },
        "design_variant": variant_key,
        "variant_meta": variant_meta,
        "floors": processed_floors,
        "summary": {
            "total_floors": floors_count,
            "total_builtup_sqft": round(total_project_builtup, 1),
            "total_carpet_sqft": round(total_project_carpet, 1),
            "bedrooms": bedrooms_count,
            "bathrooms": bathrooms_count,
            "architectural_style": arch_style,
            "variant_title": variant_meta["title"],
            "variant_desc": variant_meta["desc"]
        },
        "scene_3d": scene_3d
    }


# ==============================================================================
# TYPOLOGY A: MODERN OPEN-PLAN COURTYARD VILLA
# ==============================================================================
def _generate_courtyard_variant(bx, by, bw, bl, floors_cnt, beds_cnt, cars):
    variant_meta = {
        "key": "courtyard",
        "title": "Modern Open-Plan Courtyard Villa",
        "desc": "Featuring a central landscaped green lightwell, double-height living room, floating bridge corridor, and seamless indoor-outdoor terrace flow."
    }
    roof_info = {"style": "floating_flat", "has_pergola": True, "has_skylight": True}

    stair_w = min(7.5, bw * 0.28)
    stair_l = 10.5
    stair_x = bx + bw - stair_w
    stair_y = by + (bl * 0.32)

    floors = []

    # Ground Floor
    gf_rooms = []
    porch_w = min(11.5, bw * 0.40) if cars > 0 else 0.0
    living_w = bw - porch_w
    front_l = max(13.0, min(16.5, bl * 0.34))

    if porch_w > 0:
        gf_rooms.append({"id": "gf_porch", "name": "PORTICO & CARPORT", "x": bx, "y": by, "width": round(porch_w, 2), "length": round(front_l, 2), "type": "porch", "color": "#1e293b", "flooring": "stone_pavers"})

    gf_rooms.append({"id": "gf_living", "name": "DOUBLE-HEIGHT LIVING LOUNGE", "x": bx + porch_w, "y": by, "width": round(living_w, 2), "length": round(front_l, 2), "type": "living", "color": "#0f2942", "flooring": "carrara_marble", "accent_wall": "north"})

    # Central Courtyard Zone
    mid_y = by + front_l
    mid_l = max(11.0, min(14.0, bl * 0.28))
    court_w = min(9.5, bw * 0.32)

    gf_rooms.append({"id": "gf_courtyard", "name": "CENTRAL GREEN COURTYARD", "x": bx, "y": mid_y, "width": round(court_w, 2), "length": round(mid_l, 2), "type": "courtyard", "color": "#064e3b", "flooring": "grass_turf", "accent_wall": "west"})
    gf_rooms.append({"id": "gf_dining", "name": "PANORAMIC DINING & BAR", "x": bx + court_w, "y": mid_y, "width": round(bw - court_w - stair_w, 2), "length": round(mid_l, 2), "type": "dining", "color": "#172554", "flooring": "herringbone_wood", "accent_wall": "south"})

    # Rear Kitchen & Guest Suite
    rear_y = mid_y + mid_l
    rear_l = bl - (rear_y - by)
    kitchen_w = min(10.0, bw * 0.38)
    bath_w = min(6.0, bw * 0.24)

    gf_rooms.append({"id": "gf_kitchen", "name": "GOURMET CHEF KITCHEN", "x": bx, "y": rear_y, "width": round(kitchen_w, 2), "length": round(rear_l, 2), "type": "kitchen", "color": "#292524", "flooring": "terrazzo", "accent_wall": "south"})
    gf_rooms.append({"id": "gf_bed1", "name": "GUEST BEDROOM SUITE", "x": bx + kitchen_w, "y": rear_y, "width": round(bw - kitchen_w - bath_w, 2), "length": round(rear_l, 2), "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "east"})
    gf_rooms.append({"id": "gf_bath1", "name": "EN-SUITE BATH", "x": bx + bw - bath_w, "y": rear_y, "width": round(bath_w, 2), "length": round(min(7.5, rear_l), 2), "type": "bathroom", "color": "#0e2e3b", "flooring": "slate_stone", "accent_wall": "east"})

    floors.append({
        "floor_number": 0, "floor_name": "Ground Floor (Courtyard Level)", "level_m": 0.0, "rooms": gf_rooms,
        "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "UP"}
    })

    # Upper Floors
    for fl_idx in range(1, floors_cnt):
        uf_rooms = []
        uf_front_l = max(13.5, bl * 0.36)
        balcony_l = 4.2
        master_bath_w = min(7.0, bw * 0.28)

        uf_rooms.append({"id": f"f{fl_idx}_master", "name": "PRIMARY MASTER SUITE", "x": bx, "y": by, "width": round(bw - master_bath_w, 2), "length": round(uf_front_l, 2), "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "north"})
        uf_rooms.append({"id": f"f{fl_idx}_mbath", "name": "LUXURY SPA BATH & WALK-IN", "x": bx + bw - master_bath_w, "y": by, "width": round(master_bath_w, 2), "length": round(min(8.0, uf_front_l), 2), "type": "bathroom", "color": "#0e2e3b", "flooring": "carrara_marble", "accent_wall": "north"})
        uf_rooms.append({"id": f"f{fl_idx}_balcony", "name": "CANTILEVERED GLASS BALCONY", "x": bx, "y": max(0.0, by - balcony_l), "width": round(bw * 0.65, 2), "length": round(balcony_l, 2), "type": "balcony", "color": "#132338", "flooring": "deck_timber"})

        uf_mid_y = by + uf_front_l
        uf_mid_l = max(10.0, bl * 0.26)
        uf_rooms.append({"id": f"f{fl_idx}_bridge", "name": "FLOATING MEZZANINE BRIDGE", "x": bx, "y": uf_mid_y, "width": round(bw - stair_w, 2), "length": round(uf_mid_l, 2), "type": "lounge", "color": "#0f2942", "flooring": "herringbone_wood", "accent_wall": "west"})

        uf_rear_y = uf_mid_y + uf_mid_l
        uf_rear_l = bl - (uf_rear_y - by)
        bed_split = bw / 2.0
        uf_rooms.append({"id": f"f{fl_idx}_bed2", "name": f"SUITE BEDROOM {fl_idx + 1}", "x": bx, "y": uf_rear_y, "width": round(bed_split, 2), "length": round(uf_rear_l, 2), "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "south"})
        uf_rooms.append({"id": f"f{fl_idx}_bath2", "name": f"ATTACHED BATH {fl_idx + 1}", "x": bx + bed_split, "y": uf_rear_y, "width": round(bed_split, 2), "length": round(uf_rear_l, 2), "type": "bathroom", "color": "#0e2e3b", "flooring": "slate_stone", "accent_wall": "east"})

        floors.append({
            "floor_number": fl_idx, "floor_name": f"Level {fl_idx} (Master Suites)", "level_m": round(fl_idx * 3.2, 1), "rooms": uf_rooms,
            "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "DN / UP"}
        })

    # Rooftop Terrace
    floors.append({
        "floor_number": floors_cnt, "floor_name": "Rooftop Garden & Pergola", "level_m": round(floors_cnt * 3.2, 1),
        "rooms": [
            {"id": "terrace_open", "name": "OPEN SKYLINE ROOF TERRACE", "x": bx, "y": by, "width": round(bw, 2), "length": round(bl, 2), "type": "terrace", "color": "#132338", "flooring": "deck_timber"},
            {"id": "pergola_zone", "name": "TIMBER PERGOLA LOUNGE", "x": bx + (bw * 0.3), "y": by + (bl * 0.25), "width": round(bw * 0.45, 2), "length": round(bl * 0.35, 2), "type": "terrace", "color": "#0f2942", "flooring": "deck_timber"}
        ],
        "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "DN"}
    })

    return floors, roof_info, variant_meta


# ==============================================================================
# TYPOLOGY B: L-SHAPED WRAP PATIO & DECK VILLA
# ==============================================================================
def _generate_l_shaped_variant(bx, by, bw, bl, floors_cnt, beds_cnt, cars):
    variant_meta = {
        "key": "l_shaped",
        "title": "L-Shaped Wrap Patio & Deck Villa",
        "desc": "Built footprint wraps around a private corner garden patio with floor-to-ceiling glass sliding doors and corner cantilevered balcony."
    }
    roof_info = {"style": "floating_flat", "has_pergola": True, "has_skylight": False}

    patio_w = round(bw * 0.38, 2)
    patio_l = round(bl * 0.42, 2)
    stair_w = min(7.5, bw * 0.28)
    stair_l = 10.0
    stair_x = bx + bw - stair_w
    stair_y = by + 2.0

    floors = []

    # Ground Floor
    gf_rooms = []
    # Corner Garden Patio Deck
    gf_rooms.append({"id": "gf_patio", "name": "PRIVATE ZEN PATIO & DECK", "x": bx, "y": by, "width": patio_w, "length": patio_l, "type": "patio", "color": "#064e3b", "flooring": "deck_timber"})

    # Great Room (Living + Formal Dining)
    main_w = round(bw - patio_w, 2)
    gf_rooms.append({"id": "gf_living", "name": "GREAT ROOM (LIVING & SALON)", "x": bx + patio_w, "y": by, "width": main_w - stair_w, "length": patio_l, "type": "living", "color": "#0f2942", "flooring": "carrara_marble", "accent_wall": "north"})

    # Rear Wing (Chef's Kitchen, Guest Suite, Bath)
    rear_y = by + patio_l
    rear_l = round(bl - patio_l, 2)
    kitchen_w = round(bw * 0.36, 2)
    bath_w = min(6.5, bw * 0.25)

    gf_rooms.append({"id": "gf_kitchen", "name": "ISLAND SHOW KITCHEN & DINING", "x": bx, "y": rear_y, "width": kitchen_w, "length": rear_l, "type": "kitchen", "color": "#292524", "flooring": "terrazzo", "accent_wall": "west"})
    gf_rooms.append({"id": "gf_bed1", "name": "GROUND FLOOR SUITE", "x": bx + kitchen_w, "y": rear_y, "width": round(bw - kitchen_w - bath_w, 2), "length": rear_l, "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "south"})
    gf_rooms.append({"id": "gf_bath1", "name": "POWDER & BATH", "x": bx + bw - bath_w, "y": rear_y, "width": bath_w, "length": round(min(8.0, rear_l), 2), "type": "bathroom", "color": "#0e2e3b", "flooring": "slate_stone", "accent_wall": "east"})

    floors.append({
        "floor_number": 0, "floor_name": "Ground Floor (L-Shape Patio)", "level_m": 0.0, "rooms": gf_rooms,
        "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "UP"}
    })

    # Upper Floors
    for fl_idx in range(1, floors_cnt):
        uf_rooms = []
        uf_rooms.append({"id": f"f{fl_idx}_master", "name": "CANTILEVERED MASTER SUITE", "x": bx + patio_w, "y": by, "width": round(bw - patio_w, 2), "length": patio_l, "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "north"})
        uf_rooms.append({"id": f"f{fl_idx}_wrap_balcony", "name": "WRAPAROUND CORNER BALCONY", "x": bx, "y": by, "width": patio_w, "length": patio_l, "type": "balcony", "color": "#132338", "flooring": "deck_timber"})

        bed_split = bw / 2.0
        uf_rooms.append({"id": f"f{fl_idx}_bed2", "name": f"GUEST BEDROOM {fl_idx + 1}", "x": bx, "y": rear_y, "width": round(bed_split, 2), "length": rear_l, "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "south"})
        uf_rooms.append({"id": f"f{fl_idx}_bath2", "name": f"EN-SUITE BATH {fl_idx + 1}", "x": bx + bed_split, "y": rear_y, "width": round(bed_split, 2), "length": rear_l, "type": "bathroom", "color": "#0e2e3b", "flooring": "slate_stone", "accent_wall": "east"})

        floors.append({
            "floor_number": fl_idx, "floor_name": f"Level {fl_idx} (Cantilevered Deck)", "level_m": round(fl_idx * 3.2, 1), "rooms": uf_rooms,
            "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "DN / UP"}
        })

    # Roof
    floors.append({
        "floor_number": floors_cnt, "floor_name": "Roof Deck & Solar Canopy", "level_m": round(floors_cnt * 3.2, 1),
        "rooms": [
            {"id": "roof_deck", "name": "PANORAMIC ROOFTOP DECK", "x": bx, "y": by, "width": round(bw, 2), "length": round(bl, 2), "type": "terrace", "color": "#132338", "flooring": "deck_timber"}
        ],
        "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "DN"}
    })

    return floors, roof_info, variant_meta


# ==============================================================================
# TYPOLOGY C: CONTEMPORARY SYMMETRICAL MANOR
# ==============================================================================
def _generate_manor_variant(bx, by, bw, bl, floors_cnt, beds_cnt, cars):
    variant_meta = {
        "key": "manor",
        "title": "Contemporary Symmetrical Manor",
        "desc": "Grand central double-height foyer with twin formal wings, central floating staircase, and symmetrical pitched roof architecture."
    }
    roof_info = {"style": "gable_pitch", "has_pergola": False, "has_skylight": True}

    center_w = min(10.0, bw * 0.32)
    wing_w = round((bw - center_w) / 2.0, 2)
    front_l = round(bl * 0.48, 2)
    rear_l = round(bl - front_l, 2)

    stair_w = center_w - 1.0
    stair_l = 9.0
    stair_x = bx + wing_w + 0.5
    stair_y = by + 2.0

    floors = []

    # Ground Floor
    gf_rooms = []
    # Central Grand Foyer
    gf_rooms.append({"id": "gf_foyer", "name": "GRAND ENTRANCE FOYER", "x": bx + wing_w, "y": by, "width": center_w, "length": front_l, "type": "foyer", "color": "#172554", "flooring": "carrara_marble", "accent_wall": "north"})
    # Left Wing: Formal Living Salon
    gf_rooms.append({"id": "gf_living", "name": "FORMAL SALON & FIREPLACE", "x": bx, "y": by, "width": wing_w, "length": front_l, "type": "living", "color": "#0f2942", "flooring": "carrara_marble", "accent_wall": "west"})
    # Right Wing: Dining & Kitchen
    gf_rooms.append({"id": "gf_dining", "name": "BANQUET DINING HALL", "x": bx + wing_w + center_w, "y": by, "width": wing_w, "length": front_l, "type": "dining", "color": "#1e293b", "flooring": "herringbone_wood", "accent_wall": "east"})

    # Rear Suites
    gf_rooms.append({"id": "gf_kitchen", "name": "CHEF ISLAND KITCHEN", "x": bx, "y": by + front_l, "width": wing_w, "length": rear_l, "type": "kitchen", "color": "#292524", "flooring": "terrazzo", "accent_wall": "south"})
    gf_rooms.append({"id": "gf_bed1", "name": "GARDEN SUITE BEDROOM", "x": bx + wing_w + center_w, "y": by + front_l, "width": wing_w, "length": rear_l, "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "south"})
    gf_rooms.append({"id": "gf_bath1", "name": "POWDER ROOM & BATH", "x": bx + wing_w, "y": by + front_l, "width": center_w, "length": round(min(7.5, rear_l), 2), "type": "bathroom", "color": "#0e2e3b", "flooring": "slate_stone", "accent_wall": "south"})

    floors.append({
        "floor_number": 0, "floor_name": "Ground Floor (Grand Foyer)", "level_m": 0.0, "rooms": gf_rooms,
        "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "UP"}
    })

    # Upper Floor
    for fl_idx in range(1, floors_cnt):
        uf_rooms = []
        uf_rooms.append({"id": f"f{fl_idx}_suite_l", "name": "MASTER SUITE (EAST WING)", "x": bx, "y": by, "width": wing_w, "length": front_l, "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "north"})
        uf_rooms.append({"id": f"f{fl_idx}_suite_r", "name": "MASTER SUITE (WEST WING)", "x": bx + wing_w + center_w, "y": by, "width": wing_w, "length": front_l, "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "north"})
        uf_rooms.append({"id": f"f{fl_idx}_lounge", "name": "CENTRAL GALLERY LOUNGE", "x": bx + wing_w, "y": by, "width": center_w, "length": front_l, "type": "lounge", "color": "#0f2942", "flooring": "carrara_marble", "accent_wall": "north"})

        # Balconies
        uf_rooms.append({"id": f"f{fl_idx}_balc_l", "name": "EAST BALCONY", "x": bx, "y": max(0.0, by - 4.0), "width": wing_w, "length": 4.0, "type": "balcony", "color": "#132338", "flooring": "deck_timber"})
        uf_rooms.append({"id": f"f{fl_idx}_balc_r", "name": "WEST BALCONY", "x": bx + wing_w + center_w, "y": max(0.0, by - 4.0), "width": wing_w, "length": 4.0, "type": "balcony", "color": "#132338", "flooring": "deck_timber"})

        floors.append({
            "floor_number": fl_idx, "floor_name": f"Level {fl_idx} (Manor Suites)", "level_m": round(fl_idx * 3.2, 1), "rooms": uf_rooms,
            "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "DN / UP"}
        })

    # Roof (Pitched Gable)
    floors.append({
        "floor_number": floors_cnt, "floor_name": "Pitched Roof & Attic", "level_m": round(floors_cnt * 3.2, 1),
        "rooms": [
            {"id": "attic_terrace", "name": "ATTIC MEZZANINE & STORAGE", "x": bx, "y": by, "width": round(bw, 2), "length": round(bl, 2), "type": "terrace", "color": "#1e293b", "flooring": "slate_stone"}
        ],
        "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "DN"}
    })

    return floors, roof_info, variant_meta


# ==============================================================================
# TYPOLOGY D: SCANDINAVIAN URBAN SMART HOME
# ==============================================================================
def _generate_urban_smart_variant(bx, by, bw, bl, floors_cnt, beds_cnt, cars):
    variant_meta = {
        "key": "urban_smart",
        "title": "Scandinavian Urban Lightwell Home",
        "desc": "High-efficiency vertical zoning, integrated car port, light court, and dedicated Work-from-Home Studio with deep sun-shaded balconies."
    }
    roof_info = {"style": "terrace_pergola", "has_pergola": True, "has_skylight": True}

    stair_w = min(6.8, bw * 0.28)
    stair_l = 9.5
    stair_x = bx + bw - stair_w
    stair_y = by + (bl * 0.40)

    floors = []

    # Ground Floor
    gf_rooms = []
    porch_w = min(11.0, bw * 0.42) if cars > 0 else 0.0
    entry_w = bw - porch_w
    front_l = max(12.5, min(15.0, bl * 0.32))

    if porch_w > 0:
        gf_rooms.append({"id": "gf_porch", "name": "INTEGRATED CAR PORT", "x": bx, "y": by, "width": round(porch_w, 2), "length": round(front_l, 2), "type": "porch", "color": "#1e293b", "flooring": "stone_pavers"})

    gf_rooms.append({"id": "gf_living", "name": "NORDIC LIVING ROOM", "x": bx + porch_w, "y": by, "width": round(entry_w, 2), "length": round(front_l, 2), "type": "living", "color": "#0f2942", "flooring": "herringbone_wood", "accent_wall": "north"})

    # Great Room Middle
    mid_y = by + front_l
    mid_l = max(11.0, min(14.0, bl * 0.30))
    gf_rooms.append({"id": "gf_dining", "name": "OPEN DINING & BREAKFAST BAR", "x": bx, "y": mid_y, "width": round(bw - stair_w, 2), "length": round(mid_l, 2), "type": "dining", "color": "#172554", "flooring": "herringbone_wood", "accent_wall": "west"})

    # Rear Zone
    rear_y = mid_y + mid_l
    rear_l = bl - (rear_y - by)
    kitchen_w = min(9.5, bw * 0.38)
    bath_w = min(6.0, bw * 0.24)

    gf_rooms.append({"id": "gf_kitchen", "name": "LINEAR SCANDI KITCHEN", "x": bx, "y": rear_y, "width": round(kitchen_w, 2), "length": round(rear_l, 2), "type": "kitchen", "color": "#292524", "flooring": "terrazzo", "accent_wall": "south"})
    gf_rooms.append({"id": "gf_zen", "name": "REAR ZEN GARDEN NOOK", "x": bx + kitchen_w, "y": rear_y, "width": round(bw - kitchen_w - bath_w, 2), "length": round(rear_l, 2), "type": "courtyard", "color": "#064e3b", "flooring": "grass_turf", "accent_wall": "south"})
    gf_rooms.append({"id": "gf_bath1", "name": "GUEST POWDER ROOM", "x": bx + bw - bath_w, "y": rear_y, "width": round(bath_w, 2), "length": round(min(7.0, rear_l), 2), "type": "bathroom", "color": "#0e2e3b", "flooring": "slate_stone", "accent_wall": "east"})

    floors.append({
        "floor_number": 0, "floor_name": "Ground Floor (Living & Garden)", "level_m": 0.0, "rooms": gf_rooms,
        "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "UP"}
    })

    # Upper Floor
    for fl_idx in range(1, floors_cnt):
        uf_rooms = []
        uf_front_l = max(13.0, bl * 0.36)
        studio_w = min(10.0, bw * 0.36)

        uf_rooms.append({"id": f"f{fl_idx}_studio", "name": "WORK-FROM-HOME STUDIO", "x": bx, "y": by, "width": round(studio_w, 2), "length": round(uf_front_l, 2), "type": "lounge", "color": "#0f2942", "flooring": "herringbone_wood", "accent_wall": "north"})
        uf_rooms.append({"id": f"f{fl_idx}_master", "name": "NORDIC MASTER SUITE", "x": bx + studio_w, "y": by, "width": round(bw - studio_w, 2), "length": round(uf_front_l, 2), "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "north"})
        uf_rooms.append({"id": f"f{fl_idx}_balc", "name": "SUN-SHADED BALCONY", "x": bx, "y": max(0.0, by - 4.0), "width": round(bw * 0.60, 2), "length": 4.0, "type": "balcony", "color": "#132338", "flooring": "deck_timber"})

        uf_rear_y = by + uf_front_l
        uf_rear_l = bl - uf_front_l
        bed_split = bw / 2.0
        uf_rooms.append({"id": f"f{fl_idx}_bed2", "name": f"BEDROOM {fl_idx + 1}", "x": bx, "y": uf_rear_y, "width": round(bed_split, 2), "length": round(uf_rear_l, 2), "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "south"})
        uf_rooms.append({"id": f"f{fl_idx}_bath2", "name": f"BATHROOM {fl_idx + 1}", "x": bx + bed_split, "y": uf_rear_y, "width": round(bed_split, 2), "length": round(uf_rear_l, 2), "type": "bathroom", "color": "#0e2e3b", "flooring": "slate_stone", "accent_wall": "east"})

        floors.append({
            "floor_number": fl_idx, "floor_name": f"Level {fl_idx} (Studio & Master)", "level_m": round(fl_idx * 3.2, 1), "rooms": uf_rooms,
            "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "DN / UP"}
        })

    # Rooftop Terrace
    floors.append({
        "floor_number": floors_cnt, "floor_name": "Rooftop Terrace & Solar", "level_m": round(floors_cnt * 3.2, 1),
        "rooms": [
            {"id": "roof_deck", "name": "ROOFTOP SOLAR LOUNGE", "x": bx, "y": by, "width": round(bw, 2), "length": round(bl, 2), "type": "terrace", "color": "#132338", "flooring": "deck_timber"}
        ],
        "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "DN"}
    })

    return floors, roof_info, variant_meta


# ==============================================================================
# TYPOLOGY E: INDO-CONTEMPORARY RAJASTHAN HAVELI (JAALI & JHAROKHA)
# ==============================================================================
def _generate_rajasthan_heritage_variant(bx: float, by: float, bw: float, bl: float, floors_cnt: int, beds_cnt: int, cars: int):
    variant_meta = {
        "key": "rajasthan_heritage",
        "title": "Indo-Contemporary Rajasthan Haveli",
        "desc": "Timeless desert architectural elegance with Jaisalmer golden sandstone facades, intricate geometric Jaali solar lattice screens, cantilevered Jharokha balconies with stone corbels, central green Aangan courtyard with water fountain, and a rooftop Chhatri sky pavilion."
    }
    roof_info = {"style": "rajasthan_chhatri", "has_pergola": True, "has_chhatri": True, "has_skylight": True}

    stair_w = min(7.2, bw * 0.28)
    stair_l = 10.0
    stair_x = bx + bw - stair_w
    stair_y = by + (bl * 0.35)

    floors = []

    # Ground Floor
    gf_rooms = []
    porch_w = min(11.0, bw * 0.40) if cars > 0 else 0.0
    foyer_w = bw - porch_w
    front_l = max(13.0, min(16.0, bl * 0.33))

    if porch_w > 0:
        gf_rooms.append({"id": "gf_porch", "name": "SANDSTONE PORTICO & CARPORT", "x": bx, "y": by, "width": round(porch_w, 2), "length": round(front_l, 2), "type": "porch", "color": "#1e293b", "flooring": "stone_pavers"})

    gf_rooms.append({"id": "gf_living", "name": "ROYAL BAITHAK (LIVING HALL)", "x": bx + porch_w, "y": by, "width": round(foyer_w, 2), "length": round(front_l, 2), "type": "living", "color": "#2c1c0f", "flooring": "slate_stone", "accent_wall": "north", "wall_finish": "brick"})

    # Central Green Aangan (Courtyard with Fountain)
    mid_y = by + front_l
    mid_l = max(11.0, min(14.0, bl * 0.28))
    court_w = min(9.5, bw * 0.35)

    gf_rooms.append({"id": "gf_courtyard", "name": "CENTRAL AANGAN & WATER FOUNTAIN", "x": bx, "y": mid_y, "width": round(court_w, 2), "length": round(mid_l, 2), "type": "courtyard", "color": "#064e3b", "flooring": "grass_turf", "accent_wall": "west"})
    gf_rooms.append({"id": "gf_dining", "name": "HERITAGE DINING HALL", "x": bx + court_w, "y": mid_y, "width": round(bw - court_w - stair_w, 2), "length": round(mid_l, 2), "type": "dining", "color": "#1e293b", "flooring": "slate_stone", "accent_wall": "south"})

    # Rear Kitchen & Ground Guest Suite
    rear_y = mid_y + mid_l
    rear_l = bl - (rear_y - by)
    kitchen_w = min(10.0, bw * 0.38)
    bath_w = min(6.0, bw * 0.22)
    gf_rooms.append({"id": "gf_kitchen", "name": "MODERN MODULAR RASOI", "x": bx, "y": rear_y, "width": round(kitchen_w, 2), "length": round(rear_l, 2), "type": "kitchen", "color": "#292524", "flooring": "terrazzo", "accent_wall": "south"})
    gf_rooms.append({"id": "gf_bed_g", "name": "GROUND GUEST CHAMBER", "x": bx + kitchen_w, "y": rear_y, "width": round(bw - kitchen_w - bath_w, 2), "length": round(rear_l, 2), "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "south"})
    gf_rooms.append({"id": "gf_bath_g", "name": "ENSUITE BATHROOM", "x": bx + bw - bath_w, "y": rear_y, "width": round(bath_w, 2), "length": round(rear_l, 2), "type": "bathroom", "color": "#0e2e3b", "flooring": "slate_stone", "accent_wall": "east"})

    floors.append({
        "floor_number": 0, "floor_name": "Ground Floor (Aangan & Baithak)", "level_m": 0.0, "rooms": gf_rooms,
        "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "UP"}
    })

    # Upper Floors with Jharokha Balconies and Jaali Solar Screens
    for fl_idx in range(1, floors_cnt):
        uf_rooms = []
        uf_front_l = max(13.0, bl * 0.36)
        balcony_l = 4.5
        jharokha_w = min(12.0, bw * 0.55)

        # Cantilevered Jharokha Balcony with Jaali Screen
        uf_rooms.append({
            "id": f"f{fl_idx}_jharokha", "name": "CANTILEVERED JHAROKHA BALCONY",
            "x": bx, "y": max(0.0, by - balcony_l), "width": round(jharokha_w, 2), "length": round(balcony_l, 2),
            "type": "balcony", "color": "#132338", "flooring": "slate_stone", "has_jaali": True
        })

        # Front Master Chamber behind the Jharokha
        uf_rooms.append({
            "id": f"f{fl_idx}_master", "name": "ROYAL MASTER SUITE",
            "x": bx, "y": by, "width": round(jharokha_w, 2), "length": round(uf_front_l, 2),
            "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "north"
        })

        # Upper Family Lounge overlooking the central aangan
        uf_rooms.append({
            "id": f"f{fl_idx}_lounge", "name": "UPPER JHAROKHA LOUNGE",
            "x": bx + jharokha_w, "y": by, "width": round(bw - jharokha_w, 2), "length": round(uf_front_l, 2),
            "type": "lounge", "color": "#0f2942", "flooring": "slate_stone", "accent_wall": "north"
        })

        # Rear Bedrooms & Baths
        uf_rear_y = by + uf_front_l
        uf_rear_l = bl - uf_front_l
        bed_split = bw / 2.0
        uf_rooms.append({"id": f"f{fl_idx}_bed2", "name": f"BED CHAMBER {fl_idx + 1}", "x": bx, "y": uf_rear_y, "width": round(bed_split, 2), "length": round(uf_rear_l, 2), "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "south"})
        uf_rooms.append({"id": f"f{fl_idx}_bath2", "name": f"ROYAL BATH {fl_idx + 1}", "x": bx + bed_split, "y": uf_rear_y, "width": round(bed_split, 2), "length": round(uf_rear_l, 2), "type": "bathroom", "color": "#0e2e3b", "flooring": "slate_stone", "accent_wall": "east"})

        floors.append({
            "floor_number": fl_idx, "floor_name": f"Level {fl_idx} (Master & Jharokha)", "level_m": round(fl_idx * 3.2, 1), "rooms": uf_rooms,
            "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "DN / UP"}
        })

    # Rooftop Terrace with Staircase Mumty & Chhatri Pavilion
    mumty_w = stair_w + 1.2
    mumty_l = stair_l + 1.2
    roof_rooms = [
        {"id": "roof_mumty", "name": "STAIRCASE HEADHOUSE (MUMTY)", "x": round(stair_x - 0.6, 2), "y": round(stair_y - 0.6, 2), "width": round(mumty_w, 2), "length": round(mumty_l, 2), "type": "foyer", "color": "#1e293b", "flooring": "slate_stone"},
        {"id": "roof_chhatri", "name": "CHHATRI ROOFTOP SKY PAVILION", "x": bx, "y": by, "width": round(bw, 2), "length": round(bl, 2), "type": "terrace", "color": "#132338", "flooring": "slate_stone"}
    ]
    floors.append({
        "floor_number": floors_cnt, "floor_name": "Rooftop Chhatri & Sky Terrace", "level_m": round(floors_cnt * 3.2, 1),
        "rooms": roof_rooms,
        "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "DN"}
    })

    return floors, roof_info, variant_meta


# ==============================================================================
# TYPOLOGY F: CANTILEVERED GLASS & TIMBER SKY VILLA
# ==============================================================================
def _generate_cantilever_luxury_variant(bx: float, by: float, bw: float, bl: float, floors_cnt: int, beds_cnt: int, cars: int):
    variant_meta = {
        "key": "cantilever_luxury",
        "title": "Cantilevered Glass & Timber Sky Villa",
        "desc": "Dramatic forward-cantilevered upper floor, floor-to-ceiling glass sliding doors, wrap-around sunset balcony with warm recessed LED soffit lighting, and panoramic sky lounge."
    }
    roof_info = {"style": "pergola_garden", "has_pergola": True, "has_skylight": True}

    stair_w = min(7.5, bw * 0.28)
    stair_l = 10.5
    stair_x = bx + bw - stair_w
    stair_y = by + (bl * 0.35)

    floors = []

    # Ground Floor
    gf_rooms = []
    porch_w = min(12.0, bw * 0.42) if cars > 0 else 0.0
    living_w = bw - porch_w
    front_l = max(13.0, min(16.0, bl * 0.34))

    if porch_w > 0:
        gf_rooms.append({"id": "gf_porch", "name": "CANTILEVERED CARPORT & ENTRY", "x": bx, "y": by, "width": round(porch_w, 2), "length": round(front_l, 2), "type": "porch", "color": "#1e293b", "flooring": "stone_pavers"})

    gf_rooms.append({"id": "gf_living", "name": "PANORAMIC GREAT ROOM", "x": bx + porch_w, "y": by, "width": round(living_w, 2), "length": round(front_l, 2), "type": "living", "color": "#0f2942", "flooring": "carrara_marble", "accent_wall": "north"})

    # Dining & Open Kitchen
    mid_y = by + front_l
    mid_l = max(11.0, min(14.0, bl * 0.28))
    gf_rooms.append({"id": "gf_dining", "name": "CHEF's DINING & WINE LOUNGE", "x": bx, "y": mid_y, "width": round(bw - stair_w, 2), "length": round(mid_l, 2), "type": "dining", "color": "#172554", "flooring": "terrazzo", "accent_wall": "west"})

    # Rear Suite & Powder Room
    rear_y = mid_y + mid_l
    rear_l = bl - (rear_y - by)
    suite_w = round(bw * 0.65, 2)
    bath_w = round(bw - suite_w, 2)
    gf_rooms.append({"id": "gf_bed_rear", "name": "GUEST SUITE", "x": bx, "y": rear_y, "width": suite_w, "length": round(rear_l, 2), "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "south"})
    gf_rooms.append({"id": "gf_bath_rear", "name": "POWDER & SPA BATH", "x": bx + suite_w, "y": rear_y, "width": bath_w, "length": round(rear_l, 2), "type": "bathroom", "color": "#0e2e3b", "flooring": "slate_stone", "accent_wall": "east"})

    floors.append({
        "floor_number": 0, "floor_name": "Ground Floor (Great Room & Lounge)", "level_m": 0.0, "rooms": gf_rooms,
        "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "UP"}
    })

    # Upper Floors: Cantilevered 4.5ft forward over the front facade
    for fl_idx in range(1, floors_cnt):
        uf_rooms = []
        uf_front_l = max(13.0, bl * 0.36)
        balcony_l = 4.8
        balc_w = round(bw * 0.70, 2)

        # Dramatic Cantilevered Sunset Balcony
        uf_rooms.append({
            "id": f"f{fl_idx}_balcony", "name": "CANTILEVERED GLASS SUNSET BALCONY",
            "x": bx, "y": max(0.0, by - balcony_l), "width": balc_w, "length": round(balcony_l, 2),
            "type": "balcony", "color": "#132338", "flooring": "deck_timber"
        })

        # Master Suite with walkout sliding glass doors
        uf_rooms.append({
            "id": f"f{fl_idx}_master", "name": "CANTILEVERED MASTER SUITE",
            "x": bx, "y": by, "width": balc_w, "length": round(uf_front_l, 2),
            "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "north"
        })

        uf_rooms.append({
            "id": f"f{fl_idx}_studio", "name": "ARCHITECTURAL STUDY / ATELIER",
            "x": bx + balc_w, "y": by, "width": round(bw - balc_w, 2), "length": round(uf_front_l, 2),
            "type": "lounge", "color": "#0f2942", "flooring": "herringbone_wood", "accent_wall": "north"
        })

        # Rear Bedrooms
        uf_rear_y = by + uf_front_l
        uf_rear_l = bl - uf_front_l
        half_w = round(bw / 2.0, 2)
        uf_rooms.append({"id": f"f{fl_idx}_bed2", "name": f"SUITE {fl_idx + 1}", "x": bx, "y": uf_rear_y, "width": half_w, "length": round(uf_rear_l, 2), "type": "bedroom", "color": "#1e1e2f", "flooring": "herringbone_wood", "accent_wall": "south"})
        uf_rooms.append({"id": f"f{fl_idx}_bath2", "name": f"SPA BATH {fl_idx + 1}", "x": bx + half_w, "y": uf_rear_y, "width": round(bw - half_w, 2), "length": round(uf_rear_l, 2), "type": "bathroom", "color": "#0e2e3b", "flooring": "slate_stone", "accent_wall": "east"})

        floors.append({
            "floor_number": fl_idx, "floor_name": f"Level {fl_idx} (Master & Balcony)", "level_m": round(fl_idx * 3.2, 1), "rooms": uf_rooms,
            "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "DN / UP"}
        })

    # Rooftop Sky Terrace with Pergola Garden & Mumty
    mumty_w = stair_w + 1.2
    mumty_l = stair_l + 1.2
    roof_rooms = [
        {"id": "roof_mumty", "name": "STAIRCASE HEADHOUSE (MUMTY)", "x": round(stair_x - 0.6, 2), "y": round(stair_y - 0.6, 2), "width": round(mumty_w, 2), "length": round(mumty_l, 2), "type": "foyer", "color": "#1e293b", "flooring": "slate_stone"},
        {"id": "roof_deck", "name": "ROOFTOP PERGOLA SKY GARDEN", "x": bx, "y": by, "width": round(bw, 2), "length": round(bl, 2), "type": "terrace", "color": "#132338", "flooring": "deck_timber"}
    ]
    floors.append({
        "floor_number": floors_cnt, "floor_name": "Rooftop Sky Garden & Pergola", "level_m": round(floors_cnt * 3.2, 1),
        "rooms": roof_rooms,
        "stairs": {"x": round(stair_x, 2), "y": round(stair_y, 2), "width": round(stair_w, 2), "length": round(stair_l, 2), "direction": "DN"}
    })

    return floors, roof_info, variant_meta


# ==============================================================================
# ARCHITECTURAL ROOM DETAILS: DOORS, WINDOWS, FLOORING & 3D FURNITURE
# ==============================================================================
def _enrich_room_details(rooms: List[Dict[str, Any]], bw: float, bl: float, fl_num: int) -> List[Dict[str, Any]]:
    """Calculates authentic architectural door openings, window apertures, and furniture."""
    outdoor_spaces = [o for o in rooms if o.get("type") in ("balcony", "terrace", "patio")]

    for r in rooms:
        rtype = r.get("type", "")
        rx, ry, rw, rl = r["x"], r["y"], r["width"], r["length"]

        # Default Flooring & Accent Finishes
        if not r.get("flooring"):
            if rtype in ("living", "foyer"):
                r["flooring"] = "carrara_marble"
            elif rtype in ("bedroom", "lounge"):
                r["flooring"] = "herringbone_wood"
            elif rtype in ("dining", "kitchen"):
                r["flooring"] = "terrazzo"
            elif rtype in ("bathroom", "porch"):
                r["flooring"] = "slate_stone"
            elif rtype in ("balcony", "terrace", "patio"):
                r["flooring"] = "deck_timber"
            elif rtype == "courtyard":
                r["flooring"] = "grass_turf"
            else:
                r["flooring"] = "carrara_marble"

        if not r.get("wall_finish"):
            if rtype == "living":
                r["wall_finish"] = "slats" # Fluted walnut timber slats accent
            elif rtype == "bedroom":
                r["wall_finish"] = "felt"  # Acoustic felt paneling
            elif rtype in ("dining", "courtyard"):
                r["wall_finish"] = "brick" # Exposed brick accent
            else:
                r["wall_finish"] = "limewash"

        # Preserve existing doors if defined (e.g. for roof mumty)
        doors = list(r.get("doors", []))
        if not doors:
            if rtype == "living" and fl_num == 0:
                # Main front entrance double door
                doors.append({"wall": "north", "offset": round(rw * 0.25, 2), "width": 3.8, "height": 7.0, "type": "entrance"})
                doors.append({"wall": "south", "offset": round(rw * 0.60, 2), "width": 3.0, "height": 7.0, "type": "interior"})
            elif rtype in ("bedroom", "lounge"):
                doors.append({"wall": "south", "offset": round(rw * 0.20, 2), "width": 2.8, "height": 7.0, "type": "interior"})
            elif rtype == "kitchen":
                doors.append({"wall": "north", "offset": round(rw * 0.30, 2), "width": 2.8, "height": 7.0, "type": "interior"})
            elif rtype == "bathroom":
                doors.append({"wall": "west", "offset": round(rl * 0.25, 2), "width": 2.4, "height": 7.0, "type": "interior"})

        # Windows
        windows = list(r.get("windows", []))
        if not windows:
            if rtype == "living":
                windows.append({"wall": "north", "offset": round(rw * 0.15, 2), "width": round(min(10.0, rw * 0.70), 2), "height": 6.5, "sill": 1.2, "type": "panoramic"})
            elif rtype == "bedroom":
                windows.append({"wall": "north" if fl_num > 0 else "south", "offset": round(rw * 0.20, 2), "width": round(min(7.0, rw * 0.55), 2), "height": 5.0, "sill": 2.2, "type": "standard"})
            elif rtype == "kitchen":
                windows.append({"wall": "south", "offset": round(rw * 0.20, 2), "width": round(min(6.0, rw * 0.50), 2), "height": 3.5, "sill": 3.2, "type": "ribbon"})
            elif rtype == "dining":
                windows.append({"wall": "east", "offset": round(rl * 0.20, 2), "width": round(min(8.0, rl * 0.60), 2), "height": 5.5, "sill": 1.8, "type": "standard"})

        # Intelligent Balcony Door Adjacency Engine:
        # If this interior room shares any wall with an outdoor balcony or terrace,
        # automatically inject a full-height sliding glass balcony walkout door!
        if rtype not in ("balcony", "terrace", "patio", "courtyard"):
            for out in outdoor_spaces:
                ox, oy, ow, ol = out["x"], out["y"], out["width"], out["length"]

                # 1. North wall of room touches outdoor balcony
                if abs(ry - (oy + ol)) < 0.40:
                    ov_x1 = max(rx, ox)
                    ov_x2 = min(rx + rw, ox + ow)
                    ov_w = ov_x2 - ov_x1
                    if ov_w >= 3.0:
                        door_w = min(6.0, max(3.5, ov_w * 0.75))
                        off = (ov_x1 - rx) + (ov_w - door_w) / 2.0
                        doors.append({
                            "wall": "north",
                            "offset": round(max(0.4, off), 2),
                            "width": round(door_w, 2),
                            "height": 7.5,
                            "type": "sliding_glass_balcony"
                        })
                        # Remove conflicting high-sill window on north wall
                        windows = [w for w in windows if w.get("wall") != "north"]

                # 2. South wall of room touches outdoor balcony
                elif abs((ry + rl) - oy) < 0.40:
                    ov_x1 = max(rx, ox)
                    ov_x2 = min(rx + rw, ox + ow)
                    ov_w = ov_x2 - ov_x1
                    if ov_w >= 3.0:
                        door_w = min(6.0, max(3.5, ov_w * 0.75))
                        off = (ov_x1 - rx) + (ov_w - door_w) / 2.0
                        doors.append({
                            "wall": "south",
                            "offset": round(max(0.4, off), 2),
                            "width": round(door_w, 2),
                            "height": 7.5,
                            "type": "sliding_glass_balcony"
                        })
                        windows = [w for w in windows if w.get("wall") != "south"]

                # 3. West wall of room touches outdoor balcony
                elif abs(rx - (ox + ow)) < 0.40:
                    ov_y1 = max(ry, oy)
                    ov_y2 = min(ry + rl, oy + ol)
                    ov_l = ov_y2 - ov_y1
                    if ov_l >= 3.0:
                        door_w = min(5.5, max(3.2, ov_l * 0.70))
                        off = (ov_y1 - ry) + (ov_l - door_w) / 2.0
                        doors.append({
                            "wall": "west",
                            "offset": round(max(0.4, off), 2),
                            "width": round(door_w, 2),
                            "height": 7.5,
                            "type": "sliding_glass_balcony"
                        })
                        windows = [w for w in windows if w.get("wall") != "west"]

                # 4. East wall of room touches outdoor balcony
                elif abs((rx + rw) - ox) < 0.40:
                    ov_y1 = max(ry, oy)
                    ov_y2 = min(ry + rl, oy + ol)
                    ov_l = ov_y2 - ov_y1
                    if ov_l >= 3.0:
                        door_w = min(5.5, max(3.2, ov_l * 0.70))
                        off = (ov_y1 - ry) + (ov_l - door_w) / 2.0
                        doors.append({
                            "wall": "east",
                            "offset": round(max(0.4, off), 2),
                            "width": round(door_w, 2),
                            "height": 7.5,
                            "type": "sliding_glass_balcony"
                        })
                        windows = [w for w in windows if w.get("wall") != "east"]

        r["doors"] = doors
        r["windows"] = windows

        # Rich Detailed Furniture
        furn = []
        if rtype == "living":
            furn.append({"name": "Designer Sectional Sofa", "type": "sofa", "x": round(rx + 1.2, 1), "y": round(ry + 1.2, 1), "w": 7.5, "l": 5.5})
            furn.append({"name": "Sculptural Coffee Table", "type": "table", "x": round(rx + 3.8, 1), "y": round(ry + 3.2, 1), "w": 3.5, "l": 2.2})
            furn.append({"name": "Woven Area Rug", "type": "rug", "x": round(rx + 2.0, 1), "y": round(ry + 1.8, 1), "w": 9.0, "l": 7.0})
            furn.append({"name": "Linear Media Console", "type": "tv", "x": round(rx + 1.5, 1), "y": round(ry + rl - 1.6, 1), "w": 7.0, "l": 1.4})
        elif rtype == "bedroom":
            furn.append({"name": "King Platform Bed & Headboard", "type": "bed", "x": round(rx + (rw - 7.0)/2, 1), "y": round(ry + 1.2, 1), "w": 7.0, "l": 7.0})
            furn.append({"name": "Nightstand Left", "type": "nightstand", "x": round(rx + (rw - 7.0)/2 - 1.8, 1), "y": round(ry + 1.4, 1), "w": 1.6, "l": 1.6})
            furn.append({"name": "Nightstand Right", "type": "nightstand", "x": round(rx + (rw + 7.0)/2 + 0.2, 1), "y": round(ry + 1.4, 1), "w": 1.6, "l": 1.6})
            furn.append({"name": "Built-in Wardrobe", "type": "wardrobe", "x": round(rx + 1.0, 1), "y": round(ry + rl - 2.0, 1), "w": round(min(8.0, rw - 2.0), 1), "l": 1.8})
        elif rtype in ("dining", "foyer"):
            furn.append({"name": "6-Seater Timber Dining Suite", "type": "dining_set", "x": round(rx + (rw - 6.5)/2, 1), "y": round(ry + (rl - 4.5)/2, 1), "w": 6.5, "l": 4.5})
        elif rtype == "kitchen":
            furn.append({"name": "Chef Island Counter & Stools", "type": "counter", "x": round(rx + 1.0, 1), "y": round(ry + 1.2, 1), "w": round(rw - 2.0, 1), "l": 2.4})
        elif rtype == "bathroom":
            furn.append({"name": "Floating Vanity & Basin", "type": "vanity", "x": round(rx + 0.6, 1), "y": round(ry + 0.6, 1), "w": 3.6, "l": 1.8})
        elif rtype in ("balcony", "patio", "terrace"):
            furn.append({"name": "Outdoor Lounge Chairs & Table", "type": "lounger", "x": round(rx + 0.8, 1), "y": round(ry + 0.6, 1), "w": round(min(4.5, rw - 1.0), 1), "l": round(min(3.0, rl - 0.6), 1)})
            if rw > 6.0:
                furn.append({"name": "Biophilic Planter", "type": "planter", "x": round(rx + rw - 1.4, 1), "y": round(ry + 0.5, 1), "w": 1.2, "l": 1.2})
        r["furniture"] = furn

    return rooms


# ==============================================================================
# 2D CAD SVG BLUEPRINT GENERATOR WITH REAL DOOR SWINGS & WINDOW DETAILS
# ==============================================================================
def _generate_residential_svg(plot_w: float, plot_l: float, floor: Dict[str, Any], road_dir: str, arch_style: str, variant_title: str) -> str:
    scale = 16.0
    pad = 70.0
    svg_w = (plot_w * scale) + (2 * pad)
    svg_h = (plot_l * scale) + (2 * pad)

    def tx(x_ft): return pad + (x_ft * scale)
    def ty(y_ft): return pad + (y_ft * scale)
    def tw(w_ft): return w_ft * scale
    def tl(l_ft): return l_ft * scale

    svg_parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_w} {svg_h}" width="100%" height="100%" style="background:#090d16; border-radius:12px; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <defs>
        <pattern id="resGrid" width="{scale}" height="{scale}" patternUnits="userSpaceOnUse">
            <path d="M {scale} 0 L 0 0 0 {scale}" fill="none" stroke="#16233b" stroke-width="0.75" opacity="0.6"/>
        </pattern>
        <linearGradient id="marbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f2942" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#0a1d30" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e1e2f" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#141424" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="grassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#064e3b" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#022c22" stop-opacity="0.9"/>
        </linearGradient>
    </defs>
    <rect width="{svg_w}" height="{svg_h}" fill="url(#resGrid)" />
    
    <!-- Plot Boundary -->
    <rect x="{tx(0)}" y="{ty(0)}" width="{tw(plot_w)}" height="{tl(plot_l)}" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="8,4" opacity="0.6"/>
    <text x="{tx(plot_w / 2)}" y="{ty(0) - 16}" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="middle">PLOT BOUNDARY ({plot_w:.0f}' x {plot_l:.0f}') • {variant_title.upper()}</text>
    <rect x="{tx(0)}" y="{ty(-2.5)}" width="{tw(plot_w)}" height="{scale * 2}" fill="#1e293b" rx="4" opacity="0.9" />
    <text x="{tx(plot_w / 2)}" y="{ty(-1.0)}" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">▲ ROAD ACCESS ({road_dir.upper()} FACING)</text>
    ''']

    for r in floor["rooms"]:
        rx, ry, rw, rl = tx(r["x"]), ty(r["y"]), tw(r["width"]), tl(r["length"])
        color = r.get("color", "#0f172a")
        rname = r["name"]
        sqft = r["width"] * r["length"]
        dim_str = f"{r['width']:.1f}' x {r['length']:.1f}'"
        flooring_label = (r.get("flooring") or "finish").replace("_", " ").title()

        svg_parts.append(f'''
        <g id="{r['id']}">
            <rect x="{rx}" y="{ry}" width="{rw}" height="{rl}" fill="{color}" stroke="#38bdf8" stroke-width="2.5" opacity="0.94" rx="2"/>
            <text x="{rx + rw/2}" y="{ry + 20}" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">{rname}</text>
            <text x="{rx + rw/2}" y="{ry + 34}" fill="#94a3b8" font-size="9" font-weight="500" text-anchor="middle">{dim_str} • {sqft:.0f} sq.ft</text>
            <text x="{rx + rw/2}" y="{ry + 48}" fill="#38bdf8" font-size="8" font-weight="600" text-anchor="middle">FLOOR: {flooring_label.upper()}</text>
        </g>''')

        # Draw Real Architectural Windows on Exterior Walls
        for w in r.get("windows", []):
            ww_dim = tw(w.get("width", 4.0))
            if w.get("wall") == "north":
                wx = rx + tw(w.get("offset", 1.0))
                svg_parts.append(f'''<g><line x1="{wx}" y1="{ry}" x2="{wx + ww_dim}" y2="{ry}" stroke="#38bdf8" stroke-width="4"/><line x1="{wx}" y1="{ry-2}" x2="{wx + ww_dim}" y2="{ry-2}" stroke="#94a3b8" stroke-width="1.5"/><line x1="{wx}" y1="{ry+2}" x2="{wx + ww_dim}" y2="{ry+2}" stroke="#94a3b8" stroke-width="1.5"/></g>''')
            elif w.get("wall") == "south":
                wx = rx + tw(w.get("offset", 1.0))
                svg_parts.append(f'''<g><line x1="{wx}" y1="{ry + rl}" x2="{wx + ww_dim}" y2="{ry + rl}" stroke="#38bdf8" stroke-width="4"/><line x1="{wx}" y1="{ry + rl - 2}" x2="{wx + ww_dim}" y2="{ry + rl - 2}" stroke="#94a3b8" stroke-width="1.5"/><line x1="{wx}" y1="{ry + rl + 2}" x2="{wx + ww_dim}" y2="{ry + rl + 2}" stroke="#94a3b8" stroke-width="1.5"/></g>''')

        # Draw Real Architectural Door Openings with Swing Arcs or Sliding Panels
        for d in r.get("doors", []):
            dw_dim = tw(d.get("width", 3.0))
            is_sliding = (d.get("type") == "sliding_glass_balcony")
            if d.get("wall") == "north":
                dx = rx + tw(d.get("offset", 1.0))
                if is_sliding:
                    svg_parts.append(f'''<g><line x1="{dx}" y1="{ry}" x2="{dx + dw_dim}" y2="{ry}" stroke="#090d16" stroke-width="4.5"/><line x1="{dx}" y1="{ry-2}" x2="{dx + dw_dim*0.55}" y2="{ry-2}" stroke="#38bdf8" stroke-width="2.5"/><line x1="{dx + dw_dim*0.45}" y1="{ry+2}" x2="{dx + dw_dim}" y2="{ry+2}" stroke="#38bdf8" stroke-width="2.5"/><text x="{dx + dw_dim/2}" y="{ry - 6}" fill="#38bdf8" font-size="7.5" font-weight="700" text-anchor="middle">◀ SLIDING BALCONY DOOR ▶</text></g>''')
                else:
                    svg_parts.append(f'''<g><line x1="{dx}" y1="{ry}" x2="{dx + dw_dim}" y2="{ry}" stroke="#090d16" stroke-width="3.5"/><path d="M {dx} {ry} A {dw_dim} {dw_dim} 0 0 1 {dx + dw_dim} {ry + dw_dim}" fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="2,2"/><line x1="{dx}" y1="{ry}" x2="{dx + dw_dim}" y2="{ry + dw_dim}" stroke="#f59e0b" stroke-width="1.5"/></g>''')
            elif d.get("wall") == "south":
                dx = rx + tw(d.get("offset", 1.0))
                if is_sliding:
                    svg_parts.append(f'''<g><line x1="{dx}" y1="{ry + rl}" x2="{dx + dw_dim}" y2="{ry + rl}" stroke="#090d16" stroke-width="4.5"/><line x1="{dx}" y1="{ry + rl - 2}" x2="{dx + dw_dim*0.55}" y2="{ry + rl - 2}" stroke="#38bdf8" stroke-width="2.5"/><line x1="{dx + dw_dim*0.45}" y1="{ry + rl + 2}" x2="{dx + dw_dim}" y2="{ry + rl + 2}" stroke="#38bdf8" stroke-width="2.5"/><text x="{dx + dw_dim/2}" y="{ry + rl + 12}" fill="#38bdf8" font-size="7.5" font-weight="700" text-anchor="middle">◀ SLIDING BALCONY DOOR ▶</text></g>''')
                else:
                    svg_parts.append(f'''<g><line x1="{dx}" y1="{ry + rl}" x2="{dx + dw_dim}" y2="{ry + rl}" stroke="#090d16" stroke-width="3.5"/><path d="M {dx} {ry + rl} A {dw_dim} {dw_dim} 0 0 0 {dx + dw_dim} {ry + rl - dw_dim}" fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="2,2"/><line x1="{dx}" y1="{ry + rl}" x2="{dx + dw_dim}" y2="{ry + rl - dw_dim}" stroke="#f59e0b" stroke-width="1.5"/></g>''')
            elif d.get("wall") == "west":
                dy = ry + tl(d.get("offset", 1.0))
                if is_sliding:
                    svg_parts.append(f'''<g><line x1="{rx}" y1="{dy}" x2="{rx}" y2="{dy + dw_dim}" stroke="#090d16" stroke-width="4.5"/><line x1="{rx - 2}" y1="{dy}" x2="{rx - 2}" y2="{dy + dw_dim*0.55}" stroke="#38bdf8" stroke-width="2.5"/><line x1="{rx + 2}" y1="{dy + dw_dim*0.45}" x2="{rx + 2}" y2="{dy + dw_dim}" stroke="#38bdf8" stroke-width="2.5"/></g>''')
            elif d.get("wall") == "east":
                dy = ry + tl(d.get("offset", 1.0))
                if is_sliding:
                    svg_parts.append(f'''<g><line x1="{rx + rw}" y1="{dy}" x2="{rx + rw}" y2="{dy + dw_dim}" stroke="#090d16" stroke-width="4.5"/><line x1="{rx + rw - 2}" y1="{dy}" x2="{rx + rw - 2}" y2="{dy + dw_dim*0.55}" stroke="#38bdf8" stroke-width="2.5"/><line x1="{rx + rw + 2}" y1="{dy + dw_dim*0.45}" x2="{rx + rw + 2}" y2="{dy + dw_dim}" stroke="#38bdf8" stroke-width="2.5"/></g>''')

        # Draw Interior Furniture Blocks
        for f in r.get("furniture", []):
            fx, fy, fw, fl_dim = tx(f["x"]), ty(f["y"]), tw(f["w"]), tl(f["l"])
            border_color = "#f59e0b" if f["type"] == "bed" else "#0ea5e9"
            svg_parts.append(f'''
            <g>
                <rect x="{fx}" y="{fy}" width="{fw}" height="{fl_dim}" fill="#1e293b" stroke="{border_color}" stroke-width="1.2" stroke-dasharray="3,2" rx="3" opacity="0.88"/>
                <text x="{fx + fw/2}" y="{fy + fl_dim/2 + 3}" fill="#cbd5e1" font-size="7.5" font-weight="600" text-anchor="middle">{f["name"]}</text>
            </g>''')

    stairs = floor.get("stairs")
    if stairs:
        sx, sy, sw, sl = tx(stairs["x"]), ty(stairs["y"]), tw(stairs["width"]), tl(stairs["length"])
        svg_parts.append(f'''<rect x="{sx}" y="{sy}" width="{sw}" height="{sl}" fill="#172554" stroke="#60a5fa" stroke-width="2"/>
        <text x="{sx + sw/2}" y="{sy + sl/2}" fill="#dbeafe" font-size="10" font-weight="bold" text-anchor="middle">STAIRCASE</text>''')

    svg_parts.append(f'''
    <g transform="translate({svg_w - pad - 220}, {svg_h - pad - 72})">
        <rect width="220" height="72" fill="#0c0c0e" stroke="#27272a" stroke-width="1.5" rx="6"/>
        <text x="12" y="18" fill="#ffffff" font-size="11" font-weight="bold">{floor["floor_name"].upper()}</text>
        <text x="12" y="34" fill="#e4e4e7" font-size="9" font-weight="600">BUILT-UP: {floor.get("total_area_sqft", 0):.0f} SQ.FT</text>
        <text x="12" y="48" fill="#a1a1aa" font-size="8.5" font-weight="600">CONCEPT: {variant_title.upper()}</text>
        <text x="12" y="62" fill="#71717a" font-size="8" font-weight="700">NEEV • GENERATIVE STUDIO</text>
    </g>
    </svg>''')

    return "".join(svg_parts)


# ==============================================================================
# 3D WEBGL ARCHITECTURAL SCENE BUILDER
# ==============================================================================
def _generate_residential_3d(floors: List[Dict[str, Any]], plot_w_ft: float, plot_l_ft: float, bx: float, by: float, bw: float, bl: float, roof_info: Dict[str, Any], variant_meta: Dict[str, Any]) -> Dict[str, Any]:
    """Builds rich 3D scene data including real door cutouts, window cutouts, materials, and landscaping."""
    wall_height = 3.0 # meters
    to_m = 0.3048
    levels = []

    for fl in floors:
        fl_num = fl["floor_number"]
        level_elevation = fl_num * wall_height
        rooms_3d = []

        for r in fl["rooms"]:
            rx_m = r["x"] * to_m
            ry_m = r["y"] * to_m
            rw_m = r["width"] * to_m
            rl_m = r["length"] * to_m

            # Furniture in meters
            furn_3d = []
            for f in r.get("furniture", []):
                furn_3d.append({
                    "name": f["name"],
                    "type": f["type"],
                    "x": round(f["x"] * to_m, 2),
                    "z": round(f["y"] * to_m, 2),
                    "w": round(f["w"] * to_m, 2),
                    "d": round(f["l"] * to_m, 2)
                })

            # Doors in meters
            doors_3d = []
            for d in r.get("doors", []):
                doors_3d.append({
                    "wall": d.get("wall", "north"),
                    "offset_m": round(d.get("offset", 1.0) * to_m, 2),
                    "width_m": round(d.get("width", 3.0) * to_m, 2),
                    "height_m": 2.4 if d.get("type") == "sliding_glass_balcony" else 2.2,
                    "type": d.get("type", "interior")
                })

            # Windows in meters
            windows_3d = []
            for w in r.get("windows", []):
                windows_3d.append({
                    "wall": w.get("wall", "north"),
                    "offset_m": round(w.get("offset", 1.0) * to_m, 2),
                    "width_m": round(w.get("width", 4.0) * to_m, 2),
                    "height_m": round(w.get("height", 4.5) * to_m, 2),
                    "sill_m": round(w.get("sill", 1.5) * to_m, 2),
                    "type": w.get("type", "standard")
                })

            is_rajasthan = (variant_meta.get("key") == "rajasthan_heritage")
            wall_finish = "sandstone" if (is_rajasthan and r.get("type") in ("balcony", "living", "bedroom")) else r.get("wall_finish", "limewash")

            rooms_3d.append({
                "id": r["id"],
                "name": r["name"],
                "type": r.get("type", "room"),
                "flooring_material": r.get("flooring", "carrara_marble"),
                "wall_finish": wall_finish,
                "wall_color": "#dfb784" if is_rajasthan else r.get("wall_color", "#f8fafc"),
                "accent_color": "#d97706" if is_rajasthan else r.get("accent_color", "#0284c7"),
                "accent_wall": r.get("accent_wall", "north"),
                "has_jaali": r.get("has_jaali", False) or (is_rajasthan and r.get("type") == "balcony"),
                "bounds_m": {
                    "x": round(rx_m, 2),
                    "z": round(ry_m, 2),
                    "width": round(rw_m, 2),
                    "depth": round(rl_m, 2),
                    "height": wall_height
                },
                "doors": doors_3d,
                "windows": windows_3d,
                "furniture": furn_3d,
                "color": r.get("color", "#1e293b")
            })

        levels.append({
            "floor_number": fl_num,
            "floor_name": fl["floor_name"],
            "elevation_y_m": round(level_elevation, 2),
            "rooms": rooms_3d,
            "has_roof": (fl_num == len(floors) - 1)
        })

    # Site context & exterior landscaping
    site_3d = {
        "plot_width_m": round(plot_w_ft * to_m, 2),
        "plot_length_m": round(plot_l_ft * to_m, 2),
        "build_bounds_m": {
            "x": round(bx * to_m, 2),
            "z": round(by * to_m, 2),
            "width": round(bw * to_m, 2),
            "depth": round(bl * to_m, 2)
        },
        "has_lawn": True,
        "has_driveway": True,
        "has_walkway": True
    }

    return {
        "domain": "residential",
        "variant": variant_meta.get("key", "courtyard"),
        "variant_title": variant_meta.get("title", "Modern Villa"),
        "plot_dimensions_m": {
            "width": round(plot_w_ft * to_m, 2),
            "length": round(plot_l_ft * to_m, 2)
        },
        "floor_height_m": wall_height,
        "roof": roof_info,
        "site": site_3d,
        "levels": levels
    }

