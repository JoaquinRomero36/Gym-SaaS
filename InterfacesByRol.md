# Interfaces por Rol

## Estructura común (App Shell)

Toda ruta protegida (`/admin/*`, `/coach/*`, `/member/*`) comparte el mismo layout:

```
┌─────────────────────────────────────────────┐
│               Navbar                        │
│  [G] AI Gym Retention  [rol]  [nombre] [⏻] │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │         <router-outlet>          │
│ (ítems   │       (contenido de cada         │
│  según   │        interfaz)                 │
│  rol)    │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

### Navbar (siempre visible)
- Logo + nombre app
- Badge del rol
- Nombre del usuario autenticado
- Botón de cerrar sesión (llama `auth.logout()` → redirige a `/login`)

### Sidebar (según rol)

| Rol | Ítems en sidebar |
|-----|-----------------|
| **Admin** | Dashboard (`/admin/dashboard`), Coaches (`/admin/coaches`) |
| **Coach** | Dashboard (`/coach/dashboard`), Rutinas (`/coach/routines`), Nueva Rutina (`/coach/routines/create`) |
| **Member** | Dashboard (`/member/dashboard`), Mi Rutina (`/member/routine`), Feedback (`/member/feedback`), Progreso (`/member/progress`), Notificaciones (`/member/notifications`) |

Footer del sidebar: "AI Gym Retention v1.0"

---

## Interfaces Públicas (sin autenticación)

### 1. Landing Page (`/`)
**Ruta**: `''`
**Componente**: `LandingComponent`

**Propósito**: Página de aterrizaje/marketing.

**Contenido**:
- Hero con título "Reducí la deserción con inteligencia artificial"
- Tres cards de features: Predicción de abandono, Mensajería automatizada, Multi-tenant SaaS
- Footer

**Acciones**:
| Elemento | Acción | Destino |
|----------|--------|---------|
| "Ingresar" | Navegación | `/login` |
| "Registrarse" | Navegación | `/register` |

**API calls**: Ninguna.

---

### 2. Login (`/login`)
**Ruta**: `'login'`
**Componente**: `LoginComponent`

**Propósito**: Autenticación de usuarios.

**Contenido**:
- Formulario: email + password (ngModel)
- Botón submit con spinner de carga
- Panel de credenciales de prueba (admin@gym.com, coach@gym.com, member@gym.com)
- Enlace a registro

**Acciones**:
| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Submit login | `POST /api/v1/auth/login` | Guarda token + user en localStorage, redirige a `/${rol}/dashboard` |
| Link "Registrarse" | Navegación | `/register` |

**Flujo post-login**:
- `admin` → `/admin/dashboard`
- `coach` → `/coach/dashboard`
- `member` → `/member/dashboard`
- Error → muestra mensaje "Credenciales inválidas"

**Rate limit**: 10 intentos por minuto.

---

### 3. Register (`/register`)
**Ruta**: `'register'`
**Componente**: `RegisterComponent`

**Propósito**: Creación de cuenta nueva.

**Contenido**:
- Formulario: nombre, email, password
- Mensajes de error/success
- Enlace a login

**Acciones**:
| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Submit register | `POST /api/v1/auth/register` | Muestra success, redirige a `/login` tras 1.5s |
| Link "Ingresar" | Navegación | `/login` |

**Nota**: El campo `gym_id` se envía vacío en el frontend actual — el registro sin gym_id puede fallar si el backend lo requiere.

**Rate limit**: 5 registros por minuto.

---

## Interfaces Admin (`/admin/*`)

**Requisito**: Rol `admin` en JWT.
**Sidebar**: Dashboard, Coaches.

---

### 1. Admin Dashboard (`/admin/dashboard`)
**Ruta**: `'admin/dashboard'`
**Componente**: `DashboardComponent` (admin)

**Propósito**: Visión general del gimnasio con métricas clave.

**Datos obtenidos**:
| API | Uso |
|-----|-----|
| `GET /api/v1/stats` | Métricas globales del gym |

**Cards de métricas** (6 tarjetas):
| Métrica | Descripción |
|---------|-------------|
| Total Usuarios | Cantidad total de miembros |
| Usuarios Activos | Miembros con status `active` |
| Usuarios Churned | Miembros con status `churned` |
| Asistencia Hoy | Attendance logs de la fecha actual |
| Usuarios en Riesgo Alto | Risk scores con category `high` |
| Notificaciones Hoy | Notificaciones creadas hoy |

**Desglose por estado**: Progress bars con porcentajes de Activos / Inactivos / Churned.

**Tabla de usuarios en riesgo**: Lista de los 10 miembros con mayor score de riesgo, con columnas: nombre, score (formateado), categoría (high/medium/low con badge de color).

**Acciones**:
| Elemento | Acción |
|----------|--------|
| Cards | Read-only (solo display) |
| Tabla riesgos | Read-only |

**Navegación desde aquí**: Sidebar (Coaches).

---

### 2. Admin Coaches (`/admin/coaches`)
**Ruta**: `'admin/coaches'`
**Componente**: `CoachesComponent`

**Propósito**: Listar todos los coaches del gimnasio.

**Datos obtenidos**:
| API | Uso |
|-----|-----|
| `GET /api/v1/coaches` | Lista de coaches |

**Contenido**:
- Tabla con columnas: Nombre, Email, Gym ID (truncado)

**Acciones**:
| Elemento | Acción |
|----------|--------|
| Tabla coaches | Read-only (solo display) |

**Problemas actuales**:
- No permite crear/editar/eliminar coaches (solo lectura)
- No muestra métricas por coach (miembros asignados, etc.)

---

## Interfaces Coach (`/coach/*`)

**Requisito**: Rol `coach` en JWT.
**Sidebar**: Dashboard, Rutinas, Nueva Rutina.

---

### 1. Coach Dashboard (`/coach/dashboard`)
**Ruta**: `'coach/dashboard'`
**Componente**: `CoachDashboardComponent`

**Propósito**: Panel principal del coach con lista de sus miembros y scores de riesgo.

**Datos obtenidos**:
| API | Uso |
|-----|-----|
| `GET /api/v1/users?coach_id={userId}` | Miembros asignados a este coach |
| `GET /api/v1/risk/all` | Todos los risk scores del gym |

**Contenido**:
- Cards de resumen:
  - Miembros activos (filtrados por status === 'active')
  - Miembros en riesgo alto (risk category === 'high')
- Lista de miembros, cada uno con:
  - Nombre, email, nivel (beginner/intermediate/advanced), status badge
  - Score de riesgo con badge de color (high=rojo, medium=amarillo, low=verde)
  - Botones de acción por miembro

**Acciones por miembro**:
| Elemento | API | Resultado |
|----------|-----|-----------|
| Click en card | Navegación | `/coach/members/{memberId}` |
| "Calcular riesgo" | `POST /api/v1/risk/calculate/{memberId}` | Actualiza risk score, muestra spinner por miembro |
| "Enviar mensaje" | `POST /api/v1/jobs/messaging/{memberId}` | Dispara mensaje IA, muestra spinner por miembro |

**Navegación desde aquí**:
- Click en miembro → `/coach/members/:id`
- Sidebar → Rutinas, Nueva Rutina

---

### 2. Coach Member Detail (`/coach/members/:id`)
**Ruta**: `'coach/members/:id'`
**Componente**: `MemberDetailComponent`

**Propósito**: Vista detallada de un miembro específico.

**Datos obtenidos**:
| API | Uso |
|-----|-----|
| `GET /api/v1/users/{userId}` | Datos del miembro |
| `GET /api/v1/risk/{userId}` | Risk score del miembro |
| `GET /api/v1/attendance/user/{userId}/last` | Última asistencia |
| `GET /api/v1/feedback/user/{userId}` | Feedbacks del miembro (hasta 10) |

**Contenido**:
- Header con nombre, email, nivel
- Badge de status (active/inactive/churned) con color
- Stats cards: risk score (con color), última asistencia, cantidad de feedbacks
- Lista de feedbacks recientes con effort/energy (X/5 c/u)

**Acciones**:
| Elemento | Acción |
|----------|--------|
| Stats cards | Read-only |
| Lista feedbacks | Read-only |

**Problemas actuales**:
- No hay acciones sobre el miembro (editar perfil, cambiar status, etc.)

---

### 3. Coach Routines List (`/coach/routines`)
**Ruta**: `'coach/routines'`
**Componente**: `RoutinesComponent`

**Propósito**: Listar todas las rutinas del gimnasio.

**Datos obtenidos**:
| API | Uso |
|-----|-----|
| `GET /api/v1/routines` | Todas las rutinas del gym |

**Contenido**:
- Lista de rutinas con: nombre, cantidad de ejercicios, fecha de creación
- Estado vacío con botón para crear rutina

**Acciones**:
| Elemento | Acción |
|----------|--------|
| "+ Nueva rutina" | Navegación a `/coach/routines/create` |

---

### 4. Coach Routine Create (`/coach/routines/create`)
**Ruta**: `'coach/routines/create'`
**Componente**: `RoutineCreateComponent`

**Propósito**: Crear una nueva rutina con ejercicios.

**Formulario**:
- Nombre de la rutina (texto, requerido)
- User ID (UUID opcional — a quién asignar la rutina)
- Lista dinámica de ejercicios:
  - Nombre (texto)
  - Sets (number, min 1)
  - Reps (number, min 1)
  - Botón "X" para eliminar ejercicio

**Acciones**:
| Elemento | API | Resultado |
|----------|-----|-----------|
| "+ Agregar ejercicio" | — | Agrega fila vacía a la lista |
| "X" en ejercicio | — | Elimina ejercicio de la lista |
| Submit | `POST /api/v1/routines` + `POST /api/v1/exercises/bulk` | Crea rutina + ejercicios, redirige a `/coach/routines` |

**Problemas actuales**:
- Pide gym_id manualmente en el formulario → debería venir del tenant context
- Los ejercicios se crean sin gym_id en el backend (ya fixeado en backend, pero el frontend no lo envía)
- No hay selector de usuario (hay que escribir UUID manual)

---

## Interfaces Member (`/member/*`)

**Requisito**: Rol `member` en JWT.
**Sidebar**: Dashboard, Mi Rutina, Feedback, Progreso, Notificaciones.

---

### 1. Member Dashboard (`/member/dashboard`)
**Ruta**: `'member/dashboard'`
**Componente**: `MemberDashboardComponent`

**Propósito**: Panel principal del miembro con resumen de actividad y riesgo.

**Datos obtenidos**:
| API | Uso |
|-----|-----|
| `GET /api/v1/attendance/user/{userId}/count?days=7` | Asistencias en últimos 7 días |
| `GET /api/v1/feedback/user/{userId}/averages?last=5` | Promedio effort/energy últimas 5 sesiones |
| `GET /api/v1/risk/{userId}` | Risk score personal |
| `GET /api/v1/attendance/user/{userId}/last` | Fecha de última asistencia |
| `GET /api/v1/notifications/user/{userId}` | Notificaciones recientes |

**Contenido**:
- **Stats cards** (4):
  | Card | Descripción |
  |------|-------------|
  | Asistencias (7d) | Número de visitas en la última semana |
  | Score de Riesgo | Valor + color (verde/amarillo/rojo) |
  | Esfuerzo Promedio | Promedio effort_level (últimas 5) |
  | Notificaciones | Cantidad de notificaciones sin leer |

- **Risk progress bar**: Barra con gradiente verde→rojo según el score
- **Última asistencia**: Fecha + etiqueta (Ej: "Hace 3 días")
- **Notificaciones recientes** (hasta 3): mensaje, status badge, fecha
- **Quick links** (4 cards):
  - Mi Rutina → `/member/routine`
  - Dar Feedback → `/member/feedback`
  - Mi Progreso → `/member/progress`
  - Notificaciones → `/member/notifications`

**Acciones**:
| Elemento | Acción |
|----------|--------|
| Quick links | Navegación a rutas internas |
| "Ver todas" (notificaciones) | Navegación a `/member/notifications` |
| Stats cards | Read-only |

---

### 2. Member Routine (`/member/routine`)
**Ruta**: `'member/routine'`
**Componente**: `MemberRoutineComponent`

**Propósito**: Ver la rutina asignada y registrar sesión completada.

**Datos obtenidos**:
| API | Uso |
|-----|-----|
| `GET /api/v1/routines?user_id={userId}` | Rutinas asignadas al miembro |

**Contenido**:
- Nombre de la rutina + cantidad de ejercicios
- Lista de ejercicios con checkboxes (visuales)
- Botón "Completar sesión"

**Acciones**:
| Elemento | API | Resultado |
|----------|-----|-----------|
| Checkboxes ejercicios | — | Visual (solo UI) |
| "Completar sesión" | `POST /api/v1/attendance` | Registra attendance con date=today, completed=true. Muestra card de éxito |

**Problemas actuales**:
- No hay feedback visual de carga mientras se guarda la asistencia (solo un `alert()` en error)
- Los checkboxes no persisten entre visitas

---

### 3. Member Feedback (`/member/feedback`)
**Ruta**: `'member/feedback'`
**Componente**: `MemberFeedbackComponent`

**Propósito**: Registrar feedback post-entrenamiento.

**Contenido**:
- Selector de effort level (1-5) con botones de color (1-2 rojo, 3 amarillo, 4-5 verde)
- Selector de energy level (1-5) con mismos colores
- Botón submit

**Acciones**:
| Elemento | API | Resultado |
|----------|-----|-----------|
| Click effort/energy | — | Selecciona nivel visualmente |
| "Enviar feedback" | `POST /api/v1/feedback` | Crea feedback, muestra "Feedback enviado", deshabilita botón |

**Estado post-envío**: Muestra mensaje de éxito y bloquea el envío duplicado.

---

### 4. Member Progress (`/member/progress`)
**Ruta**: `'member/progress'`
**Componente**: `MemberProgressComponent`

**Propósito**: Ver progreso histórico del miembro.

**Datos obtenidos**:
| API | Uso |
|-----|-----|
| `GET /api/v1/attendance/user/{userId}/count?days=7` | Asistencias semanales |
| `GET /api/v1/feedback/user/{userId}/averages?last=5` | Promedios effort/energy |
| `GET /api/v1/risk/{userId}` | Risk score |

**Contenido**:
- Asistencias (7d) - card numérica
- Score de Riesgo con progress bar de color
- Esfuerzo promedio (X/5)
- Energía promedio (X/5)

**Acciones**: Read-only.

**Problemas actuales**:
- Solo muestra últimos 7 días de attendance y últimas 5 sesiones de feedback
- Sin gráficos históricos ni tendencias
- Sin historial de scores de riesgo (solo el último)

---

### 5. Member Notifications (`/member/notifications`)
**Ruta**: `'member/notifications'`
**Componente**: `MemberNotificationsComponent`

**Propósito**: Ver todas las notificaciones recibidas.

**Datos obtenidos**:
| API | Uso |
|-----|-----|
| `GET /api/v1/notifications/user/{userId}` | Notificaciones del miembro |

**Contenido**:
- Lista completa de notificaciones, cada una con:
  - Icono de status (pending/sent/failed)
  - Mensaje de texto
  - Fecha de creación (formateada)
  - Badge de trigger (high_risk, milestone, manual)
  - Badge de status (pending/sent/failed)

**Acciones**: Read-only.

---

## Mapa de navegación completo

```
                         ┌──────────┐
                         │  Landing  │
                         │    /      │
                         └────┬─────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
              ┌──────────┐        ┌──────────┐
              │  Login   │        │ Register │
              │  /login  │        │ /register│
              └────┬─────┘        └──────────┘
                   │
            ┌──────┴──────┬──────────────┐
            ▼             ▼              ▼
     ┌────────────┐ ┌──────────┐ ┌──────────────┐
     │ /admin/    │ │ /coach/  │ │  /member/    │
     │  dashboard │ │  dashboard│ │   dashboard  │
     │  coaches   │ │  members/│ │   routine    │
     │            │ │   :id    │ │   feedback   │
     │            │ │  routines│ │   progress   │
     │            │ │  routines│ │  notifications│
     │            │ │   /create│ │              │
     └────────────┘ └──────────┘ └──────────────┘
```

---

## Resumen de acciones por rol

| Acción | Admin | Coach | Member |
|--------|-------|-------|--------|
| Ver dashboard con métricas | ✅ Global | ✅ Sus miembros | ✅ Personal |
| Gestionar coaches | ❌ (solo read) | — | — |
| Ver detalle de miembro | — | ✅ | — |
| Calcular riesgo | — | ✅ (por miembro) | ❌ |
| Enviar mensaje IA | — | ✅ (por miembro) | — |
| CRUD rutinas | — | ✅ | ❌ (solo view) |
| Registrar asistencia | — | — | ✅ |
| Dar feedback | — | — | ✅ |
| Ver progreso | — | — | ✅ |
| Ver notificaciones | — | — | ✅ |
| Crear/editar/eliminar usuarios | ❌ (solo seed) | ❌ | ❌ |

---

## Problemas de usabilidad detectados

### Críticos
1. **Crear rutina pide gym_id manual** — el coach no debería ver ni saber el UUID del gym
2. **Member routine solo muestra checkboxes visuales** — no marcan persistence ni envían datos
3. **Sin feedback de carga en "Completar sesión"** — solo `alert()` en error
4. **Admin no puede crear/editar coaches** — solo lista, sin gestión
5. **Sin paginación en listas** — coaches, routines, notifications cargan todo

### Medios
6. **Register no envía gym_id válido** — el usuario nuevo no sabe qué gym_id poner
7. **Coach member detail sin acciones** — no puede editar perfil ni cambiar status
8. **Member progress sin tendencias** — solo valores puntuales, sin gráficos
9. **Login sin persistencia de sesión** — al recargar se pierde (solo localStorage, no verifica token)
10. **Sin confirmación en acciones destructivas** — no hay delete en frontend, pero si se agregan después

### Bajos
11. **Dashboard admin sin navegación a detalle** — la tabla de riesgos no es clickeable
12. **Coach routine list sin editar/eliminar** — solo crear nuevas
13. **Notificaciones sin marcar como leídas** — todas aparecen igual
