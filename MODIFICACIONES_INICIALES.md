# Modificaciones iniciales — ChambeaSV

**Fecha:** 15 de noviembre de 2026  
**Objetivo:** dejar constancia de los cambios realizados y orientar el siguiente trabajo del equipo.

## Resumen del proyecto

ChambeaSV es un portal de empleo hecho con Node.js, Express, páginas HTML, JavaScript del navegador, Bootstrap y PostgreSQL/Supabase. Express sirve los archivos de `public/`; el frontend conserva un conjunto de datos de demostración en `localStorage` para poder probar las pantallas aunque la base de datos no responda.

## Archivos y carpetas creados

```text
MODIFICACIONES_INICIALES.md
public/
└── assets/
    └── chambeasv-hero.svg
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
DOCUMENTO_ENTREGA.md         # nombre del proyecto
database/
├── db.js                    # conexión PostgreSQL/Supabase
└── schema.sql               # nombre de marca en comentarios y datos iniciales
package.json                 # nombre y descripción del paquete
package-lock.json            # nombre del paquete sincronizado
public/
├── admin.html               # título y marca del panel
├── css/
│   └── styles.css           # estilos compartidos y rediseño visual
├── empleo.html              # título de página
├── empleos.html             # título y vista de búsqueda
├── empresa.html             # título de página
├── foros.html               # título de página
├── index.html               # portada, secciones y contenido
├── perfil.html              # título y vista de perfil
├── recursos.html            # título y tarjeta de boletín
├── valoraciones.html        # título de página
└── js/
    ├── data.js              # datos de demostración y marca
    ├── layout.js            # encabezado, navegación y pie compartidos
    └── pages/
        ├── empleo.js        # vista de detalle y postulación
        └── empleos.js      # vista de búsqueda
server.js                    # puerto web, aplicación modular y marca
```

## Trabajo realizado

- Se separaron rutas, controladores y modelos para empleos, usuarios y postulaciones.
- Se renovó la portada con una ilustración original y una paleta clara de azul y tonos cálidos.
- Se extendió el estilo visual a los módulos existentes sin quitar sus secciones ni comportamientos.
- Se reemplazó la marca visible por **ChambeaSV** y se separó `APP_PORT=3000` de `DB_PORT=5432`.

## Lógica que ya está integrada

> Estas funciones existen en el frontend y se pueden probar con datos de demostración. Como la conexión a Supabase no respondió, todavía no se confirmó su persistencia real en PostgreSQL.

```text
INICIO Y EMPLEOS
├── Mostrar métricas, sectores, vacantes recientes y empresas destacadas
├── Buscar vacantes y filtrar por experiencia, sector, contrato,
│   modalidad, salario y fecha
├── Ordenar resultados y guardar empleos
├── Ver el detalle de una vacante y ofertas similares
└── Crear postulaciones y registrar su estado

PERFIL DEL CANDIDATO
├── Editar información y habilidades
├── Calcular el porcentaje de perfil completado
├── Registrar solicitudes, entrevistas y empleos guardados
├── Crear, activar, desactivar y eliminar alertas
└── Aceptar PDF/DOCX; en la demo solo se guarda el nombre del archivo

MÓDULO DE EMPRESA
├── Crear, editar y eliminar empresas
├── Publicar, pausar, reactivar y eliminar vacantes
├── Consultar postulaciones y perfiles de candidatos
└── Cambiar el estado de cada postulación

VALORACIONES, RECURSOS Y COMUNIDAD
├── Buscar empresas y publicar valoraciones
├── Filtrar recursos, abrirlos en un modal y completar el checklist del CV
├── Crear temas de foro, responder y registrar vistas
└── Moderar valoraciones y temas reportados desde Administración

ADMINISTRACIÓN Y SESIÓN
├── Buscar usuarios, empresas y vacantes; cambiar sus estados
├── Revisar reportes y aprobar valoraciones o temas
└── Iniciar/cerrar sesión de demostración y mostrar el menú por rol
```

### Límites del modo de demostración

- Los datos y cambios locales se guardan en `localStorage` del navegador; no se comparten entre computadoras o navegadores.
- El login/registro es simulado y no debe usarse con cuentas reales.
- El CV no se sube a un servidor: solo se conserva su nombre.
- Correos, notificaciones, suscripciones y algunas métricas son simulados.
- `Store` intenta sincronizar mediante la API, pero la persistencia en PostgreSQL no se verificó porque la conexión a Supabase agotó el tiempo de espera.

## Verificaciones realizadas

- Sintaxis de JavaScript y consistencia de `package.json` con `package-lock.json`: correctas.
- `git diff --check`: correcto.
- Búsqueda de «Desarrollador»: mostró un resultado de demostración.
- Portada en escritorio y móvil (390 px): sin desbordamiento horizontal.
- Se abrieron las páginas principales para comprobar títulos, navegación y carga.

## Qué falta hacer

```text

[ ] 2. Confirmar API y tablas
      Probar /api/estado.
      Crear las tablas con database/schema.sql si todavía no existen.

[ ] 3. Probar persistencia real
      Crear/editar empleos, usuarios y postulaciones.
      Recargar y confirmar que los datos vienen de PostgreSQL,
      no solo de localStorage.

[ ] 4. Revisar autenticación
      El inicio de sesión actual es de demostración.
      Definir una autenticación real antes de usar datos reales.

[ ] 5. Probar los flujos funcionales
      Filtros, postulaciones, alertas, perfil, vacantes,
      valoraciones, foros y administración.
      Corregir diferencias entre la API y Store.

[ ] 6. Completar pruebas responsive
      Revisar cada módulo en móvil y escritorio
      después de los cambios pendientes.
```

## Para ejecutar

```text
npm run dev
http://localhost:3000
```
