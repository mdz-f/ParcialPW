# DOCUMENTO DE REGISTRO DE DESARROLLO Y CAMBIOS
## Proyecto: ChambeaSV - Portal de Búsqueda y Gestión de Empleo

Este documento detalla los hitos técnicos, refactorizaciones y avances de diseño implementados en la plataforma, abarcando desde la capa de base de datos hasta las microinteracciones de interfaz de usuario.

---

### HITO 1: Configuración de Base de Datos y Backend (Completado)
**Objetivo:** Migrar de un almacenamiento local simulado (`localStorage`) a una persistencia de datos real y escalable.

* **Resolución de Conflictos Core:** Se solventó un error crítico de compilación (`ReferenceError: app is not defined`) en `server.js` restaurando la importación modular de Express (`src/app.js`) y protegiendo los puertos para evitar colisiones con PostgreSQL.
* **Despliegue en Supabase (PostgreSQL):** Se estructuró y ejecutó el script `database/schema.sql` aprovisionando 11 tablas relacionales (usuarios, empresas, empleos, postulaciones, etc.), vistas de métricas y poblado inicial de datos (*seed data*).
* **Seguridad de Credenciales:** Se configuró el entorno local (`.env`) encapsulando correctamente contraseñas complejas con caracteres especiales (ej. `#`) para garantizar la lectura de `dotenv`.
* **Validación:** El endpoint `GET /api/estado` confirma una conexión exitosa con el pool de base de datos, habilitando la arquitectura para transacciones reales.

---

### HITO 2: Arquitectura de Autenticación y UI/UX de Acceso (En progreso)
**Objetivo:** Implementar un sistema de registro/login robusto, estético y conectado a la base de datos.

* **Limpieza de la Barra de Navegación:** Se eliminaron los campos de formulario incrustados y modales de Bootstrap del `layout.js` global, reemplazándolos por llamadas a la acción (CTAs) limpios hacia una página dedicada, mejorando los tiempos de carga y la experiencia en dispositivos móviles.
* **Página de Autenticación Dedicada (`login.html`):** 
  * Se transicionó a un patrón de diseño *Split-Screen* (Pantalla Dividida).
  * Se configuró el enrutamiento dinámico en Vanilla JS (`auth.js`) para alternar entre "Iniciar Sesión" y "Registro" utilizando parámetros URL (`?mode=register`).
  * **Evolución Visual:** Se está migrando de una estética genérica (ilustraciones vectoriales y neón) hacia un diseño *Premium / Cinematográfico* con fotografía de alta calidad, enfoque minimalista y uso refinado del espacio en blanco y azul corporativo.

---

### HITO 3: Identidad Visual y Microinteracciones (Completado)
**Objetivo:** Dotar a la plataforma de una identidad única, memorable y altamente interactiva.

* **Diseño de Imagotipo Personalizado:** Se reemplazó la iconografía genérica (maletín) por un logotipo en SVG puro, escalable y ligero. El diseño integra una letra "C" gruesa en azul corporativo que abraza un rostro minimalista y amigable en color verde menta, humanizando la marca.
* **Creación del Agente "Chambita AI":**
  * **Seguimiento Ocular Biológico:** Se aisló el rostro del isotipo para crear un avatar flotante. Mediante cálculos trigonométricos (`Math.atan2`) en el evento `mousemove`, el agente sigue el cursor del usuario de forma natural, sumando un efecto de parpadeo periódico.
  * **Interfaz Glassmorphism:** Se construyó una ventana emergente de chat aplicando `backdrop-filter: blur(20px)`, sombras multicapa suaves y bordes translúcidos (`chatbot.css`).
  * **Motor Lógico Local:** Mientras se finaliza la integración del endpoint `/api/chat`, el agente (`chatbot.js`) cuenta con un sistema de respaldo que detecta palabras clave (ej. *remoto, salario, cv*) para ofrecer respuestas y accesos directos instantáneos, simulando el retraso humano de escritura.

---

### PRÓXIMOS PASOS (Hoja de Ruta Inmediata)
1. **Depuración del Widget AI:** Conectar correctamente el evento `click` del botón flotante para desplegar la ventana de chat.
2. **Refinamiento UI del Login:** Aplicar el estilo fotográfico/editorial a la pantalla de acceso.
3. **Módulo de Candidatos (Parte 2):** Conectar el inicio de sesión exitoso con la redirección al `perfil.html` del usuario para consumir datos reales desde Supabase.