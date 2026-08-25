# Biblioteca Escolar RGB — Documentación Técnica

**Versión:** 2.0.0  
**Última actualización:** Junio 2026

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Backend](#backend)
   - [Configuración](#configuración)
   - [Base de Datos](#base-de-datos)
   - [Modelos y Esquemas](#modelos-y-esquemas)
   - [Autenticación y Seguridad](#autenticación-y-seguridad)
   - [API REST — Endpoints](#api-rest--endpoints)
   - [Servicios](#servicios)
   - [Repositorios](#repositorios)
   - [Auditoría](#auditoría)
   - [Rate Limiting](#rate-limiting)
6. [Frontend](#frontend)
   - [Contextos](#contextos)
   - [Componentes Principales](#componentes-principales)
   - [Acceso de Administrador](#acceso-de-administrador)
   - [Diseño y Estilos](#diseño-y-estilos)
7. [Roles y Permisos](#roles-y-permisos)
8. [Despliegue](#despliegue)
9. [Credenciales por Defecto](#credenciales-por-defecto)
10. [Backlog y Trabajo Futuro](#backlog-y-trabajo-futuro)

---

## Descripción General

**Biblioteca Escolar RGB** es una aplicación web de biblioteca escolar interactiva con una jerarquía de contenidos organizada en:

```
Nivel → Grado → Materias → Enlace (Google Drive / URL)
```

Los usuarios públicos pueden navegar y buscar recursos sin necesidad de autenticarse. Los administradores y rectores acceden a un panel protegido que les permite gestionar libros, categorías, usuarios y enlaces de materias.

La interfaz utiliza un tema oscuro con efectos de glassmorfismo, inspirado visualmente en una biblioteca clásica.

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                   │
│   AuthContext ─── LibraryContext                        │
│   Componentes: Header, Hero, Categories, Books, Admin   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / REST (JSON)
                        │ JWT via Cookie o Bearer Header
┌───────────────────────▼─────────────────────────────────┐
│                   Backend (FastAPI)                     │
│   /api/auth  /api/users  /api/books                     │
│   /api/links  /api/categories  /api/audit               │
│   Middleware: CORS, Rate Limit, JWT Validation          │
└───────────────────────┬─────────────────────────────────┘
                        │ Motor (async)
┌───────────────────────▼─────────────────────────────────┐
│                   MongoDB                               │
│   Colecciones: users, books, links, categories,         │
│                audit_log                                │
└─────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Python | 3.x | Lenguaje principal |
| FastAPI | 0.110.1 | Framework web / API |
| Uvicorn | 0.25.0 | Servidor ASGI |
| Motor | 3.3.1 | Driver asíncrono MongoDB |
| PyMongo | 4.5.0 | Driver MongoDB |
| Pydantic | ≥ 2.6.4 | Validación de datos y esquemas |
| PyJWT | ≥ 2.10.1 | Tokens JWT |
| bcrypt | 4.1.3 | Hash de contraseñas |
| python-multipart | ≥ 0.0.9 | Upload de archivos (fotos de perfil) |

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Framework UI |
| Tailwind CSS | — | Estilos utilitarios |
| shadcn/ui | — | Componentes de UI |
| lucide-react | — | Iconografía |
| Sonner | — | Notificaciones toast |
| CRACO | — | Configuración de Create React App |

### Infraestructura

| Servicio | Uso |
|---|---|
| Render | Despliegue del backend |
| Vercel | Despliegue del frontend |
| MongoDB Atlas | Base de datos en la nube |

---

## Estructura del Proyecto

```
/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py              # Variables de entorno y configuración
│   │   ├── core/
│   │   │   ├── audit.py           # Registro de auditoría
│   │   │   ├── deps.py            # Dependencias FastAPI (auth guards)
│   │   │   ├── rate_limit.py      # Rate limiting por IP
│   │   │   └── security.py        # JWT y hashing de contraseñas
│   │   ├── db/
│   │   │   └── client.py          # Conexión MongoDB + índices
│   │   ├── domain/
│   │   │   └── schemas.py         # Modelos Pydantic (DTOs)
│   │   ├── repositories/
│   │   │   ├── book_repo.py
│   │   │   ├── category_repo.py
│   │   │   ├── link_repo.py
│   │   │   └── user_repo.py
│   │   ├── routers/
│   │   │   ├── audit.py
│   │   │   ├── auth.py
│   │   │   ├── books.py
│   │   │   ├── categories.py
│   │   │   ├── links.py
│   │   │   └── user.py
│   │   └── services/
│   │       ├── auth_service.py
│   │       ├── books_service.py
│   │       ├── categories_service.py
│   │       ├── links_service.py
│   │       └── user_service.py
│   ├── server.py                  # Punto de entrada FastAPI
│   ├── requirements.txt
│   ├── runtime.txt
│   └── render.yaml
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/            # Componentes React
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Estado global de autenticación
│   │   │   └── LibraryContext.jsx # Estado global de libros y links
│   │   ├── data/
│   │   │   ├── materias.js        # Catálogo de materias
│   │   │   └── niveles.js         # Catálogo de niveles/grados
│   │   ├── hooks/
│   │   └── lib/
│   │       └── api.js             # Cliente HTTP centralizado
│   ├── package.json
│   └── tailwind.config.js
│
└── memory/
    └── PRD.md                     # Product Requirements Document
```

---

## Backend

### Configuración

El backend se configura mediante variables de entorno. El archivo `backend/app/config.py` las carga con `pydantic-settings`.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `MONGO_URL` | URI de conexión a MongoDB | *requerida* |
| `DB_NAME` | Nombre de la base de datos | *requerida* |
| `JWT_SECRET` | Clave secreta para firmar JWT | *requerida* |
| `JWT_EXPIRE_HOURS` | Duración del token en horas | `8` |
| `CORS_ORIGINS` | Orígenes permitidos (separados por coma) | `https://biblioteca-rgb.vercel.app` |
| `SECURE_COOKIES` | Activar cookies seguras (HTTPS) | `True` |
No existen cuentas ni contraseñas predeterminadas. El primer administrador se crea de forma interactiva con `python scripts/bootstrap_admin.py --email admin@colegio.edu` y las demás cuentas se gestionan desde el panel.

> **Importante:** Use un `JWT_SECRET` aleatorio y mantenga `SECURE_COOKIES=True` en producción.

---

### Base de Datos

**Colecciones MongoDB:**

| Colección | Descripción | Índices |
|---|---|---|
| `users` | Cuentas de usuario | `email` (único), `id` (único) |
| `books` | Catálogo de libros | `id` (único) |
| `links` | Vínculos materia → URL | `(grado_id, materia_id)` compuesto |
| `categories` | Categorías de libros | `id` (único) |
| `audit_log` | Registro de acciones | `timestamp` (descendente) |

Los índices se crean de forma idempotente en el startup de la aplicación mediante `ensure_indexes()`.

#### Datos semilla al arrancar

Al iniciar, el servidor ejecuta automáticamente:

- **Usuarios semilla:** crea o actualiza `admin@rgb.edu` (rol `admin`) y `rector@rgb.edu` (rol `rector`) según las variables de entorno.
- **Libros semilla:** si la colección `books` está vacía, inserta 4 libros de ejemplo (Cien Años de Soledad, Principios de Matemáticas, Breve Historia del Tiempo, Sapiens).

---

### Modelos y Esquemas

Todos los modelos están definidos en `backend/app/domain/schemas.py` usando Pydantic v2.

#### Auth

```python
class LoginIn(BaseModel):
    email: EmailStr
    password: str
```

#### Usuarios

```python
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str = ""
    role: str = "rector"         # "admin" | "rector"

class UserUpdate(BaseModel):
    name: Optional[str]
    role: Optional[str]
    password: Optional[str]
    profile_photo_url: Optional[str]

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
    category: str = "literatura"
    cover: str = ""              # URL de portada
    url: str = ""                # URL de acceso al libro
    description: str = ""

class BookUpdate(BaseModel):
    # Todos los campos opcionales para PATCH semántico
    title: Optional[str]
    author: Optional[str]
    category: Optional[str]
    cover: Optional[str]
    url: Optional[str]
    description: Optional[str]
```

#### Categorías

```python
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    audience: str = "general"   # "general" | "estudiantes" | "profesores"
    status: str = "show"        # "show" | "hide"
```

#### Links (Materias)

```python
class LinkCreate(BaseModel):
    grado_id: str      # e.g. "sexto", "septimo"
    materia_id: str    # e.g. "matematicas", "español"
    url: str           # URL de Google Drive u otra fuente
```

#### Auditoría

```python
class AuditRecord(BaseModel):
    id: str
    user_id: str
    user_email: str
    user_role: str
    action: str           # "login" | "logout" | "create" | "update" | "delete"
    resource_type: str    # "auth" | "book" | "category" | "link" | "user"
    resource_id: str
    details: Dict[str, Any]
    timestamp: str        # ISO 8601 UTC
```

---

### Autenticación y Seguridad

#### Flujo de autenticación

1. El cliente hace `POST /api/auth/login` con email y contraseña.
2. El servidor verifica las credenciales contra `users.password_hash` (bcrypt).
3. Si son válidas, genera un JWT con `sub=user_id`, `email`, `role` y exp.
4. El token se envía en dos formas:
   - **Cookie httpOnly** `access_token` (duración configurable, por defecto 12h).
   - **Cuerpo de la respuesta** como campo `token` para clientes que usen Bearer.
5. Rutas protegidas leen el token primero desde la cookie, luego desde el header `Authorization: Bearer <token>`.

#### Dependencias de autorización

```python
# Cualquier usuario autenticado
get_current_user

# Solo admin o rector
require_staff = require_roles("admin", "rector")

# Solo admin
require_admin = require_roles("admin")
```

#### Rate limiting de login

El módulo `core/rate_limit.py` implementa un límite en memoria por IP:

- **Ventana:** 300 segundos (5 minutos)
- **Máximo de intentos:** 5
- **Respuesta al superar el límite:** `HTTP 429 Too Many Requests`
- El contador se reinicia automáticamente tras un login exitoso.

> **Nota:** Al ser en memoria, el rate limit se resetea al reiniciar el servidor. No persiste entre réplicas.

---

### API REST — Endpoints

La API se monta bajo el prefijo `/api`.

#### Autenticación — `/api/auth`

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Pública | Iniciar sesión, retorna usuario + token |
| POST | `/api/auth/logout` | Opcional | Cerrar sesión, borra la cookie |
| GET | `/api/auth/me` | Usuario autenticado | Retorna el usuario actual |

**Ejemplo — Login:**

```json
// POST /api/auth/login
// Body:
{ "email": "admin@colegio.edu", "password": "una-contraseña-segura" }

// Respuesta 200:
{
  "id": "uuid",
  "email": "admin@rgb.edu",
  "name": "Administrador",
  "role": "admin",
  "csrf_token": "token-de-proteccion-de-solicitud"
}
```

---

#### Usuarios — `/api/users`

| Método | Ruta | Autorización | Descripción |
|---|---|---|---|
| GET | `/api/users` | staff (admin, rector) | Listar todos los usuarios |
| POST | `/api/users` | staff | Crear nuevo usuario |
| PUT | `/api/users/{user_id}` | staff | Actualizar usuario |
| DELETE | `/api/users/{user_id}` | solo admin | Eliminar usuario |

---

#### Libros — `/api/books`

| Método | Ruta | Autorización | Descripción |
|---|---|---|---|
| GET | `/api/books` | Pública | Listar todos los libros |
| POST | `/api/books` | staff | Crear libro |
| PUT | `/api/books/{book_id}` | staff | Actualizar libro |
| DELETE | `/api/books/{book_id}` | staff | Eliminar libro |

---

#### Categorías — `/api/categories`

| Método | Ruta | Autorización | Descripción |
|---|---|---|---|
| GET | `/api/categories` | Pública | Listar categorías |
| POST | `/api/categories` | staff | Crear categoría |
| PUT | `/api/categories/{category_id}` | staff | Actualizar categoría |
| DELETE | `/api/categories/{category_id}` | staff | Eliminar categoría |

**Validaciones al crear/actualizar:**

- `status` debe ser `"show"` o `"hide"`
- `audience` debe ser `"general"`, `"estudiantes"` o `"profesores"`
- El `id` se genera automáticamente como slug del nombre (e.g. `"Ciencias Naturales"` → `"ciencias-naturales"`)
- No se permiten categorías con nombre duplicado

---

#### Links de Materias — `/api/links`

| Método | Ruta | Autorización | Descripción |
|---|---|---|---|
| GET | `/api/links` | Pública | Todos los links agrupados por grado |
| GET | `/api/links/{grado_id}` | Pública | Links de un grado específico |
| POST | `/api/links` | staff | Crear o actualizar un link (upsert) |
| DELETE | `/api/links/{grado_id}/{materia_id}` | staff | Eliminar un link |

**Formato de respuesta `GET /api/links`:**

```json
{
  "sexto": {
    "matematicas": "https://drive.google.com/...",
    "español": "https://drive.google.com/..."
  },
  "septimo": {
    "ciencias": "https://drive.google.com/..."
  }
}
```

---

#### Auditoría — `/api/audit` *(nota: el router está montado en `/api/categories` en el archivo actual — ver nota de implementación)*

| Método | Ruta | Autorización | Descripción |
|---|---|---|---|
| GET | `/api/audit` | staff | Últimas entradas del log de auditoría |

---

#### Health check

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/` | Info de versión |
| GET | `/api/health` | Status `{"status": "ok"}` |

---

### Servicios

La capa de servicios contiene la lógica de negocio. Los routers delegan en ella; los repositorios son su única dependencia de persistencia.

#### `auth_service.py`

- `login(email, password, request)` — valida credenciales, aplica rate limit, genera token, registra en auditoría.
- `logout(current)` — registra en auditoría.
- Las cuentas se crean únicamente desde el panel o mediante el script de arranque seguro.

#### `books_service.py`

- `list_books()` — retorna todos los libros.
- `create_book(payload, current)` — crea libro con `BookRecord`, registra auditoría.
- `update_book(book_id, payload, current)` — aplica solo los campos no nulos, registra auditoría.
- `delete_book(book_id, current)` — elimina y registra auditoría.
- `seed_books_if_empty()` — inserta 4 libros ejemplo si la colección está vacía.

#### `categories_service.py`

- Genera el `id` como slug del nombre.
- Valida `status` (`show`/`hide`) y `audience` (`general`/`estudiantes`/`profesores`).
- Detecta duplicados por `id` antes de insertar.

#### `links_service.py`

- `all_links_grouped()` — agrupa todos los links en `{grado_id: {materia_id: url}}`. Maneja campos legados (`grado`, `materia`).
- `save_link(payload, current)` — hace upsert; valida que la URL empiece con `http://`, `https://` o `/`.

#### `user_service.py`

- Gestión CRUD de usuarios con hash de contraseña al crear o actualizar.

---

### Repositorios

Los repositorios encapsulan el acceso a MongoDB. Usan `motor` para operaciones asíncronas.

| Repositorio | Colección | Métodos principales |
|---|---|---|
| `BookRepository` | `books` | `list_all`, `get_by_id`, `insert`, `update`, `delete`, `count` |
| `CategoryRepository` | `categories` | `list_all`, `get_by_id`, `insert`, `update`, `delete` |
| `LinkRepository` | `links` | `list_all`, `list_by_grado`, `find_one`, `upsert`, `delete` |
| `UserRepository` | `users` | `get_by_id`, `get_by_id_with_hash`, `get_by_email`, `list_all`, `insert`, `update`, `delete` |

Todos los repositorios excluyen el campo `_id` de MongoDB (`{"_id": 0}`) para no exponer internals de Mongo.

---

### Auditoría

El módulo `core/audit.py` registra cualquier acción relevante en la colección `audit_log`.

```python
await audit.record(
    user=current_user,
    action="create",          # login | logout | create | update | delete
    resource_type="book",     # auth | book | category | link | user
    resource_id=book_id,
    details={"title": "..."}
)
```

Se puede consultar el historial de auditoría (últimas 100 entradas, máximo 500) con `GET /api/audit` (requiere rol staff).

---

### Rate Limiting

Implementado en `core/rate_limit.py`. Funciona con un diccionario en memoria:

```
IP → { count: N, first: timestamp }
```

Si `count >= MAX_ATTEMPTS` (5) dentro de `WINDOW_SECONDS` (300s), se lanza `HTTP 429`.

> **Limitación conocida:** no persiste entre reinicios ni funciona en entornos multi-worker/multi-réplica sin Redis u otro backend compartido.

---

## Frontend

### Contextos

#### `AuthContext`

Gestiona el estado global de autenticación.

| Estado/Función | Descripción |
|---|---|
| `user` | Objeto con datos del usuario autenticado, o `null` |
| `isAuthenticated` | Boolean derivado de `user` |
| `login(email, password)` | Llama `POST /api/auth/login`, guarda usuario |
| `logout()` | Llama `POST /api/auth/logout`, limpia estado |
| `isAdmin` | `true` si `user.role === "admin"` |
| `isStaff` | `true` si el role es `"admin"` o `"rector"` |

#### `LibraryContext`

Gestiona el estado global de contenido de la biblioteca.

| Estado/Función | Descripción |
|---|---|
| `books` | Lista de libros del servidor |
| `links` | Objeto `{grado: {materia: url}}` |
| `categories` | Lista de categorías |
| `selectedNivel` | Nivel jerárquico actualmente seleccionado |
| `selectedGrado` | Grado actualmente seleccionado |
| `modalOpen` | Boolean del modal de materias |
| `createBook / updateBook / deleteBook` | CRUD de libros |
| `saveLink / deleteLink` | Gestión de links |

---

### Componentes Principales

| Componente | Descripción |
|---|---|
| `Header` | Barra superior con logo, navegación y acceso discreto al panel admin |
| `Hero` | Sección banner principal con imagen de fondo |
| `SearchSection` | Barra de búsqueda de libros |
| `Categories` | Navegación jerárquica Nivel → Grado |
| `LibraryModal` | Modal con las materias del grado seleccionado y sus enlaces |
| `FeaturedBooks` | Grilla de libros destacados con filtros por categoría |
| `CTABanner` | Banner de llamada a la acción |
| `Footer` | Pie de página |
| `AdminBadge` | Botón flotante (FAB) que abre el panel de admin (solo visible para staff) |
| `AdminLogin` | Modal de inicio de sesión para administradores |
| `AdminPanel` | Panel principal de administración con pestañas |
| `BooksManager` | CRUD completo de libros (lista + formulario) |
| `CategoriesManager` | CRUD de categorías |
| `UsersManager` | CRUD de usuarios (solo admin) |
| `StaffPanel` | Panel para gestión de links por materia/grado |
| `AuditLog` | Visualización del log de auditoría |
| `ProfilePhotoUploader` | Subida de foto de perfil de usuario |
| `UserAvatar` | Avatar de usuario con iniciales o foto |

---

### Acceso de Administrador

El acceso al panel de administración es **discreto** (no visible en la UI pública). Se puede activar de tres formas:

1. **Ctrl + Click** sobre el logo de la biblioteca.
2. **Triple click** sobre el logo.
3. Haciendo clic en el **ícono de escudo** pequeño ubicado en la esquina inferior izquierda.

Al activarse, se muestra el modal de login. Una vez autenticado como staff, aparece el FAB (Floating Action Button) con ícono de escudo para abrir el `AdminPanel`.

---

### Diseño y Estilos

El proyecto usa un sistema de diseño oscuro con glassmorfismo, definido en `design_guidelines.json`.

**Paleta de colores principal:**

| Variable | Color | Uso |
|---|---|---|
| Fondo oscuro primario | `#020b04` | Fondo principal |
| Fondo oscuro secundario | `#051a09` | Tarjetas, modales |
| Dorado | `#c9a227` | Acentos, botones CTA |

**Tipografía:**

| Fuente | Uso |
|---|---|
| Cinzel | Títulos y encabezados principales |
| Cormorant Garamond | Subtítulos y texto de categorías |
| DM Sans | Cuerpo de texto, UI general |

Los estilos se gestionan con Tailwind CSS. Los componentes de UI base provienen de shadcn/ui (estilo `new-york`).

---

## Roles y Permisos

| Acción | Público (sin auth) | Rector | Admin |
|---|---|---|---|
| Ver libros | ✅ | ✅ | ✅ |
| Ver categorías | ✅ | ✅ | ✅ |
| Ver links de materias | ✅ | ✅ | ✅ |
| Crear/editar/eliminar libros | ❌ | ✅ | ✅ |
| Crear/editar/eliminar categorías | ❌ | ✅ | ✅ |
| Gestionar links de materias | ❌ | ✅ | ✅ |
| Ver usuarios | ❌ | ✅ | ✅ |
| Crear/editar usuarios | ❌ | ✅ | ✅ |
| Eliminar usuarios | ❌ | ❌ | ✅ |
| Ver log de auditoría | ❌ | ✅ | ✅ |

---

## Despliegue

### Backend (Render)

La configuración de despliegue está en `backend/render.yaml`. El servidor corre con Uvicorn.

```bash
# Arrancar localmente
cd backend
uvicorn server:app --reload --port 8000
```

### Frontend (Vercel)

```bash
cd frontend
npm install
npm run build   # Genera /build para producción
npm start       # Servidor de desarrollo
```

La URL del backend se configura en `frontend/src/lib/api.js` mediante la variable de entorno `REACT_APP_API_URL`.

### Variables de entorno requeridas en producción

**Backend:**

```env
MONGO_URL=mongodb+srv://...
DB_NAME=biblioteca_rgb
JWT_SECRET=<clave-segura-aleatoria>
CORS_ORIGINS=https://tu-frontend.vercel.app
SECURE_COOKIES=True
```

---

## Creación de la primera cuenta

No hay credenciales por defecto. Ejecute `python scripts/bootstrap_admin.py --email admin@colegio.edu` desde `backend`; el comando solicita una contraseña de al menos 12 caracteres y solo guarda su hash bcrypt en MongoDB.

---

## Backlog y Trabajo Futuro

### Prioridad Alta (P1)

- [ ] **Rate limiting persistente** — integrar Redis para que el límite de intentos sobreviva reinicios y funcione en multi-worker.
- [ ] **Importación/exportación masiva de libros** — soporte CSV para carga y descarga.
- [ ] **Migrar `@app.on_event`** — actualizar a la API `lifespan` de FastAPI (los eventos on_event están deprecados desde FastAPI 0.93).
- [ ] **Multi-admin** — el admin puede crear y gestionar otros administradores.

### Prioridad Media (P2)

- [ ] **Restablecimiento de contraseña** — flujo de recuperación por email.
- [ ] **Analytics** — conteo de clics por libro y por link de materia.
- [ ] **PWA / caché offline** — manifesto y service worker para uso sin conexión.
- [ ] **Iconos por grado** — soporte de imágenes personalizadas por nivel/grado.

---

*Documentación generada a partir del código fuente del repositorio — Junio 2026.*
