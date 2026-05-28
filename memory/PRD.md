# Biblioteca Escolar RGB — PRD

## Problem Statement
Interactive school library with glassmorphism dark theme. Hierarchical: Nivel → Grado → Materias. Admin-only CRUD for books and link management. Public users browse read-only.

## User Choices
- Backend: MongoDB + FastAPI
- Auth: JWT (email/password) — single seeded admin — discrete access (Ctrl+click / triple-click logo, or small shield icon bottom-left)
- Books: managed by admin (MongoDB), seeded with 4 default books
- Modal materias: admin sees full CRUD; public sees only name + "Ir" when link exists, "No disponible" otherwise

## Architecture
- **Backend**: FastAPI + Motor + bcrypt + PyJWT
- **Frontend**: React 19 + Tailwind + sonner + lucide-react. Two Contexts: `AuthContext` (login/logout/token) + `LibraryContext` (links + books + modal state)
- **Design**: Cinzel / Cormorant Garamond / DM Sans; #020b04 / #051a09 / #c9a227

## Implemented

### v1 (Feb 2026)
- Niveles → Grados → Materias modal with breadcrumb + ESC close
- GET/POST/DELETE `/api/links`
- Featured books mock with category filters
- Responsive layout

### v2 (Apr 2026) — Admin CRUD
- **Auth**: POST `/api/auth/login`, `/logout`, GET `/auth/me` — JWT Bearer + httpOnly cookie
- **Admin seeded** on startup: `admin@rgb.edu` / `admin123` (from env vars, idempotent)
- **Protected writes** (require admin): POST/DELETE `/api/links`, POST/PUT/DELETE `/api/books`
- **Books CRUD** backed by MongoDB (seeded with 4 books if empty)
- **Frontend**: AuthContext, AdminLogin modal, AdminBadge (floating shield / FAB), BooksManager with full CRUD UI (list + form)
- **Public vs Admin materia view**: non-admin sees name + "Ir" or "No disponible"; admin sees input + Save + Go + Trash
- **Discrete admin access**: Ctrl+Click / triple-click on logo, or small shield icon bottom-left

## Testing
- Backend: 21/21 pytest tests pass (`/app/backend/tests/test_library_api.py`) — auth, links protected, books CRUD
- Frontend: full Playwright flow verified — login, admin FAB, BooksManager create/edit/delete, public/admin materia split, logout

## Credentials
- `/app/memory/test_credentials.md` — admin@rgb.edu / admin123

## Backlog
### P1
- [ ] Login rate limiting / brute-force protection
- [ ] Bulk import/export of books (CSV)
- [ ] Migrate deprecated `@app.on_event` to lifespan
- [ ] Admin can manage users (multi-admin)

### P2
- [ ] Password reset flow
- [ ] Analytics per book/link clicks
- [ ] PWA / offline caching
- [ ] Per-grado custom icons / cover images
