# Prompt para Claude Code — AI Gym Retention SaaS

---

## ⚠️ Instrucción de uso

Pegá este prompt en Claude Code **antes de escribir una sola línea de código**.
Usá el modo plan primero: decile a Claude Code que **planifique sin implementar** hasta que apruebes cada fase.

Comando sugerido para empezar:
```
Read this prompt carefully. Do NOT write any code yet. 
First, generate a complete file/folder structure for the project and wait for my approval.
```

---

## 🧠 Contexto del proyecto

Estás construyendo **AI Gym Retention SaaS**, un sistema multi-tenant orientado a gimnasios que reduce la deserción de clientes usando inteligencia artificial.

**No es un gestor de rutinas tradicional. Es un sistema de predicción + acción.**

El sistema tiene tres actores: **Admin** (gestiona el gym), **Coach** (gestiona miembros) y **Miembro** (genera datos). La IA detecta usuarios en riesgo de abandono y dispara mensajes automatizados.

---

## 🧱 Stack obligatorio

| Capa | Tecnología |
|---|---|
| Frontend | Angular 17+ con standalone components, RxJS, Tailwind CSS |
| Backend | Node.js + NestJS con arquitectura modular |
| Base de datos | PostgreSQL con TypeORM |
| IA / ML | Python + scikit-learn (microservicio separado con FastAPI) |
| Colas | BullMQ + Redis |
| Autenticación | JWT (access token 15min + refresh token 7 días) |
| Infraestructura | Docker + Docker Compose |

---

## 🗂️ Estructura de carpetas esperada

```
/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/
│   │   ├── gyms/
│   │   ├── users/
│   │   ├── coaches/
│   │   ├── routines/
│   │   ├── attendance/
│   │   ├── feedback/
│   │   ├── risk/
│   │   ├── notifications/
│   │   ├── jobs/
│   │   └── common/
│   │       ├── guards/         # JwtAuthGuard, RolesGuard, TenantGuard
│   │       ├── decorators/
│   │       └── interceptors/
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # Angular SPA
│   ├── src/app/
│   │   ├── core/               # AuthService, Guards, Interceptors
│   │   ├── shared/             # Componentes reutilizables
│   │   ├── features/
│   │   │   ├── admin/
│   │   │   ├── coach/
│   │   │   └── member/
│   │   └── layouts/
│   └── Dockerfile
│
├── ai-service/                 # FastAPI + scikit-learn
│   ├── main.py
│   ├── models/
│   ├── training/
│   │   └── seed_data.py        # Generador de datos sintéticos
│   ├── Dockerfile
│   └── requirements.txt
│
└── docker-compose.yml
```

---

## 🗃️ Modelo de datos completo

Implementá estas entidades con TypeORM. **Toda entidad debe tener `gym_id` como foreign key** (excepto `Gym`).

```typescript
// Gym
id, name, plan (basic|pro|enterprise), createdAt

// User (miembro)
id, gym_id, coach_id (nullable), name, email, passwordHash,
level (beginner|intermediate|advanced), joinedAt, status (active|inactive|churned)

// Coach
id, gym_id, name, email, passwordHash

// Routine
id, gym_id, coach_id, user_id, name, createdAt

// Exercise
id, routine_id, name, sets, reps, order

// AttendanceLog
id, user_id, gym_id, date, completed (boolean)

// FeedbackEntry
id, user_id, gym_id, date, effortLevel (1-5), energyLevel (1-5), note (nullable)

// RiskScore
id, user_id, gym_id, score (decimal 0.0-1.0), category (low|medium|high),
calculatedAt, features (JSONB)

// Notification
id, user_id, gym_id, channel (whatsapp|email|in-app), message,
trigger (inactivity|low_feedback|high_risk|milestone|manual),
sentAt, status (pending|sent|failed)
```

---

## 🔐 Autenticación y multi-tenancy

Implementá tres guards en NestJS:

1. **`JwtAuthGuard`** — verifica y decodifica el token JWT
2. **`RolesGuard`** — verifica que el rol del usuario (`admin | coach | member`) coincida con el decorador `@Roles()`
3. **`TenantGuard`** — extrae `gymId` del token y lo inyecta en cada request; ningún query debe ejecutarse sin filtrar por `gym_id`

El payload del JWT debe contener: `{ sub: userId, gymId, role, email }`

Todos los módulos aplican estos guards por default. Los endpoints públicos se marcan con `@Public()`.

---

## 🤖 Servicio de IA (FastAPI)

### Endpoints requeridos

```
POST /predict/churn          — recibe features de un usuario, devuelve score y categoría
POST /predict/churn/batch    — procesa lista de usuarios
POST /messaging/generate     — recibe contexto del usuario, devuelve mensaje personalizado
GET  /health
```

### Features para predicción de churn

```python
{
  "days_since_last_attendance": int,
  "weekly_frequency": float,       # promedio últimas 4 semanas
  "tenure_days": int,
  "consistency_score": float,      # 0.0 - 1.0
  "avg_effort_level": float,       # últimas 5 sesiones
  "avg_energy_level": float,
  "feedback_count_last_2w": int
}
```

### Respuesta esperada

```json
{
  "score": 0.78,
  "category": "high",
  "calculated_at": "2024-01-01T00:00:00Z"
}
```

### Dataset sintético (seed_data.py)

Generá 500 usuarios ficticios con reglas lógicas:
- `days_inactive > 14` + `avg_effort < 2` → label churn = 1
- `weekly_frequency > 3` + `consistency > 0.7` → label churn = 0
- Casos intermedios con ruido aleatorio

Entrenando con Logistic Regression como modelo base.

---

## 🔁 Jobs (BullMQ)

Implementá estas cuatro colas:

| Job name | Trigger | Lógica |
|---|---|---|
| `churn-prediction-job` | Cron diario 2AM | Recalcula score de todos los usuarios activos del gym |
| `churn-prediction-single-job` | Bajo demanda | Recalcula un usuario específico por `userId` |
| `messaging-job` | Evento (trigger detectado) | Llama al AI service, guarda y envía notificación |
| `coach-alert-job` | Post-predicción | Si usuario pasó a categoría `high`, crea alerta para su coach |

---

## 🖥️ Frontend — Vistas requeridas

### Admin
- `/admin/dashboard` — métricas globales (usuarios activos, % en riesgo, mensajes enviados)
- `/admin/coaches` — CRUD de coaches

### Coach
- `/coach/dashboard` — lista de miembros con risk score (badge de color)
- `/coach/members/:id` — detalle de miembro: historial, feedback, score, alertas activas
- `/coach/routines` — listado de rutinas
- `/coach/routines/create` — constructor de rutina con ejercicios

### Miembro
- `/member/routine` — rutina del día con checklist de ejercicios
- `/member/feedback` — form rápido de esfuerzo/energía post-sesión
- `/member/progress` — gráfico básico de asistencia
- `/member/notifications` — historial de mensajes recibidos

### Auth
- `/login` — formulario por rol
- `/register` — registro básico de gym + admin

---

## 📐 Convenciones de código

### Backend (NestJS)
- Cada módulo tiene: `module.ts`, `controller.ts`, `service.ts`, `dto/`, `entities/`
- Usar `class-validator` + `class-transformer` en todos los DTOs
- Respuesta siempre con shape: `{ data, meta?, error? }`
- Nunca exponer stack traces al cliente
- Usar el módulo `Logger` de NestJS, nunca `console.log`
- Naming: `PascalCase` para clases, `camelCase` para métodos, `kebab-case` para archivos

### Frontend (Angular)
- Standalone components en todos lados (sin NgModules)
- Usar `inject()` en lugar de constructor injection
- `HttpClient` siempre dentro de services, nunca en components
- Estado con `BehaviorSubject` o `signal()`
- Lazy loading para cada feature module

### Base de datos
- Migraciones con TypeORM (no `synchronize: true` en producción)
- Todo query filtrado por `gym_id` — nunca queries globales
- Índices en: `user_id`, `gym_id`, `status`, `calculatedAt`

---

## 🐳 Docker Compose

Levantá estos servicios:
- `backend` (NestJS, puerto 3000)
- `frontend` (Angular con nginx, puerto 4200)
- `ai-service` (FastAPI, puerto 8000)
- `postgres` (puerto 5432)
- `redis` (puerto 6379)

Con variables de entorno para: `DATABASE_URL`, `REDIS_URL`, `AI_SERVICE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`.

---

## 🚀 Fases de implementación

**Implementá en este orden exacto. Pedí aprobación antes de pasar a la siguiente fase.**

### Fase 1 — Infraestructura base
- Docker Compose completo con todos los servicios
- NestJS con configuración inicial, módulo de health check
- PostgreSQL conectado con TypeORM
- Redis conectado
- Variables de entorno configuradas

### Fase 2 — Auth y multi-tenancy
- Módulo `auth` con registro y login (JWT)
- Los tres guards: `JwtAuthGuard`, `RolesGuard`, `TenantGuard`
- Endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- Seed básico de un gym, un admin, un coach y un miembro de prueba

### Fase 3 — Core del negocio (tracer bullet completo)
- Módulos: `gyms`, `users`, `coaches`, `routines`, `exercises`
- CRUD completo con guards aplicados
- Un flujo end-to-end: coach crea rutina → asigna a usuario → usuario la visualiza

### Fase 4 — Datos de actividad
- Módulos: `attendance`, `feedback`
- Endpoints para registrar asistencia y feedback por sesión
- Queries para calcular las features del modelo de IA

### Fase 5 — Servicio de IA
- FastAPI con el endpoint de predicción
- Dataset sintético en `seed_data.py`
- Modelo entrenado y serializado con `joblib`
- Endpoint de generación de mensajes con prompt estructurado

### Fase 6 — Jobs y automatización
- BullMQ configurado con Redis
- Las cuatro colas implementadas
- Cron para predicción masiva diaria
- Integración backend → AI service via HTTP

### Fase 7 — Frontend
- Estructura Angular con routing por rol
- Todas las vistas listadas arriba
- Interceptor HTTP para JWT
- Guards de routing por rol

### Fase 8 — Polish
- Manejo de errores global (NestJS exception filter)
- Logging estructurado
- README final con instrucciones de setup
- Variables de entorno de ejemplo (`.env.example`)

---

## ✅ Checklist de calidad por fase

Antes de marcar una fase como completa, verificá:
- [ ] Los guards están aplicados en todos los endpoints
- [ ] Ningún query corre sin filtrar por `gym_id`
- [ ] Los DTOs tienen validación con `class-validator`
- [ ] No hay `console.log` en el código
- [ ] El Docker Compose levanta sin errores
- [ ] Hay al menos un test de integración por módulo nuevo

---

## 💬 Instrucción final

Empezá generando **solo la estructura de carpetas y el `docker-compose.yml`**.
No escribas lógica de negocio todavía. Esperá confirmación antes de continuar con la Fase 1.
