# AI Gym Retention SaaS

Sistema multi-tenant SaaS que reduce la deserción de clientes en gimnasios usando inteligencia artificial. Predice abandono, automatiza mensajes y mejora la retención.

---

## Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | Angular 17+ (standalone components, RxJS, Tailwind CSS) |
| **Backend** | Node.js + NestJS (modular, guards multi-tenant) |
| **Base de datos** | PostgreSQL + TypeORM |
| **IA / ML** | Python + scikit-learn (FastAPI microservicio) |
| **Colas** | BullMQ + Redis |
| **Autenticación** | JWT (access + refresh token) |
| **Infraestructura** | Docker + Docker Compose |

---

## Requisitos

- Docker + Docker Compose
- Node.js 18+ (para desarrollo local)
- Python 3.11+ (para IA service, opcional)

---

## Inicio rápido con Docker

```bash
# 1. Clonar el repo
git clone <url>
cd gym

# 2. Copiar env
cp backend/.env.example backend/.env

# 3. Iniciar todo
docker compose up --build
```

Esto levanta:
- `backend` → http://localhost:3000
- `frontend` → http://localhost:4200
- `ai-service` → http://localhost:8000
- `postgres` → puerto 5432
- `redis` → puerto 6379

---

## Desarrollo local

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev    # http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run start        # http://localhost:4200
```

### AI Service

```bash
cd ai-service
pip install -r requirements.txt
python training/seed_data.py
python training/train.py
uvicorn main:app --port 8000
```

### Seed de datos

```bash
cd backend
npm run seed
```

> Crea: 1 gym demo, 1 admin (`admin@gym.com` / `admin123`), 1 coach (`coach@gym.com` / `coach123`), 1 member (`member@gym.com` / `member123`).

---

## Tests

```bash
cd backend
npm test             # Tests unitarios
npm run test:e2e     # Tests de integración
```

---

## Arquitectura

```
┌─────────────────────────────┐
│      Frontend (Angular)      │
│  Admin UI | Coach UI | Member│
└─────────────┬───────────────┘
              │ REST (JWT)
┌─────────────▼───────────────┐
│      Backend API (NestJS)    │
│  Auth | Gyms | Users | ...   │
└──────┬──────────────┬───────┘
       │              │
┌──────▼────┐  ┌──────▼──────────┐
│ PostgreSQL│  │  BullMQ + Redis  │
│ (multi-   │  │  (job queues)    │
│  tenant)  │  └──────┬──────────┘
└───────────┘         │
             ┌────────▼──────────┐
             │ AI Service (Python)│
             │ churn | messaging  │
             └───────────────────┘
```

---

## Endpoints de la API

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/auth/register` | Registro de usuario |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |

### Core
| Método | Ruta | Roles |
|---|---|---|
| GET/POST | `/api/v1/gyms` | admin |
| GET/POST | `/api/v1/users` | admin, coach |
| GET/POST | `/api/v1/coaches` | admin |
| GET/POST | `/api/v1/routines` | admin, coach |
| GET/POST | `/api/v1/exercises` | admin, coach |

### Actividad + IA
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/attendance` | Registrar asistencia |
| POST | `/api/v1/feedback` | Registrar feedback |
| POST | `/api/v1/risk/calculate/:userId` | Calcular score de churn |
| GET | `/api/v1/risk/:userId` | Último score |

### AI Service (interno)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/predict/churn` | Predicción individual |
| POST | `/predict/churn/batch` | Predicción batch |
| POST | `/messaging/generate` | Generar mensaje |
| GET | `/health` | Health check |

### Jobs
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/jobs/churn-prediction/:userId` | Forzar predicción |
| POST | `/api/v1/jobs/messaging/:userId` | Forzar mensaje |

---

## Variables de entorno

Ver `backend/.env.example`:

```
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=secret
DATABASE_NAME=gym
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=change-this-secret
JWT_REFRESH_SECRET=change-this-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8000
CHURN_THRESHOLD_HIGH=0.7
CHURN_THRESHOLD_MEDIUM=0.4
```

---

## Features de churn

| Feature | Descripción |
|---|---|
| `days_since_last_attendance` | Días desde última asistencia |
| `weekly_frequency` | Promedio semanal (4 semanas) |
| `tenure_days` | Antigüedad en días |
| `consistency_score` | Regularidad (0–1) |
| `avg_effort_level` | Esfuerzo promedio (1–5) |
| `avg_energy_level` | Energía promedio (1–5) |
| `feedback_count_last_2w` | Cantidad de feedbacks (14 días) |

---

## Licencia

MIT
