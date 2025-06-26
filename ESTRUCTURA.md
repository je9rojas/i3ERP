i3pyERP/
├── backend/
│   ├── app/
│   │   ├── blueprints/
│   │   │   ├── auth/
│   │   │   │   ├── routes.py
│   │   │   │   ├── services.py
│   │   │   │   └── schemas.py
│   │   │   ├── dashboard/
│   │   │   └── users/
│   │   ├── core/
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   └── user.py
│   │   ├── services/
│   │   ├── utils/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── migrations/
│   ├── scripts/
│   │   └── create_admin.py
│   ├── .env
│   ├── .flaskenv
│   ├── requirements.txt
│   └── venv/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/          # Todos los recursos visuales
│   │   │   ├── fonts/           # Fuentes personalizadas
│   │   │   └── favicon.ico
│   │   ├── css/
│   │   │   ├── base/            # Estilos base y reset
│   │   │   │   ├── _reset.css
│   │   │   │   ├── _variables.css
│   │   │   │   └── _typography.css
│   │   │   ├── components/      # Componentes reutilizables
│   │   │   │   ├── _buttons.css
│   │   │   │   ├── _cards.css
│   │   │   │   ├── _forms.css
│   │   │   │   └── _tables.css
│   │   │   ├── layouts/         # Estructuras de página
│   │   │   │   ├── _dashboard.css
│   │   │   │   ├── _auth.css
│   │   │   │   └── _sidebar.css
│   │   │   └── main.css         # Archivo principal que importa todos los demás
│   │   ├── js/
│   │   │   ├── lib/             # Librerías de terceros (si no usas CDN)
│   │   │   ├── modules/         # Módulos independientes
│   │   │   │   ├── api.js       # Cliente API
│   │   │   │   ├── auth.js      # Manejo de autenticación
│   │   │   │   ├── charts.js    # Configuración de gráficos
│   │   │   │   └── utils.js     # Funciones utilitarias
│   │   │   ├── pages/           # Lógica específica de cada página
│   │   │   │   ├── dashboard.js
│   │   │   │   ├── login.js
│   │   │   │   └── ...
│   │   │   └── main.js          # Punto de entrada principal
│   │   ├── templates/           # Plantillas HTML
│   │   │   ├── base.html        # Plantilla maestra
│   │   │   ├── dashboard.html   # Dashboard principal
│   │   │   ├── login.html       # Página de inicio de sesión
│   │   │   └── ...
│   │   └── index.html           # Punto de entrada (redirección)
│   ├── package.json
│   ├── webpack.config.js        # Configuración de Webpack (opcional)
│   └── .babelrc                 # Configuración de Babel (opcional)
│
└── ... (resto de la estructura)