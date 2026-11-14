-- =============================================================================
-- PROYECTO: T-Search - Portal de Búsqueda y Gestión de Empleo
-- MOTOR: PostgreSQL 15+ (Supabase)
-- ARCHIVO: database/schema.sql
-- DESCRIPCIÓN: Estructura completa de tablas, llaves foráneas, restricciones,
--              índices, vistas y datos iniciales (seed) para T-Search.
--              Puedes pegar y ejecutar todo este script en el "SQL Editor"
--              de Supabase de una sola vez.
-- =============================================================================

BEGIN;

-- 1. LIMPIEZA PREVIA (Idempotente para re-ejecución segura)
DROP VIEW IF EXISTS v_empleos_completos CASCADE;
DROP VIEW IF EXISTS v_metricas_sistema CASCADE;
DROP TABLE IF EXISTS foro_respuestas CASCADE;
DROP TABLE IF EXISTS foros CASCADE;
DROP TABLE IF EXISTS alertas CASCADE;
DROP TABLE IF EXISTS resenas CASCADE;
DROP TABLE IF EXISTS empleos_guardados CASCADE;
DROP TABLE IF EXISTS postulaciones CASCADE;
DROP TABLE IF EXISTS empleos CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;
DROP TABLE IF EXISTS recursos CASCADE;
DROP TABLE IF EXISTS noticias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- =============================================================================
-- 2. CREACIÓN DE TABLAS PRINCIPALES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLA 1: usuarios
-- Almacena Candidatos, Reclutadores/Empresas y Administradores del sistema.
-- Cumple con: Crear Usuario, Dashboard de Usuarios, Panel Administrativo.
-- -----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL DEFAULT '',
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT '123456',
    telefono VARCHAR(50) DEFAULT '',
    rol VARCHAR(20) NOT NULL DEFAULT 'candidato'
        CHECK (rol IN ('candidato', 'empresa', 'admin')),
    titular VARCHAR(150) DEFAULT '',
    ubicacion VARCHAR(120) DEFAULT '',
    habilidades TEXT[] NOT NULL DEFAULT '{}',
    cv VARCHAR(255) DEFAULT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
        CHECK (estado IN ('Activo', 'Suspendido', 'Inactivo')),
    registro TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLA 2: empresas
-- Almacena las organizaciones empleadoras registradas en el portal.
-- Cumple con: Crear Empresa, Dashboard de Empresas, Verificación en Admin.
-- -----------------------------------------------------------------------------
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre VARCHAR(150) NOT NULL,
    sector VARCHAR(80) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#0a66c2',
    ubicacion VARCHAR(120) NOT NULL,
    empleados VARCHAR(50) NOT NULL DEFAULT '10-50',
    web VARCHAR(150) DEFAULT '',
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(50) DEFAULT '',
    direccion VARCHAR(255) DEFAULT '',
    descripcion TEXT DEFAULT '',
    verificada BOOLEAN NOT NULL DEFAULT FALSE,
    propia BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLA 3: empleos
-- Ofertas laborales publicadas por las empresas.
-- Cumple con: Empresa crea oferta, Usuario busca/ve detalle,
--             Empresa inactiva/cancela/elimina ofertas, Supervisión Admin.
-- -----------------------------------------------------------------------------
CREATE TABLE empleos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    titulo VARCHAR(180) NOT NULL,
    ubicacion VARCHAR(120) NOT NULL,
    modalidad VARCHAR(30) NOT NULL DEFAULT 'Presencial'
        CHECK (modalidad IN ('Presencial', 'Remoto', 'Híbrido')),
    tipo VARCHAR(50) NOT NULL DEFAULT 'Tiempo completo',
    contrato VARCHAR(50) NOT NULL DEFAULT 'Indefinido',
    nivel VARCHAR(50) NOT NULL DEFAULT 'Junior',
    sector VARCHAR(80) NOT NULL,
    salario_min NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (salario_min >= 0),
    salario_max NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (salario_max >= salario_min),
    descripcion TEXT NOT NULL,
    responsabilidades TEXT[] NOT NULL DEFAULT '{}',
    requisitos TEXT[] NOT NULL DEFAULT '{}',
    beneficios TEXT[] NOT NULL DEFAULT '{}',
    contacto_email VARCHAR(150) DEFAULT '',
    contacto_telefono VARCHAR(50) DEFAULT '',
    estado VARCHAR(20) NOT NULL DEFAULT 'Activa'
        CHECK (estado IN ('Activa', 'Pausada', 'Inactiva', 'Cancelada', 'Cerrada')),
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLA 4: postulaciones
-- Relación entre Candidatos (usuarios) y Ofertas de Empleo (empleos).
-- Cumple con: Usuario aplica a empleo, Empresa ve aplicantes de ofertas,
--             Empresa Acepta (Contratado/Aceptado) o Deniega (Rechazada) aplicante.
-- -----------------------------------------------------------------------------
CREATE TABLE postulaciones (
    id SERIAL PRIMARY KEY,
    empleo_id INTEGER NOT NULL REFERENCES empleos(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    carta TEXT DEFAULT '',
    cv_adjunto VARCHAR(255) DEFAULT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'Recibida'
        CHECK (estado IN ('Recibida', 'En revisión', 'Entrevista', 'Aceptado', 'Contratado', 'Rechazada')),
    propia BOOLEAN NOT NULL DEFAULT FALSE,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_postulacion_usuario_empleo UNIQUE (empleo_id, usuario_id)
);

-- -----------------------------------------------------------------------------
-- TABLA 5: empleos_guardados
-- Vacantes guardadas como favoritas por cada candidato.
-- -----------------------------------------------------------------------------
CREATE TABLE empleos_guardados (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    empleo_id INTEGER NOT NULL REFERENCES empleos(id) ON DELETE CASCADE,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_guardado_usuario_empleo UNIQUE (usuario_id, empleo_id)
);

-- -----------------------------------------------------------------------------
-- TABLA 6: resenas
-- Valoraciones y calificaciones (1 a 5 estrellas) hacia las empresas.
-- Cumple con: Valoraciones de empresas y Moderación en Panel Administrativo.
-- -----------------------------------------------------------------------------
CREATE TABLE resenas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    autor VARCHAR(120) NOT NULL DEFAULT 'Usuario anónimo',
    puntuacion SMALLINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    titulo VARCHAR(150) NOT NULL,
    comentario TEXT NOT NULL,
    reportada BOOLEAN NOT NULL DEFAULT FALSE,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLA 7: alertas
-- Alertas automáticas de búsqueda de empleo configuradas por los candidatos.
-- -----------------------------------------------------------------------------
CREATE TABLE alertas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    termino VARCHAR(150) NOT NULL,
    ubicacion VARCHAR(120) NOT NULL DEFAULT 'Cualquiera',
    frecuencia VARCHAR(30) NOT NULL DEFAULT 'Diaria'
        CHECK (frecuencia IN ('Inmediata', 'Diaria', 'Semanal')),
    canal VARCHAR(30) NOT NULL DEFAULT 'Correo'
        CHECK (canal IN ('Correo', 'SMS', 'Ambos')),
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLA 8: foros
-- Hilos de discusión profesional de la comunidad.
-- -----------------------------------------------------------------------------
CREATE TABLE foros (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    etiqueta VARCHAR(50) NOT NULL DEFAULT 'General',
    autor VARCHAR(120) NOT NULL,
    contenido TEXT NOT NULL,
    vistas INTEGER NOT NULL DEFAULT 0,
    reportado BOOLEAN NOT NULL DEFAULT FALSE,
    respuestas JSONB NOT NULL DEFAULT '[]'::jsonb,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLA 9: foro_respuestas
-- Respuestas normalizadas asociadas a cada hilo del foro.
-- -----------------------------------------------------------------------------
CREATE TABLE foro_respuestas (
    id SERIAL PRIMARY KEY,
    foro_id INTEGER NOT NULL REFERENCES foros(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    autor VARCHAR(120) NOT NULL,
    texto TEXT NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLA 10: recursos
-- Artículos, tutoriales y videos de preparación profesional.
-- -----------------------------------------------------------------------------
CREATE TABLE recursos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(180) NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    tipo VARCHAR(40) NOT NULL CHECK (tipo IN ('Artículo', 'Tutorial', 'Video')),
    duracion VARCHAR(40) NOT NULL,
    icono VARCHAR(60) NOT NULL DEFAULT 'bi-journal-text',
    color VARCHAR(20) NOT NULL DEFAULT '#0a66c2',
    resumen TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- TABLA 11: noticias
-- Noticias del mercado laboral mostradas en Inicio y Recursos.
-- -----------------------------------------------------------------------------
CREATE TABLE noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    fuente VARCHAR(100) NOT NULL,
    resumen TEXT NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS Y BÚSQUEDAS
-- =============================================================================
CREATE INDEX idx_empleos_empresa_id ON empleos(empresa_id);
CREATE INDEX idx_empleos_estado ON empleos(estado);
CREATE INDEX idx_empleos_sector ON empleos(sector);
CREATE INDEX idx_empleos_modalidad ON empleos(modalidad);
CREATE INDEX idx_postulaciones_empleo_id ON postulaciones(empleo_id);
CREATE INDEX idx_postulaciones_usuario_id ON postulaciones(usuario_id);
CREATE INDEX idx_postulaciones_estado ON postulaciones(estado);
CREATE INDEX idx_resenas_empresa_id ON resenas(empresa_id);
CREATE INDEX idx_alertas_usuario_id ON alertas(usuario_id);

-- =============================================================================
-- 4. VISTAS ÚTILES PARA DASHBOARDS Y CONSULTAS RÁPIDAS
-- =============================================================================

-- Vista de empleos con datos de la empresa integrada
CREATE OR REPLACE VIEW v_empleos_completos AS
SELECT
    e.*,
    emp.nombre AS empresa_nombre,
    emp.color AS empresa_color,
    emp.verificada AS empresa_verificada,
    (SELECT COUNT(*) FROM postulaciones p WHERE p.empleo_id = e.id) AS total_postulaciones
FROM empleos e
JOIN empresas emp ON emp.id = e.empresa_id;

-- Vista de métricas globales para el Panel Administrativo y Landing Page
CREATE OR REPLACE VIEW v_metricas_sistema AS
SELECT
    (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
    (SELECT COUNT(*) FROM empresas) AS total_empresas,
    (SELECT COUNT(*) FROM empleos WHERE estado = 'Activa') AS empleos_activos,
    (SELECT COUNT(*) FROM empleos) AS total_empleos,
    (SELECT COUNT(*) FROM postulaciones) AS total_postulaciones,
    (SELECT COUNT(*) FROM resenas WHERE reportada = TRUE) +
    (SELECT COUNT(*) FROM foros WHERE reportado = TRUE) AS reportes_pendientes;

-- =============================================================================
-- 5. DATOS INICIALES (SEED DATA)
-- =============================================================================

-- 5.1 Usuarios
INSERT INTO usuarios (id, nombre, apellidos, email, password_hash, telefono, rol, titular, ubicacion, habilidades, cv, estado, registro) VALUES
(1, 'María', 'López', 'maria@correo.com', '123456', '+504 9988-7766', 'candidato', 'Desarrolladora Frontend', 'Tegucigalpa, HN', ARRAY['JavaScript', 'React', 'CSS', 'Figma'], 'CV_Maria_Lopez.pdf', 'Activo', NOW() - INTERVAL '40 days'),
(2, 'Carlos', 'Martínez', 'carlos@correo.com', '123456', '+504 9123-4567', 'candidato', 'Analista de Datos', 'San Pedro Sula, HN', ARRAY['SQL', 'Python', 'Power BI'], 'CV_Carlos_Martinez.pdf', 'Activo', NOW() - INTERVAL '32 days'),
(3, 'Ana', 'Rodríguez', 'ana@correo.com', '123456', '+502 5555-1212', 'candidato', 'Enfermera Profesional', 'Guatemala, GT', ARRAY['Atención al paciente', 'Primeros auxilios'], NULL, 'Activo', NOW() - INTERVAL '20 days'),
(4, 'Luis', 'Hernández', 'luis@correo.com', '123456', '+503 7777-8888', 'candidato', 'Diseñador Gráfico', 'San Salvador, SV', ARRAY['Illustrator', 'Figma', 'Branding'], NULL, 'Suspendido', NOW() - INTERVAL '15 days'),
(5, 'Recursos Humanos', 'Nexo Digital', 'empresa@nexodigital.com', '123456', '+504 2234-5678', 'empresa', 'Reclutador Corporativo', 'Tegucigalpa, HN', ARRAY[]::TEXT[], NULL, 'Activo', NOW() - INTERVAL '60 days'),
(6, 'Admin', 'T-Search', 'admin@tsearch.com', '123456', '', 'admin', 'Administrador del Sistema', 'Tegucigalpa, HN', ARRAY[]::TEXT[], NULL, 'Activo', NOW() - INTERVAL '90 days'),
(7, 'Sofía', 'Castillo', 'sofia@correo.com', '123456', '+506 8888-1111', 'candidato', 'Ingeniera Eléctrica', 'San José, CR', ARRAY['AutoCAD', 'PVsyst', 'Gestión de proyectos'], 'CV_Sofia_Castillo.pdf', 'Activo', NOW() - INTERVAL '8 days');

-- 5.2 Empresas
INSERT INTO empresas (id, usuario_id, nombre, sector, color, ubicacion, empleados, web, email, telefono, direccion, descripcion, verificada, propia) VALUES
(1, 5, 'Nexo Digital', 'Tecnología', '#0a66c2', 'Tegucigalpa, HN', '200-500', 'www.nexodigital.com', 'talento@nexodigital.com', '+504 2234-5678', 'Blvd. Morazán, Torre Metrópolis', 'Agencia de desarrollo de software y transformación digital para empresas de Latinoamérica.', TRUE, TRUE),
(2, 5, 'Banco Atlántida Plus', 'Finanzas', '#2b8a3e', 'San Pedro Sula, HN', '1000+', 'www.atlantidaplus.com', 'rrhh@atlantidaplus.com', '+504 2550-1100', 'Av. Circunvalación 5ta calle', 'Institución financiera con más de 100 años de trayectoria e innovación en banca digital.', TRUE, FALSE),
(3, NULL, 'Salud Integral', 'Salud', '#e03131', 'Ciudad de Guatemala, GT', '500-1000', 'www.saludintegral.gt', 'empleos@saludintegral.gt', '+502 2333-4455', 'Zona 10, Edificio Médico Central', 'Red de clínicas y hospitales con atención de calidad en Centroamérica.', TRUE, FALSE),
(4, NULL, 'EduFuturo', 'Educación', '#7048e8', 'Remoto', '50-200', 'www.edufuturo.org', 'equipo@edufuturo.org', '+503 2222-9090', 'San Salvador, El Salvador', 'Plataforma de educación en línea que lleva cursos de calidad a toda la región.', FALSE, FALSE),
(5, NULL, 'LogiExpress', 'Logística', '#f08c00', 'San Pedro Sula, HN', '200-500', 'www.logiexpress.com', 'trabaja@logiexpress.com', '+504 2556-7788', 'Zona Industrial, Km 5', 'Soluciones de logística, transporte y distribución para comercio electrónico.', TRUE, FALSE),
(6, NULL, 'Creativa Studio', 'Marketing', '#d6336c', 'Ciudad de México, MX', '10-50', 'www.creativastudio.mx', 'hola@creativastudio.mx', '+52 55 1234 5678', 'Col. Roma Norte, CDMX', 'Estudio de diseño, branding y marketing digital para marcas que quieren destacar.', TRUE, FALSE),
(7, NULL, 'EnerVerde', 'Energía', '#0c9a6e', 'San José, CR', '200-500', 'www.enerverde.cr', 'carreras@enerverde.cr', '+506 2290-1234', 'Escazú, Centro Corporativo', 'Empresa líder en proyectos de energía solar y eólica en Centroamérica.', FALSE, FALSE),
(8, NULL, 'Construye+', 'Construcción', '#495057', 'Tegucigalpa, HN', '500-1000', 'www.construyemas.com', 'rh@construyemas.com', '+504 2239-0000', 'Col. Palmira', 'Constructora especializada en obras civiles, viviendas y proyectos comerciales.', TRUE, FALSE);

-- 5.3 Empleos (Vacantes)
INSERT INTO empleos (id, empresa_id, titulo, ubicacion, modalidad, tipo, contrato, nivel, sector, salario_min, salario_max, fecha, estado, descripcion, responsabilidades, requisitos, beneficios) VALUES
(1, 1, 'Desarrollador Full Stack (Node.js / React)', 'Tegucigalpa, HN', 'Híbrido', 'Tiempo completo', 'Indefinido', 'Semi-senior', 'Tecnología', 1500, 2200, NOW() - INTERVAL '1 day', 'Activa',
 'Buscamos un desarrollador Full Stack apasionado por construir productos digitales de alto impacto. Formarás parte de un equipo ágil trabajando con clientes internacionales.',
 ARRAY['Desarrollar APIs REST con Node.js y Express', 'Construir interfaces con React', 'Participar en revisiones de código', 'Colaborar con diseño y QA'],
 ARRAY['2+ años de experiencia con JavaScript', 'Conocimiento de PostgreSQL', 'Manejo de Git', 'Inglés intermedio'],
 ARRAY['Seguro médico privado', 'Horario flexible', 'Bono anual por desempeño', 'Capacitaciones pagadas']),

(2, 6, 'Diseñador UI/UX', 'Remoto', 'Remoto', 'Tiempo completo', 'Indefinido', 'Junior', 'Marketing', 900, 1300, NOW() - INTERVAL '2 days', 'Activa',
 'Diseña experiencias digitales memorables para marcas de toda Latinoamérica.',
 ARRAY['Crear wireframes y prototipos en Figma', 'Realizar pruebas de usabilidad', 'Mantener el sistema de diseño'],
 ARRAY['Portafolio de proyectos', 'Dominio de Figma', 'Nociones de HTML/CSS'],
 ARRAY['100% remoto', 'Equipo de trabajo', 'Vacaciones extra']),

(3, 2, 'Analista de Datos', 'San Pedro Sula, HN', 'Presencial', 'Tiempo completo', 'Indefinido', 'Semi-senior', 'Finanzas', 1300, 1800, NOW() - INTERVAL '3 days', 'Activa',
 'Transforma datos en decisiones para nuestra área de banca digital.',
 ARRAY['Construir tableros en Power BI', 'Analizar comportamiento de clientes', 'Automatizar reportes con SQL y Python'],
 ARRAY['SQL avanzado', 'Python o R', 'Power BI o Tableau', 'Título en Ingeniería, Estadística o afín'],
 ARRAY['Préstamos preferenciales', 'Seguro de vida', 'Plan de carrera']),

(4, 3, 'Enfermero(a) Profesional', 'Ciudad de Guatemala, GT', 'Presencial', 'Tiempo completo', 'Temporal', 'Junior', 'Salud', 800, 1100, NOW() - INTERVAL '4 days', 'Activa',
 'Únete a nuestro equipo de enfermería en el área de hospitalización.',
 ARRAY['Atención directa a pacientes', 'Administración de medicamentos', 'Registro clínico'],
 ARRAY['Licenciatura en Enfermería', 'Colegiado activo', 'Disponibilidad de turnos'],
 ARRAY['Alimentación', 'Uniformes', 'Seguro médico']),

(5, 4, 'Tutor de Matemáticas en Línea', 'Remoto', 'Remoto', 'Medio tiempo', 'Por proyecto', 'Junior', 'Educación', 400, 700, NOW() - INTERVAL '5 days', 'Activa',
 'Imparte clases en vivo a estudiantes de secundaria desde casa.',
 ARRAY['Dar clases virtuales', 'Preparar material didáctico', 'Dar seguimiento a estudiantes'],
 ARRAY['Estudios en Matemáticas o Ingeniería', 'Buena conexión a internet', 'Paciencia y vocación'],
 ARRAY['Horario flexible', 'Trabajo desde casa']),

(6, 5, 'Coordinador de Logística', 'San Pedro Sula, HN', 'Presencial', 'Tiempo completo', 'Indefinido', 'Senior', 'Logística', 1600, 2400, NOW() - INTERVAL '6 days', 'Activa',
 'Lidera la operación de distribución regional de nuestro centro logístico.',
 ARRAY['Planificar rutas de distribución', 'Gestionar equipo de 20 personas', 'Controlar indicadores (KPIs)'],
 ARRAY['5+ años en logística', 'Manejo de ERP', 'Liderazgo de equipos'],
 ARRAY['Vehículo de la empresa', 'Bono trimestral', 'Seguro médico']),

(7, 6, 'Especialista en Marketing Digital', 'Ciudad de México, MX', 'Híbrido', 'Tiempo completo', 'Indefinido', 'Semi-senior', 'Marketing', 1200, 1700, NOW() - INTERVAL '7 days', 'Activa',
 'Planifica y ejecuta campañas digitales para clientes de primer nivel.',
 ARRAY['Gestionar campañas en Meta y Google Ads', 'Analizar métricas', 'Proponer estrategias de contenido'],
 ARRAY['Certificación Google Ads', '3 años de experiencia', 'Pensamiento analítico'],
 ARRAY['Home office 3 días', 'Gimnasio', 'Capacitación continua']),

(8, 7, 'Ingeniero Eléctrico - Proyectos Solares', 'San José, CR', 'Presencial', 'Tiempo completo', 'Por proyecto', 'Senior', 'Energía', 2000, 3000, NOW() - INTERVAL '9 days', 'Activa',
 'Diseña e implementa parques solares de gran escala.',
 ARRAY['Diseño eléctrico de plantas solares', 'Supervisión en sitio', 'Elaboración de presupuestos'],
 ARRAY['Ingeniería Eléctrica', 'AutoCAD y PVsyst', 'Disponibilidad para viajar'],
 ARRAY['Viáticos', 'Seguro internacional', 'Bono por proyecto']),

(9, 1, 'Practicante de Desarrollo Web', 'Tegucigalpa, HN', 'Híbrido', 'Prácticas', 'Temporal', 'Practicante', 'Tecnología', 300, 450, NOW() - INTERVAL '2 days', 'Activa',
 'Programa de prácticas profesionales para estudiantes de últimos años.',
 ARRAY['Apoyar en desarrollo frontend', 'Aprender buenas prácticas', 'Documentar código'],
 ARRAY['Estudiante de Ingeniería en Sistemas', 'HTML, CSS y JavaScript básico', 'Ganas de aprender'],
 ARRAY['Mentoría', 'Posibilidad de contratación', 'Certificado']),

(10, 8, 'Supervisor de Obra', 'Tegucigalpa, HN', 'Presencial', 'Tiempo completo', 'Por proyecto', 'Senior', 'Construcción', 1400, 2000, NOW() - INTERVAL '10 days', 'Activa',
 'Supervisa la ejecución de proyectos residenciales y comerciales.',
 ARRAY['Controlar avance de obra', 'Gestionar subcontratistas', 'Garantizar normas de seguridad'],
 ARRAY['Ingeniería Civil o Arquitectura', '4 años de experiencia', 'Manejo de MS Project'],
 ARRAY['Vehículo', 'Seguro', 'Bono por entrega']),

(11, 2, 'Gerente de Producto Digital', 'Remoto', 'Remoto', 'Tiempo completo', 'Indefinido', 'Gerencial', 'Finanzas', 3000, 4200, NOW() - INTERVAL '12 days', 'Activa',
 'Lidera la visión y estrategia de nuestra app de banca móvil.',
 ARRAY['Definir roadmap del producto', 'Liderar equipos multidisciplinarios', 'Medir resultados de negocio'],
 ARRAY['6+ años en producto', 'Experiencia en fintech', 'Inglés avanzado'],
 ARRAY['Acciones de la empresa', 'Seguro familiar', 'Trabajo remoto']),

(12, 3, 'Asistente Administrativo', 'Ciudad de Guatemala, GT', 'Presencial', 'Medio tiempo', 'Temporal', 'Junior', 'Salud', 500, 650, NOW() - INTERVAL '14 days', 'Activa',
 'Apoya las labores administrativas de la clínica central.',
 ARRAY['Agendar citas', 'Atención al cliente', 'Manejo de archivo'],
 ARRAY['Bachillerato completo', 'Office intermedio', 'Buena actitud'],
 ARRAY['Horario matutino', 'Seguro médico']);

-- 5.4 Postulaciones
INSERT INTO postulaciones (id, empleo_id, usuario_id, fecha, estado, carta, propia) VALUES
(1, 1, 1, NOW() - INTERVAL '1 day', 'En revisión', 'Me encantaría formar parte del equipo de desarrollo en Nexo Digital.', TRUE),
(2, 1, 2, NOW() - INTERVAL '1 day', 'Recibida', 'Tengo experiencia construyendo APIs REST con Node y consultas SQL.', FALSE),
(3, 9, 4, NOW() - INTERVAL '2 days', 'Entrevista', 'Soy estudiante de último año con portafolio en diseño y frontend.', FALSE),
(4, 3, 2, NOW() - INTERVAL '3 days', 'Entrevista', 'Analista de datos con 3 años de experiencia en el sector financiero.', FALSE),
(5, 2, 1, NOW() - INTERVAL '2 days', 'Recibida', 'Adjunto mi portafolio de proyectos UI/UX en Figma.', TRUE),
(6, 4, 3, NOW() - INTERVAL '4 days', 'Contratado', 'Licenciada en enfermería con colegiado activo y disponibilidad inmediata.', FALSE),
(7, 8, 7, NOW() - INTERVAL '5 days', 'En revisión', 'Ingeniera eléctrica especialista en sistemas fotovoltaicos.', FALSE);

-- 5.5 Reseñas (Valoraciones de empresas)
INSERT INTO resenas (id, empresa_id, usuario_id, autor, puntuacion, titulo, comentario, fecha, reportada) VALUES
(1, 1, 1, 'Ex empleado - Desarrollador', 5, 'Excelente ambiente', 'Gran cultura de aprendizaje y líderes que apoyan tu crecimiento.', NOW() - INTERVAL '5 days', FALSE),
(2, 1, 2, 'Empleado actual - QA', 4, 'Buen lugar para crecer', 'Proyectos interesantes, a veces hay presión por entregas.', NOW() - INTERVAL '12 days', FALSE),
(3, 2, NULL, 'Ex empleado - Cajero', 3, 'Estable pero rígido', 'Buenas prestaciones, pero procesos muy burocráticos.', NOW() - INTERVAL '20 days', FALSE),
(4, 3, 3, 'Enfermera', 4, 'Vocación de servicio', 'Excelente equipo médico, turnos pesados.', NOW() - INTERVAL '8 days', FALSE),
(5, 6, 4, 'Diseñador', 5, 'Creatividad al máximo', 'Te dan libertad creativa y el equipo es muy unido.', NOW() - INTERVAL '3 days', FALSE),
(6, 5, NULL, 'Ex empleado - Bodega', 2, 'Mucha carga laboral', 'Horarios extendidos sin compensación justa. ¡¡¡PÉSIMO!!!', NOW() - INTERVAL '6 days', TRUE),
(7, 7, 7, 'Ingeniero', 5, 'Propósito real', 'Trabajar en energía limpia es muy motivador.', NOW() - INTERVAL '9 days', FALSE),
(8, 8, NULL, 'Maestro de obra', 4, 'Pagan puntual', 'Empresa seria y responsable con sus trabajadores.', NOW() - INTERVAL '15 days', FALSE),
(9, 4, NULL, 'Tutora', 4, 'Flexibilidad', 'Ideal para quien estudia y trabaja.', NOW() - INTERVAL '11 days', FALSE);

-- 5.6 Alertas de empleo
INSERT INTO alertas (id, usuario_id, termino, ubicacion, frecuencia, canal, activa) VALUES
(1, 1, 'Desarrollador Web', 'Tegucigalpa', 'Diaria', 'Correo', TRUE),
(2, 1, 'Diseñador UI/UX', 'Remoto', 'Semanal', 'SMS', TRUE),
(3, 1, 'React', 'Remoto', 'Inmediata', 'Correo', FALSE);

-- 5.7 Foros
INSERT INTO foros (id, usuario_id, titulo, categoria, etiqueta, autor, fecha, vistas, reportado, contenido, respuestas) VALUES
(1, 1, '¿Qué preguntas técnicas hacen en entrevistas de Node.js?', 'Tecnología', 'Semi-senior', 'María López', NOW() - INTERVAL '1 day', 234, FALSE,
 'Tengo una entrevista la próxima semana para un puesto Full Stack. ¿Qué temas me recomiendan repasar?',
 '[{"autor": "Carlos Martínez", "texto": "Repasa event loop, promesas, async/await y middlewares de Express.", "fecha": "2026-11-12T10:00:00Z"}, {"autor": "Sofía Castillo", "texto": "¡También seguridad básica: JWT, CORS y validación de datos!", "fecha": "2026-11-13T09:00:00Z"}]'::jsonb),

(2, 4, 'Trabajo remoto vs. presencial: ¿qué prefieren las empresas en 2026?', 'Remoto', 'General', 'Luis Hernández', NOW() - INTERVAL '2 days', 512, FALSE,
 'Veo cada vez más ofertas híbridas. ¿Cuál ha sido su experiencia?',
 '[{"autor": "Ana Rodríguez", "texto": "En salud casi todo es presencial, obviamente 😅", "fecha": "2026-11-11T15:30:00Z"}]'::jsonb),

(3, 3, 'Mi primer empleo como Junior: consejos para negociar salario', 'Junior', 'Junior', 'Ana Rodríguez', NOW() - INTERVAL '3 days', 389, FALSE,
 'Me ofrecieron mi primer trabajo, pero no sé si el salario es justo. ¿Cómo negocio?',
 '[{"autor": "María López", "texto": "Investiga rangos en el portal y pide un 10-15% más del ofrecido con argumentos.", "fecha": "2026-11-10T18:00:00Z"}]'::jsonb),

(4, 2, 'Certificaciones que valen la pena en Finanzas', 'Finanzas', 'Senior', 'Carlos Martínez', NOW() - INTERVAL '5 days', 178, FALSE,
 '¿CFA, FRM o un MBA? ¿Qué recomiendan para crecer en banca?', '[]'::jsonb),

(5, NULL, 'GANA DINERO FÁCIL DESDE CASA!!! click aquí', 'Remoto', 'General', 'usuario123', NOW() - INTERVAL '1 day', 12, TRUE,
 'Contenido sospechoso de spam.', '[]'::jsonb),

(6, 4, 'Portafolio de UI/UX: ¿Behance o sitio propio?', 'Marketing', 'Junior', 'Luis Hernández', NOW() - INTERVAL '6 days', 145, FALSE,
 'Estoy armando mi portafolio, ¿qué funciona mejor con los reclutadores?',
 '[{"autor": "Creativa Studio", "texto": "Nosotros valoramos ver el proceso, no solo el resultado final.", "fecha": "2026-11-08T14:20:00Z"}]'::jsonb);

-- 5.8 Recursos
INSERT INTO recursos (id, titulo, categoria, tipo, duracion, icono, color, resumen) VALUES
(1, 'Las 15 preguntas más comunes en una entrevista', 'Entrevistas', 'Artículo', '8 min lectura', 'bi-chat-quote', '#0a66c2', 'Aprende a responder con el método STAR y destaca frente a otros candidatos.'),
(2, 'Cómo crear un currículum que pase los filtros ATS', 'Currículum', 'Tutorial', '12 min', 'bi-file-earmark-person', '#12b886', 'Formato, palabras clave y errores que hacen que tu CV sea descartado.'),
(3, 'Lenguaje corporal en entrevistas virtuales', 'Entrevistas', 'Video', '6:40', 'bi-camera-video', '#e03131', 'Iluminación, postura y contacto visual frente a la cámara.'),
(4, 'Habilidades blandas más buscadas en 2026', 'Habilidades', 'Artículo', '5 min lectura', 'bi-people', '#7048e8', 'Comunicación, adaptabilidad y pensamiento crítico: cómo demostrarlas.'),
(5, 'Plantilla de carta de presentación', 'Currículum', 'Tutorial', '4 min', 'bi-envelope-paper', '#f08c00', 'Estructura en 4 párrafos para captar la atención del reclutador.'),
(6, 'Aprende Excel para el trabajo desde cero', 'Habilidades', 'Video', '22:15', 'bi-table', '#2b8a3e', 'Tablas dinámicas, BUSCARV y gráficos en una sola sesión.'),
(7, 'Cómo negociar tu salario sin miedo', 'Carrera', 'Artículo', '7 min lectura', 'bi-cash-coin', '#0c9a6e', 'Investiga, ancla y argumenta: la guía práctica.'),
(8, 'Construye tu marca personal en redes profesionales', 'Carrera', 'Video', '10:05', 'bi-person-badge', '#d6336c', 'Optimiza tu perfil y publica contenido de valor.');

-- 5.9 Noticias
INSERT INTO noticias (id, titulo, fecha, fuente, resumen) VALUES
(1, 'El empleo tecnológico crece 18% en Centroamérica', NOW() - INTERVAL '1 day', 'Observatorio Laboral', 'La demanda de desarrolladores y analistas de datos sigue en aumento.'),
(2, 'Nuevas regulaciones para el teletrabajo en la región', NOW() - INTERVAL '3 days', 'Diario Económico', 'Los gobiernos actualizan las leyes para proteger a trabajadores remotos.'),
(3, 'Las energías renovables generarán 50,000 empleos', NOW() - INTERVAL '6 days', 'Revista Energía', 'Ingenieros y técnicos serán los perfiles más solicitados.'),
(4, 'Ferias de empleo virtuales: fechas de noviembre', NOW() - INTERVAL '8 days', 'T-Search', 'Más de 120 empresas participarán en las próximas ferias en línea.');

-- Ajustar las secuencias SERIAL al último ID insertado para evitar colisiones en nuevos INSERT
SELECT setval('usuarios_id_seq', (SELECT COALESCE(MAX(id), 1) FROM usuarios));
SELECT setval('empresas_id_seq', (SELECT COALESCE(MAX(id), 1) FROM empresas));
SELECT setval('empleos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM empleos));
SELECT setval('postulaciones_id_seq', (SELECT COALESCE(MAX(id), 1) FROM postulaciones));
SELECT setval('resenas_id_seq', (SELECT COALESCE(MAX(id), 1) FROM resenas));
SELECT setval('alertas_id_seq', (SELECT COALESCE(MAX(id), 1) FROM alertas));
SELECT setval('foros_id_seq', (SELECT COALESCE(MAX(id), 1) FROM foros));
SELECT setval('recursos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM recursos));
SELECT setval('noticias_id_seq', (SELECT COALESCE(MAX(id), 1) FROM noticias));

COMMIT;

