# 🚀 NeeV.ai — 100% Free Cloud Deployment Guide

This guide explains how to deploy **NeeV.ai** completely **free of cost** (no credit card required) with the service name **`neev-ai`** so you can share it with your friend circle and architects to collect professional critique and suggestions.

---

## 🌟 Top 100% Free Deployment Options

| Platform | Free URL Format | Free Tier Details | Credit Card Required? |
| :--- | :--- | :--- | :--- |
| **Render.com (Recommended)** | `https://neev-ai.onrender.com` | 750 free hours/month, automatic HTTPS SSL, connects to GitHub | **NO** |
| **Vercel** | `https://neev-ai.vercel.app` | 100% Free Hobby Tier, global fast CDN | **NO** |
| **Hugging Face Spaces** | `https://huggingface.co/spaces/<user>/neev-ai` | 100% Free CPU container, persistent uptime | **NO** |

---

## ⚡ Option 1: Render.com (Recommended — 3 Minutes)

Render is the simplest and cleanest way to run full FastAPI + Three.js web applications for free.

### Step 1: Push your project to GitHub
If you haven't already pushed this folder to your GitHub:
1. Go to [github.com/new](https://github.com/new) and create a repository named **`neev-ai`**.
2. Open your terminal in `AI Architect/` and run:
   ```bash
   git init
   git add .
   git commit -m "Initial NeeV.ai Spatial Studio commit"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/neev-ai.git
   git push -u origin main
   ```
   *(Note: `.env` is automatically protected by `.gitignore` so your API keys will never be leaked).*

### Step 2: Connect to Render.com
1. Go to [render.com](https://render.com) and sign in using your **GitHub account**.
2. Click **"New +"** in the top navigation and select **"Web Service"**.
3. Select your **`neev-ai`** repository and click **Connect**.

### Step 3: Configure Web Service Settings
Render will show a configuration screen. Fill in:
- **Name**: `neev-ai` *(This gives you the free URL `https://neev-ai.onrender.com`)*
- **Region**: Choose the closest region (e.g., Singapore, Oregon, Frankfurt)
- **Branch**: `main`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- **Instance Type**: Select **Free** ($0/month)

### Step 4: Add Your Free Groq API Key
1. Scroll down to **"Environment Variables"**.
2. Click **"Add Environment Variable"**:
   - **Key**: `GROQ_API_KEY`
   - **Value**: `gsk_...` *(your free Groq key from [console.groq.com](https://console.groq.com/keys))*
3. Click **"Deploy Web Service"** at the bottom!

🎉 **In ~2 minutes, your project is live at `https://neev-ai.onrender.com`!**

---

## 🌐 Custom Domain: How to link `NeeV.ai`
If you purchase or own the domain `neev.ai`:
1. In your Render dashboard for `neev-ai`, go to **Settings** → **Custom Domains**.
2. Click **"Add Custom Domain"** and enter `neev.ai` (or `app.neev.ai`).
3. Add the CNAME / A records provided by Render to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.).
4. Render will automatically issue a **free Let's Encrypt SSL certificate** for `https://neev.ai`!

---

## ⚡ Option 2: Hugging Face Spaces (100% Free Docker Container)

If you want an alternative that never spins down on inactivity:
1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) and click **"Create new Space"**.
2. Space Name: `neev-ai`.
3. Select **Docker** (Blank).
4. Clone the space repo and push these files (the included [Dockerfile](file:///c:/Users/goura/OneDrive/Desktop/AI%20Architect/Dockerfile) is pre-configured).
5. In Space **Settings** → **Variables and secrets**, add secret `GROQ_API_KEY`.
6. Live immediately at `https://huggingface.co/spaces/<your-username>/neev-ai`!

---

## 💬 How Your Friends & Architects Interact with Deployed NeeV.ai

1. **Quick-Prompt Testing**:
   When visitors arrive, they see 1-click prompt chips:
   - `🏰 30x50 Haveli`
   - `🚪 Balcony Doors`
   - `🌿 Pergola Terrace`
   - `✨ Audit Mistakes`
   - `↩️ Undo`
2. **In-App Feedback System**:
   - Visitors can click the top-right **"💬 Feedback"** button or bottom-right floating pill.
   - They choose their role (*Architect, Civil Engineer, Friend, Interior Designer*), give a 1–5 star rating, and write their critique/suggestions.
   - Submissions are saved instantly to `/api/feedback`.
3. **1-Click Share**:
   - Any layout or variant can be shared by clicking **"🔗 Share"** in the header, which copies a direct link with the exact design preset for peers to inspect.
4. **Reading All Feedback**:
   - You can view all suggestions sent by visiting friends at any time by calling:
     `https://<your-site>/api/feedback` or viewing `feedbacks.json`.
