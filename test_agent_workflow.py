import requests
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def test_chat_shorthand_dimensions_and_rajasthan():
    print("\n--- TEST 1: Shorthand Input ('its 20*40 rajasthan north 3 4 2 5') ---")
    payload = {
        "project_data": {
            "project_type": "residential house"
        },
        "user_message": "its 20*40 rajasthan north 3 4 2 5"
    }
    res = requests.post(f"{BASE_URL}/api/chat", json=payload, timeout=30)
    assert res.status_code == 200, f"Error: {res.status_code} {res.text}"
    data = res.json()

    p = data["project_data"]
    print(f"Parsed Width x Length: {p.get('plot_width')} x {p.get('plot_length')}")
    print(f"Location: {p.get('location')}")
    print(f"Road Direction: {p.get('road_direction')}")
    print(f"Floors: {p.get('floors')}, Beds: {p.get('bedrooms')}, Baths: {p.get('bathrooms')}, Residents: {p.get('residents')}")
    print(f"Design Variant: {p.get('design_variant')}")

    assert p.get("plot_width") == 20, f"Expected 20, got {p.get('plot_width')}"
    assert p.get("plot_length") == 40, f"Expected 40, got {p.get('plot_length')}"
    assert p.get("floors") == 3, f"Expected 3, got {p.get('floors')}"
    assert p.get("design_variant") == "rajasthan_heritage", f"Expected rajasthan_heritage, got {p.get('design_variant')}"

    # Verify layout & 3D scene generated immediately
    assert data.get("layout") is not None, "Layout should be generated immediately!"
    assert data.get("boq") is not None, "BOQ should be estimated immediately!"

    # Verify balcony doors and Jaali in 3D scene
    scene = data["layout"]["scene_3d"]
    assert scene["variant"] == "rajasthan_heritage", f"Scene variant should be rajasthan_heritage"
    assert scene["roof"]["style"] == "rajasthan_chhatri", f"Roof style should be rajasthan_chhatri"

    # Check that upper floor master suite adjacent to Jharokha has sliding_glass_balcony door
    fl1_rooms = data["layout"]["floors"][1]["rooms"]
    master_room = next((r for r in fl1_rooms if "master" in r["id"]), None)
    assert master_room is not None, "Master room should exist on Level 1"
    balcony_doors = [d for d in master_room.get("doors", []) if d.get("type") == "sliding_glass_balcony"]
    print(f"Master suite doors: {master_room.get('doors', [])}")
    assert len(balcony_doors) > 0, "Master suite MUST have sliding_glass_balcony walkout door!"

    print("AI Message preview:\n", data["chat"].get("message", "")[:200], "...")
    print("PASS: Test 1 Passed Successfully!")
    return data["project_data"]

def test_chat_balcony_doors_directive(project_data):
    print("\n--- TEST 2: Design Directive ('in balcony add doors') ---")
    payload = {
        "project_data": project_data,
        "user_message": "in balcony add doors"
    }
    res = requests.post(f"{BASE_URL}/api/chat", json=payload, timeout=30)
    assert res.status_code == 200, f"Error: {res.status_code} {res.text}"
    data = res.json()

    p = data["project_data"]
    print(f"Has Balcony Doors flag: {p.get('has_balcony_doors')}")
    assert p.get("has_balcony_doors") is True, "has_balcony_doors should be True"

    msg = data["chat"].get("message", "")
    print(f"AI Response:\n{msg}\n")
    assert any(w in msg.lower() for w in ["door", "doors", "balcony", "sliding"]), "AI must confirm balcony doors were added"

    assert data.get("layout") is not None, "Layout should be regenerated"
    print("PASS: Test 2 Passed Successfully!")

def test_chat_terrace_directive(project_data):
    print("\n--- TEST 3: Design Directive ('change the terrace of house to pergola garden') ---")
    payload = {
        "project_data": project_data,
        "user_message": "change the terrace of house to pergola garden"
    }
    res = requests.post(f"{BASE_URL}/api/chat", json=payload, timeout=35)
    assert res.status_code == 200, f"Error: {res.status_code} {res.text}"
    data = res.json()

    p = data["project_data"]
    print(f"Terrace style: {p.get('terrace_style')}")
    assert p.get("terrace_style") == "pergola_garden", f"Expected pergola_garden, got {p.get('terrace_style')}"

    msg = data["chat"].get("message", "")
    print(f"AI Response:\n{msg}\n")
    assert any(w in msg.lower() for w in ["terrace", "pergola", "roof", "garden"]), "AI must confirm terrace change"
    print("PASS: Test 3 Passed Successfully!")

def test_all_variants_generation():
    print("\n--- TEST 4: Generate All Architectural Variants ---")
    variants = ["courtyard", "l_shaped", "manor", "urban_smart", "rajasthan_heritage", "cantilever_luxury"]
    for v in variants:
        payload = {
            "project_data": {
                "project_type": "residential house",
                "plot_width": 25.0,
                "plot_length": 50.0,
                "design_variant": v
            }
        }
        res = requests.post(f"{BASE_URL}/api/generate", json=payload, timeout=10)
        assert res.status_code == 200, f"Failed variant {v}: {res.status_code}"
        d = res.json()
        scene = d["layout"]["scene_3d"]
        assert scene["variant"] == v, f"Scene variant mismatch: {scene['variant']} vs {v}"
        print(f"  ✓ Variant '{v}' generated successfully: {len(d['layout']['floors'])} floors, roof: {scene['roof']['style']}")
    print("PASS: Test 4 All Variants Passed Successfully!")

if __name__ == "__main__":
    try:
        p_data = test_chat_shorthand_dimensions_and_rajasthan()
        test_chat_balcony_doors_directive(p_data)
        test_chat_terrace_directive(p_data)
        test_all_variants_generation()
        print("\n========================================")
        print("ALL ARCHITECTURAL & AGENT TESTS PASSED!")
        print("========================================")
    except Exception as e:
        print(f"TEST FAILED: {e}")
        sys.exit(1)
