# Crear entorno virtual
cd pyERP/backend
python -m venv venv
# Para Windows: 
.\venv\Scripts\activate



# Iniciar MongoDB (en otra terminal)
docker run -d -p 27017:27017 --name mongo mongo:5.0

# En la terminal principal (dentro del entorno virtual)
cd pyERP/backend
uvicorn app.main:app --reload

# Para ejecutar con Docker Compose
docker-compose up --build





¿Cómo ejecutar ahora?
Opción 1: Solo backend (para desarrollo API)
bash
# En la terminal del backend
cd D:\Projects\i3ERP\backend
uvicorn app.main:app --reload
Opción 2: Con Docker (backend + frontend)
bash
# En la raíz del proyecto
cd D:\Projects\i3ERP
docker compose up --build
Opción 3: Frontend separado (recomendado para desarrollo)
bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm install  # o yarn install
npm run dev  # o el comando de tu framework




Para usar el script:
Ejecuta desde el directorio backend:

bash
python -m scripts.create_admin

email = "admin@erp.com"  
password = "AdminERP"

pip freeze > requirements.txt



New-Item -Path "frontend/src/favicon.ico" -ItemType File

<link rel="stylesheet" href="/static/css/styles.css">
<script src="/static/js/app.js"></script>


uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug --app-dir backend

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug --app-dir backend