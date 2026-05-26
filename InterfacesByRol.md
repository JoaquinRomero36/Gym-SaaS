# Interfaces por Rol — AI Gym Retention

> Documento de análisis y guía para refactorización del frontend.
> Basado en: Web Interface Guidelines + Frontend Design Skill + auditoría completa del código.

---

## Arquitectura general

Toda ruta protegida (`/admin/*`, `/coach/*`, `/member/*`) comparte un **App Shell**:

```
┌───────────────────────────────────────────────────────┐
│  Navbar: [G] AI Gym Retention  [rol]  [nombre] [⏻]   │
├──────────┬────────────────────────────────────────────┤
│          │                                            │
│ Sidebar  │         <router-outlet>                    │
│ (items   │       (contenido de cada interfaz)         │
│  según   │                                            │
│  rol)    │                                            │
│          │                                            │
└──────────┴────────────────────────────────────────────┘
```

### Componentes compartidos

| Componente | Ruta | Props/Inputs |
|---|---|---|
| `NavbarComponent` | `shared/navbar.component.ts` | `role`, `userName`, `logout` output |
| `SidebarComponent` | `shared/sidebar.component.ts` | `items: NavItem[]` |
| `LayoutComponent` | `shared/layout.component.ts` | Wrapper: navbar + sidebar + router-outlet |

### Diseño system (CSS custom properties)

`styles.css` define un design system completo con:

| Categoría | Variables |
|---|---|
| Brand | `--color-primary: #4f46e5` (indigo), `--color-primary-dark`, `--color-primary-light` |
| Semantic | `--color-success: #059669`, `--color-warning: #d97706`, `--color-danger: #dc2626` |
| Neutral | `--color-bg: #f8fafc`, `--color-surface: #ffffff`, `--color-border: #e2e8f0` |
| Shadows | `--shadow-sm` a `--shadow-xl` |
| Radius | `--radius-sm: 6px` a `--radius-xl: 16px` |
| Font | `--font-sans: 'Inter', system-ui, ...` |

**Problema**: Inter es genérica. Las guidelines de frontend-design recomiendan tipografías con más personalidad.

---

## Auditoría de Web Interface Guidelines

Violaciones encontradas en el código actual:

### Accesibilidad

```
src/app/features/coach/coach-dashboard/coach-dashboard.component.ts:80 - icon button "Calcular riesgo" sin aria-label
src/app/features/coach/coach-dashboard/coach-dashboard.component.ts:83 - icon button "Enviar mensaje" sin aria-label
src/app/shared/navbar.component.ts:18 - botón "Salir" sin aria-label en SVG icon
src/app/features/coach/member-detail/member-detail.component.ts:13 - avatar decorativo sin aria-hidden
src/app/features/admin/coaches/coaches.component.ts:38 - badge de gym_id truncado sin title tooltip
```

### Focus States

```
src/app/styles.css:178 - .input:focus solo usa box-shadow sin outline visible alternativo
src/app/features/member/member-routine/member-routine.component.ts:51 - checkbox sin focus-visible styling
src/app/features/coach/routine-create/routine-create.component.ts:47-49 - inputs sin focus-visible styling
```

### Formularios

```
src/app/features/auth/login/login.component.ts:24-28 - inputs sin autocomplete (email, password)
src/app/features/auth/register/register.component.ts:25-33 - inputs sin autocomplete
src/app/features/coach/routine-create/routine-create.component.ts:24 - input gym_id sin autocomplete="off"
src/app/features/auth/register/register.component.ts:68 - gym_id enviado vacío, sin validación frontend
src/app/features/coach/routine-create/routine-create.component.ts:84 - validación manual sin mensajes inline por campo
```

### Content Handling

```
src/app/features/admin/dashboard/dashboard.component.ts:134 - score.toFixed(4) muestra muchos decimales
src/app/features/admin/coaches/coaches.component.ts:38 - gym_id truncado sin title completo
src/app/features/member/member-dashboard/member-dashboard.component.ts:88 - notif message con text-overflow:ellipsis sin tooltip
src/app/features/member/member-routine/member-routine.component.ts:94 - alert() en lugar de UI inline para error
```

### Performance

```
src/app/features/admin/dashboard/dashboard.component.ts:150 - sin paginación en stats (carga todo)
src/app/features/coach/coach-dashboard/coach-dashboard.component.ts:100-101 - sin paginación en members/risks
src/app/features/admin/coaches/coaches.component.ts:50 - sin paginación en coaches
src/app/features/member/member-notifications/member-notifications.component.ts:56 - sin paginación en notifications
```

### Navigation & State

```
src/app/features/coach/coach-dashboard/coach-dashboard.component.ts:122-123 - calculateRisk recrea signal completa en vez de actualizar
src/app/features/member/member-routine/member-routine.component.ts:83-86 - fecha hardcodeada sin timezone handling
src/app/features/member/member-routine/member-routine.component.ts:94 - alert() sin confirmación para acción destructiva
```

### Animation / prefers-reduced-motion

```
src/app/styles.css:324-338 - @keyframes fadeIn y slideIn sin consultar prefers-reduced-motion
src/app/features/auth/register/register.component.ts:15 - animación fadeIn sin @media (prefers-reduced-motion: no-preference)
```

### Dark Mode

```
src/app/styles.css:9-49 - Sin variables de tema oscuro
src/index.html:8 - Sin <meta name="theme-color"> ni color-scheme
```

### i18n / Locale

```
src/app/styles.css:651 - clamp() usa 5vw sin fallback para navegadores antiguos
src/app/features/member/member-routine/member-routine.component.ts:82 - toISOString() sin considerar timezone del usuario
```

---

## Sidebar por rol

| Rol | Items |
|---|---|
| **Admin** | 📊 Dashboard (`/admin/dashboard`), 👥 Coaches (`/admin/coaches`) |
| **Coach** | 📊 Dashboard (`/coach/dashboard`), 📋 Rutinas (`/coach/routines`), ➕ Nueva Rutina (`/coach/routines/create`) |
| **Member** | 📊 Dashboard (`/member/dashboard`), 💪 Mi Rutina (`/member/routine`), ⭐ Feedback (`/member/feedback`), 📈 Progreso (`/member/progress`), 🔔 Notificaciones (`/member/notifications`) |

Footer: "AI Gym Retention v1.0"

---

## Interfaces Públicas

### Landing Page (`/`)
**Componente**: `LandingComponent` (standalone, imports: `RouterLink`)

**Propósito**: Página de aterrizaje / marketing.

**API calls**: Ninguna.

**Contenido actual**:
- Navbar con logo "G" + "AI Gym Retention" + botones Ingresar/Registrarse
- Hero: "Reducí la deserción con inteligencia artificial"
- Badge flotante: "🤖 IA aplicada a retención de clientes"
- Subtítulo explicativo
- 2 CTAs: "Comenzá gratis" / "Ya tengo cuenta"
- 3 feature cards: Predicción de abandono, Mensajería automatizada, Multi-tenant SaaS
- Footer con copyright

**Acciones**:
| Elemento | Tipo | Destino | Problemas |
|---|---|---|---|
| "Ingresar" | `<a routerLink>` | `/login` | ✅ |
| "Registrarse" | `<a routerLink>` | `/register` | ✅ |
| "Comenzá gratis" | `<a routerLink>` | `/register` | ✅ |
| "Ya tengo cuenta" | `<a routerLink>` | `/login` | ✅ |

**Problemas de UI/UX**:
- Sin `prefers-reduced-motion` en animaciones
- Sin tipografía distintiva (usa Inter del design system)
- Sin imágenes/ilustraciones que acompañen
- Footer sin links útiles
- Sin favicon definido

---

### Login (`/login`)
**Componente**: `LoginComponent` (standalone, imports: `FormsModule`, `RouterLink`)

**Propósito**: Autenticación de usuarios.

**API calls**: `POST /api/v1/auth/login` → `{ access_token, refresh_token, user: { id, email, name, role, gymId } }`

**Formulario**:
| Campo | Type | autocomplete | Validación |
|---|---|---|---|
| Email | `email` | ❌ falta | `required` |
| Password | `password` | ❌ falta | `required` |

**Acciones**:
| Elemento | Acción | Resultado |
|---|---|---|
| Submit | `auth.login({ email, password })` | Guarda en localStorage, redirige a `/${role}/dashboard` |
| Link "Registrate" | Navigate | `/register` |

**Post-login routing**:
- `admin` → `/admin/dashboard`
- `coach` → `/coach/dashboard`
- `member` → `/member/dashboard`

**Estado**: `loading` signal (deshabilita botón + muestra spinner), `error` signal (muestra mensaje inline).

**Rate limit**: 10 req/min.

**Problemas**:
- Sin `autocomplete` en inputs → los password managers no sugieren credenciales
- No hay "olvidé mi contraseña"
- Las credenciales de prueba en texto plano son útiles para dev pero peligrosas en prod
- Sin validación de email format antes de enviar
- Sin `type="submit"` explícito en el botón (el form ngSubmit lo maneja, pero semánticamente)

---

### Register (`/register`)
**Componente**: `RegisterComponent` (standalone, imports: `FormsModule`, `RouterLink`)

**Propósito**: Creación de cuenta nueva.

**API calls**: `POST /api/v1/auth/register` → `AuthResponse`

**Formulario**:
| Campo | Type | autocomplete | Problema |
|---|---|---|---|
| Nombre | `text` | ❌ falta | ✅ |
| Email | `email` | ❌ falta | ✅ |
| Password | `password` | ❌ falta | Sin indicador de fortaleza |

**Acciones**:
| Elemento | Resultado |
|---|---|
| Submit | Envía `gym_id: ''` (vacío), muestra success, redirige a `/login` tras 1.5s |
| Link "Ingresá" | Navega a `/login` |

**Flujo de error**: Status 400 → "El ID de gym es obligatorio. Usá el seed para crear uno."

**Problemas críticos**:
- `gym_id` se envía vacío **SIEMPRE** → el registro siempre falla a menos que el backend lo acepte vacío (no debería)
- Sin validación de fortaleza de contraseña
- Sin `autocomplete` en ningún input
- Sin spinner de carga en el botón submit
- Error message expone detalle interno ("El ID de gym es obligatorio")

---

## Admin (`/admin/*`)

### Admin Dashboard (`/admin/dashboard`)
**Requiere**: Rol `admin`
**Componente**: `DashboardComponent` (standalone)

**API call**: `GET /api/v1/stats`

**Retorna**:
```json
{
  "totalUsers": 5, "activeUsers": 3, "churnedUsers": 1, "inactiveUsers": 1,
  "todayAttendance": 2, "totalMembers": 4, "totalCoaches": 1,
  "usersAtHighRisk": 1, "usersAtMediumRisk": 2, "usersAtLowRisk": 2,
  "notificationsSentToday": 3, "recentRisks": [{ "userId": "...", "userName": "...", "score": 0.85, "category": "high" }]
}
```

**Secciones**:

1. **Métricas principales** (grid-3): Total usuarios ⚠️ En riesgo alto 📨 Mensajes enviados hoy
2. **Métricas secundarias** (grid-4): Activos, Churned, Asistencias hoy, Riesgo bajo
3. **Desglose por estado** (card izquierda): Progress bars con % Activos / Inactivos / Churned
4. **Resumen rápido** (card derecha): Miembros, Coaches, Riesgo medio, Riesgo bajo, Inactivos
5. **Tabla de usuarios en riesgo** (card inferior): Nombre | Score (4 decimales) | Categoría (badge)

**Acciones**: ❌ Ninguna (read-only dashboard).

**Cómputos**: `statusBreakdown()` calcula porcentajes, `riskScoreColor()` mapea thresholds.

**Problemas**:
- Score con 4 decimales (`toFixed(4)`) es ruido visual → 2 decimales bastan
- Sin paginación en `recentRisks` (si hay cientos de usuarios, explota)
- La tabla de riesgos no es clickeable → no lleva al detalle del usuario
- No hay acciones de admin (crear coach, crear usuario, etc.)
- Sin cache/refetch de stats
- Sin skeleton loader mientras carga

---

### Admin Coaches (`/admin/coaches`)
**Requiere**: Rol `admin`
**Componente**: `CoachesComponent` (standalone)

**API call**: `GET /api/v1/coaches` → `Coach[]`

**Contenido**:
- Header con contador: "X coaches registrados"
- Tabla: Nombre | Email | Gym (UUID truncado a 8 chars)
- Estado vacío con mensaje

**Acciones**: ❌ Ninguna. Read-only.

**Problemas**:
- ❌ **No se pueden crear, editar ni eliminar coaches** — es una tabla de solo lectura
- Gym ID truncado sin tooltip (`title`) con el UUID completo
- Sin métricas por coach (miembros asignados, etc.)
- Sin paginación
- Sin búsqueda/filtro por nombre

---

## Coach (`/coach/*`)

### Coach Dashboard (`/coach/dashboard`)
**Requiere**: Rol `coach`
**Componente**: `CoachDashboardComponent` (standalone, imports: `RouterLink`)
**Dependencias**: `AuthService` (para obtener `userId`)

**API calls**:
| API | Uso |
|---|---|
| `GET /api/v1/users?coach_id={userId}` | Miembros asignados |
| `GET /api/v1/risk/all` | Scores de riesgo del gym |
| `POST /api/v1/risk/calculate/{memberId}` | Trigger cálculo de riesgo |
| `POST /api/v1/jobs/messaging/{memberId}` | Trigger mensaje IA |

**Secciones**:

1. **Stats cards** (grid-3): Total miembros · Activos · Alto riesgo (conteos)
2. **Lista de miembros** (member cards), cada una con:
   - Avatar (primera letra) + nombre + email + nivel
   - Badge de status (active/inactive/churned) con color
   - Badge de riesgo (% con color según threshold)
   - Botón "Calcular riesgo" (icono gráfico de barras) → `POST /api/v1/risk/calculate/{id}`
   - Botón "Enviar mensaje" (icono de chat) → `POST /api/v1/jobs/messaging/{id}`
   - Chevron → navegación a `/coach/members/{id}`

**Acciones por miembro**:
| Elemento | Tipo | Acción |
|---|---|---|
| Card completa | `<a routerLink>` | Navega a `/coach/members/{id}` |
| Calcular riesgo | `<button>` icon | POST + refetch risks |
| Enviar mensaje | `<button>` icon | POST (sin feedback de resultado) |

**Estados**: `loadingCalc` (Set de IDs con spinner), `loadingMsg` (Set de IDs con spinner)

**Cómputos**: `activeMembers()`, `highRiskCount()`, `memberRisk(member)` lookup.

**Problemas**:
- Sin `aria-label` en los icon buttons (violación accesibilidad)
- `calculateRisk()` recrea toda la signal en vez de hacer update optimista
- Sin confirmación antes de enviar mensaje
- Sin paginación (si tiene >50 miembros)
- Los botones tienen `(click)` con `preventDefault()` porque están dentro de un `<a>` — patrón incorrecto
- Sin feedback visual de éxito/error en "Enviar mensaje"
- Sin distinción visual entre miembros activos/inactivos/churned más allá del badge

---

### Coach Member Detail (`/coach/members/:id`)
**Requiere**: Rol `coach`
**Componente**: `MemberDetailComponent` (standalone)

**API calls**:
| API | Uso |
|---|---|
| `GET /api/v1/users/{userId}` | Datos del miembro |
| `GET /api/v1/risk/{userId}` | Risk score |
| `GET /api/v1/attendance/user/{userId}/last` | Última asistencia |
| `GET /api/v1/feedback/user/{userId}` | Feedbacks |

**Secciones**:
1. **Profile header**: Avatar grande + nombre + email + nivel + badge status
2. **Stats cards** (grid-3): Score de riesgo (color según threshold) · Última asistencia · Cantidad de feedbacks
3. **Feedback reciente**: Lista con date · effort/5 · energy/5 (hasta 10)

**Cómputos**: `lastDate()` formatea fecha, `riskColor()` según threshold.

**Acciones**: ❌ Ninguna. Read-only.

**Problemas**:
- ❌ No hay acciones sobre el miembro (cambiar status, editar perfil, reasignar coach)
- ❌ No se puede ver la rutina del miembro
- ❌ No hay historial de riesgo (solo el último score)
- La función `lastDate()` NO es un computed signal — es una función plana que se ejecuta en el template → no es reactiva
- Sin paginación en feedbacks (si tiene +10, se pierden)
- Sin skeleton loader

---

### Coach Routines List (`/coach/routines`)
**Requiere**: Rol `coach`
**Componente**: `RoutinesComponent` (standalone, imports: `RouterLink`)

**API call**: `GET /api/v1/routines` → `Routine[]`

**Contenido**:
- Header: "Rutinas" + "X rutinas creadas" + botón "+ Nueva rutina"
- Lista de cards: ícono 🏋️ + nombre + cantidad de ejercicios + fecha de creación
- Estado vacío con botón "Crear rutina"

**Acciones**:
| Elemento | Resultado |
|---|---|
| "+ Nueva rutina" | Navega a `/coach/routines/create` |
| "Crear rutina" (vacío) | Navega a `/coach/routines/create` |

**Problemas**:
- ❌ No se puede editar ni eliminar rutinas
- ❌ No se puede ver a qué usuario está asignada cada rutina
- Sin paginación
- Sin filtro por usuario/nombre

---

### Coach Routine Create (`/coach/routines/create`)
**Requiere**: Rol `coach`
**Componente**: `RoutineCreateComponent` (standalone, imports: `FormsModule`)

**API calls**:
| API | Momento |
|---|---|
| `POST /api/v1/routines` | Primero: crea rutina |
| `POST /api/v1/exercises/bulk` | Segundo: crea ejercicios |

**Formulario**:

| Campo | Control | Validación | Problema |
|---|---|---|---|
| Nombre de rutina | `text` | Required (custom) | ✅ |
| ID del gym | `text` | Required (custom) | 🔴 **El coach no debería ver/pedir el UUID del gym** |
| ID del usuario | `text` | Optional | 🔴 **No es UX: debería ser un selector** |
| Ejercicios (lista dinámica) | Nombre, Sets, Reps | — | Sin validación de sets>0, reps>0 |

**Acciones dinámicas**:
| Elemento | Acción |
|---|---|
| "+ Agregar" | Agrega ejercicio vacío a la lista |
| "✕" en ejercicio | Elimina ejercicio |
| Submit | Crea rutina → crea ejercicios → redirige a `/coach/routines` |

**Problemas críticos**:
- **🔴 gym_id manual**: El coach tiene que escribir el UUID del gym. Debería venir del context del tenant automáticamente.
- **🔴 user_id manual**: El coach tiene que saber el UUID del miembro. Debería haber un selector con búsqueda.
- Sin validación de sets/reps > 0
- Sin indicador de carga mientras se guarda
- Si falla el POST de ejercicios, la rutina queda huérfana (no hay rollback)
- Los input names usan índices (`name_${id}`) que son frágiles
- Sin confirmación antes de navegar si hay cambios sin guardar

---

## Member (`/member/*`)

### Member Dashboard (`/member/dashboard`)
**Requiere**: Rol `member`
**Componente**: `MemberDashboardComponent` (standalone, imports: `RouterLink`)
**Dependencias**: `AuthService`

**API calls** (5 paralelas):
| API | Para qué |
|---|---|
| `GET /api/v1/attendance/user/{userId}/count?days=7` | Conteo semanal |
| `GET /api/v1/feedback/user/{userId}/averages?last=5` | Promedios |
| `GET /api/v1/risk/{userId}` | Risk score |
| `GET /api/v1/attendance/user/{userId}/last` | Última asistencia |
| `GET /api/v1/notifications/user/{userId}` | Notificaciones recientes |

**Secciones**:

1. **Stats cards** (grid-4): Asistencias (7d) · Score de riesgo · Esfuerzo promedio · Notificaciones
2. **Estado de riesgo** (card izquierda): Progress bar (gradiente según score) + mensaje contextual
3. **Última asistencia** (card derecha): Emoji 🏋️ + fecha formateada + "Hace X días"
4. **Notificaciones recientes** (hasta 3): Icono status + mensaje truncado + fecha + badge
5. **Quick links** (grid-2, 4 cards): Mi Rutina / Dar Feedback / Mi Progreso / Notificaciones

**Cómputos** (11 computed signals): `avgEffort`, `avgEnergy`, `riskScore`, `riskFormatted`, `riskBarWidth`, `riskColor`, `riskBarBg`, `riskMessage`, `lastDateLabel`, `daysSinceLabel`, `userName`

**Acciones**:
| Elemento | Destino |
|---|---|
| "Ver todas" (notificaciones) | `/member/notifications` |
| Quick link "Mi Rutina" | `/member/routine` |
| Quick link "Dar Feedback" | `/member/feedback` |
| Quick link "Mi Progreso" | `/member/progress` |
| Quick link "Notificaciones" | `/member/notifications` |

**Problemas**:
- 5 llamadas HTTP paralelas al montar el componente → posible waterfall si alguna es lenta
- `userName()` no es un signal computed que se re-calcule si auth.user cambia
- Sin cache de datos entre navegaciones (vuelve a fetch al entrar)
- Las notificaciones sin leer no tienen distinción visual
- El riesgo solo muestra mensaje genérico, sin sugerencias accionables

---

### Member Routine (`/member/routine`)
**Requiere**: Rol `member`
**Componente**: `MemberRoutineComponent` (standalone)

**API calls**:
| API | Momento |
|---|---|
| `GET /api/v1/routines?user_id={userId}` | On init |
| `POST /api/v1/attendance` | On "Completar sesión" |

**Contenido**:
- Card de éxito post-completado (🎉 "¡Sesión completada!")
- Estado vacío si no hay rutina asignada
- Lista de ejercicios con checkboxes visuales + número + nombre + `S × R` badge
- Botón "Completar sesión" con estado `saving` (texto "Registrando...")

**Acciones**:
| Elemento | API | Resultado |
|---|---|---|
| Checkbox | — | Solo visual, no persiste |
| "Completar sesión" | `POST /api/v1/attendance` | Crea attendance + muestra success |

**Problemas**:
- **🔴 Checkboxes no persisten** — solo UI, al recargar se pierden
- **🔴 `alert()` en error** — rompe la UX, debería ser un mensaje inline
- Sin validación de que no se registre asistencia dos veces el mismo día
- Sin feedback de cuántas sesiones completó esta semana
- Sin indicación visual de progreso (ej: "Completaste 3/5 ejercicios")

---

### Member Feedback (`/member/feedback`)
**Requiere**: Rol `member`
**Componente**: `MemberFeedbackComponent` (standalone, imports: `FormsModule`)

**API call**: `POST /api/v1/feedback`

**Formulario**:
| Campo | UI | Valores |
|---|---|---|
| Nivel de esfuerzo | 5 botones (1-5) con selección visual (indigo) | 1-2 rojo claro, 3 amarillo, 4-5 verde |
| Nivel de energía | 5 botones (1-5) con selección visual (verde) | Misma escala |

**Estados**: `effort` signal (default 3), `energy` signal (default 3), `sent` signal.

**Acciones**:
| Elemento | Resultado |
|---|---|
| Click en effort/energy | Selecciona valor, escala visual |
| Submit | Envía feedback + `sent = true` (deshabilita botón) |

**Problemas**:
- Sin validación de que no se envíe feedback dos veces el mismo día
- No hay nota opcional de texto
- No hay confirmación de que se registró correctamente (solo cambia el botón a "Enviado")
- Sin `autocomplete="off"` en los botones de selección

---

### Member Progress (`/member/progress`)
**Requiere**: Rol `member`
**Componente**: `MemberProgressComponent` (standalone)

**API calls** (3 paralelas):
| API | Para qué |
|---|---|
| `GET /api/v1/attendance/user/{userId}/count?days=7` | Conteo semanal |
| `GET /api/v1/feedback/user/{userId}/averages?last=5` | Promedios |
| `GET /api/v1/risk/{userId}` | Score |

**Contenido**:
- Stats cards (grid-4, mismas que dashboard): Asistencias · Score de riesgo · Esfuerzo · Energía
- Progress bar de riesgo (card inferior)

**Cómputos**: `avgEffort`, `avgEnergy`, `riskScore`, `riskScoreFormatted`, `riskBarWidth`, `riskColor`, `riskBarBg`

**Acciones**: ❌ Ninguna.

**Problemas**:
- **🔴 Misma info que el dashboard** — no hay valor agregado: sin gráficos, sin tendencias, sin historial
- Sin historial de scores de riesgo (solo el último)
- Sin histórico de asistencias (solo últimos 7 días)
- Sin histórico de feedback (solo últimos 5 promedios)
- Sin gráficos (barras, líneas de tendencia)

---

### Member Notifications (`/member/notifications`)
**Requiere**: Rol `member`
**Componente**: `MemberNotificationsComponent` (standalone)

**API call**: `GET /api/v1/notifications/user/{userId}` → `Notification[]`

**Contenido**:
- Lista de notificaciones tipo timeline con:
  - Status dot (pendiente/enviado/fallido con emoji ⏳✅❌)
  - Mensaje
  - Fecha formateada
  - Trigger badge (high_risk / milestone / manual)
  - Status badge (pending / sent / failed)
- Estado vacío con mensaje

**Acciones**: ❌ Ninguna.

**Problemas**:
- Sin marcar como leída
- Sin filtro por estado (pending/sent/failed)
- Sin paginación
- Sin acción de reintentar para notificaciones failed

---

## Mapa de navegación completo

```
                         ┌──────────┐
                         │  /       │
                         │ Landing  │
                         └────┬─────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
              ┌──────────┐        ┌──────────┐
              │ /login   │        │ /register│
              └────┬─────┘        └──────────┘
                   │
            ┌──────┴──────┬──────────────┐
            ▼             ▼              ▼
     ┌────────────┐ ┌──────────┐ ┌──────────────┐
     │ admin/     │ │ coach/   │ │  member/     │
     │  dashboard │ │  dashboard│ │   dashboard  │
     │  coaches   │ │  members/ │ │   routine    │
     │            │ │   :id     │ │   feedback   │
     │            │ │  routines │ │   progress   │
     │            │ │  routines/│ │  notifications│
     │            │ │   create  │ │              │
     └────────────┘ └──────────┘ └──────────────┘
```

---

## Resumen de acciones por rol

| Acción | Admin | Coach | Member |
|---|---|---|---|
| Ver dashboard | ✅ Global | ✅ Sus miembros | ✅ Personal |
| CRUD Coaches | ❌ (solo read) | — | — |
| CRUD Miembros | ❌ | ❌ | — |
| Ver detalle miembro | — | ✅ | — |
| Calcular riesgo | — | ✅ (por miembro) | ❌ |
| Enviar mensaje IA | — | ✅ (por miembro) | — |
| CRUD Rutinas | — | ✅ (solo create + read) | ❌ (solo read) |
| Registrar asistencia | — | — | ✅ |
| Dar feedback | — | — | ✅ |
| Ver progreso | — | — | ✅ |
| Ver notificaciones | — | — | ✅ |

---

## Problemas por prioridad para refactor

### 🔴 Críticos (rotura funcional o UX blocking)

| # | Problema | Componente | Impacto |
|---|---|---|---|
| 1 | Register envía `gym_id: ''` → siempre falla | `RegisterComponent` | No se pueden registrar usuarios nuevos |
| 2 | Crear rutina pide `gym_id` manual al coach | `RoutineCreateComponent` | Coach no sabe qué UUID poner |
| 3 | Member routine checkboxes no persisten | `MemberRoutineComponent` | Usuario pierde progreso visual |
| 4 | `alert()` en error de completar sesión | `MemberRoutineComponent` | UX bloqueante, no hay mensaje inline |
| 5 | Admin no puede crear/editar coaches | `CoachesComponent` | Funcionalidad incompleta |
| 6 | MemberProgress duplica MemberDashboard | `MemberProgressComponent` | Sin valor agregado |
| 7 | Coach routine list sin editar/eliminar | `RoutinesComponent` | Funcionalidad incompleta |

### 🟡 Altos (UX degradada)

| # | Problema | Componente | Impacto |
|---|---|---|---|
| 8 | Icon buttons sin `aria-label` | `CoachDashboardComponent` | Inaccesible para lectores de pantalla |
| 9 | Sin autocomplete en login | `LoginComponent` | No funciona con password managers |
| 10 | Admin dashboard sin acciones | `DashboardComponent` | Dashboard no accionable |
| 11 | Sin paginación en listas | Varios | Degradación con datos reales |
| 12 | `lastDate()` no es computed signal | `MemberDetailComponent` | No se actualiza reactivamente |
| 13 | Coach member detail sin acciones | `MemberDetailComponent` | Solo lectura, no permite ayudar al miembro |
| 14 | Sin skeleton loading en ningún componente | Varios | Pantalla en blanco mientras carga |
| 15 | Sin `prefers-reduced-motion` | `styles.css` | Puede causar mareos en usuarios sensibles |

### 🟢 Medios (mejorable)

| # | Problema | Componente | Impacto |
|---|---|---|---|
| 16 | Sin dark mode | `styles.css` | Sin soporte de tema oscuro |
| 17 | Score con 4 decimales | `DashboardComponent` | Ruido visual |
| 18 | 5 llamadas HTTP paralelas en member dashboard | `MemberDashboardComponent` | Waterfall de carga |
| 19 | Sin filtros en listas | Varios | Dificulta encontrar datos |
| 20 | Tipografía genérica (Inter) | `styles.css` | Sin identidad visual |
| 21 | Estado vacío sin call-to-action útil | Varios | Usuario no sabe qué hacer |
| 22 | Notificaciones sin marcar como leídas | `MemberNotificationsComponent` | No hay gestión de estado |
| 23 | Coach routine create sin selector de usuario | `RoutineCreateComponent` | Mala UX, requiere saber UUID |

---

## Recomendaciones de diseño (Frontend Design Skill)

Basado en la skill `frontend-design`, el sistema actual tiene un diseño correcto pero genérico. Para darle identidad:

### Tipografía
- **Cambiar Inter** por una dupla con personalidad:
  - Display: `DM Sans`, `Sora` o `Plus Jakarta Sans` para títulos
  - Body: `Inter` está bien, pero se puede cambiar a `Outfit` o `Manrope`
- Aplicar `font-variant-numeric: tabular-nums` en todas las cards con números

### Color
- El indigo `#4f46e5` es funcional pero común. Considerar:
  - Mantener indigo como primary pero agregar un accent más audaz (ej: `#f59e0b` o `#ec4899`)
  - Usar gradientes en backgrounds de cards de riesgo (verde→amarillo→rojo)

### Motion
- Agregar staggered reveals en listas con `animation-delay` incremental
- Micro-interactions en hover de cards (scale sutil + shadow)
- Transiciones de página con `View Transitions API`

### Layout
- Sidebar colapsable en mobile
- Dashboard adaptativo: 1 col en mobile, 2-4 en desktop
- Grid asimétrico en dashboard admin (card de riesgo más grande que las otras)

### Backgrounds
- Agregar noise texture sutil al fondo
- Cards de estado con gradient meshes en lugar de colores sólidos
- Avatar backgrounds con gradient basado en el nombre (hash→color)
