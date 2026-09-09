"""
Comprehensive Multi-Domain Automated Test Suite
Tests:
1. Civil Infrastructure: Bridges & Flyovers
2. Transportation Infrastructure: Roads & Highways
3. Commercial: Shopping Malls & Complexes
4. Residential: Houses & Villas
"""

import unittest
from layout_engine import generate_layout, detect_category
from boq_estimator import estimate_boq


class TestUniversalAIArchitect(unittest.TestCase):

    def test_bridge_infrastructure(self):
        project = {
            "project_type": "cable-stayed river bridge",
            "plot_length": 120.0, # span meters
            "plot_width": 16.0,   # deck width meters
            "architectural_style": "Cable-Stayed Girder Bridge"
        }
        self.assertEqual(detect_category(project), "bridge")
        layout = generate_layout(project)
        boq = estimate_boq(project, layout.get("floors", []))

        self.assertEqual(layout["category"], "bridge")
        self.assertIn("scene_3d", layout)
        self.assertEqual(layout["scene_3d"]["domain"], "bridge")
        self.assertEqual(boq["domain"], "bridge")
        self.assertGreater(boq["civil_materials"]["high_grade_concrete_cum"], 500)
        self.assertGreater(boq["civil_materials"]["steel_rebar"]["total_metric_tons"], 50)
        self.assertGreater(boq["civil_materials"]["elastomeric_bearings_units"], 0)
        self.assertGreater(boq["cost_estimation"]["total_estimated_cost"], 500000)

    def test_road_highway_infrastructure(self):
        project = {
            "project_type": "4-lane divided highway expressway",
            "plot_length": 5.0, # km
            "floors": 4 # 4 lanes
        }
        self.assertEqual(detect_category(project), "road")
        layout = generate_layout(project)
        boq = estimate_boq(project, layout.get("floors", []))

        self.assertEqual(layout["category"], "road")
        self.assertEqual(layout["scene_3d"]["domain"], "road")
        self.assertEqual(boq["domain"], "road")
        self.assertGreater(boq["civil_materials"]["asphalt_bitumen_metric_tons"], 1000)
        self.assertGreater(boq["electrical_system"]["highway_streetlights_count"], 50)
        self.assertGreater(boq["plumbing_system"]["drainage_pvc_pipelines_meters"], 1000)
        self.assertGreater(boq["cost_estimation"]["total_estimated_cost"], 1000000)

    def test_commercial_shopping_mall(self):
        project = {
            "project_type": "commercial shopping mall galleria",
            "plot_width": 140.0,
            "plot_length": 220.0,
            "floors": 3
        }
        self.assertEqual(detect_category(project), "mall")
        layout = generate_layout(project)
        boq = estimate_boq(project, layout.get("floors", []))

        self.assertEqual(layout["category"], "mall")
        self.assertEqual(len(layout["floors"]), 3)
        self.assertEqual(boq["domain"], "mall")
        self.assertGreater(boq["electrical_system"]["total_electrical_wire_meters"], 10000)
        self.assertGreater(boq["plumbing_system"]["fire_sprinkler_pipeline_meters"], 5000)
        self.assertGreater(boq["plumbing_system"]["escalators_units"], 0)
        self.assertGreater(boq["cost_estimation"]["total_estimated_cost"], 2000000)

    def test_residential_house(self):
        project = {
            "project_type": "residential house",
            "plot_width": 30.0,
            "plot_length": 50.0,
            "floors": 2,
            "bedrooms": 3,
            "bathrooms": 3
        }
        self.assertEqual(detect_category(project), "residential")
        layout = generate_layout(project)
        boq = estimate_boq(project, layout.get("floors", []))

        self.assertEqual(layout["category"], "residential")
        self.assertEqual(len(layout["floors"]), 3) # Ground, 1st, Terrace
        self.assertEqual(boq["domain"], "residential")
        self.assertGreater(boq["civil_materials"]["cement"]["total_bags"], 200)
        self.assertGreater(boq["electrical_system"]["total_electrical_wire_meters"], 1000)
        self.assertGreater(boq["plumbing_system"]["total_pipeline_length_meters"], 100)


if __name__ == "__main__":
    unittest.main()
