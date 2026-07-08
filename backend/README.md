# CivicMind AI - Backend API

CivicMind AI is an AI-powered decision support and intelligence platform built for local ward commissioners, Members of Parliament (MPs), and municipal bodies. It automates the classification, prioritization, and action brief formulation of community complaints submitted by citizens using Google Gemini (via the modern Google Gen AI SDK) and Firebase.

## Technology Stack
- **FastAPI**: Asynchronous web framework for high-performance routing.
- **Firebase Firestore**: Dynamic schemaless storage for issues and generated recommendations.
- **Firebase Storage**: File bucket hosting for citizen-uploaded pictures.
- **Google Gen AI SDK (`google-genai`)**: Interfacing with Google Gemini models.
- **Pydantic v2**: Input validation and structured schema constraints.

---

## Directory Structure
```
backend/
├── app/
│   ├── api/
│   │   └── endpoints.py
│   ├── services/
│   │   ├── firebase_service.py
│   │   ├── gemini_service.py
│   │   └── processing_service.py
│   ├── schemas/
│   │   ├── issue.py
│   │   ├── recommendation.py
│   │   └── dashboard.py
│   ├── prompts/
│   │   └── templates.py
│   ├── config.py
│   ├── dependencies.py
│   └── main.py
├── requirements.txt
├── .env.example
└── README.md
```

---

## Quick Start Setup

### 1. Pre-requisites
Ensure you have **Python 3.12+** installed on your machine.

### 2. Configure Environment Variables
Copy the env template file and update it with your API keys:
```bash
cp .env.example .env
```
Open `.env` and fill in:
- `GEMINI_API_KEY`: Found on your Google AI Studio dashboard.
- Firebase credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` OR path to service account key file).

> [!NOTE]
> **Mock Fallback Mode**: If you run the app without setting up Gemini or Firebase keys, the backend automatically intercepts calls, falls back to mock logic, and serves realistic mock data so that the frontend continues to operate seamlessly during development.

### 3. Install Dependencies
Create a virtual environment and install requirements:
```bash
python -m venv venv
# On Windows (PowerShell):
venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Run the Server
Launch the local Uvicorn development server:
```bash
python -m uvicorn app.main:app --reload --port 8000
```
Your API server will run at: `http://localhost:8000`

---

## API Documentation
Once the server is running, visit:
- **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Core Endpoint Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | System liveness probe. Indicates if Firebase or Gemini are running in mock or live state. |
| `/api/v1/submit-issue` | `POST` | Uploads files to Storage, creates an issue in Firestore, triggers async Gemini task. Takes `multipart/form-data`. |
| `/api/v1/processing/{issue_id}` | `GET` | Gets status and completion percentage (0.0 to 1.0) of AI generation. |
| `/api/v1/dashboard` | `GET` | Returns aggregated statistics (totals, status distributions, category breakdowns) for dashboard panels. |
| `/api/v1/recommendation/{issue_id}` | `GET` | Returns full Gemini output (severity, recommended schemes, impact analysis, etc.) |
| `/api/v1/action-brief/{issue_id}` | `GET` | Returns the formatted, MP-ready markdown report and action briefing details. |
