# CivicMind AI
### AI-Powered Constituency Decision Intelligence Platform

> Transforming citizen grievances into explainable, data-driven civic priorities using Google Gemini.

---

## Overview

CivicMind AI is an AI-powered constituency intelligence platform that bridges the gap between citizens and policymakers.

Citizens can submit issues using voice, text, or images. The platform automatically analyzes complaints using Google Gemini, categorizes issues, estimates severity and priority, maps them to government schemes, and generates actionable recommendations for constituency representatives.

The platform helps decision-makers prioritize development work based on real community needs instead of manual processing.

---

## Problem Statement

Local governments receive thousands of citizen grievances every month.

Current systems suffer from:

- Manual complaint processing
- Duplicate complaints
- Slow prioritization
- Lack of explainability
- Poor resource allocation
- No AI-assisted decision support

As a result, many important public issues remain unresolved despite available government schemes and budgets.

---

## Solution

CivicMind AI provides an end-to-end AI-powered decision intelligence platform that:

- Accepts multilingual citizen complaints
- Supports voice, text and image inputs
- Uses Google Gemini to analyze issues
- Calculates severity and priority
- Maps complaints to relevant government schemes
- Generates explainable recommendations
- Produces executive action briefs
- Visualizes constituency hotspots using maps
- Provides an executive dashboard for decision makers

---

# Features

### Citizen Portal

- Voice complaint recording
- Image upload
- Text complaint submission
- Multilingual support

---

### AI Processing Pipeline

- Google Gemini 2.5 Flash
- Complaint understanding
- Severity estimation
- Priority scoring
- Government scheme matching
- Explainable reasoning
- Executive recommendation generation

---

### Executive Dashboard

- Constituency heatmap
- Live issue statistics
- Resolution metrics
- Budget estimation
- Action recommendations
- Priority interventions

---

### Recommendation Engine

Automatically generates:

- Executive Summary
- Severity
- Priority Score
- Responsible Department
- Budget Estimate
- Government Scheme Mapping
- Action Plan

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- CSS
- HTML5

## Backend

- FastAPI
- Python
- Google Gemini API
- Firebase (Mock-compatible)
- REST APIs

## AI

- Google Gemini 2.5 Flash

## Maps

- OpenStreetMap
- Google Maps compatible architecture

---

# System Architecture

Citizen

↓

Frontend (React)

↓

FastAPI Backend

↓

Google Gemini API

↓

Recommendation Engine

↓

Dashboard & Executive Brief

---

# Project Structure

```
CivicMind-AI
│
├── backend
│   ├── app
│   │   ├── api
│   │   ├── prompts
│   │   ├── schemas
│   │   ├── services
│   │   ├── config.py
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── README.md
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Amayrajyadav/civicmind-ai.git
```

```
cd civicmind-ai
```

---

## Backend Setup

```
cd backend
```

Create a virtual environment

```
python -m venv venv
```

Activate

Windows

```
venv\Scripts\activate
```

Linux / Mac

```
source venv/bin/activate
```

Install dependencies

```
pip install -r requirements.txt
```

Create a `.env` file

```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

PORT=8000

HOST=0.0.0.0

FORCE_MOCK=False
```

Run backend

```
python -m uvicorn app.main:app --reload
```

Backend runs at

```
http://127.0.0.1:8000
```

Swagger

```
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

```
cd frontend
```

Install packages

```
npm install
```

Run

```
npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/v1/submit-issue | Submit new issue |
| GET | /api/v1/processing/{id} | AI processing status |
| GET | /api/v1/recommendation/{id} | AI recommendation |
| GET | /api/v1/dashboard | Executive dashboard |
| GET | /api/v1/action-brief/{id} | Executive action brief |

---

# Workflow

Citizen submits complaint

↓

AI extracts context

↓

Severity estimation

↓

Priority scoring

↓

Government scheme matching

↓

Recommendation generation

↓

Executive dashboard

↓

Action brief generation

---

# Future Enhancements

- Firebase Firestore integration
- BigQuery analytics
- Google Maps APIs
- Multi-language translation
- Real-time notifications
- Duplicate complaint detection
- RAG-based government scheme retrieval
- PDF report export
- Mobile application

---

# Demo

1. Open Citizen Portal
2. Submit a complaint
3. AI Processing starts
4. Gemini analyzes the complaint
5. Recommendation is generated
6. Dashboard updates
7. Executive Action Brief is produced

---

# Build With AI: Code for Communities Hackathon

This project was developed as a prototype for Google's Build with AI : Code for Communities Hackathon.

The objective is to demonstrate how Generative AI can improve public service delivery by transforming citizen grievances into explainable, actionable insights for policymakers.

---

# Author

**A.Amay Raj**

AI/ML Developer

GitHub

https://github.com/Amayrajyadav

---

