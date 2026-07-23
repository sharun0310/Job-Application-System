# AI Job Automation & Application System 🚀

An intelligent, end-to-end career automation platform that parses candidate resumes, computes hybrid AI match scores with ChromaDB vector embeddings, performs live job aggregation across global & Indian tech boards, generates AI ATS resume reports, provides interactive skill-gap roadmaps, and features a 24/7 AI career interview prep chatbot.

---

## 🌟 Key Features

1. **📄 AI Resume Parsing & ATS Analyzer**
   - Automatically extracts candidate skills, experience, education, and contact details from PDF/DOCX resumes.
   - Calculates ATS Compatibility score with actionable improvement points using Google Gemini AI.

2. **🎯 Dynamic Hybrid AI Job Matching (ChromaDB + Skill Overlap)**
   - Computes weighted hybrid match percentages: `Score = 0.6 * Skill_Match_Ratio + 0.4 * Vector_Cosine_Similarity`.
   - Uses ChromaDB vector search (`job_embeddings` collection) for deep semantic matching beyond simple keyword search.

3. **🌐 Real-Time Live Job Aggregator**
   - Aggregates live jobs across global & top Indian job platforms (Jobicy, RemoteOK, Remotive, Adzuna, and custom providers).

4. **🚀 Interactive Skill Gap & Learning Roadmap**
   - Identifies missing required skills between a candidate's resume and target job descriptions.
   - Generates personalized, step-by-step learning roadmaps with recommended courses & timelines.

5. **🤖 AI Career Assistant & Interview Prep Chatbot**
   - Interactive 24/7 AI chatbot powered by Google Gemini for mock interview practice, salary negotiations, and resume advice.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy, PostgreSQL, Alembic
- **AI & Vector DB**: Google Gemini AI (`google-genai`), ChromaDB (Vector Store)
- **Frontend**: React 19, Vite, TailwindCSS, Axios, Lucide Icons, Zustand
- **Authentication**: JWT Bearer Tokens with Passlib (Bcrypt) hashing

---

## 🚀 Quick Start Guide (For Evaluators)

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**
- **PostgreSQL** database instance running on `localhost:5432`

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Copy .env.example to .env and set your credentials
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start FastAPI server
python -m uvicorn app.main:app --port 8000 --reload
```
> Backend API Swagger Docs available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
> Frontend Application available at: `http://localhost:5173`

---

## 📁 Repository Architecture

```text
Job Automation System/
├── backend/
│   ├── alembic/              # Database migration scripts
│   ├── app/
│   │   ├── ai/               # Gemini LLM Provider, ATS & Roadmap services
│   │   ├── models/           # SQLAlchemy DB Models (User, Resume, Job, Company)
│   │   ├── routers/          # FastAPI API Endpoints (Auth, Matching, Chatbot, Jobs)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Core business logic & ChromaDB matching engine
│   │   └── live_job_search/  # Multi-provider job scraping & aggregation engine
│   └── .env.example          # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios API instance with JWT interceptors
│   │   ├── layouts/          # Auth & Dashboard Layouts
│   │   ├── pages/            # Recommended Jobs, Skill Gap, Chatbot, Resume pages
│   │   ├── services/         # API Service client methods
│   │   └── store/            # Auth state store (Zustand)
│   └── package.json
├── requirements.txt          # Backend Python dependencies
└── README.md                 # Evaluation documentation
```

---

## 📜 API Highlights

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | User Registration |
| `POST` | `/api/v1/auth/login` | User Login & JWT Token issuance |
| `POST` | `/api/v1/resume/upload` | Upload & parse PDF/DOCX resume |
| `GET` | `/api/v1/matching/jobs/recommended` | Hybrid AI Job Recommendations |
| `GET` | `/api/v1/matching/skill-gap/{job_id}` | Calculate candidate skill gaps |
| `POST` | `/api/v1/chatbot/message` | AI Interview Prep & Career Chatbot |
| `GET` | `/api/v1/live-jobs/search` | Aggregated real-time job search |
