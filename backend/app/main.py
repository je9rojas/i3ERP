from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
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
        if request.url.path.startswith(("/public", "/assets", "/styles", "/scripts")):
            # Archivos JS/CSS - 1 año
            if any(request.url.path.endswith(ext) for ext in ['.js', '.css', '.scss']):
                response.headers["Cache-Control"] = "public, max-age=31536000"
            
            # Imágenes - 1 año
            elif any(request.url.path.endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.svg']):
                response.headers["Cache-Control"] = "public, max-age=31536000"
            
            # HTML - no cache
            elif request.url.path.endswith('.html'):
                response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        
        return response

# Configuración de CORS más estricta
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Authorization"]  # Exponer el header de autorización
)

# Agregar middleware de caché
app.add_middleware(StaticCacheMiddleware)

# Obtener la ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

# Configuración de directorios profesional
public_dir = FRONTEND_DIR / "public"            # Archivos públicos
assets_dir = FRONTEND_DIR / "src" / "assets"    # Recursos (imágenes, fuentes)
styles_dir = FRONTEND_DIR / "src" / "styles"    # Hojas de estilo
scripts_dir = FRONTEND_DIR / "src" / "scripts"  # JavaScript
templates_dir = FRONTEND_DIR / "src" / "templates"  # Plantillas

# Crear directorios si no existen (solo para desarrollo)
os.makedirs(public_dir, exist_ok=True)
os.makedirs(assets_dir, exist_ok=True)
os.makedirs(styles_dir, exist_ok=True)
os.makedirs(scripts_dir, exist_ok=True)
os.makedirs(templates_dir, exist_ok=True)

# Montar archivos estáticos con rutas específicas
app.mount("/public", StaticFiles(directory=str(public_dir)), name="public")
app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
app.mount("/styles", StaticFiles(directory=str(styles_dir)), name="styles")
app.mount("/scripts", StaticFiles(directory=str(scripts_dir)), name="scripts")

print(f"✅ Archivos públicos montados desde: {public_dir}")
print(f"✅ Assets montados desde: {assets_dir}")
print(f"✅ Estilos montados desde: {styles_dir}")
print(f"✅ Scripts montados desde: {scripts_dir}")

# SOLUCIÓN CRÍTICA: Usar ruta absoluta para templates
templates_dir_abs = templates_dir.resolve()

# Configuración de templates
try:
    templates = Jinja2Templates(directory=str(templates_dir_abs))
    
    # Verificar existencia de plantillas críticas
    required_templates = [
        "layouts/base.html",
        "layouts/auth.html",
        "layouts/base.html",
        "pages/auth/login.html",
        "pages/dashboard/index.html"
    ]
    
    for template in required_templates:
        template_path = templates_dir_abs / template
        if not template_path.exists():
            print(f"⚠️ ERROR CRÍTICO: Plantilla {template} no encontrada en {template_path}")
        else:
            print(f"✓ Plantilla encontrada: {template}")
    
    print(f"✅ Motor de plantillas Jinja2 configurado correctamente en: {templates_dir_abs}")
    
except Exception as e:
    print(f"❌ Error configurando plantillas: {e}")
    print(f"Ruta de templates: {templates_dir_abs}")
    print(f"¿Existe el directorio? {os.path.exists(templates_dir_abs)}")
    templates = None

# Ruta principal - Página de inicio
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    if not templates:
        return HTMLResponse(content="<h1>Sistema en mantenimiento</h1>", status_code=500)
    
    try:
        # Verificación adicional de la plantilla base
        base_template = templates_dir_abs / "layouts" / "base.html"
        if not base_template.exists():
            return HTMLResponse(content=f"<h1>Error: Plantilla base no encontrada en {base_template}</h1>", status_code=500)
        
        context = {
            "request": request,
            "company": {
                "name": "i3ERP Solutions",
                "mission": "Transformar negocios con tecnología innovadora",
                "vision": "Líderes en soluciones ERP para PyMEs"
            },
            "static_path": "/styles",
            "scripts_path": "/scripts",
            "assets_path": "/assets"
        }
        return templates.TemplateResponse("pages/dashboard/index.html", context)
    except Exception as e:
        print(f"❌ Error cargando la página de inicio (dashboard): {e}")
        traceback.print_exc()
        return HTMLResponse(content=f"<h1>Error interno: {str(e)}</h1>", status_code=500)

# Ruta de login - Interfaz de autenticación
@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    if not templates:
        return HTMLResponse(content="<h1>Sistema en mantenimiento</h1>", status_code=500)
    
    try:
        # Verificar existencia de recursos estáticos
        css_path = styles_dir / "pages" / "auth.css"
        js_path = scripts_dir / "modules" / "auth" / "auth.js"
        auth_service_path = scripts_dir / "core" / "auth.js"
        
        if not css_path.exists():
            print(f"⚠️ Advertencia: Archivo CSS no encontrado: {css_path}")
        if not js_path.exists():
            print(f"⚠️ Advertencia: Archivo JS no encontrado: {js_path}")
        if not auth_service_path.exists():
            print(f"⚠️ Advertencia: Archivo JS no encontrado: {auth_service_path}")
        
        context = {
            "request": request,
            "static_path": "/styles",
            "scripts_path": "/scripts",
            "assets_path": "/assets"
        }
        
        return templates.TemplateResponse("pages/auth/login.html", context)
    except Exception as e:
        print(f"❌ Error cargando login.html: {e}")
        traceback.print_exc()
        return HTMLResponse(content=f"<h1>Error interno: {str(e)}</h1>", status_code=500)

# Ruta de dashboard - Panel de administración
@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    if not templates:
        return HTMLResponse(content="<h1>Sistema en mantenimiento</h1>", status_code=500)
    
    try:
        context = {
            "request": request,
            "static_path": "/styles",
            "scripts_path": "/scripts",
            "assets_path": "/assets"
        }
        
        return templates.TemplateResponse("pages/dashboard/index.html", context)
    except Exception as e:
        print(f"❌ Error cargando dashboard.html: {e}")
        traceback.print_exc()
        return HTMLResponse(content=f"<h1>Error interno: {str(e)}</h1>", status_code=500)

# Ruta de logout - Cerrar sesión
@app.get("/logout", response_class=HTMLResponse)
async def logout():
    """Cierra la sesión del usuario (manejo real en cliente)"""
    return RedirectResponse(url="/login")

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