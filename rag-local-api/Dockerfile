FROM python:3.11-slim

ENV LANG=C.UTF-8 \
    DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1

# Instalar dependencias del sistema requeridas para OCR, procesamiento de PDFs e imágenes HEIC
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl build-essential \
    libglib2.0-0 libsm6 libxext6 libxrender-dev \
    libgl1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*


WORKDIR /app

# Copiar solo requirements primero (para cachear instalación)
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache/pip

# Copiar el resto del código (ya con .dockerignore activo)
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
