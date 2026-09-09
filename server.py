"""
NeeV - AI Architecture & Engineering Platform
FastAPI Server delivering generative 2D CAD blueprints, 3D WebGL scenes,
and itemized BOQ estimations.
"""

import os
import json
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from architect_ai import ask_architect
from layout_engine import generate_layout
from boq_estimator import estimate_boq

app = FastAPI(
    title="NeeV - Generative Architecture API",
    description="NeeV: Foundation of Generative Architecture, 2D CAD Blueprints, 3D WebGL & Civil BOQ",
    version="2.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_message: str
    project_data: Dict[str, Any]
    force_generate: Optional[bool] = False

class GenerateRequest(BaseModel):
    project_data: Dict[str, Any]


@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "NeeV Generative Architecture v2.0"}


@app.get("/api/sample")
def get_sample_project(type: Optional[str] = "house"):
    """Returns a fully-formed sample project for instant interactive demonstration across domains."""
    t = (type or "house").lower()
    
    if "bridge" in t:
        sample_data = {
            "project_type": "cable-stayed river bridge",
            "plot_length": 120.0, # span in meters
            "plot_width": 16.0,   # deck width in meters
            "unit": "meters",
            "location": "River Crossing Corridor",
            "road_direction": "north",
            "floors": 1,
            "architectural_style": "Cable-Stayed Girder Bridge",
            "special_requirements": "High water clearance 12 meters with 4 travel lanes and pedestrian walkway",
            "budget": 1250000
        }
    elif "road" in t or "highway" in t:
        sample_data = {
            "project_type": "4-lane divided highway",
            "plot_length": 5.0, # 5 km
            "plot_width": 20.0, # right of way width
            "unit": "km",
            "location": "Interstate Corridor",
            "road_direction": "east",
            "floors": 4, # 4 lanes
            "architectural_style": "Asphalt Concrete Expressway",
            "special_requirements": "Green median barrier, drainage culverts, and solar street lighting",
            "budget": 6500000
        }
    elif "mall" in t or "commercial" in t:
        sample_data = {
            "project_type": "commercial shopping mall",
            "plot_width": 140.0,
            "plot_length": 220.0,
            "unit": "feet",
            "location": "City Commercial Center",
            "road_direction": "north",
            "floors": 3,
            "architectural_style": "Grand Galleria Atrium",
            "special_requirements": "Central glass skylight atrium, 2 anchor department stores, retail boutiques, and food court",
            "budget": 6000000
        }
    else:
        sample_data = {
            "project_type": "residential house",
            "plot_width": 30.0,
            "plot_length": 50.0,
            "unit": "feet",
            "location": "Urban Metro",
            "road_direction": "north",
            "floors": 2,
            "bedrooms": 3,
            "bathrooms": 3,
            "living_room": "Spacious double-height living room",
            "dining_room": "Central dining adjacent to open kitchen",
            "kitchen": "Modular L-shaped kitchen with utility area",
            "parking_cars": 1,
            "parking_bikes": 2,
            "residents": 4,
            "special_requirements": "Home office / study nook and elder accessibility on ground floor",
            "architectural_style": "Modern Minimalist",
            "natural_light": "High preference (large front windows)",
            "ventilation": "Cross-ventilation between north and south",
            "garden": "Front lawn and landscaped terrace garden",
            "budget": 75000,
            "project_specific_requirements": "Earthquake resistant RCC frame structure"
        }

    layout = generate_layout(sample_data)
    boq = estimate_boq(sample_data, layout.get("floors", []))

    return {
        "project_data": sample_data,
        "layout": layout,
        "boq": boq,
        "plan_ready": True
    }


@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """Processes user message, updates project state, and triggers generation when ready."""
    try:
        user_msg = req.user_message.strip()
        project_data = req.project_data

        # Check if user explicitly asked to generate, modify, or add any architectural element
        design_triggers = [
            "generate", "draw plan", "give plan", "make 3d", "create 3d", "show design",
            "finish planning", "calculate cost", "door", "doors", "balcony", "window",
            "terrace", "roof", "pergola", "garden", "chhatri", "haveli", "rajasthan",
            "cantilever", "floor", "bedroom", "bath", "change", "add", "make", "modify",
            "update", "surprise", "reverse", "undo", "revert", "go back", "last step",
            "mistake", "mistakes", "audit", "fix"
        ]
        user_wants_generation = req.force_generate or any(
            trigger in user_msg.lower() for trigger in design_triggers
        )

        # Call Groq LLM Architect Consultant (with active intent parser & resilient fallback)
        result = ask_architect(project_data, user_msg)
        
        # Merge updated fields
        updated = result.get("updated_project", {})
        for k, v in updated.items():
            if v is not None:
                project_data[k] = v

        is_complete = result.get("requirements_complete", False) or user_wants_generation

        layout = None
        boq = None

        # If requirements are sufficient or user requested modification, build 2D, 3D and BOQ immediately
        if is_complete or (project_data.get("plot_width") and project_data.get("plot_length")):
            if not project_data.get("plot_width"):
                project_data["plot_width"] = 30.0
                project_data["plot_length"] = 50.0
                project_data["unit"] = "feet"
            layout = generate_layout(project_data)
            boq = estimate_boq(project_data, layout["floors"])

        return {
            "chat": result,
            "project_data": project_data,
            "plan_ready": is_complete or bool(layout),
            "layout": layout,
            "boq": boq
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate")
async def generate_endpoint(req: GenerateRequest):
    """Generates 2D floor plans, 3D meshes, and BOQ from current project parameters."""
    try:
        project_data = req.project_data
        layout = generate_layout(project_data)
        boq = estimate_boq(project_data, layout["floors"])
        return {
            "project_data": project_data,
            "layout": layout,
            "boq": boq,
            "plan_ready": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------------------------
# PROJECT PERSISTENCE (SAVE / LOAD / DELETE)
# ------------------------------------------------------------------------------
PROJECTS_FILE = os.path.join(os.path.dirname(__file__), "saved_projects.json")

def load_saved_projects_file() -> list:
    if os.path.exists(PROJECTS_FILE):
        try:
            with open(PROJECTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_saved_projects_file(projects: list):
    with open(PROJECTS_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=2)


class SaveProjectRequest(BaseModel):
    id: Optional[str] = None
    name: str
    category: Optional[str] = "residential"
    domain: Optional[str] = None
    client_name: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    author: Optional[str] = None
    project_data: Dict[str, Any]
    layout: Optional[Dict[str, Any]] = None
    boq: Optional[Dict[str, Any]] = None
    interior: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None


@app.get("/api/projects")
def get_projects():
    """Returns all saved projects wrapped in standard response format."""
    projects = load_saved_projects_file()
    return {"status": "ok", "projects": projects}


@app.post("/api/projects/save")
def save_project_endpoint(req: SaveProjectRequest):
    """Saves a project payload to server storage with rich metadata."""
    import time
    projects = load_saved_projects_file()
    
    project_id = req.id or f"proj_{int(time.time() * 1000)}"
    timestamp = req.timestamp or time.strftime("%Y-%m-%d %H:%M")

    domain = req.domain or req.category or "residential"
    new_project = {
        "id": project_id,
        "name": req.name or "Untitled Architectural Project",
        "category": domain,
        "domain": domain,
        "client_name": req.client_name or "Self / Direct Client",
        "notes": req.notes or "",
        "tags": req.tags or [domain.capitalize(), "Concept"],
        "author": req.author or "Studio Architect",
        "project_data": req.project_data,
        "layout": req.layout,
        "boq": req.boq,
        "interior": req.interior or {},
        "timestamp": timestamp
    }

    # Replace if exists, else prepend
    existing_idx = next((i for i, p in enumerate(projects) if p.get("id") == project_id), None)
    if existing_idx is not None:
        projects[existing_idx] = new_project
    else:
        projects.insert(0, new_project)

    save_saved_projects_file(projects)
    return {"status": "ok", "id": project_id, "timestamp": timestamp, "project": new_project}


@app.delete("/api/projects/{project_id}")
def delete_project_endpoint(project_id: str):
    """Deletes a saved project by ID."""
    projects = load_saved_projects_file()
    projects = [p for p in projects if p.get("id") != project_id]
    save_saved_projects_file(projects)
    return {"status": "ok", "id": project_id}


# ------------------------------------------------------------------------------
# ARCHITECT & PEER FEEDBACK SYSTEM (COLLECT CRITIQUES & SUGGESTIONS)
# ------------------------------------------------------------------------------
FEEDBACKS_FILE = os.path.join(os.path.dirname(__file__), "feedbacks.json")

class FeedbackRequest(BaseModel):
    name: str
    role: Optional[str] = "Architect"
    rating: int = 5
    category: Optional[str] = "General"
    feedback: str
    project_id: Optional[str] = None
    timestamp: Optional[str] = None

def load_feedbacks_file() -> list:
    if os.path.exists(FEEDBACKS_FILE):
        try:
            with open(FEEDBACKS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_feedbacks_file(feedbacks: list):
    with open(FEEDBACKS_FILE, "w", encoding="utf-8") as f:
        json.dump(feedbacks, f, indent=2)

@app.get("/api/feedback")
def get_feedbacks_endpoint():
    """Returns recent feedback and suggestions from visiting architects and friends."""
    return {"status": "ok", "feedbacks": load_feedbacks_file()}

@app.post("/api/feedback")
def post_feedback_endpoint(req: FeedbackRequest):
    """Saves a peer suggestion or architect review."""
    import time
    feedbacks = load_feedbacks_file()
    item = {
        "id": f"fb_{int(time.time() * 1000)}",
        "name": req.name.strip() or "Architect Reviewer",
        "role": req.role or "Architect / Peer",
        "rating": max(1, min(5, req.rating)),
        "category": req.category or "Spatial Architecture",
        "feedback": req.feedback.strip(),
        "project_id": req.project_id,
        "timestamp": req.timestamp or time.strftime("%Y-%m-%d %H:%M")
    }
    feedbacks.insert(0, item)
    save_feedbacks_file(feedbacks)
    return {"status": "ok", "feedback": item}


# Mount static directory for Frontend Web Studio
public_dir = os.path.join(os.path.dirname(__file__), "public")
if not os.path.exists(public_dir):
    os.makedirs(public_dir)

app.mount("/static", StaticFiles(directory=public_dir), name="static")

@app.get("/")
def serve_index():
    index_file = os.path.join(public_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(
            index_file,
            headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
        )
    return {"message": "NeeV.ai Studio API is running. Web UI not found in /public."}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting NeeV.ai Spatial Studio on http://0.0.0.0:{port}")
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)

