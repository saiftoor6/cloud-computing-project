# Single Container Dockerfile
# Serves both Frontend (Static) and Backend (Flask)

FROM python:3.12-slim

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=5000

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --default-timeout=1000 --retries 10 -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy frontend code (STATIC_DIR set in app.py as ../frontend)
# In Docker, we put it in /app/frontend so ../frontend works from /app/app
# Wait, app.py is in /app (WORKDIR), so ../frontend would be /frontend
# Let's adjust structure:
# /app/backend/app.py
# /app/frontend/
# But app.py is copied to /app/ in this Dockerfile steps usually.
# Let's check my app.py config: serving from '../frontend' relative to file.
# If I copy backend content to /app, app.py is at /app/app.py.
# Then ../frontend is /frontend.

# Let's structure it clearly inside container:
# /app/src/app.py
# /app/frontend/index.html

WORKDIR /app

# Copy Frontend
COPY frontend/ ./frontend/

# Copy Backend
COPY backend/ ./backend/
COPY slang.txt ./slang.txt

# Set working directory to backend for running gunicorn
WORKDIR /app/backend

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

# Run Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "4", "app:app"]
