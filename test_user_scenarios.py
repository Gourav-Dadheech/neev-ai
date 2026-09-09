import requests
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def test_user_exact_queries():
    print("\n=======================================================")
    print("TESTING USER SCENARIOS & AGENT DIRECTIVES")
    print("=======================================================")

    # Initial state representing the active design in user's screenshot
    active_project = {
        "project_type": "residential house",
        "plot_width": 30.0,
        "plot_length": 50.0,
        "unit": "feet",
        "location": "Urban Metro",
        "road_direction": "north",
        "floors": 2,
        "bedrooms": 3,
        "bathrooms": 3,
        "design_variant": "courtyard"
    }

    # SCENARIO 1: "reverse the last step"
    print("\n--- SCENARIO 1: 'reverse the last step' ---")
    res1 = requests.post(f"{BASE_URL}/api/chat", json={
        "project_data": active_project,
        "user_message": "reverse the last step"
    }, timeout=10)
    assert res1.status_code == 200, f"Failed: {res1.status_code}"
    d1 = res1.json()
    msg1 = d1["chat"]["message"]
    q1 = d1["chat"]["next_questions"]
    print(f"Message: {msg1}")
    print(f"Next Questions: {q1}")
    assert "reversed the last step" in msg1.lower(), "Should confirm reverse"
    assert len(q1) == 0, f"Expected 0 questions, got: {q1}"
    assert "where is the plot" not in msg1.lower(), "Survey questions MUST NOT appear!"
    print("✓ SCENARIO 1 PASSED: Reverse completed with zero questionnaire.")

    # SCENARIO 2: "it is not working like agent why"
    print("\n--- SCENARIO 2: 'it is not working like agent why' ---")
    res2 = requests.post(f"{BASE_URL}/api/chat", json={
        "project_data": active_project,
        "user_message": "it is not working like agent why"
    }, timeout=10)
    assert res2.status_code == 200, f"Failed: {res2.status_code}"
    d2 = res2.json()
    msg2 = d2["chat"]["message"]
    q2 = d2["chat"]["next_questions"]
    print(f"Message: {msg2}")
    print(f"Next Questions: {q2}")
    assert "agent" in msg2.lower(), "Should acknowledge agent mode"
    assert len(q2) == 0, f"Expected 0 questions, got: {q2}"
    assert "where is the plot" not in msg2.lower(), "Survey questions MUST NOT appear!"
    print("✓ SCENARIO 2 PASSED: Direct CAD action mode acknowledged with zero questionnaire.")

    # SCENARIO 3: "check all mistakes which is possible then surprise me"
    print("\n--- SCENARIO 3: 'check all mistakes which is possible then surprise me' ---")
    res3 = requests.post(f"{BASE_URL}/api/chat", json={
        "project_data": active_project,
        "user_message": "missing balcony doors is example check all mistakes which is possible then surprise me"
    }, timeout=25)
    assert res3.status_code == 200, f"Failed: {res3.status_code}"
    d3 = res3.json()
    msg3 = d3["chat"]["message"]
    q3 = d3["chat"]["next_questions"]
    print(f"Message: {msg3}")
    print(f"Next Questions: {q3}")
    assert len(q3) == 0, f"Expected 0 questions, got: {q3}"
    assert any(k in msg3.lower() for k in ["door", "balcony", "staircase", "terrace", "pergola", "audit"]), "Should explain architectural fixes"
    assert d3.get("layout") is not None, "Should regenerate layout"
    assert d3.get("boq") is not None, "Should regenerate boq"
    print("✓ SCENARIO 3 PASSED: Architectural mistakes audited and surprise implemented.")

    print("\n=======================================================")
    print("ALL USER SCENARIOS VERIFIED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    test_user_exact_queries()
