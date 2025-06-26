from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pathlib import Path
import os
import traceback

# Configuración inicial de la app
app = FastAPI(
    title="i3ERP Sistema",
    description="Sistema ERP Integral con interfaz web",
    version="1.0.0"
)

# Middleware para caché de archivos estáticos
class StaticCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        
        # Aplicar políticas de caché solo a archivos estáticos
        if request.url.path.startswith(("/static", "/assets")):
            # Archivos JS/CSS - 1 año
            if any(request.url.path.endswith(ext) for ext in ['.js', '.css']):
                response.headers["Cache-Control"] = "public, max-age=31536000"
            
            # Imágenes - 1 año
            elif any(request.url.path.endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp']):
                response.headers["Cache-Control"] = "public, max-age=31536000"
            
            # HTML - no cache
            elif request.url.path.endswith('.html'):
                response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        
        return response

# Configura CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agregar middleware de caché
app.add_middleware(StaticCacheMiddleware)

# Obtener la ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Configuración para archivos estáticos (CSS, JS, imágenes)
static_dir = BASE_DIR / "frontend" / "src"
static_assets_dir = BASE_DIR / "frontend" / "src" / "assets"

# Crear directorios si no existen (solo para desarrollo)
os.makedirs(static_dir, exist_ok=True)
os.makedirs(static_assets_dir, exist_ok=True)

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
app.mount("/assets", StaticFiles(directory=str(static_assets_dir)), name="assets")

print(f"✅ Archivos estáticos montados desde: {static_dir}")

# Configuración de templates - Usando el directorio frontend/src
templates_dir = static_dir
try:
    templates = Jinja2Templates(directory=str(templates_dir))
    print(f"✅ Motor de plantillas Jinja2 configurado correctamente en: {templates_dir}")
except Exception as e:
    print(f"❌ Error configurando plantillas: {e}")
    templates = None

# Ruta principal - Página de inicio
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    if not templates:
        return HTMLResponse(content="<h1>Sistema en mantenimiento</h1>", status_code=500)
    
    # Verificar si existe el archivo index.html
    index_path = static_dir / "index.html"
    if not index_path.exists():
        return HTMLResponse(content="<h1>Archivo index.html no encontrado</h1>", status_code=404)
    
    return templates.TemplateResponse("index.html", {
        "request": request,
        "company": {
            "name": "i3ERP Solutions",
            "mission": "Transformar negocios con tecnología innovadora",
            "vision": "Líderes en soluciones ERP para PyMEs"
        }
    })

# Ruta de login - Interfaz de autenticación
@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    if not templates:
        return HTMLResponse(content="<h1>Sistema en mantenimiento</h1>", status_code=500)
    
    # Verificar si existe el archivo login.html
    login_path = static_dir / "login.html"
    if not login_path.exists():
        return HTMLResponse(content="<h1>Archivo login.html no encontrado</h1>", status_code=404)
    
    return templates.TemplateResponse("login.html", {"request": request})

# Ruta de dashboard - Panel de administración
@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    if not templates:
        return HTMLResponse(content="<h1>Sistema en mantenimiento</h1>", status_code=500)
    
    # Verificar si existe el archivo dashboard.html
    dashboard_path = static_dir / "dashboard.html"
    if not dashboard_path.exists():
        return HTMLResponse(content="<h1>Archivo dashboard.html no encontrado</h1>", status_code=404)
    
    return templates.TemplateResponse("dashboard.html", {"request": request})

# Ruta de logout - Cerrar sesión
@app.get("/logout", response_class=HTMLResponse)
async def logout():
    """Cierra la sesión del usuario (manejo real en cliente)"""
    return RedirectResponse(url="/login")

# Ruta para favicon - SOLUCIÓN PROFESIONAL
@app.get("/favicon.ico", include_in_schema=False)
async def get_favicon():
    """
    Maneja las solicitudes de favicon de manera eficiente.
    - Primero busca en la ubicación estándar (assets/favicon.ico)
    - Si no existe, devuelve un favicon vacío en memoria
    - Configura cabeceras de caché adecuadas
    """
    # Ruta correcta del favicon
    favicon_path = static_assets_dir / "favicon.ico"
    
    # Opción 1: Favicon existe - devolver con caché
    if favicon_path.exists():
        return FileResponse(
            favicon_path,
            headers={"Cache-Control": "public, max-age=31536000"}  # 1 año
        )
    
    # Opción 2: Favicon no existe - devolver ícono vacío en memoria
    from fastapi.responses import Response
    return Response(
        content=b"",  # Contenido vacío
        media_type="image/x-icon",
        headers={
            "Cache-Control": "public, max-age=3600",  # 1 hora de caché
            "X-Content-Type-Options": "nosniff"
        }
    )

# --- IMPORTACIÓN MANUAL DE ROUTERS ---
try:
    from app.blueprints.auth.routes import router as auth_router
    app.include_router(auth_router, prefix="/api/auth", tags=["Autenticación"])
    print("✅ Módulo Auth cargado correctamente")
except ImportError as e:
    print(f"⚠️ Error cargando módulo Auth: {str(e)}")
    traceback.print_exc()
except AttributeError as e:
    print(f"⚠️ Error en la estructura del módulo Auth: {str(e)}")
    traceback.print_exc()
except Exception as e:
    print(f"⚠️ Error inesperado en módulo Auth: {str(e)}")
    traceback.print_exc()

try:
    from app.blueprints.users.routes import router as users_router
    app.include_router(users_router, prefix="/api/users", tags=["Usuarios"])
    print("✅ Módulo Users cargado correctamente")
except ImportError as e:
    print(f"⚠️ Error cargando módulo Users: {str(e)}")
    traceback.print_exc()
except Exception as e:
    print(f"⚠️ Error inesperado en módulo Users: {str(e)}")
    traceback.print_exc()

try:
    from app.blueprints.dashboard.routes import router as dashboard_router
    app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
    print("✅ Módulo Dashboard cargado correctamente")
except ImportError:
    print("⚠️ Advertencia: Módulo Dashboard no encontrado. Continuando sin dashboard...")
except Exception as e:
    print(f"⚠️ Error cargando módulo Dashboard: {str(e)}")
    traceback.print_exc()

# Evento de inicio
@app.on_event("startup")
async def startup_db():
    from app.core.database import init_db
    try:
        await init_db()
        print("✅ Base de datos conectada exitosamente")
    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {e}")

# Función para imprimir rutas registradas
@app.on_event("startup")
async def print_routes():
    print("\n🌐 Rutas registradas:")
    for route in app.routes:
        if hasattr(route, "methods") and hasattr(route, "path"):
            methods = ",".join(route.methods)
            print(f"  - {methods} {route.path}")
    
    print("\n✨ Aplicación iniciada correctamente")
    print(f"🌐 Accede a: http://localhost:8000")
    print("🔍 Prueba las rutas de autenticación:")
    print(f"  - POST http://localhost:8000/api/auth/token")
    print(f"  - POST http://localhost:8000/api/auth/register")
    print(f"  - GET  http://localhost:8000/api/auth/me")