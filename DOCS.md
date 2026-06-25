# Documentación Técnica — Biblioteca Escolar RGB

## Índice

1. [Arquitectura general](#1-arquitectura-general)
2. [Backend — FastAPI](#2-backend--fastapi)
   - [Estructura de módulos](#21-estructura-de-módulos)
   - [Modelos de datos (Schemas)](#22-modelos-de-datos-schemas)
   - [Autenticación y seguridad](#23-autenticación-y-seguridad)
   - [Rate limiting](#24-rate-limiting)
   - [Auditoría](#25-auditoría)
   - [Repositorios](#26-repositorios)
   - [Servicios](#27-servicios)
   - [Routers / Endpoints](#28-routers--endpoints)
   - [Seed data (datos iniciales)](#29-seed-data-datos-iniciales)
3. [Frontend — React](#3-frontend--react)
   - [Estructura de componentes](#31-estructura-de-componentes)
   - [Contextos de estado](#32-contextos-de-estado)
   - [Componentes principales](#33-componentes-principales)
   - [Panel de administración](#34-panel-de-administración)
   - [Cliente HTTP (api.js)](#35-cliente-http-apijs)
4. [Base de datos — MongoDB](#4-base-de-datos--mongodb)
   - [Colecciones](#41-colecciones)
   - [Índices](#42-índices)
5. [Flujos clave](#5-flujos-clave)
   - [Login de administrador](#51-login-de-administrador)
   - [Exploración jerárquica](#52-exploración-jerárquica)
   - [CRUD de libros](#53-crud-de-libros)
6. [Guía de desarrollo](#6-guía-de-desarrollo)
   - [Agregar un nuevo endpoint](#61-agregar-un-nuevo-endpoint)
   - [Agregar un nuevo componente admin](#62-agregar-un-nuevo-componente-admin)
7. [Decisiones de diseño y contexto](#7-decisiones-de-diseño-y-contexto)

---

## 1. Arquitectura general

El proyecto sigue una arquitectura cliente-servidor clásica con separación estricta:

```
frontend/  →  SPA React desplegada en Vercel
backend/   →  API REST FastAPI desplegada en Render
             └─ MongoDB Atlas como base de datos
```

La comunicación se realiza exclusivamente vía HTTP sobre `/api/*`. El backend expone todos sus endpoints bajo el prefijo `/api` (requerimiento del ingress de despliegue). El frontend consume la API usando axios configurado con `baseURL` desde variables de entorno.

La autenticación usa **JWT** almacenado en una **cookie httpOnly** (`access_token`), lo que previene acceso desde JavaScript. El token también puede enviarse como `Authorization: Bearer <token>` para clientes que no soporten cookies.

---

## 2. Backend — FastAPI

### 2.1 Estructura de módulos

```
backend/
└── app/
    ├── config.py          # Settings con pydantic-settings (lectura de .env)
    ├── __init__.py
    ├── core/
    │   ├── audit.py       # Escritura y consulta del log de auditoría
    │   ├── deps.py        # Dependencias FastAPI: get_current_user, require_roles
    │   ├── rate_limit.py  # Rate limiting en memoria para login
    │   └── security.py    # Hash de contraseñas, creación/decodificación JWT
    ├── db/
    │   └── client.py      # Singleton Motor, creación de índices
    ├── domain/
    │   └── schemas.py     # Todos los modelos Pydantic (I/O + records internos)
    ├── repositories/
    │   ├── book_repo.py
    │   ├── category_repo.py
    │   ├── link_repo.py
    │   └── user_repo.py
    ├── routers/
    │   ├── audit.py
    │   ├── auth.py
    │   ├── books.py
    │   ├── categories.py
    │   ├── links.py
    │   └── user.py
    └── services/
        ├── auth_service.py
        ├── books_service.py
        ├── categories_service.py
        ├── links_service.py
        └── user_service.py
```

El flujo de una petición es siempre: **Router → Service → Repository → DB**.

### 2.2 Modelos de datos (Schemas)

Definidos en `app/domain/schemas.py` usando Pydantic v2.

#### Usuarios

```python
# Entrada para crear usuario
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str = ""
    role: str = "rector"   # "admin" | "rector"

# Salida pública (nunca expone password_hash)
class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    profile_photo_url: Optional[str]
    created_at: str
    created_by: str
    updated_at: Optional[str]
    updated_by: Optional[str]
```

#### Libros

```python
class BookCreate(BaseModel):
    title: str
    author: str = ""
    category: str = "literatura"   # slug de categoría
    cover: str = ""                # URL de imagen de portada
    url: str = ""                  # URL al recurso (Google Drive, etc.)
    description: str = ""

class BookRecord(BookCreate):
    id: str          # UUID v4
    created_by: str  # ID del usuario
    updated_by: str
    created_at: str  # ISO 8601 UTC
    updated_at: str
```

#### Links de Materias

Los links conectan una materia de un grado con una URL (generalmente carpeta de Google Drive):

```python
class LinkCreate(BaseModel):
    grado_id: str    # Ej: "sexto", "septimo", "docente"
    materia_id: str  # Ej: "matematicas", "lengua", "guia"
    url: str

class LinkRecord(LinkCreate):
    id: str
    created_by: str
    updated_by: str
    updated_at: str
```

#### Categorías

```python
class CategoryCreate(BaseModel):
    name: str
    description: str = ""
    audience: str = "general"   # "general" | "estudiantes" | "profesores"
    status: str = "show"        # "show" | "hide"
```

El `id` de una categoría se genera automáticamente como **slug** del nombre (e.g., `"Ciencias Naturales"` → `"ciencias-naturales"`).

#### Registro de Auditoría

```python
class AuditRecord(BaseModel):
    id: str
    user_id: str
    user_email: str
    user_role: str
    action: str          # "login" | "logout" | "create" | "update" | "delete"
    resource_type: str   # "auth" | "book" | "link" | "category" | "user"
    resource_id: str
    details: Dict[str, Any]
    timestamp: str
```

### 2.3 Autenticación y seguridad

**Archivo**: `app/core/security.py` y `app/core/deps.py`

El sistema usa:
- **bcrypt** para hashing de contraseñas (vía `passlib`)
- **PyJWT** para generación y verificación de tokens

El token contiene: `sub` (user ID), `email`, `role`, `type: "access"`, y `exp`.

**Dependencias de FastAPI** (`deps.py`):

```python
# Extrae usuario del token (cookie o header)
async def get_current_user(request: Request) -> Dict

# Factory para proteger rutas por rol
def require_roles(*roles: str)

# Alias listos para usar
require_admin = require_roles("admin")
require_staff = require_roles("admin", "rector")
```

**Uso en routers**:

```python
@router.post("/books")
async def create_book(payload: BookCreate, current=Depends(require_staff)):
    # current es el usuario autenticado con rol admin o rector
    return await books_service.create_book(payload, current)
```

### 2.4 Rate limiting

**Archivo**: `app/core/rate_limit.py`

Implementación en memoria (sin dependencias externas). Limita a **5 intentos de login por IP en una ventana de 300 segundos**.

```python
WINDOW_SECONDS = 300
MAX_ATTEMPTS = 5
```

El cache se limpia automáticamente al superar la ventana de tiempo. Cuando el login es exitoso, el contador del IP se resetea con `rate_limit.clear(request)`.

> ⚠️ Esta implementación no persiste entre reinicios del servidor. Para producción con múltiples workers, considera Redis.

### 2.5 Auditoría

**Archivo**: `app/core/audit.py`

Cada operación de escritura genera un registro en la colección `audit_log`:

```python
await audit.record(
    user=current_user,
    action="create",
    resource_type="book",
    resource_id=book_id,
    details={"title": "Cien Años de Soledad"}
)
```

Se pueden consultar los últimos N registros (máximo 500) vía `GET /api/audit?limit=100`.

### 2.6 Repositorios

Cada repositorio encapsula las operaciones de MongoDB para una colección. El patrón es consistente:

```python
class BookRepository:
    async def list_all(self) -> List[Dict]
    async def get_by_id(self, id: str) -> Optional[Dict]
    async def insert(self, doc: Dict) -> None
    async def update(self, id: str, changes: Dict) -> Dict
    async def delete(self, id: str) -> int  # retorna cantidad eliminada
    async def count(self) -> int
```

Los documentos se devuelven **sin el campo `_id`** de MongoDB (se usa proyección `{"_id": 0}`) para mantener la consistencia con los schemas Pydantic.

### 2.7 Servicios

La capa de servicios contiene la lógica de negocio y validaciones:

**`categories_service.py`** — Validaciones de enum:
```python
ALLOWED_STATUS = ("show", "hide")
ALLOWED_AUDIENCE = ("general", "estudiantes", "profesores")

# El ID se genera como slug del nombre
def _slug(name: str) -> str:
    return "-".join(name.lower().strip().split())
```

**`links_service.py`** — Manejo de campo legacy:
```python
# Compatible con documentos antiguos que usaban "grado"/"materia" en lugar de "grado_id"/"materia_id"
g = doc.get("grado_id") or doc.get("grado")
m = doc.get("materia_id") or doc.get("materia")
```

**`auth_service.py`** — Seed idempotente:
```python
async def ensure_seed_user(email, password, name, role) -> None:
    # Crea el usuario si no existe, o actualiza password/role si cambió en .env
```

### 2.8 Routers / Endpoints

Todos los routers se montan bajo el `api_router` con prefijo `/api`:

```python
api_router.include_router(auth.router)       # /api/auth/...
api_router.include_router(user.router)       # /api/users/...
api_router.include_router(books.router)      # /api/books/...
api_router.include_router(links.router)      # /api/links/...
api_router.include_router(categories.router) # /api/categories/...
api_router.include_router(audit.router)      # /api/audit/...
```

La documentación interactiva de la API está disponible en `/docs` (Swagger UI) cuando el servidor está corriendo.

### 2.9 Seed data (datos iniciales)

Al arrancar el servidor (`on_startup`):

1. Se crean los índices de MongoDB (operación idempotente)
2. Se crean/actualizan los usuarios semilla (`admin` y `rector`)
3. Si la colección `books` está vacía, se insertan 4 libros de ejemplo

---

## 3. Frontend — React

### 3.1 Estructura de componentes

```
src/
├── App.js                     # Raíz: providers + routing
├── components/
│   ├── Header.jsx             # Navegación + logo (trigger acceso admin)
│   ├── Hero.jsx               # Banner principal con CTA
│   ├── SearchSection.jsx      # Barra de búsqueda de libros
│   ├── Categories.jsx         # Grid de categorías de libros
│   ├── FeaturedBooks.jsx      # Listado de libros con filtros
│   ├── CTABanner.jsx          # Banner de llamada a la acción
│   ├── Footer.jsx
│   ├── LibraryModal.jsx       # Modal jerárquico Nivel→Grado→Materia
│   ├── AdminBadge.jsx         # FAB flotante (ícono escudo)
│   ├── AdminLogin.jsx         # Modal de login de admin
│   ├── AdminPanel.jsx         # Panel lateral con tabs de administración
│   ├── BooksManager.jsx       # CRUD de libros
│   ├── CategoriesManager.jsx  # CRUD de categorías
│   ├── UsersManager.jsx       # CRUD de usuarios
│   ├── AuditLog.jsx           # Visualización del log de auditoría
│   ├── StaffPanel.jsx         # Panel simplificado para rol rector
│   ├── ProfilePhotoUploader.jsx
│   ├── UserAvatar.jsx
│   └── ui/                    # Componentes shadcn/ui
├── context/
│   ├── AuthContext.jsx        # Estado de sesión
│   └── LibraryContext.jsx     # Estado de la biblioteca
├── data/
│   ├── niveles.js             # Estructura estática Nivel→Grado
│   └── materias.js            # Materias por grado (estáticas)
└── lib/
    └── api.js                 # Instancia axios configurada
```

### 3.2 Contextos de estado

#### AuthContext (`context/AuthContext.jsx`)

Gestiona el estado de autenticación del usuario:

```javascript
// Valores expuestos por el contexto
{
  user,          // null o { id, email, name, role, ... }
  isAdmin,       // role === "admin"
  isStaff,       // role === "admin" || role === "rector"
  login,         // async (email, password) => void
  logout,        // async () => void
  showLogin,     // boolean — controla visibilidad del modal de login
  setShowLogin,  // setter
}
```

#### LibraryContext (`context/LibraryContext.jsx`)

Gestiona el estado compartido de datos y UI de la biblioteca:

```javascript
{
  // Datos del servidor
  links,       // { grado_id: { materia_id: url } }
  books,       // Book[]
  categories,  // Category[]
  loading,

  // Funciones de recarga
  refreshLinks,
  refreshBooks,
  refreshCategories,

  // Estado del modal de navegación
  modalOpen,
  openModal,
  closeModal,
  level,       // 0=niveles, 1=grados, 2=materias
  nivelId,
  gradoId,
  setNivelId,
  setGradoId,
  setLevel,

  // Filtro de categoría activo
  activeCategoryId,
  setActiveCategoryId,
}
```

### 3.3 Componentes principales

#### LibraryModal

Implementa la navegación jerárquica en tres niveles:

```
Nivel 0: Lista de Niveles (Primaria, Secundaria, Docentes...)
Nivel 1: Lista de Grados del nivel seleccionado
Nivel 2: Lista de Materias del grado
         - Admin: input URL + botones Guardar / Ir / Eliminar
         - Público: solo nombre + botón "Ir" (si existe link) o "No disponible"
```

#### FeaturedBooks

Muestra el catálogo de libros con:
- Filtrado por `activeCategoryId` del contexto
- Búsqueda por texto (título, autor, descripción)
- Cards con portada, título, autor y descripción
- Acceso al link del recurso

### 3.4 Panel de administración

El acceso al admin sigue este flujo:

```
1. Usuario activa trigger oculto (Ctrl+Click logo / escudo FAB)
2. Se muestra AdminLogin (modal de credenciales)
3. Login exitoso → AuthContext.user se actualiza
4. AdminBadge cambia a modo "panel abierto"
5. Se muestra AdminPanel (drawer lateral) con tabs:
   - Libros (BooksManager)
   - Categorías (CategoriesManager)
   - Usuarios (UsersManager) — solo admin
   - Auditoría (AuditLog) — solo admin
```

Para rol `rector`, se muestra `StaffPanel` con acceso limitado (gestión de links).

### 3.5 Cliente HTTP (api.js)

```javascript
// src/lib/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  withCredentials: true,  // Envía cookies httpOnly automáticamente
});
```

Todos los componentes importan `api` para sus peticiones. El token se maneja automáticamente a través de la cookie — no es necesario añadir headers manualmente.

---

## 4. Base de datos — MongoDB

### 4.1 Colecciones

| Colección | Descripción |
|---|---|
| `users` | Usuarios del sistema (admin, rector) |
| `books` | Catálogo de libros/recursos |
| `links` | Links Grado → Materia → URL |
| `categories` | Categorías de libros |
| `audit_log` | Registro de acciones administrativas |

### 4.2 Índices

Creados al arrancar el servidor (`ensure_indexes`):

```python
db.users.create_index("email", unique=True)
db.users.create_index("id", unique=True)
db.books.create_index("id", unique=True)
db.links.create_index([("grado_id", 1), ("materia_id", 1)])  # Búsqueda de links
db.categories.create_index("id", unique=True)
db.audit_log.create_index([("timestamp", -1)])  # Ordenar por fecha desc
```

---

## 5. Flujos clave

### 5.1 Login de administrador

```
Frontend                    Backend
───────                     ───────
AdminLogin (form)
  │
  ├─ POST /api/auth/login ──►  auth_service.login()
  │   { email, password }       ├─ rate_limit.enforce(request)
  │                             ├─ user_repo.get_by_email()
  │                             ├─ verify_password()
  │                             ├─ create_access_token()
  │                             ├─ audit.record("login")
  │                             └─ Set-Cookie: access_token=...
  │
  ◄─ { user, token } ──────── Response 200
  │
AuthContext.setUser()
AdminPanel visible
```

### 5.2 Exploración jerárquica

```
Usuario hace clic en "Explorar Biblioteca"
  │
  ▼
LibraryContext.openModal()  →  modalOpen = true, level = 0

Nivel 0: muestra niveles (datos estáticos de niveles.js)
  │ clic en nivel
  ▼
level = 1, nivelId = "secundaria"

Nivel 1: muestra grados del nivel (datos estáticos de niveles.js)
  │ clic en grado
  ▼
level = 2, gradoId = "septimo"

Nivel 2: muestra materias (datos estáticos de materias.js)
  │ para cada materia: busca links[gradoId][materiaId]
  │
  ├─ Admin: muestra input URL + guardar/ir/eliminar
  └─ Público: muestra "Ir" si hay URL, "No disponible" si no
```

### 5.3 CRUD de libros

**Crear**:
```
BooksManager (form)
  │
  ├─ POST /api/books ─────► books_service.create_book()
  │   BookCreate payload      ├─ BookRecord(id=uuid4(), ...)
  │                           ├─ book_repo.insert(doc)
  │                           └─ audit.record("create", "book")
  │
  ◄─ BookRecord ───────────
  │
LibraryContext.refreshBooks()  →  re-renderiza FeaturedBooks
```

**Actualizar** (parcial — solo campos enviados):
```
PUT /api/books/{id}  →  books_service.update_book()
  ├─ Filtra cambios no nulos
  ├─ Añade updated_at y updated_by
  └─ book_repo.update(id, changes)
```

---

## 6. Guía de desarrollo

### 6.1 Agregar un nuevo endpoint

1. **Crear schema** en `app/domain/schemas.py`:
```python
class ResourceCreate(BaseModel):
    name: str
    value: str

class ResourceRecord(ResourceCreate):
    id: str = Field(default_factory=new_id)
    created_by: str = ""
    created_at: str = Field(default_factory=now_iso)
```

2. **Crear repositorio** en `app/repositories/resource_repo.py`:
```python
class ResourceRepository:
    async def list_all(self): ...
    async def insert(self, doc): ...
    async def update(self, id, changes): ...
    async def delete(self, id): ...
```

3. **Crear servicio** en `app/services/resource_service.py`:
```python
async def create_resource(payload: ResourceCreate, current: Dict) -> Dict:
    record = ResourceRecord(**payload.model_dump(), created_by=current["id"])
    await resource_repo.insert(record.model_dump())
    await audit.record(current, "create", "resource", record.id)
    return record.model_dump()
```

4. **Crear router** en `app/routers/resource.py`:
```python
router = APIRouter(prefix="/resources", tags=["resources"])

@router.get("")
async def list_resources():
    return await resource_service.list_resources()

@router.post("")
async def create_resource(payload: ResourceCreate, current=Depends(require_staff)):
    return await resource_service.create_resource(payload, current)
```

5. **Registrar en `server.py`**:
```python
from app.routers import resource
api_router.include_router(resource.router)
```

### 6.2 Agregar un nuevo componente admin

1. Crear el componente en `frontend/src/components/MiManager.jsx`
2. Importar `api` de `../lib/api`
3. Importar `useAuth` de `../context/AuthContext`
4. Añadir el tab en `AdminPanel.jsx`

```jsx
// Ejemplo mínimo de componente manager
import { api } from "../lib/api";
import { useState, useEffect } from "react";

export function MiManager() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await api.get("/mi-recurso");
    setItems(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data) => {
    await api.post("/mi-recurso", data);
    await load();
  };

  return (/* UI */);
}
```

---

## 7. Decisiones de diseño y contexto

### ¿Por qué FastAPI + Motor en lugar de Django/Flask?

FastAPI ofrece validación automática con Pydantic, generación de OpenAPI, y soporte nativo async. Motor es el driver async oficial de MongoDB, necesario para aprovechar el event loop de FastAPI sin bloquear.

### ¿Por qué el acceso admin es "discreto"?

La aplicación es de uso público institucional. Exponer un botón de login visible invitaría a intentos de acceso no autorizados. El acceso por Ctrl+Click / triple-click en el logo o el pequeño ícono escudo es suficientemente obvio para administradores capacitados, pero invisible para el usuario promedio.

### ¿Por qué datos estáticos para niveles y materias?

La jerarquía Nivel → Grado → Materia es estable y definida institucionalmente. Gestionarlos desde la base de datos agregaría complejidad sin beneficio real. Los **links** que conectan materias con recursos sí son dinámicos y se gestionan desde la base de datos.

### Compatibilidad con campo legacy (`grado` vs `grado_id`)

El servicio de links maneja documentos que pueden tener el campo antiguo `grado`/`materia` o el nuevo `grado_id`/`materia_id`. Esto evita migraciones manuales de datos al actualizar el schema.

### Categorías como slugs

El ID de una categoría se genera como slug de su nombre. Esto hace los IDs legibles y predecibles (`"Ciencias Naturales"` → `"ciencias-naturales"`), simplifica las URLs y evita duplicados implícitamente.

### Roles `admin` y `rector`

El rol `rector` tiene permisos de escritura (`require_staff`) pero no puede gestionar usuarios ni ver auditoría completa. Esto permite que el directivo institucional actualice recursos sin tener acceso a datos sensibles de administración del sistema.
