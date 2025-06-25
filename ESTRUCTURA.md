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
│   │   ├── scripts/
│   │   │   └── main.js
│   │   ├── styles/
│   │   │   └── main.css
│   │   └── index.html
│   └── package.json
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   └── frontend/
│       └── Dockerfile
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── infrastructure/
│   ├── terraform/
│   └── kubernetes/
├── docker-compose.yml
└── README.md