#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME=$(basename "$0")
PROJ_ROOT=$(cd "$(dirname "$0")" && pwd)
BACKEND_DIR="$PROJ_ROOT/backend"
FRONTEND_DIR="$PROJ_ROOT/frontend"

function usage() {
  cat <<EOF
Usage: $SCRIPT_NAME [backend|user|analyst|all|help]

Commands:
  backend   Start the FastAPI backend on port 8000
  user      Start the frontend app on port 5173 (user UI)
  analyst   Start the frontend app on port 5174 (analyst UI)
  all       Start backend, user frontend, and analyst frontend together
  help      Show this help message

Examples:
  ./start-servers.sh backend
  ./start-servers.sh user
  ./start-servers.sh analyst
  ./start-servers.sh all
EOF
}

function start_backend() {
  echo "Starting backend at http://localhost:8000"
  cd "$BACKEND_DIR"
  python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
}

function start_user_frontend() {
  echo "Starting user frontend at http://localhost:5173"
  cd "$FRONTEND_DIR"
  VITE_API_BASE_URL=http://localhost:8000/api/v1 npm run dev -- --host 0.0.0.0 --port 5173
}

function start_analyst_frontend() {
  echo "Starting analyst frontend at http://localhost:5174"
  cd "$FRONTEND_DIR"
  VITE_API_BASE_URL=http://localhost:8000/api/v1 npm run dev -- --host 0.0.0.0 --port 5174
}

function start_all() {
  echo "Starting backend, user frontend, and analyst frontend together..."
  echo "Backend log: $PROJ_ROOT/backend.log"
  echo "User frontend log: $PROJ_ROOT/frontend-user.log"
  echo "Analyst frontend log: $PROJ_ROOT/frontend-analyst.log"

  cd "$BACKEND_DIR"
  nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 >"$PROJ_ROOT/backend.log" 2>&1 &
  BACKEND_PID=$!

  cd "$FRONTEND_DIR"
  nohup env VITE_API_BASE_URL=http://localhost:8000/api/v1 npm run dev -- --host 0.0.0.0 --port 5173 >"$PROJ_ROOT/frontend-user.log" 2>&1 &
  USER_PID=$!

  nohup env VITE_API_BASE_URL=http://localhost:8000/api/v1 npm run dev -- --host 0.0.0.0 --port 5174 >"$PROJ_ROOT/frontend-analyst.log" 2>&1 &
  ANALYST_PID=$!

  echo "Started backend pid=$BACKEND_PID"
  echo "Started user frontend pid=$USER_PID"
  echo "Started analyst frontend pid=$ANALYST_PID"
  echo "Logs: backend.log, frontend-user.log, frontend-analyst.log"
}

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

case "$1" in
  backend)
    start_backend
    ;;
  user)
    start_user_frontend
    ;;
  analyst)
    start_analyst_frontend
    ;;
  all)
    start_all
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    echo "Unknown command: $1"
    usage
    exit 1
    ;;
esac
