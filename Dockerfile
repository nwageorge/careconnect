# Builds the React app and serves it together with the FastAPI backend
# from a single container. Used by render.yaml; works on any Docker host.

# --- Frontend build ---
FROM node:20-bookworm-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000
COPY frontend/ ./
# Empty backend URL: the app calls /api on the same site
ENV REACT_APP_BACKEND_URL="" \
    GENERATE_SOURCEMAP=false
RUN yarn build

# --- Backend + static files ---
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend/ backend/
COPY --from=frontend /app/frontend/build frontend/build
WORKDIR /app/backend
EXPOSE 8000
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers"]
