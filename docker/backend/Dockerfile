FROM python:3.10-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y gcc

# Copiar requirements e instalar
COPY ./backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar toda la aplicación backend
COPY ./backend .

# Puerto expuesto
EXPOSE 8000

# Comando para iniciar
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]