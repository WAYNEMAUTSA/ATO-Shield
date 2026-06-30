# ATO-Shield

A demo account takeover and fraud detection app with a FastAPI backend and Vite React frontend.

## Local setup

### Prerequisites
- Python 3.12+
- Node.js 18+ / npm
- Git

### Install dependencies

```bash
cd backend
python -m pip install -r requirements.txt

cd ../frontend
npm install
```

## Start servers

A helper script is included to launch servers separately or together:

```bash
./start-servers.sh backend    # run the FastAPI backend on http://localhost:8000
./start-servers.sh user       # run the user frontend on http://localhost:5173
./start-servers.sh analyst    # run the analyst frontend on http://localhost:5174
./start-servers.sh all        # start backend + user + analyst together
```

### Manual start commands

Backend:

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

User frontend:

```bash
cd frontend
VITE_API_BASE_URL=http://localhost:8000/api/v1 npm run dev -- --host 0.0.0.0 --port 5173
```

Analyst frontend:

```bash
cd frontend
VITE_API_BASE_URL=http://localhost:8000/api/v1 npm run dev -- --host 0.0.0.0 --port 5174
```

## URLs

- Backend: `http://localhost:8000`
- API: `http://localhost:8000/api/v1`
- User app: `http://localhost:5173`
- Analyst app: `http://localhost:5174`

## Notes

- The frontend uses the backend transaction API at `/api/v1/transactions`.
- Use the helper script for local demo workflow to avoid manually managing ports.
