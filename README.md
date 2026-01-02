# VeriFact – AI-Assisted Web Fact Verification

VeriFact is a web application that allows users to verify the credibility of claims or news articles using AI-assisted fact-checking. It combines web search, data retrieval, and language model reasoning to provide contextual verification results.

## Key Features
- Claim input interface for user-submitted statements
- Automated search of related sources on the web
- AI-based summarization and reasoning
- Credibility feedback with confidence indication
- Stored query history for recent fact checks

## Tech Stack
- Frontend: React, Tailwind CSS
- Backend: Node.js, Express
- AI / NLP: Groq LLM integration
- Database: MongoDB
- APIs: DuckDuckGo search

## Project Structure
```text
verifact/
├── backend/
├── frontend/
└── README.md
```

## How to Run Locally

### 1. Install dependencies
```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Start backend server
```bash
cd backend
npm run dev
```

### 3. Start frontend
```bash
cd frontend
npm run dev
```

### 4. Open in browser
http://localhost:3000

## Notes
- API keys for AI and search services should be configured in `.env` files.
- This project demonstrates backend development combined with AI-based reasoning and real-time data retrieval.
