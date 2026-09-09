"""
Test script for verifying 4 distinct architectural variants and 3D scene data via FastAPI server
"""
import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def test_sample():
    req = urllib.request.Request(f"{BASE_URL}/api/sample?type=house")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode("utf-8"))
        assert "layout" in data
        assert "scene_3d" in data["layout"]
        scene_3d = data["layout"]["scene_3d"]
        assert "roof" in scene_3d
        assert "site" in scene_3d
        assert "levels" in scene_3d
        print("PASS: /api/sample?type=house returns valid layout with 3D scene data.")

def test_variants():
    variants = ["courtyard", "l_shaped", "manor", "urban_smart"]
    for v in variants:
        payload = {
            "project_data": {
                "project_type": "residential house",
                "plot_width": 30.0,
                "plot_length": 50.0,
                "design_variant": v,
                "floors": 2,
                "bedrooms": 3
            }
        }
        req = urllib.request.Request(
            f"{BASE_URL}/api/generate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200
            res = json.loads(resp.read().decode("utf-8"))
            layout = res["layout"]
            assert layout["design_variant"] == v
            scene_3d = layout["scene_3d"]
            assert scene_3d["variant"] == v
            rooms = scene_3d["levels"][0]["rooms"]
            assert len(rooms) > 0
            # Verify doors, windows, and flooring
            has_doors = any(len(r.get("doors", [])) > 0 for r in rooms)
            has_windows = any(len(r.get("windows", [])) > 0 for r in rooms)
            has_flooring = all("flooring_material" in r for r in rooms)
            assert has_doors, f"Variant {v} ground floor has no doors"
            assert has_windows, f"Variant {v} ground floor has no windows"
            assert has_flooring, f"Variant {v} rooms missing flooring_material"
            print(f"PASS: Variant '{v}' generated correctly with {len(rooms)} rooms, doors, windows, and flooring: {layout['summary']['variant_title']}")

if __name__ == "__main__":
    test_sample()
    test_variants()
    print("ALL VARIANT API TESTS PASSED SUCCESSFULLY!")
