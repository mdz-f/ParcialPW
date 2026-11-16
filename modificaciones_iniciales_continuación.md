# Modificaciones iniciales y Agente de IA — ChambeaSV

**Fecha:** 15 de noviembre de 2026  
**Objetivo:** Dejar constancia de los cambios estructurales, la resolución de conflictos del servidor y la integración del nuevo asistente virtual "Chambita AI" para orientar el siguiente trabajo del equipo.

## Resumen del proyecto

ChambeaSV es un portal de empleo hecho con Node.js, Express, páginas HTML, JavaScript del navegador, Bootstrap y PostgreSQL/Supabase. Express sirve los archivos de `public/`; el frontend conserva un conjunto de datos de demostración en `localStorage` para poder probar las pantallas aunque la base de datos no responda.

## Archivos y carpetas creados

```text
MODIFICACIONES_INICIALES.md
public/
├── assets/
│   └── chambeasv-hero.svg
└── js/
    └── chatbot.js               # Lógica, renderizado y eventos de Chambita AI
src/
├── app.js
├── controllers/
│   ├── empleos.controller.js
│   ├── postulaciones.controller.js
│   └── usuarios.controller.js
├── models/
│   ├── empleos.model.js
│   ├── postulaciones.model.js
│   └── usuarios.model.js
├── routes/
│   ├── empleos.routes.js
│   ├── postulaciones.routes.js
│   └── usuarios.routes.js
└── utils/
    └── async-handler.js
```

## Archivos editados

```text
.env.example                 # APP_PORT separado de DB_PORT
DOCUMENTO_ENTREGA.md         # Nombre del proyecto
database/
├── db.js                    # Conexión PostgreSQL/Supabase
└── schema.sql               # Nombre de marca en comentarios y datos iniciales
package.json                 # Nombre y descripción del paquete
package-lock.json            # Nombre del paquete sincronizado
public/
├── admin.html               # Título y marca del panel
├── css/
│   └── styles.css           # Estilos compartidos, rediseño visual y UI de Chambita (Glassmorphism)
├── index.html               # Portada, secciones y contenido
└── js/
    ├── data.js              # Datos de demostración y marca
    ├── layout.js            # Encabezado, navegación, pie compartidos e inicialización del Chatbot
    └── pages/
        ├── empleo.js        # Vista de detalle y postulación
        └── empleos.js       # Vista de búsqueda
server.js                    # Corrección de conflictos de puertos y listener del servidor
```

## Trabajo realizado

- **Servidor y Estructura:** Se separaron rutas, controladores y modelos. Se corrigió un error de inicialización en `server.js` separando `APP_PORT=3000` de `DB_PORT=5432` y solucionando problemas de asincronía en el inicio de la app.
- **Diseño de Interfaz:** Se renovó la portada con una ilustración original y una paleta clara de azul y tonos cálidos. Se extendió el estilo visual a los módulos existentes y se consolidó la marca **ChambeaSV**.
- **Agente Chambita AI:** Se integró un asistente virtual flotante inyectado dinámicamente vía JavaScript.
  - Avatar vectorial (SVG) con viewBox optimizado y seguimiento ocular del ratón (pupilas móviles y parpadeo biológico).
  - Ventana de chat con diseño *Glassmorphism* y scroll adaptativo.
  - Delegación de eventos y "candados" de inicialización para evitar parpadeos y dobles clics en el DOM.
  - Respuestas locales inteligentes de respaldo integradas para orientar al candidato en base a palabras clave.

## Lógica que ya está integrada (Frontend)

> Estas funciones existen en el frontend y se pueden probar con datos de demostración en `localStorage`.

- **Inicio y Empleos:** Búsqueda, filtros, métricas, y vista de vacantes.
- **Perfil del Candidato:** Edición de información, progreso del CV (solo guarda el nombre del archivo subido) y gestión de alertas.
- **Módulo Empresa:** Publicación y pausa de vacantes, y visualización de postulaciones.
- **Comunidad:** Foros de discusión, valoraciones de empresas y checklist de recursos.
- **Administración:** Cambio de estados y moderación básica por roles.
- **Asistente Inteligente:** Motor de respuestas locales sugeridas (CV, Salarios, Remoto, Empresa, Registro) que simula asincronía visual ("escribiendo...").

## Qué falta hacer (Lo de la IA se puede omitir)

```text
[ ] 1. Integración de Endpoint AI (/api/chat)
      Crear el controlador backend real para conectar a Chambita con un LLM 
      (OpenAI, Gemini, etc.) y reemplazar las respuestas locales de respaldo.

[ ] 2. Confirmar API y tablas
      Probar /api/estado y crear tablas con database/schema.sql.

[ ] 3. Probar persistencia real
      Crear/editar recursos reales en PostgreSQL y abandonar el localStorage.

[ ] 4. Revisar autenticación
      Definir JWT o sesiones reales antes de usar datos en producción.

[ ] 5. Probar los flujos funcionales
      Corregir diferencias entre la API y Store para filtros, postulaciones y perfiles.
```

## Para ejecutar

```text
npm run dev
http://localhost:3000
```