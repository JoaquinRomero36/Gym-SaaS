# 🧠 AI Gym Retention SaaS

## 📌 Descripción general

Sistema SaaS orientado a gimnasios que permite **reducir la deserción de clientes** mediante el uso de datos y modelos de inteligencia artificial.

El sistema:

- registra comportamiento de los miembros
- detecta patrones de abandono
- automatiza acciones (mensajes, alertas, ajustes)
- mejora la toma de decisiones del gimnasio

No es un gestor de rutinas tradicional. Es un **sistema de predicción + acción**.

---

## 🎯 Problema que resuelve

Los gimnasios pierden clientes por:

- falta de seguimiento personalizado
- rutinas mal adaptadas al nivel del usuario
- baja motivación sin intervención oportuna
- ausencia de alertas tempranas de abandono

**Impacto directo:** pérdida de ingresos recurrentes y baja retención mensual.

---

## 💡 Qué demuestra este proyecto

Este proyecto fue diseñado intencionalmente para exhibir habilidades de desarrollo full-stack con IA integrada en un contexto real:

| Área | Qué se demuestra |
|---|---|
| **Arquitectura** | Separación de responsabilidades, modularidad, event-driven con colas |
| **Backend** | API REST con NestJS, guards multi-tenant, autenticación JWT |
| **Base de datos** | Modelo relacional multi-tenant, queries con filtrado por `gym_id` |
| **IA / ML** | Modelo de clasificación supervisada integrado en un flujo real |
| **Async processing** | BullMQ + Redis para jobs de predicción y mensajería |
| **Escalabilidad** | Diseño SaaS desde el inicio, aislamiento de datos por tenant |

---

## 🧑‍💼 Roles del sistema

### 1. Administrador del gimnasio

- Gestiona el gimnasio dentro del sistema
- Crea y administra coaches
- Configura planes y límites de uso
- Visualiza métricas globales del negocio

### 2. Coach del gimnasio

- Seguimiento directo de los miembros
- Diseño y ajuste de rutinas
- Intervención en casos de riesgo detectados por IA
- Recibe alertas y toma decisiones sobre acciones sugeridas

### 3. Miembro del gimnasio

- Ejecuta rutinas asignadas
- Genera datos (clave para el sistema)
- Registra feedback de cada sesión
- Recibe mensajes y recordatorios automatizados

> **Restricción:** el miembro no accede a métricas internas ni ve su propio score de abandono.

---

## 🗃️ Modelo de datos

### Entidades principales

```
Gym
├── id (PK)
├── name
├── plan (basic | pro | enterprise)
├── createdAt

User  (miembro)
├── id (PK)
├── gym_id (FK → Gym)
├── coach_id (FK → Coach, nullable)
├── name
├── email
├── level (beginner | intermediate | advanced)
├── joinedAt
├── status (active | inactive | churned)

Coach
├── id (PK)
├── gym_id (FK → Gym)
├── name
├── email

Routine
├── id (PK)
├── gym_id (FK → Gym)
├── coach_id (FK → Coach)
├── user_id (FK → User)
├── name
├── createdAt

Exercise
├── id (PK)
├── routine_id (FK → Routine)
├── name
├── sets
├── reps
├── order

AttendanceLog
├── id (PK)
├── user_id (FK → User)
├── gym_id (FK → Gym)
├── date
├── completed (boolean)

FeedbackEntry
├── id (PK)
├── user_id (FK → User)
├── gym_id (FK → Gym)
├── date
├── effortLevel (1–5)
├── energyLevel (1–5)
├── note (optional)

RiskScore
├── id (PK)
├── user_id (FK → User)
├── gym_id (FK → Gym)
├── score (0.0 – 1.0)
├── category (low | medium | high)
├── calculatedAt
├── features (JSONB — snapshot de inputs usados)

Notification
├── id (PK)
├── user_id (FK → User)
├── gym_id (FK → Gym)
├── channel (whatsapp | email | in-app)
├── message
├── trigger (inactivity | low_feedback | high_risk | manual)
├── sentAt
├── status (pending | sent | failed)
```

### Relaciones clave

- Un `Gym` tiene muchos `Users`, `Coaches` y `Routines`
- Un `User` tiene muchos `AttendanceLogs`, `FeedbackEntries`, `RiskScores` y `Notifications`
- Cada entidad lleva `gym_id` para aislamiento multi-tenant

---

## 🔐 Autenticación y seguridad

- **JWT** con access token (15 min) + refresh token (7 días)
- El payload del token incluye: `userId`, `gymId`, `role`
- **Guards en NestJS:**
  - `JwtAuthGuard` — verifica token
  - `RolesGuard` — verifica rol (`admin | coach | member`)
  - `TenantGuard` — inyecta `gym_id` en el contexto de cada request y filtra datos automáticamente
- Ningún endpoint expone datos de otro `gym_id`

---

## 🤖 Sistema de IA — Predicción de abandono

### Objetivo

Detectar usuarios con alta probabilidad de abandonar antes de que ocurra.

### Features de entrada

| Feature | Descripción |
|---|---|
| `days_since_last_attendance` | Días desde la última asistencia registrada |
| `weekly_frequency` | Promedio de sesiones por semana (últimas 4 semanas) |
| `tenure_days` | Antigüedad en el gimnasio |
| `consistency_score` | Regularidad de asistencia (0–1) |
| `avg_effort_level` | Promedio de esfuerzo reportado (últimas 5 sesiones) |
| `avg_energy_level` | Promedio de energía reportada (últimas 5 sesiones) |
| `feedback_count_last_2w` | Cantidad de feedbacks en las últimas 2 semanas |

### Modelo

- Tipo: **clasificación supervisada binaria**
- Opciones: Logistic Regression / Random Forest (scikit-learn)
- Output: score `0.0 – 1.0` + categoría (`low | medium | high`)
- Umbrales configurables por gimnasio

### Estrategia de datos iniciales (MVP)

Para el MVP se entrena con un **dataset sintético generado con reglas lógicas**
(ej: usuarios con >10 días inactivos + feedback bajo = labeled como churn).
El modelo se mejora de forma incremental con datos reales una vez que el sistema
lleva semanas en producción.

### Ejecución

- **Periódica:** cron diario que recalcula scores de todos los usuarios activos
- **Bajo demanda:** endpoint `POST /risk/calculate/:userId` para recalcular manualmente

---

## 🤖 Sistema de IA — Mensajería automatizada

### Objetivo

Comunicación personalizada y oportuna para mejorar la adherencia.

### Triggers configurables

| Trigger | Condición |
|---|---|
| `inactivity` | N días sin asistir (configurable por gym) |
| `low_feedback` | Feedback de esfuerzo/energía bajo durante X sesiones seguidas |
| `high_risk` | Score de abandono en categoría `high` |
| `milestone` | El usuario completó X sesiones o lleva N meses activo |

### Flujo

1. Job detecta trigger
2. Construye contexto del usuario (`days_inactive`, `level`, `last_feedback`, etc.)
3. Envía prompt estructurado al modelo de lenguaje
4. Mensaje generado se encola para envío
5. Se registra en `Notification` con estado

### Output esperado

- Mensajes motivacionales breves y personalizados
- Recordatorios con menor carga si el usuario está desmotivado
- Tono adaptado al nivel y contexto del miembro

### Ejemplo

**Input:**
```json
{
  "days_inactive": 6,
  "level": "beginner",
  "last_effort": 2,
  "last_energy": 1
}
```

**Output:**
> "¡Hola! Notamos que hace unos días no pasás por el gym. No te preocupes, todos tenemos semanas difíciles. Esta semana podés empezar con una sesión corta de 20 minutos, sin presión. ¿Te animás?"

---

## 🔁 Jobs y colas (BullMQ + Redis)

| Job | Nombre | Frecuencia | Descripción |
|---|---|---|---|
| Predicción masiva | `churn-prediction-job` | Diaria (cron) | Recalcula riesgo de todos los usuarios activos |
| Predicción individual | `churn-prediction-single-job` | Bajo demanda | Recalcula un usuario específico |
| Mensajería | `messaging-job` | Evento-driven | Se dispara cuando se detecta un trigger |
| Alertas a coaches | `coach-alert-job` | Post-predicción | Notifica al coach si algún usuario pasó a `high` |

---

## 🖥️ Interfaces del sistema

### Admin Dashboard
- Métricas globales: usuarios activos, tasa de riesgo, mensajes enviados
- Gestión de coaches
- Estado general del sistema y plan activo

### Coach Dashboard
- Lista de miembros con score de abandono visible
- Alertas activas por usuario
- Historial de asistencia y feedback por usuario
- Acceso a acciones sugeridas por IA

### Vista de Rutinas (Coach)
- Creación y edición de rutinas
- Asignación a usuarios específicos

### Interfaz de Miembro
- Rutina actual con ejercicios del día
- Marcado de ejercicios completados
- Registro de feedback (esfuerzo y energía)
- Progreso básico visualizado

### Sistema de Notificaciones
- Historial de mensajes recibidos
- Estado de cada notificación

---

## 🧱 Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Angular SPA)               │
│              Admin UI | Coach UI | Member UI                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────────┐
│                   Backend API (NestJS)                        │
│   Auth | Users | Routines | Attendance | Risk | Notifications│
└───────┬─────────────────────────────────────┬───────────────┘
        │                                     │
┌───────▼────────┐                  ┌─────────▼──────────────┐
│  PostgreSQL     │                  │   BullMQ + Redis        │
│  (multi-tenant) │                  │   (job queue)           │
└────────────────┘                  └─────────┬───────────────┘
                                              │
                              ┌───────────────▼───────────────┐
                              │       Servicio de IA (Python)  │
                              │  churn model | prompt builder  │
                              └───────────────────────────────┘
                                              │
                              ┌───────────────▼───────────────┐
                              │  APIs externas                 │
                              │  WhatsApp API | Email (SMTP)   │
                              └───────────────────────────────┘
```

### Flujo general

1. Usuario genera datos (asistencia, feedback)
2. Backend almacena en PostgreSQL
3. Scheduler / evento dispara job en BullMQ
4. Servicio de IA procesa y genera score o mensaje
5. Backend recibe resultado y actúa (alerta, notificación)
6. Coach y/o miembro reciben información accionable

---

## 🧰 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular + RxJS + Angular Material / Tailwind |
| Backend | Node.js + NestJS |
| Base de datos | PostgreSQL |
| IA / ML | Python + scikit-learn (servicio desacoplado) |
| Mensajería | WhatsApp Business API / SMTP |
| Colas | BullMQ + Redis |
| Infraestructura | Docker + Docker Compose |
| Deploy | VPS / PaaS (Railway, Render, o similar) |

---

## 📈 Métricas esperadas del producto

- Tasa de abandono mensual por gimnasio
- Frecuencia promedio de asistencia por usuario
- Cantidad de usuarios en riesgo (por categoría)
- Tasa de respuesta / efectividad de mensajes automatizados
- Tiempo promedio hasta intervención del coach

---

## ⚠️ Alcance del MVP

**Incluye:**

- Autenticación JWT con roles y multi-tenancy
- CRUD completo de rutinas y ejercicios
- Registro de asistencia y feedback
- Predicción de abandono con modelo básico y dataset sintético
- Mensajería automatizada por triggers configurables
- Dashboards funcionales para admin, coach y miembro

**No incluye:**

- App móvil nativa
- Features sociales o gamificación
- Integración con hardware (torniquetes, sensores)
- Facturación / gestión de pagos

---

## 🧨 Diferencial

- Enfoque en un **problema real y medible** (retención de clientes)
- IA **funcional e integrada** en el flujo de negocio, no decorativa
- Arquitectura orientada a **producción desde el MVP**
- Sistema **multi-tenant** escalable como SaaS real
