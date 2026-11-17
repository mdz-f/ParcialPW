# Actualización de Arquitectura: Migración a Full-Stack y Persistencia Real

Este documento resume la reestructuración técnica del portal **ChambeaSV**, pasando de un prototipo desacoplado dependiente de `localStorage` a una arquitectura cliente-servidor integrada con **Node.js**, **Express** y **PostgreSQL (Supabase)**.

---

## 1. Matriz de Cambios de Arquitectura

| Componente | Estado Anterior (Prototipo) | Nuevo Estado (Producción / DB Real) |
|---|---|---|
| **Persistencia** | Fallback y almacenamiento en `localStorage` | PostgreSQL relacional en Supabase vía API REST |
| **Autenticación** | Simulación cliente en `tl_sesion` | Tokens JWT firmados con HMAC-SHA256 (`crypto` nativo) |
| **Control de Acceso** | Sin validación en backend; rutas desprotegidas | Middleware `requireAuth` RBAC (`candidato`, `empresa`, `admin`) |
| **Manejo de CVs** | Guardado exclusivo del nombre del archivo en cliente | Carga real física a `/public/uploads/cvs/` y enlaces de descarga |
| **Empleos Guardados** | `tl_guardados` en `localStorage` | Tabla relacional `empleos_guardados` sincronizada vía API |
| **Panel Admin** | Lecturas síncronas bloqueadas en 0 | Hidratación asíncrona contra endpoints protegidos |

---

## 2. Autenticación, Seguridad y Sesión

### Backend: JWT Nativo y Middleware RBAC
* **Módulo:** `src/middleware/auth.js`
* **Implementación:** Generación y verificación de tokens JWT sin dependencias externas usando `crypto.createHmac('sha256')` con codificación Base64URL y verificación segura ante ataques de tiempo (`crypto.timingSafeEqual`).
* **Control de Acceso (RBAC):** Middleware de orden superior `requireAuth(roles = [])` aplicado a:
  * Rutas MVC: `/api/empleos`, `/api/usuarios`, `/api/postulaciones`, `/api/guardados`.
  * Rutas genéricas y operativas en `server.js` (`POST`, `PUT`, `DELETE`).

### Frontend: Persistencia de Tokens y Guards
* **Corrección de Token:** Actualización de `public/js/auth.js` (`login` y `registro`) para almacenar explícitamente el token retornado por la API en `localStorage.setItem('tl_token', data.token)`.
* **Guardias de Ruta (Client-side):** Bloqueo por script inmediato (IIFE) en el `<head>` de vistas críticas:
  * `public/admin.html`: Acceso restringido exclusivamente al rol `admin`.
  * `public/empresa.html`: Restringido a roles `empresa` y `admin`.
* **Detección de Sesión Fantasma:** Verificación automática en `_headers()` (`public/js/data.js`): si existe `tl_sesion` pero no `tl_token`, se purga el estado y se fuerza redirección a `login.html`.

---

## 3. Capa de Datos: Store API-First (`public/js/data.js`)

Se eliminó de forma definitiva cualquier persistencia o fallback hacia `localStorage` para datos de negocio, reservando el almacenamiento local únicamente para `tl_token`, `tl_sesion`, `tl_notas` y `tl_checklist`.

* **Caché en Memoria e Hidratación Única:**
  * Al iniciar, `Store.init()` consulta `GET /api/sync` para poblar el caché local en memoria `_c` y el mapa de guardados `_guardados`.
  * `Store.ready` expone una promesa que las páginas consumen con `await Store.ready` antes del renderizado.
* **Operaciones CRUD Asíncronas:**
  * Métodos `Store.add()`, `Store.update()` y `Store.remove()` son estrictamente asíncronos (`async/await`), interactúan mediante `fetch` con `/api/...` inyectando `Authorization: Bearer <token>`, propagan excepciones y notifican visualmente mediante `UI.toast`.
* **Manejo Centralizado de Errores de Autenticación:**
  * Interceptor `_handleAuthError()`: Respuestas HTTP `401 Unauthorized` eliminan credenciales locales y ejecutan redirección inmediata a `login.html`.

---

## 4. Corrección de Funcionalidades Core

### Panel de Administración (`public/admin.html`)
* Conversión del ciclo de vida a `async/await` esperando `Store.ready`.
* Cálculo y renderizado de métricas y contadores DOM (`kpis-admin`, tablas de gestión, reportes de moderación) consumiendo los datos consolidados de la base de datos.
* Conversión de acciones de moderación, cambio de estado y eliminación a flujos asíncronos con manejo de excepciones.

### Empleos Guardados (`public/js/layout.js`)
* Refactorización de `UI.toggleGuardar(id, btn)` a un patrón servidor-primero:
  * Envío de `POST /api/guardados` con `{ usuarioId, empleoId }`.
  * La actualización del icono de guardado (bookmark) y del estado visual ocurre únicamente tras la confirmación HTTP `200/201` del servidor.

### Gestión Real de Currículums (CVs)
* **Backend (`src/routes/upload.routes.js` & `src/app.js`):**
  * Endpoint `POST /api/upload` con validación de extensiones (`.pdf`, `.doc`, `.docx`).
  * Almacenamiento físico de archivos en `public/uploads/cvs/` bajo nomenclatura única timestamped.
  * Límite de carga de payload expandido a `10MB` en el parser de Express.
* **Frontend Candidato (`public/js/pages/empleo.js` & `perfil.js`):**
  * Lectura de archivo y envío previo a la postulación/actualización de perfil.
  * Persistencia de la URL pública generada (`/uploads/cvs/...`) en los registros de `postulaciones.cv_adjunto` y `usuarios.cv`.
* **Frontend Empresa (`public/js/pages/empresa.js`):**
  * Sustitución del botón simulado por un hipervínculo directo de descarga `<a href="${p.cvAdjunto}" target="_blank" download>` dentro del modal de evaluación de candidatos.

---

## 5. Optimizaciones de UI / UX

* **Identidad de Marca:** Reemplazo de identificadores tipográficos provisionales por el isotipo/logotipo SVG oficial (`chambeasv-logo.svg`) en la barra de navegación compartida.
* **Favicon Global:** Inclusión de `chambeasv-icon.svg` en todos los encabezados HTML del proyecto.
* **Corrección de Contraste:** Solución de colisiones de especificidad CSS en `public/css/styles.css` para el Hero banner de `empleos.html` (`.page-search .search-heading`), asegurando textos legibles en blanco sobre gradiente azul.
* **Saneamiento del DOM:** Eliminación del caracter residual `"n"` inyectado al inicio del `<body>` en las plantillas HTML.
* **Diseño de Recursos:** Actualización visual de tarjetas formativas en `recursos.html` integrando imágenes fotográficas temáticas de fondo, máscaras de gradiente oscuro, efectos de desenfoque (`backdrop-filter`) y transiciones de elevación (`.tl-card-hover`).