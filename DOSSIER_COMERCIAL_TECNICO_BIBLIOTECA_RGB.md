# Biblioteca Escolar RGB

## Dossier comercial y técnico para instituciones educativas

**Versión analizada:** código fuente disponible en este repositorio, julio de 2026.  
**Tipo de solución:** biblioteca digital y portal de recursos académicos para colegios.  
**Estado comercial recomendado:** producto base funcional, apto para demostración y venta **con una puesta en producción y personalización por institución**.

---

## 1. Resumen ejecutivo

Biblioteca Escolar RGB convierte los enlaces, libros y recursos digitales de un colegio en un portal web ordenado, visual y administrable. Los estudiantes pueden descubrir contenidos por grado, materia, categoría o búsqueda; el personal autorizado puede actualizar el catálogo y la estructura académica sin editar código.

La propuesta no intenta reemplazar un LMS completo: resuelve de forma directa el problema de **encontrar y mantener accesible una biblioteca digital escolar**. Esto permite implementarla más rápido, con una interfaz clara y un costo técnico menor que una plataforma académica integral.

### Valor para un colegio

- Un único punto de acceso a lecturas, guías, videos, documentos y recursos externos.
- Organización por primaria, secundaria y media; incluye grados 1.º a 11.º en la configuración inicial.
- Catálogo de libros destacados con buscador y filtros por categoría.
- Panel para que personal autorizado cree, edite y elimine contenido.
- Dos roles institucionales: **administrador** y **rector/personal**.
- Registro de auditoría para saber quién inició sesión o modificó recursos.
- Identidad visual moderna, responsiva y personalizable al colegio comprador.

### Mensaje comercial sugerido

> “Su comunidad educativa tendrá una biblioteca digital propia, disponible desde cualquier dispositivo, donde estudiantes y docentes encuentran los recursos correctos según su grado y materia, mientras el colegio conserva el control del contenido.”

---

## 2. Qué compra la institución

La solución entregable es una aplicación web compuesta por una interfaz pública, un panel de gestión y una API. Según el alcance comercial acordado, la entrega puede incluir:

1. Personalización visual: logo, nombre, colores, textos institucionales y enlaces de contacto.
2. Configuración de grados, materias, categorías y recursos iniciales del colegio.
3. Configuración de cuentas administrativas y capacitación de uso.
4. Despliegue en el dominio o subdominio del colegio.
5. Acompañamiento de arranque y soporte bajo un acuerdo separado.

No debe venderse como una plataforma de préstamos físicos, gestión de multas, lector de e-books propio, videollamadas, calificaciones ni LMS; esas capacidades no están implementadas en el código actual.

---

## 3. Funcionalidades comprobadas en el código

| Módulo | Lo que permite | Beneficio institucional |
| --- | --- | --- |
| Portal público | Navegar el catálogo y los recursos sin iniciar sesión. | Acceso simple para estudiantes, familias y docentes. |
| Ruta académica | Explorar por nivel → grado → materia; la estructura inicial contempla 1.º a 11.º. | Reduce el tiempo de búsqueda y mantiene una lógica escolar familiar. |
| Jerarquía editable | Crear, editar y eliminar categoría → subcategoría → materia, con descripción, icono y orden. | La solución se adapta a la malla curricular de cada colegio. |
| Recursos por materia | Asociar enlaces a una materia o a un grado; los enlaces se abren en una pestaña nueva. | Centraliza Drive, repositorios, plataformas y recursos propios. |
| Catálogo de libros | Crear, editar, eliminar y publicar título, autor, categoría, portada, enlace y descripción. | Presenta recomendaciones y recursos de lectura de forma atractiva. |
| Búsqueda y filtros | Buscar en los libros destacados y filtrar por categorías. | Mejora el descubrimiento de contenido. |
| Categorías visibles | Administrar categorías con audiencia (`general`, `estudiantes`, `profesores`) y estado visible/oculto. | Permite preparar o segmentar contenido editorial. |
| Gestión de usuarios | Crear, editar y consultar cuentas del personal; el administrador puede cambiar roles y eliminar otras cuentas. | Evita depender del desarrollador para las tareas básicas de acceso. |
| Perfiles | Guardar foto de perfil mediante enlace público de Google Drive. | Humaniza el panel del personal sin requerir un sistema de archivos propio. |
| Auditoría | Consultar eventos de inicio/cierre de sesión y operaciones de creación, edición y eliminación. | Aporta trazabilidad administrativa. |

### Cómo es la experiencia de un estudiante

1. Entra al portal desde computador, tableta o celular.
2. Abre la biblioteca digital desde los llamados principales de la página.
3. Selecciona nivel, grado y materia, o explora la jerarquía personalizada del colegio.
4. Abre el recurso disponible en una nueva pestaña.
5. También puede buscar libros y abrir el enlace que la institución haya registrado.

El visitante no necesita una cuenta para consultar los recursos públicos. Las acciones de administración sí requieren autenticación.

---

## 4. Roles y gobierno de contenido

| Acción | Administrador | Rector / personal |
| --- | :---: | :---: |
| Ver usuarios, libros, categorías, jerarquía y auditoría | Sí | Sí |
| Crear o editar libros, categorías, jerarquía y enlaces | Sí | Sí |
| Crear usuarios | Sí | Sí, solo con rol rector |
| Cambiar roles | Sí | No |
| Eliminar usuarios | Sí, excepto a sí mismo | No |

**Recomendación comercial y operativa:** asignar el rol de administrador a una cuenta de tecnología o biblioteca y el de rector/personal a responsables académicos. Antes de entregar la instalación, confirmar con el colegio qué equipo debe poder modificar cada tipo de contenido; si se requiere una separación más estricta por módulo, es una mejora a cotizar.

---

## 5. Arquitectura y tecnología

```text
Navegador del estudiante o personal
              │
              ▼
Frontend React (interfaz pública + panel de personal)
              │  HTTPS / API REST /api
              ▼
Backend FastAPI (autenticación, roles, reglas de negocio, auditoría)
              │
              ▼
MongoDB (usuarios, libros, enlaces, categorías, jerarquía y auditoría)
```

| Capa | Tecnología | Razón práctica |
| --- | --- | --- |
| Interfaz | React 18, CRACO, Tailwind CSS, Radix UI y Lucide | Interfaz responsiva, reutilizable y con componentes accesibles. |
| API | Python, FastAPI y Uvicorn | API rápida, tipada y con documentación automática disponible por FastAPI. |
| Persistencia | MongoDB mediante Motor/PyMongo | Modelo flexible para catálogo, enlaces y estructuras académicas personalizadas. |
| Seguridad | bcrypt, JWT HS256, cookies HttpOnly y Bearer token | Contraseñas cifradas y rutas administrativas protegidas por sesión/rol. |
| Despliegue previsto | Frontend estático (p. ej. Vercel) + backend web (p. ej. Render) + MongoDB | Arquitectura separada que permite escalar y actualizar cada parte de forma independiente. |

### Calidad de diseño técnico

El backend está organizado por responsabilidades: `routers` (API), `services` (reglas de negocio), `repositories` (acceso a datos), `domain/schemas` (validación) y `core` (seguridad, dependencias, auditoría y límite de intentos). Esta separación favorece mantenimiento y personalizaciones posteriores.

MongoDB crea índices únicos para correo e identificadores, y un índice compuesto para enlaces por grado y materia. También hay índices para la jerarquía y el registro de auditoría.

---

## 6. Seguridad y manejo de datos

### Controles presentes

- Las contraseñas se almacenan con hash bcrypt; nunca se devuelven desde la API.
- El acceso administrativo usa JWT con vencimiento configurable (12 horas por defecto).
- El token se maneja con cookie `HttpOnly` y, para la interfaz actual, también como Bearer token almacenado en el navegador.
- Las rutas de modificación exigen sesión válida y rol autorizado en el servidor; ocultar un botón en la interfaz no es la única protección.
- Hay límite de 5 intentos de inicio de sesión por IP en una ventana de 5 minutos.
- CORS se configura por variable de entorno para limitar los orígenes permitidos.
- Las operaciones administrativas generan eventos de auditoría en MongoDB.
- Los enlaces externos se abren con `rel="noreferrer"`, reduciendo la exposición de la página de origen.

### Datos que guarda la plataforma

La instalación guarda cuentas de personal (correo, nombre, rol, hash de contraseña y foto opcional), catálogo, enlaces, categorías, estructura académica y eventos de actividad. No existe en el código un registro de estudiantes, notas, asistencia, pagos ni historiales de préstamo.

Esto reduce el alcance de datos personales, pero **no sustituye** la revisión de privacidad, términos de uso, consentimiento y política de tratamiento de datos que aplique a cada institución y jurisdicción.

---

## 7. Ventajas competitivas para la venta

### Frente a una carpeta compartida de enlaces

- Tiene una ruta visual por grado y materia, no una lista plana difícil de mantener.
- Presenta catálogo, portadas, búsqueda y categorías en una experiencia consistente.
- Las modificaciones tienen cuentas, roles y trazabilidad.
- El colegio puede mostrar una biblioteca con su marca en lugar de enviar enlaces dispersos.

### Frente a implementar un LMS completo

- Menor curva de aprendizaje para estudiantes y personal.
- Menor alcance inicial, tiempo de implementación y costo de operación.
- Se concentra en descubrimiento y difusión de recursos, donde un LMS suele ser más pesado de administrar.
- Puede complementar Moodle, Google Classroom, Teams u otra plataforma: los recursos pueden enlazar hacia ellas.

### Frente a un sitio web estático

- El personal puede actualizar contenido desde el panel, sin solicitar cambios de código por cada libro o enlace.
- La estructura académica puede evolucionar sin redeploy manual.
- Ofrece autenticación, roles y auditoría; no solo páginas informativas.

---

## 8. Limitaciones actuales y cómo tratarlas correctamente en la venta

Estas limitaciones se derivan de la revisión del código. Comunicarlas con claridad protege la relación comercial y define oportunidades de evolución.

| Prioridad | Limitación actual | Impacto | Tratamiento recomendado |
| --- | --- | --- |
| Crítica antes de producción | El archivo de Render indica `uvicorn backend.main:app`, pero el punto de entrada existente es `backend/server.py`. | El backend podría no iniciar con esa configuración tal como está. | Corregir y probar el comando de despliegue durante la puesta en producción. |
| Crítica antes de producción | Hay credenciales predeterminadas en la configuración (`admin123` y `rector123`) y el arranque sincroniza las cuentas semilla con las variables. | Riesgo de acceso no autorizado si se usa sin configuración. | Definir correos, contraseñas robustas y `JWT_SECRET` únicos por colegio antes del primer lanzamiento. |
| Alta | El token también se persiste en `localStorage` para enviar el encabezado Bearer. | Una vulnerabilidad XSS podría exponer una sesión. | Mantener dependencias actualizadas, aplicar CSP y, para una versión endurecida, migrar a cookie HttpOnly exclusivamente con estrategia CSRF. |
| Alta | El límite de intentos de login es un diccionario en memoria y toma `X-Forwarded-For` sin una capa de proxy confiable. | Se reinicia al redeploy y no se comparte entre réplicas; su eficacia depende de la infraestructura. | Usar Redis/rate limiting gestionado y configurar correctamente el proxy/CDN si se prevé alto tráfico. |
| Alta | No hay recuperación de contraseña, MFA, revocación de JWT ni bloqueo de cuenta persistente. | La administración de accesos depende del administrador y del vencimiento de sesión. | Incluir estas funciones en una fase de seguridad institucional si el colegio las exige. |
| Media | Los enlaces, portadas y fotos se alojan externamente (p. ej. Google Drive o Unsplash); la plataforma guarda URL, no archivos. | Si el proveedor externo cambia permisos o borra el archivo, el recurso deja de funcionar. | Definir una política editorial y, si se requiere, integrar almacenamiento institucional/S3 y revisión de enlaces. |
| Media | No hay validación completa de copyright, antivirus, moderación o verificación automática de enlaces. | El colegio debe publicar solo recursos autorizados y vigilar la vigencia. | Nombrar responsables de contenido e incorporar flujo de aprobación si se necesita. |
| Media | No hay préstamos, reservas, inventario físico, ISBN, lectores individuales, analítica de uso, notificaciones ni integración SSO/LMS. | No debe prometerse como sistema bibliotecario integral. | Cotizar esos módulos como roadmap; la base actual es una biblioteca/portal digital. |
| Media | El frontend aún conserva datos estáticos iniciales de grados/materias además de la jerarquía editable. | La personalización curricular requiere revisión funcional para evitar duplicidad o recorridos confusos. | Configurar una única experiencia principal por colegio y probarla con usuarios antes de publicar. |
| Media | La auditoría permite consultar hasta 500 eventos recientes y no hay retención/exportación configurada. | Historial limitado para auditorías prolongadas. | Definir retención, respaldo y exportación según política institucional. |
| Baja | Se observan textos con codificación dañada en algunos archivos fuente (por ejemplo, tildes mostradas como `Ã`). | Puede afectar mensajes o experiencia si llegan a la interfaz. | Ejecutar una revisión de codificación UTF-8 y pruebas visuales durante la personalización. |
| Baja | Existe un componente no integrado (`AdminPanel.jsx`) con un error de sintaxis, aunque no se importa desde la aplicación principal. | No bloquea el flujo actual, pero es deuda técnica. | Eliminarlo o corregirlo antes de ampliar el código. |

---

## 9. Puesta en producción por colegio

La venta responsable debe incluir una fase corta de implementación. El producto no requiere cambiar su arquitectura, pero sí configurar y validar el entorno institucional.

### Checklist obligatorio antes del lanzamiento

- [ ] Elegir dominio o subdominio y habilitar HTTPS.
- [ ] Crear base de datos MongoDB exclusiva por institución y restringir el acceso de red.
- [ ] Definir `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, `CORS_ORIGINS`, `SECURE_COOKIES`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RECTOR_EMAIL` y `RECTOR_PASSWORD`.
- [ ] Reemplazar todas las credenciales por defecto y guardar los secretos fuera del repositorio.
- [ ] Corregir, desplegar y verificar el comando de inicio del backend.
- [ ] Definir `REACT_APP_BACKEND_URL` del frontend con la URL HTTPS real de la API.
- [ ] Configurar CORS exclusivamente para el dominio institucional; no usar `*` con cookies.
- [ ] Cargar logo, textos, enlaces institucionales, usuarios y recursos autorizados.
- [ ] Comprobar login, roles, creación de contenido, apertura de enlaces, auditoría y cierre de sesión.
- [ ] Definir quién valida derechos de autor, enlaces y material publicado.
- [ ] Programar respaldo de MongoDB, responsable de soporte y procedimiento de incidentes.

### Requisitos de operación

- Navegador moderno en computador o móvil y conexión a internet.
- Una cuenta de personal por responsable, en lugar de compartir credenciales.
- Recursos externos publicados con permisos correctos; si son de Drive, acceso compatible con el público objetivo.
- Una persona o equipo que mantenga el catálogo vigente.

---

## 10. Pruebas y nivel de madurez

El repositorio contiene reportes de pruebas previas que documentan 20 pruebas backend aprobadas para autenticación, enlaces y CRUD de libros, además de recorridos UI para los flujos administrativos de esa iteración. Estos reportes son evidencia útil de desarrollo, pero no sustituyen una aceptación formal para cada colegio ni una auditoría de seguridad.

En esta revisión se verificó además por inspección:

- Protección de rutas de modificación mediante dependencias de rol en FastAPI.
- Validación de entidades padre al crear/mover subcategorías y materias.
- Borrado en cascada de materias y subcategorías al eliminar una categoría jerárquica.
- Validación básica de URL para materias jerárquicas.
- Índices de MongoDB para identidad, relaciones y auditoría.

No se ejecutó una prueba de compilación local en este equipo porque PowerShell bloqueó `npm.ps1` y no hay intérprete de Python disponible en la sesión. Por ello, antes de una entrega comercial se debe ejecutar el pipeline de build y pruebas en el entorno de despliegue.

---

## 11. Modelo de oferta recomendado

Para vender con claridad, separar el producto base de los servicios recurrentes:

| Paquete | Incluye | Ideal para |
| --- | --- | --- |
| Implementación inicial | Instalación, marca del colegio, configuración de seguridad, carga inicial de estructura y capacitación. | Instituciones que quieren salir rápido. |
| Operación y soporte | Monitoreo básico, copias de seguridad acordadas, actualizaciones y mesa de ayuda. | Colegios sin equipo técnico propio. |
| Personalización | Diseño institucional, nuevas secciones, roles, flujos de aprobación, integración de almacenamiento o LMS. | Instituciones con procesos particulares. |
| Evolución avanzada | SSO, recuperación de contraseña, Redis, analítica, inventario físico, préstamos, notificaciones o app móvil. | Colegios que deseen convertirla en una plataforma más amplia. |

**Importante:** los costos de dominio, base de datos, hosting, almacenamiento externo, correos transaccionales y licencias de terceros deben aparecer separados de la licencia/servicio de implementación, salvo que se incluyan expresamente en la propuesta.

---

## 12. Preguntas frecuentes para el equipo comercial

### ¿Los estudiantes deben crear cuenta?

No para consultar el portal público y abrir los recursos publicados. Solo el personal que administra contenido necesita cuenta.

### ¿Se puede poner el logo y los colores del colegio?

Sí. El frontend tiene una identidad visual centralizada que puede adaptarse como parte de la implementación.

### ¿Se pueden usar los recursos que ya están en Google Drive o Classroom?

Sí. La plataforma funciona como un punto organizado de acceso mediante enlaces. El colegio debe asegurar los permisos correctos de esos recursos.

### ¿Quién puede cambiar los libros y materias?

Las cuentas de administrador y rector/personal pueden gestionar contenido en la versión actual. El administrador conserva privilegios adicionales sobre roles y eliminación de usuarios.

### ¿Funciona en celular?

La interfaz usa diseño responsivo y menús adaptados a pantallas pequeñas. Debe validarse en los dispositivos objetivo de cada institución dentro de la prueba de aceptación.

### ¿Reemplaza el sistema físico de biblioteca?

No. Hoy es un portal de biblioteca y recursos digitales. Un módulo de inventario y préstamos físicos requeriría desarrollo adicional.

---

## 13. Roadmap sugerido

### Fase 1 — Lista para comercializar y operar

1. Corregir despliegue y configurar secretos por institución.
2. Personalizar marca y contenido inicial.
3. Normalizar codificación UTF-8 y retirar/corregir código no usado.
4. Ejecutar build, pruebas de aceptación y revisión básica de seguridad.

### Fase 2 — Fortalecimiento institucional

1. Recuperación de contraseña, MFA y revocación de sesiones.
2. Rate limiting centralizado con Redis y cabeceras de seguridad/CSP.
3. Backups automatizados, retención y exportación de auditoría.
4. Validación de URLs, revisión editorial y alertas de enlaces rotos.

### Fase 3 — Diferenciación premium

1. Inicio de sesión institucional (Google/Microsoft/SSO).
2. Analítica de consulta de recursos con enfoque de privacidad.
3. Préstamos, reservas e inventario de biblioteca física.
4. Integración con LMS, notificaciones y recomendaciones por grado.

---

## 14. Conclusión para la propuesta

Biblioteca Escolar RGB es una base sólida para ofrecer a colegios una presencia digital propia de biblioteca y recursos académicos: es visual, administrable, orientada a la estructura escolar y cuenta con autenticación, roles y trazabilidad.

Su mayor fortaleza es ofrecer valor inmediato sin exigir a la institución adoptar un sistema educativo pesado. Su venta debe incluir una implementación responsable: configuración de seguridad, marca institucional, carga y curaduría de contenidos, corrección del despliegue y validación antes de publicar. Con esas condiciones, es una solución atractiva para colegios que quieren ordenar y visibilizar su ecosistema de recursos digitales.

---

## Anexo A. Inventario técnico resumido

### API disponible

| Área | Rutas principales |
| --- | --- |
| Estado | `GET /api/`, `GET /api/health` |
| Sesión | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Usuarios | `GET/POST /api/users`, `PUT/DELETE /api/users/{id}` |
| Libros | `GET/POST /api/books`, `PUT/DELETE /api/books/{id}` |
| Categorías | `GET/POST /api/categories`, `PUT/DELETE /api/categories/{id}` |
| Recursos por grado | `GET /api/links`, `GET /api/links/{grado}`, `POST /api/links`, `DELETE /api/links/{grado}/{materia}` |
| Jerarquía académica | `GET /api/hierarchy/tree` y CRUD para categorías, subcategorías y materias |
| Auditoría | `GET /api/audit?limit=100` (personal autorizado) |

### Colecciones MongoDB

`users`, `books`, `links`, `categories`, `hierarchy_categories`, `subcategories`, `hierarchy_materias` y `audit_log`.

