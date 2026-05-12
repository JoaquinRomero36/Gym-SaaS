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

---

## Inicio rápido con Docker

```bash
# 1. Clonar el repo
git clone <url>
cd what-a-hel

# 2. Copiar env
cp backend/.env.example backend/.env

# 3. Iniciar todo (build + run)
docker compose up --build
```

Esto levanta:
- `backend` → http://localhost:3000
- `frontend` → http://localhost:4200
- `ai-service` → http://localhost:8000 (entrenamiento automático en primer build)
- `postgres` → puerto 5432
- `redis` → puerto 6379

### Seed de datos

```bash
# Ejecutar dentro del contenedor backend:
docker compose exec backend npm run seed
```

Crea: 1 gym demo, 1 admin (`admin@gym.com` / `admin123`), 1 coach (`coach@gym.com` / `coach123`), 1 member (`member@gym.com` / `member123`).

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
cd ..
cd frontend
npx ng serve          # http://localhost:4200
```

### AI Service

```bash
cd ai-service
pip install -r requirements.txt
python training/seed_data.py
python training/train.py
uvicorn main:app --port 8000
```

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

## Variables de entorno

Ver `backend/.env.example`:

```
NODE_ENV=development
PORT=3000
APP_ORIGIN=http://localhost:4200

DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=secret
DATABASE_NAME=gym

REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=change-this-secret-min-32-characters
JWT_REFRESH_SECRET=change-this-refresh-secret-min-32
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

AI_SERVICE_URL=http://ai-service:8000

CHURN_THRESHOLD_HIGH=0.7
CHURN_THRESHOLD_MEDIUM=0.4
```

---

## Licencia

MIT
