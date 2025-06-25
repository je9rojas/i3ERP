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



