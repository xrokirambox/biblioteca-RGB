# Biblioteca Escolar RGB — PRD

## Problem Statement
Interactive school library web app with glassmorphism dark theme (dark green + gold). Hierarchical navigation: Nivel → Grado → Materias. Users save Google Drive links per subject. No authentication. Backend with MongoDB persistence.

## User Choices (feb 2026)
- Backend: MongoDB (chosen)
- Authentication: None (open access)
- Institution name: "Biblioteca Escolar RGB"
- Books: Mock data
- Materias: standard per grade

## Architecture
- **Backend**: FastAPI + Motor (async MongoDB), collection `library_links` with upsert on (grado_id, materia_id).
- **Frontend**: React 19 + Tailwind + sonner (toasts) + lucide-react (icons). React Context for state. Portal-based modal.
- **Design**: Cinzel (headings), Cormorant Garamond (elegant), DM Sans (UI). Colors: #020b04, #051a09, #c9a227.

## Implemented (Feb 2026)
- [x] Backend endpoints:
  - `GET /api/` health
  - `GET /api/links` — nested `{gradoId: {materiaId: url}}`
  - `GET /api/links/{gradoId}` — map for single grado
  - `POST /api/links` — upsert link (validates http/https/`/`)
  - `DELETE /api/links/{gradoId}/{materiaId}`
- [x] Frontend sections: Header (with mobile menu), Hero (with background image + stats), SearchSection, Categories (3 niveles), FeaturedBooks (with category filter + search), CTABanner, Footer.
- [x] Hierarchical modal: NivelView → GradoView → MateriasView with breadcrumb, back button, ESC close, overlay close.
- [x] Materia row: URL input, Save (validates + upsert to MongoDB + toast), Go (disabled until saved, opens link in new tab), Remove link.
- [x] Persistence via MongoDB (replaces localStorage from original spec) across devices.
- [x] Responsive design (grid breakpoints sm/md/lg).
- [x] Data structure: Primaria (g1-g5), Secundaria (g6-g9), Media (g10-g11) with standard subjects.
- [x] data-testid attributes across all interactive elements.

## Testing
- Backend: 7/7 pytest tests pass (`/app/backend/tests/test_library_api.py`)
- Frontend: full flow verified — modal navigation, link save/persistence after reload, remove, filters, search.

## Backlog / Next Tasks
### P1
- [ ] Admin view to bulk-import/export links (CSV / JSON)
- [ ] Real book catalog (Google Books API) to replace mock featured books
- [ ] Per-grado cover images
- [ ] Search materias and links inside modal

### P2
- [ ] Basic analytics (most-clicked subjects)
- [ ] Migrate deprecated `@app.on_event('shutdown')` to FastAPI lifespan
- [ ] Authentication layer (optional teacher/admin login) for write operations
- [ ] PWA / offline caching of the subject tree
