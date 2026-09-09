"""
Universal BOQ Estimator & Civil Engineering Quantity Calculator
Supports:
1. Civil Infrastructure: Bridges & Flyovers
2. Transportation: Roads & Highways
3. Commercial: Shopping Malls & Complexes
4. Residential: Houses, Villas & Apartments
"""

from typing import Dict, Any, List
from layout_engine import detect_category


def estimate_boq(project_data: Dict[str, Any], floor_plans: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Polymorphic entry point for Civil & Architectural BOQ."""
    category = detect_category(project_data)

    if category == "bridge":
        return _estimate_bridge_boq(project_data)
    elif category == "road":
        return _estimate_road_boq(project_data)
    elif category == "mall":
        return _estimate_mall_boq(project_data, floor_plans)
    else:
        return _estimate_residential_boq(project_data, floor_plans)


# ==============================================================================
# 1. BRIDGE INFRASTRUCTURE BOQ
# ==============================================================================
def _estimate_bridge_boq(project_data: Dict[str, Any]) -> Dict[str, Any]:
    span_m = float(project_data.get("plot_length") or 120.0)
    width_m = float(project_data.get("plot_width") or 16.0)
    piers_count = max(2, min(8, int(span_m // 30)))
    deck_area_sqm = span_m * width_m

    # Concrete Volumes (High-Grade M40/M50)
    # - Piers & Pile caps: ~180 m3 per pier
    # - Abutments: ~250 m3 each (2 abutments)
    # - Deck Slab: deck_area * 0.35m thickness
    concrete_piers_cum = piers_count * 180.0
    concrete_abutments_cum = 2 * 250.0
    concrete_deck_cum = deck_area_sqm * 0.35
    total_concrete_cum = round(concrete_piers_cum + concrete_abutments_cum + concrete_deck_cum, 1)

    # Cement requirement for M40/M50 (approx 8.5 bags per cubic meter)
    cement_bags = int(round(total_concrete_cum * 8.5))

    # Structural Steel Girders & High-Tensile Cables
    # - Steel rebar (130 kg / m3 concrete)
    steel_rebar_mt = round((total_concrete_cum * 130.0) / 1000.0, 1)
    # - Structural Steel Girders / Box Sections / Cables (~120 kg / sqm of deck)
    structural_steel_mt = round((deck_area_sqm * 120.0) / 1000.0, 1)

    # Asphalt Pavement for Deck (75mm mastic asphalt + wearing coat)
    deck_asphalt_tons = round(deck_area_sqm * 0.075 * 2.4, 1) # 2.4 tons/m3

    # Bridge Bearings & Expansion Joints
    elastomeric_bearings = piers_count * 8
    expansion_joints_m = round(width_m * 2, 1)
    crash_barrier_m = round(span_m * 2, 1) # both sides

    # Lighting & Safety
    bridge_lighting_poles = int(span_m / 25.0) * 2

    # Cost Calculation (USD benchmark)
    cost_concrete = round(total_concrete_cum * 140.0)
    cost_steel = round((steel_rebar_mt + structural_steel_mt) * 1100.0)
    cost_asphalt = round(deck_asphalt_tons * 115.0)
    cost_bearings_joints = round((elastomeric_bearings * 650.0) + (expansion_joints_m * 450.0))
    cost_barriers_lighting = round((crash_barrier_m * 120.0) + (bridge_lighting_poles * 850.0))
    cost_piling_civil_labor = round(total_concrete_cum * 180.0)

    total_cost = (cost_concrete + cost_steel + cost_asphalt + 
                  cost_bearings_joints + cost_barriers_lighting + cost_piling_civil_labor)

    return {
        "domain": "bridge",
        "project_metrics": {
            "span_length_m": span_m,
            "deck_width_m": width_m,
            "deck_area_sqm": round(deck_area_sqm, 1),
            "piers_count": piers_count,
            "clearance_height_m": 12.0,
            "estimated_completion_months": 18
        },
        "civil_materials": {
            "high_grade_concrete_cum": total_concrete_cum,
            "cement": {"total_bags": cement_bags, "total_metric_tons": round(cement_bags * 0.05, 1)},
            "steel_rebar": {"total_metric_tons": steel_rebar_mt, "total_kg": round(steel_rebar_mt * 1000)},
            "structural_steel_girders_mt": structural_steel_mt,
            "deck_asphalt_metric_tons": deck_asphalt_tons,
            "elastomeric_bearings_units": elastomeric_bearings,
            "modular_expansion_joints_m": expansion_joints_m,
            "crash_barriers_linear_m": crash_barrier_m
        },
        "electrical_system": {
            "bridge_lighting_poles": bridge_lighting_poles,
            "total_electrical_wire_meters": round(span_m * 4.5, 1),
            "total_electrical_wire_feet": round(span_m * 4.5 * 3.28084, 1),
            "aviation_marine_nav_beacons": 4
        },
        "plumbing_system": {
            "total_pipeline_length_meters": round(span_m * 2.2, 1), # deck drainage scuppers
            "total_pipeline_length_feet": round(span_m * 2.2 * 3.28084, 1),
            "drainage_pvc_pipelines_meters": round(span_m * 2.2, 1),
            "freshwater_cpvc_pipelines_meters": 0.0
        },
        "cost_estimation": {
            "currency": "USD",
            "total_estimated_cost": int(total_cost),
            "cost_in_inr_equivalent": int(total_cost * 84),
            "materials_total": int(cost_concrete + cost_steel + cost_asphalt + cost_bearings_joints + cost_barriers_lighting),
            "labor_total": int(cost_piling_civil_labor),
            "itemized": [
                {"item": "High-Performance Concrete (M40/M50 Piers, Abutments, Deck)", "qty": f"{total_concrete_cum} m³ ({cement_bags:,} Cement Bags)", "cost": int(cost_concrete)},
                {"item": "Structural Steel Girders & TMT Rebar Reinforcement", "qty": f"{steel_rebar_mt + structural_steel_mt:.1f} Metric Tons", "cost": int(cost_steel)},
                {"item": "Bridge Deck Asphalt Pavement (Wearing Surface)", "qty": f"{deck_asphalt_tons} Metric Tons", "cost": int(cost_asphalt)},
                {"item": "Elastomeric Pot Bearings & Modular Expansion Joints", "qty": f"{elastomeric_bearings} Bearings • {expansion_joints_m}m Joints", "cost": int(cost_bearings_joints)},
                {"item": "Crash Barriers & Bridge Highway Lighting", "qty": f"{crash_barrier_m}m Barrier • {bridge_lighting_poles} Poles", "cost": int(cost_barriers_lighting)},
                {"item": "Deep Pile Foundation & Civil Engineering Labor", "qty": f"{piers_count} River Piers • 2 Abutments", "cost": int(cost_piling_civil_labor)}
            ]
        },
        "timeline": {
            "total_duration_weeks": 72,
            "phases": [
                {"phase": 1, "title": "Geotechnical Survey & Riverbed Soil Testing", "duration_weeks": 6, "description": "Bathymetric survey, borehole soil mechanics, river flow modeling."},
                {"phase": 2, "title": "Cofferdam & Deep Pile Foundations", "duration_weeks": 16, "description": "Driving deep bored cast-in-situ piles, pile caps below water level."},
                {"phase": 3, "title": "RCC Pier Columns & Abutment Casting", "duration_weeks": 14, "description": "Formwork and casting of high-strength M50 reinforced concrete piers."},
                {"phase": 4, "title": "Girder Fabrication & Launching", "duration_weeks": 16, "description": "Precast prestressed concrete girders or structural steel girder erection."},
                {"phase": 5, "title": "Deck Slab Casting & Cable Stay Tensioning", "duration_weeks": 10, "description": "Casting reinforced deck slab, tensioning stay cables."},
                {"phase": 6, "title": "Expansion Joints, Asphalt & Handover", "duration_weeks": 10, "description": "Deck waterproofing, mastic asphalt, crash barriers, lighting."}
            ]
        }
    }


# ==============================================================================
# 2. ROAD / HIGHWAY INFRASTRUCTURE BOQ
# ==============================================================================
def _estimate_road_boq(project_data: Dict[str, Any]) -> Dict[str, Any]:
    length_km = float(project_data.get("plot_length") or 5.0)
    lanes = max(2, int(project_data.get("floors") or 4))
    lane_w = 3.5
    median_w = 2.5
    total_w = (lanes * lane_w) + median_w + 4.0
    length_m = length_km * 1000.0
    pavement_area_sqm = length_m * total_w

    # Earthwork & Sub-base
    earthwork_cum = round(pavement_area_sqm * 0.60, 1) # 600mm excavation/embankment
    gsb_aggregate_mt = round(pavement_area_sqm * 0.15 * 2.2, 1) # 150mm GSB @ 2.2 t/m3
    wmm_base_mt = round(pavement_area_sqm * 0.15 * 2.3, 1) # 150mm WMM @ 2.3 t/m3

    # Bituminous Asphalt (DBM 75mm + BC 40mm = 115mm total)
    asphalt_mt = round(pavement_area_sqm * 0.115 * 2.4, 1)

    # Stormwater Concrete Culvert Pipelines (both sides)
    drainage_pipe_m = round(length_m * 2.0, 1)
    drainage_pipe_ft = round(drainage_pipe_m * 3.28084, 1)

    # Street Lighting & Electrical Cabling
    lighting_poles = int(length_m / 40.0) * 2 # poles every 40m on both sides
    cable_wire_m = round(length_m * 2.2, 1)
    cable_wire_ft = round(cable_wire_m * 3.28084, 1)

    # Road Safety & Markings
    guardrail_m = round(length_m * 2.0, 1)
    thermoplastic_paint_sqm = round(length_m * 0.8, 1)

    # Financial Cost Estimation
    cost_earthwork = round(earthwork_cum * 8.5)
    cost_aggregates = round((gsb_aggregate_mt + wmm_base_mt) * 18.0)
    cost_asphalt = round(asphalt_mt * 85.0)
    cost_drainage = round(drainage_pipe_m * 65.0)
    cost_lighting_cabling = round((lighting_poles * 650.0) + (cable_wire_m * 12.0))
    cost_guardrail_markings = round((guardrail_m * 45.0) + (thermoplastic_paint_sqm * 22.0))
    cost_paving_labor = round(pavement_area_sqm * 12.0)

    total_cost = (cost_earthwork + cost_aggregates + cost_asphalt + 
                  cost_drainage + cost_lighting_cabling + cost_guardrail_markings + cost_paving_labor)

    return {
        "domain": "road",
        "project_metrics": {
            "road_length_km": length_km,
            "road_length_m": length_m,
            "lanes_count": lanes,
            "carriageway_width_m": total_w,
            "pavement_area_sqm": round(pavement_area_sqm, 1),
            "estimated_completion_months": round(length_km * 2.2, 1)
        },
        "civil_materials": {
            "earthwork_excavation_cum": earthwork_cum,
            "granular_subbase_gsb_mt": gsb_aggregate_mt,
            "wet_mix_macadam_wmm_mt": wmm_base_mt,
            "asphalt_bitumen_metric_tons": asphalt_mt,
            "concrete_drainage_culverts_m": drainage_pipe_m,
            "w_beam_guardrails_m": guardrail_m,
            "thermoplastic_markings_sqm": thermoplastic_paint_sqm
        },
        "electrical_system": {
            "highway_streetlights_count": lighting_poles,
            "total_electrical_wire_meters": cable_wire_m,
            "total_electrical_wire_feet": cable_wire_ft,
            "high_mast_interchange_lighting": max(2, int(length_km))
        },
        "plumbing_system": {
            "total_pipeline_length_meters": drainage_pipe_m,
            "total_pipeline_length_feet": drainage_pipe_ft,
            "drainage_pvc_pipelines_meters": drainage_pipe_m,
            "catch_basin_chambers_count": int(length_m / 60.0) * 2
        },
        "cost_estimation": {
            "currency": "USD",
            "total_estimated_cost": int(total_cost),
            "cost_in_inr_equivalent": int(total_cost * 84),
            "materials_total": int(cost_earthwork + cost_aggregates + cost_asphalt + cost_drainage + cost_lighting_cabling + cost_guardrail_markings),
            "labor_total": int(cost_paving_labor),
            "itemized": [
                {"item": "Earthwork & Subgrade Compaction (Cut & Fill)", "qty": f"{earthwork_cum:,} m³", "cost": int(cost_earthwork)},
                {"item": "Granular Sub-Base (GSB) & WMM Aggregate Base", "qty": f"{gsb_aggregate_mt + wmm_base_mt:,.0f} Metric Tons", "cost": int(cost_aggregates)},
                {"item": "Bituminous Asphalt Pavement (DBM + Asphalt Concrete)", "qty": f"{asphalt_mt:,.0f} Metric Tons", "cost": int(cost_asphalt)},
                {"item": "Stormwater Drainage Concrete Culverts & Catch Basins", "qty": f"{drainage_pipe_m:,.0f} Linear Meters ({drainage_pipe_ft:,.0f} ft)", "cost": int(cost_drainage)},
                {"item": "Highway Lighting & 3-Phase Underground Power Cabling", "qty": f"{lighting_poles} Poles • {cable_wire_m:,.0f}m Cable", "cost": int(cost_lighting_cabling)},
                {"item": "Galvanized W-Beam Crash Barriers & Thermoplastic Markings", "qty": f"{guardrail_m:,.0f}m Guardrails", "cost": int(cost_guardrail_markings)},
                {"item": "Heavy Machinery Paving & Civil Construction Labor", "qty": f"{pavement_area_sqm:,.0f} m² Paving Area", "cost": int(cost_paving_labor)}
            ]
        },
        "timeline": {
            "total_duration_weeks": int(round(length_km * 8)),
            "phases": [
                {"phase": 1, "title": "Topographical Survey & Centerline Alignment", "duration_weeks": 4, "description": "Surveying, soil CBR testing, establishing benchmark pillars."},
                {"phase": 2, "title": "Earthwork, Clearing & Grubbing", "duration_weeks": int(round(length_km * 2)), "description": "Stripping topsoil, embankment cut & fill, subgrade compaction."},
                {"phase": 3, "title": "Sub-Base & Base Course Laying", "duration_weeks": int(round(length_km * 2)), "description": "Spreading GSB (150mm) and Wet Mix Macadam with vibratory rollers."},
                {"phase": 4, "title": "Stormwater Culverts & Drainage Channels", "duration_weeks": int(round(length_km * 1.5)), "description": "Laying precast concrete pipe culverts and road cross-drains."},
                {"phase": 5, "title": "Bituminous Asphalt Paving", "duration_weeks": int(round(length_km * 2)), "description": "Laying DBM binder course and high-friction asphalt wearing course."},
                {"phase": 6, "title": "Signage, Road Markings & Lighting Commissioning", "duration_weeks": 3, "description": "Thermoplastic paint, reflective studs, streetlights, and final testing."}
            ]
        }
    }


# ==============================================================================
# 3. COMMERCIAL SHOPPING MALL BOQ
# ==============================================================================
def _estimate_mall_boq(project_data: Dict[str, Any], floor_plans: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    plot_w = float(project_data.get("plot_width") or 140.0)
    plot_l = float(project_data.get("plot_length") or 220.0)
    floors = max(2, int(project_data.get("floors") or 3))

    footprint_sqft = plot_w * plot_l
    total_builtup_sqft = round(footprint_sqft * 0.78 * floors, 1)
    carpet_area_sqft = round(total_builtup_sqft * 0.72, 1)

    # Structural Materials
    cement_bags = int(round(total_builtup_sqft * 0.48))
    steel_rebar_mt = round((total_builtup_sqft * 4.6) / 1000.0, 1)
    structural_steel_atrium_mt = round(floors * 45.0, 1) # Atrium roof trusses

    # Commercial MEP (Electrical, HVAC, Fire Sprinklers, Plumbing)
    # - Commercial 3-phase cabling (heavy loads for chillers, retail power, lighting):
    wire_meters = round(total_builtup_sqft * 0.95, 1)
    wire_feet = round(wire_meters * 3.28084, 1)
    # - Fire Sprinkler Pipeline Network (NFPA standard):
    sprinkler_pipe_meters = round(total_builtup_sqft * 0.18, 1)
    # - Domestic & Commercial Public Restroom Plumbing:
    public_restroom_pipe_meters = round(floors * 180.0, 1)
    total_pipe_meters = round(sprinkler_pipe_meters + public_restroom_pipe_meters, 1)
    total_pipe_feet = round(total_pipe_meters * 3.28084, 1)

    # Commercial Equipment
    escalators_count = (floors - 1) * 2
    elevators_count = max(4, floors * 2)
    hvac_tons = round(total_builtup_sqft / 350.0) # ~350 sqft per TR

    # Cost Calculation
    cost_civil = round(total_builtup_sqft * 26.0)
    cost_atrium_steel_glass = round(floors * 95000.0)
    cost_hvac = round(hvac_tons * 850.0)
    cost_electrical = round(wire_meters * 6.5 + (floors * 35000)) # with transformers/panels
    cost_fire_plumbing = round((total_pipe_meters * 18.0) + (floors * 25000))
    cost_escalators_elevators = round((escalators_count * 45000) + (elevators_count * 35000))
    cost_finishes_tiles = round(total_builtup_sqft * 12.0)
    cost_labor = round(total_builtup_sqft * 22.0)

    total_cost = (cost_civil + cost_atrium_steel_glass + cost_hvac + 
                  cost_electrical + cost_fire_plumbing + cost_escalators_elevators + 
                  cost_finishes_tiles + cost_labor)

    return {
        "domain": "mall",
        "project_metrics": {
            "total_builtup_area_sqft": total_builtup_sqft,
            "carpet_area_sqft": carpet_area_sqft,
            "floors_count": floors,
            "hvac_cooling_capacity_tr": hvac_tons,
            "estimated_completion_months": 24
        },
        "civil_materials": {
            "cement": {"total_bags": cement_bags, "total_metric_tons": round(cement_bags * 0.05, 1)},
            "steel_rebar": {"total_kg": round(steel_rebar_mt * 1000), "total_metric_tons": steel_rebar_mt},
            "structural_steel_atrium_mt": structural_steel_atrium_mt,
            "commercial_flooring_sqft": carpet_area_sqft
        },
        "electrical_system": {
            "total_electrical_wire_meters": wire_meters,
            "total_electrical_wire_feet": wire_feet,
            "commercial_substations_count": max(1, floors // 2),
            "diesel_generator_dg_sets": 2,
            "led_commercial_luminaires": int(round(total_builtup_sqft * 0.02))
        },
        "plumbing_system": {
            "total_pipeline_length_meters": total_pipe_meters,
            "total_pipeline_length_feet": total_pipe_feet,
            "fire_sprinkler_pipeline_meters": sprinkler_pipe_meters,
            "public_restroom_pipeline_meters": public_restroom_pipe_meters,
            "underground_fire_sump_liters": 150000,
            "escalators_units": escalators_count,
            "passenger_elevators_units": elevators_count
        },
        "cost_estimation": {
            "currency": "USD",
            "total_estimated_cost": int(total_cost),
            "cost_in_inr_equivalent": int(total_cost * 84),
            "cost_per_sqft": round(total_cost / total_builtup_sqft, 1),
            "materials_total": int(total_cost - cost_labor),
            "labor_total": int(cost_labor),
            "itemized": [
                {"item": "Commercial RCC Core & Superstructure", "qty": f"{total_builtup_sqft:,.0f} sq.ft Built-up ({cement_bags:,} Bags)", "cost": int(cost_civil)},
                {"item": "Structural Steel & Skylight Glass Atrium", "qty": f"{structural_steel_atrium_mt} MT Steel • Architectural Skylight", "cost": int(cost_atrium_steel_glass)},
                {"item": "Central HVAC Chiller Plant & Ventilation Ductwork", "qty": f"{hvac_tons} TR Cooling Capacity", "cost": int(cost_hvac)},
                {"item": "Commercial 3-Phase Power Distribution & Cabling", "qty": f"{wire_meters:,.0f}m Power Cabling ({wire_feet:,.0f} ft)", "cost": int(cost_electrical)},
                {"item": "NFPA Fire Sprinkler Network & Restroom Plumbing", "qty": f"{total_pipe_meters:,.0f}m Total Pipelines ({total_pipe_feet:,.0f} ft)", "cost": int(cost_fire_plumbing)},
                {"item": "Vertical Transportation (Escalators & Glass Elevators)", "qty": f"{escalators_count} Escalators • {elevators_count} High-Speed Elevators", "cost": int(cost_escalators_elevators)},
                {"item": "Commercial Vitrified Flooring, Facades & Lighting", "qty": f"{carpet_area_sqft:,.0f} sq.ft Finishes", "cost": int(cost_finishes_tiles)},
                {"item": "Commercial Civil Engineering & MEP Labor", "qty": "Specialized MEP & Civil Teams", "cost": int(cost_labor)}
            ]
        },
        "timeline": {
            "total_duration_weeks": 96,
            "phases": [
                {"phase": 1, "title": "Basement Excavation & Diaphragm Retaining Walls", "duration_weeks": 16, "description": "Deep multi-level basement excavation, anchor tiebacks, foundation rafting."},
                {"phase": 2, "title": "RCC Frame & Multi-Floor Superstructure", "duration_weeks": 26, "description": "High-capacity column grids, post-tensioned floor slabs, core shear walls."},
                {"phase": 3, "title": "Central Atrium Steel Truss & Skylight Glazing", "duration_weeks": 12, "description": "Erection of grand roof steel trusses and safety laminated atrium glass."},
                {"phase": 4, "title": "Commercial MEP (HVAC, Fire Sprinklers, High Voltage)", "duration_weeks": 20, "description": "Central chiller piping, sprinkler risers, 11kV substation cabling."},
                {"phase": 5, "title": "Vertical Transportation & Storefront Partitions", "duration_weeks": 12, "description": "Escalator and elevator hoistway installation, glass storefronts."},
                {"phase": 6, "title": "Testing, Commissioning & Fire Safety NOC", "duration_weeks": 10, "description": "Testing life safety systems, smoke evacuation, final handover."}
            ]
        }
    }


# ==============================================================================
# 4. RESIDENTIAL HOUSE BOQ (OUR REFINED ENGINE)
# ==============================================================================
def _estimate_residential_boq(project_data: Dict[str, Any], floor_plans: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    unit = (project_data.get("unit") or "feet").lower()
    plot_width = float(project_data.get("plot_width") or 30)
    plot_length = float(project_data.get("plot_length") or 50)
    floors = int(project_data.get("floors") or 2)
    bedrooms = int(project_data.get("bedrooms") or 3)
    bathrooms = int(project_data.get("bathrooms") or 3)
    residents = int(project_data.get("residents") or 4)

    if "meter" in unit:
        plot_area_sqft = (plot_width * 3.28084) * (plot_length * 3.28084)
        plot_width_ft = plot_width * 3.28084
        plot_length_ft = plot_length * 3.28084
    else:
        plot_area_sqft = plot_width * plot_length
        plot_width_ft = plot_width
        plot_length_ft = plot_length

    total_builtup_area = 0.0
    carpet_area = 0.0

    if floor_plans:
        for fl in floor_plans:
            total_builtup_area += fl.get("total_area_sqft", 0.0)
            carpet_area += fl.get("carpet_area_sqft", 0.0)
    else:
        ground_coverage = plot_area_sqft * 0.68
        total_builtup_area = ground_coverage * floors
        carpet_area = total_builtup_area * 0.78

    total_builtup_area = round(total_builtup_area, 1)
    carpet_area = round(carpet_area, 1)

    cement_bags = int(round(total_builtup_area * 0.43))
    steel_total_kg = round(total_builtup_area * 3.8, 1)
    total_bricks = int(round(total_builtup_area * 9.5))
    sand_cft = round(total_builtup_area * 2.0, 1)
    aggregate_cft = round(total_builtup_area * 1.35, 1)

    conduit_meters = round(total_builtup_area * 0.32, 1)
    wire_1_0_meters = round(total_builtup_area * 0.45, 1)
    wire_2_5_meters = round(total_builtup_area * 0.32, 1)
    wire_4_0_meters = round(total_builtup_area * 0.18, 1)
    wire_earth_meters = round(total_builtup_area * 0.28, 1)
    total_wire_meters = round(wire_1_0_meters + wire_2_5_meters + wire_4_0_meters + wire_earth_meters, 1)
    total_wire_feet = round(total_wire_meters * 3.28084, 1)

    freshwater_meters = round((bathrooms * 22.0) + 18.0 + (floors * 3.5 + 14.0) + 20.0, 1)
    drainage_meters = round((bathrooms * 14.0) + ((bathrooms + 1) * 16.0) + (4 * floors * 3.2), 1)
    total_pipe_meters = round(freshwater_meters + drainage_meters, 1)
    total_pipe_feet = round(total_pipe_meters * 3.28084, 1)

    cost_cement = round(cement_bags * 6.0)
    cost_steel = round(steel_total_kg * 0.90)
    cost_bricks = round(total_bricks * 0.14)
    cost_sand = round(sand_cft * 0.70)
    cost_aggregate = round(aggregate_cft * 0.65)
    cost_tiles = round(carpet_area * 2.2)
    cost_paint = round(carpet_area * 1.6)
    cost_electrical = round(total_wire_meters * 2.0 + conduit_meters * 1.5 + 500)
    cost_plumbing = round(total_pipe_meters * 4.5 + (bathrooms * 550))
    cost_doors_windows = round(floors * 2400)
    cost_labor = round(total_builtup_area * 14.5)

    materials_total = (cost_cement + cost_steel + cost_bricks + cost_sand + cost_aggregate + 
                       cost_tiles + cost_paint + cost_electrical + cost_plumbing + cost_doors_windows)
    contingency = round((materials_total + cost_labor) * 0.05)
    total_cost = materials_total + cost_labor + contingency

    return {
        "domain": "residential",
        "project_metrics": {
            "plot_area_sqft": plot_area_sqft,
            "total_builtup_area_sqft": total_builtup_area,
            "carpet_area_sqft": carpet_area,
            "floors": floors,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "estimated_completion_months": round((32 + (floors * 4)) / 4.2, 1)
        },
        "civil_materials": {
            "cement": {"total_bags": cement_bags, "total_metric_tons": round(cement_bags * 0.05, 1)},
            "steel_rebar": {"total_kg": steel_total_kg, "total_metric_tons": round(steel_total_kg / 1000.0, 2)},
            "bricks": {"total_bricks": total_bricks},
            "sand": {"cubic_feet": sand_cft},
            "aggregate": {"cubic_feet": aggregate_cft}
        },
        "electrical_system": {
            "total_electrical_wire_meters": total_wire_meters,
            "total_electrical_wire_feet": total_wire_feet,
            "wire_lighting_1_0mm_meters": wire_1_0_meters,
            "wire_power_sockets_2_5mm_meters": wire_2_5_meters,
            "wire_heavy_load_ac_4_0mm_meters": wire_4_0_meters,
            "wire_grounding_earth_meters": wire_earth_meters,
            "pvc_conduit_pipe_meters": conduit_meters,
            "modular_switch_plates": int(round(total_builtup_area * 0.025)) + 6
        },
        "plumbing_system": {
            "total_pipeline_length_meters": total_pipe_meters,
            "total_pipeline_length_feet": total_pipe_feet,
            "freshwater_cpvc_pipelines_meters": freshwater_meters,
            "drainage_pvc_pipelines_meters": drainage_meters,
            "overhead_water_tank_capacity_liters": max(1000, residents * 300),
            "toilets_ewc_count": bathrooms,
            "wash_basins_count": bathrooms + 1
        },
        "cost_estimation": {
            "currency": "USD",
            "total_estimated_cost": int(total_cost),
            "cost_in_inr_equivalent": int(total_cost * 84),
            "cost_per_sqft": round(total_cost / total_builtup_area, 1),
            "materials_total": int(materials_total),
            "labor_total": int(cost_labor),
            "itemized": [
                {"item": "Cement (Foundation, Slabs, Masonry, Plaster)", "qty": f"{cement_bags:,} Bags", "cost": int(cost_cement)},
                {"item": "Steel Rebar (TMT Fe550D)", "qty": f"{steel_total_kg:,.0f} kg", "cost": int(cost_steel)},
                {"item": "Bricks & AAC Blocks", "qty": f"{total_bricks:,} Pieces", "cost": int(cost_bricks)},
                {"item": "Sand & Coarse Aggregate", "qty": f"{sand_cft:,.0f} cft", "cost": int(cost_sand + cost_aggregate)},
                {"item": "Flooring Tiles & Paint", "qty": f"{carpet_area:,.0f} sq.ft", "cost": int(cost_tiles + cost_paint)},
                {"item": "Electrical System (Copper Wire & Conduits)", "qty": f"{total_wire_meters:,.0f}m Wire ({total_wire_feet:,.0f} ft)", "cost": int(cost_electrical)},
                {"item": "Plumbing System (CPVC Water & Drainage Pipes)", "qty": f"{total_pipe_meters:,.0f}m Pipe ({total_pipe_feet:,.0f} ft)", "cost": int(cost_plumbing)},
                {"item": "Civil & Masonry Construction Labor", "qty": f"{total_builtup_area:,.0f} sq.ft", "cost": int(cost_labor)}
            ]
        },
        "timeline": {
            "total_duration_weeks": 32 + (floors * 4),
            "phases": [
                {"phase": 1, "title": "Site Prep, Excavation & Footings", "duration_weeks": 3, "description": "Site demarcation, soil excavation, foundation footing."},
                {"phase": 2, "title": "Plinth Beam & Ground Slab", "duration_weeks": 3, "description": "Plinth beam casting, backfilling, underground plumbing."},
                {"phase": 3, "title": "RCC Columns, Beams & Slabs", "duration_weeks": 4 * floors, "description": "Casting vertical columns and upper floor slabs."},
                {"phase": 4, "title": "Brick Masonry & Door Frames", "duration_weeks": 4, "description": "External and internal partition masonry walls."},
                {"phase": 5, "title": "MEP (Electrical Conduits & Plumbing Piping)", "duration_weeks": 3, "description": "Wall chasing, laying electrical wires and water pipelines."},
                {"phase": 6, "title": "Plastering, Flooring & Painting", "duration_weeks": 6, "description": "Smooth sponge plaster, vitrified tiling, and paint finish."}
            ]
        }
    }
