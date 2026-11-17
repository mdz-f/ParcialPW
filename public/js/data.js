/**
 * ============================================================
 *  ChambeaSV - DATOS INICIALES Y SINCRONIZACIÓN CON POSTGRESQL
 * ============================================================
 *  Estos arreglos representan los datos semilla de las TABLAS
 *  de la base de datos en Supabase:
 *    empresas, empleos, usuarios, postulaciones, resenas, foros,
 *    recursos, alertas, noticias.
 *
 *  El objeto `Store` sincroniza con la API REST de PostgreSQL
 *  (/api/sync y /api/:tabla) y mantiene caché en localStorage.
 *  Para volver a los datos originales: Store.reset()
 * ============================================================
 */

// Utilidad: genera una fecha ISO de hace N días
const haceNDias = (n) => new Date(Date.now() - n * 86400000).toISOString();

const DATOS_INICIALES = {
  // ---------- Tabla: empresas ----------
  empresas: [
    { id: 1, nombre: 'Nexo Digital', sector: 'Tecnología', color: '#0a66c2', ubicacion: 'Tegucigalpa, HN', empleados: '200-500', web: 'www.nexodigital.com', email: 'talento@nexodigital.com', telefono: '+504 2234-5678', direccion: 'Blvd. Morazán, Torre Metrópolis', descripcion: 'Agencia de desarrollo de software y transformación digital para empresas de Latinoamérica.', verificada: true },
    { id: 2, nombre: 'Banco Atlántida Plus', sector: 'Finanzas', color: '#2b8a3e', ubicacion: 'San Pedro Sula, HN', empleados: '1000+', web: 'www.atlantidaplus.com', email: 'rrhh@atlantidaplus.com', telefono: '+504 2550-1100', direccion: 'Av. Circunvalación 5ta calle', descripcion: 'Institución financiera con más de 100 años de trayectoria e innovación en banca digital.', verificada: true },
    { id: 3, nombre: 'Salud Integral', sector: 'Salud', color: '#e03131', ubicacion: 'Ciudad de Guatemala, GT', empleados: '500-1000', web: 'www.saludintegral.gt', email: 'empleos@saludintegral.gt', telefono: '+502 2333-4455', direccion: 'Zona 10, Edificio Médico Central', descripcion: 'Red de clínicas y hospitales con atención de calidad en Centroamérica.', verificada: true },
    { id: 4, nombre: 'EduFuturo', sector: 'Educación', color: '#7048e8', ubicacion: 'Remoto', empleados: '50-200', web: 'www.edufuturo.org', email: 'equipo@edufuturo.org', telefono: '+503 2222-9090', direccion: 'San Salvador, El Salvador', descripcion: 'Plataforma de educación en línea que lleva cursos de calidad a toda la región.', verificada: false },
    { id: 5, nombre: 'LogiExpress', sector: 'Logística', color: '#f08c00', ubicacion: 'San Pedro Sula, HN', empleados: '200-500', web: 'www.logiexpress.com', email: 'trabaja@logiexpress.com', telefono: '+504 2556-7788', direccion: 'Zona Industrial, Km 5', descripcion: 'Soluciones de logística, transporte y distribución para comercio electrónico.', verificada: true },
    { id: 6, nombre: 'Creativa Studio', sector: 'Marketing', color: '#d6336c', ubicacion: 'Ciudad de México, MX', empleados: '10-50', web: 'www.creativastudio.mx', email: 'hola@creativastudio.mx', telefono: '+52 55 1234 5678', direccion: 'Col. Roma Norte, CDMX', descripcion: 'Estudio de diseño, branding y marketing digital para marcas que quieren destacar.', verificada: true },
    { id: 7, nombre: 'EnerVerde', sector: 'Energía', color: '#0c9a6e', ubicacion: 'San José, CR', empleados: '200-500', web: 'www.enerverde.cr', email: 'carreras@enerverde.cr', telefono: '+506 2290-1234', direccion: 'Escazú, Centro Corporativo', descripcion: 'Empresa líder en proyectos de energía solar y eólica en Centroamérica.', verificada: false },
    { id: 8, nombre: 'Construye+', sector: 'Construcción', color: '#495057', ubicacion: 'Tegucigalpa, HN', empleados: '500-1000', web: 'www.construyemas.com', email: 'rh@construyemas.com', telefono: '+504 2239-0000', direccion: 'Col. Palmira', descripcion: 'Constructora especializada en obras civiles, viviendas y proyectos comerciales.', verificada: true }
  ],

  // ---------- Tabla: empleos (vacantes) ----------
  empleos: [
    { id: 1, titulo: 'Desarrollador Full Stack (Node.js / React)', empresaId: 1, ubicacion: 'Tegucigalpa, HN', modalidad: 'Híbrido', tipo: 'Tiempo completo', contrato: 'Indefinido', nivel: 'Semi-senior', sector: 'Tecnología', salarioMin: 1500, salarioMax: 2200, fecha: haceNDias(1), estado: 'Activa',
      descripcion: 'Buscamos un desarrollador Full Stack apasionado por construir productos digitales de alto impacto. Formarás parte de un equipo ágil trabajando con clientes internacionales.',
      responsabilidades: ['Desarrollar APIs REST con Node.js y Express', 'Construir interfaces con React', 'Participar en revisiones de código', 'Colaborar con diseño y QA'],
      requisitos: ['2+ años de experiencia con JavaScript', 'Conocimiento de PostgreSQL', 'Manejo de Git', 'Inglés intermedio'],
      beneficios: ['Seguro médico privado', 'Horario flexible', 'Bono anual por desempeño', 'Capacitaciones pagadas'] },
    { id: 2, titulo: 'Diseñador UI/UX', empresaId: 6, ubicacion: 'Remoto', modalidad: 'Remoto', tipo: 'Tiempo completo', contrato: 'Indefinido', nivel: 'Junior', sector: 'Marketing', salarioMin: 900, salarioMax: 1300, fecha: haceNDias(2), estado: 'Activa',
      descripcion: 'Diseña experiencias digitales memorables para marcas de toda Latinoamérica.',
      responsabilidades: ['Crear wireframes y prototipos en Figma', 'Realizar pruebas de usabilidad', 'Mantener el sistema de diseño'],
      requisitos: ['Portafolio de proyectos', 'Dominio de Figma', 'Nociones de HTML/CSS'],
      beneficios: ['100% remoto', 'Equipo de trabajo', 'Vacaciones extra'] },
    { id: 3, titulo: 'Analista de Datos', empresaId: 2, ubicacion: 'San Pedro Sula, HN', modalidad: 'Presencial', tipo: 'Tiempo completo', contrato: 'Indefinido', nivel: 'Semi-senior', sector: 'Finanzas', salarioMin: 1300, salarioMax: 1800, fecha: haceNDias(3), estado: 'Activa',
      descripcion: 'Transforma datos en decisiones para nuestra área de banca digital.',
      responsabilidades: ['Construir tableros en Power BI', 'Analizar comportamiento de clientes', 'Automatizar reportes con SQL y Python'],
      requisitos: ['SQL avanzado', 'Python o R', 'Power BI o Tableau', 'Título en Ingeniería, Estadística o afín'],
      beneficios: ['Préstamos preferenciales', 'Seguro de vida', 'Plan de carrera'] },
    { id: 4, titulo: 'Enfermero(a) Profesional', empresaId: 3, ubicacion: 'Ciudad de Guatemala, GT', modalidad: 'Presencial', tipo: 'Tiempo completo', contrato: 'Temporal', nivel: 'Junior', sector: 'Salud', salarioMin: 800, salarioMax: 1100, fecha: haceNDias(4), estado: 'Activa',
      descripcion: 'Únete a nuestro equipo de enfermería en el área de hospitalización.',
      responsabilidades: ['Atención directa a pacientes', 'Administración de medicamentos', 'Registro clínico'],
      requisitos: ['Licenciatura en Enfermería', 'Colegiado activo', 'Disponibilidad de turnos'],
      beneficios: ['Alimentación', 'Uniformes', 'Seguro médico'] },
    { id: 5, titulo: 'Tutor de Matemáticas en Línea', empresaId: 4, ubicacion: 'Remoto', modalidad: 'Remoto', tipo: 'Medio tiempo', contrato: 'Por proyecto', nivel: 'Junior', sector: 'Educación', salarioMin: 400, salarioMax: 700, fecha: haceNDias(5), estado: 'Activa',
      descripcion: 'Imparte clases en vivo a estudiantes de secundaria desde casa.',
      responsabilidades: ['Dar clases virtuales', 'Preparar material didáctico', 'Dar seguimiento a estudiantes'],
      requisitos: ['Estudios en Matemáticas o Ingeniería', 'Buena conexión a internet', 'Paciencia y vocación'],
      beneficios: ['Horario flexible', 'Trabajo desde casa'] },
    { id: 6, titulo: 'Coordinador de Logística', empresaId: 5, ubicacion: 'San Pedro Sula, HN', modalidad: 'Presencial', tipo: 'Tiempo completo', contrato: 'Indefinido', nivel: 'Senior', sector: 'Logística', salarioMin: 1600, salarioMax: 2400, fecha: haceNDias(6), estado: 'Activa',
      descripcion: 'Lidera la operación de distribución regional de nuestro centro logístico.',
      responsabilidades: ['Planificar rutas de distribución', 'Gestionar equipo de 20 personas', 'Controlar indicadores (KPIs)'],
      requisitos: ['5+ años en logística', 'Manejo de ERP', 'Liderazgo de equipos'],
      beneficios: ['Vehículo de la empresa', 'Bono trimestral', 'Seguro médico'] },
    { id: 7, titulo: 'Especialista en Marketing Digital', empresaId: 6, ubicacion: 'Ciudad de México, MX', modalidad: 'Híbrido', tipo: 'Tiempo completo', contrato: 'Indefinido', nivel: 'Semi-senior', sector: 'Marketing', salarioMin: 1200, salarioMax: 1700, fecha: haceNDias(7), estado: 'Activa',
      descripcion: 'Planifica y ejecuta campañas digitales para clientes de primer nivel.',
      responsabilidades: ['Gestionar campañas en Meta y Google Ads', 'Analizar métricas', 'Proponer estrategias de contenido'],
      requisitos: ['Certificación Google Ads', '3 años de experiencia', 'Pensamiento analítico'],
      beneficios: ['Home office 3 días', 'Gimnasio', 'Capacitación continua'] },
    { id: 8, titulo: 'Ingeniero Eléctrico - Proyectos Solares', empresaId: 7, ubicacion: 'San José, CR', modalidad: 'Presencial', tipo: 'Tiempo completo', contrato: 'Por proyecto', nivel: 'Senior', sector: 'Energía', salarioMin: 2000, salarioMax: 3000, fecha: haceNDias(9), estado: 'Activa',
      descripcion: 'Diseña e implementa parques solares de gran escala.',
      responsabilidades: ['Diseño eléctrico de plantas solares', 'Supervisión en sitio', 'Elaboración de presupuestos'],
      requisitos: ['Ingeniería Eléctrica', 'AutoCAD y PVsyst', 'Disponibilidad para viajar'],
      beneficios: ['Viáticos', 'Seguro internacional', 'Bono por proyecto'] },
    { id: 9, titulo: 'Practicante de Desarrollo Web', empresaId: 1, ubicacion: 'Tegucigalpa, HN', modalidad: 'Híbrido', tipo: 'Prácticas', contrato: 'Temporal', nivel: 'Practicante', sector: 'Tecnología', salarioMin: 300, salarioMax: 450, fecha: haceNDias(2), estado: 'Activa',
      descripcion: 'Programa de prácticas profesionales para estudiantes de últimos años.',
      responsabilidades: ['Apoyar en desarrollo frontend', 'Aprender buenas prácticas', 'Documentar código'],
      requisitos: ['Estudiante de Ingeniería en Sistemas', 'HTML, CSS y JavaScript básico', 'Ganas de aprender'],
      beneficios: ['Mentoría', 'Posibilidad de contratación', 'Certificado'] },
    { id: 10, titulo: 'Supervisor de Obra', empresaId: 8, ubicacion: 'Tegucigalpa, HN', modalidad: 'Presencial', tipo: 'Tiempo completo', contrato: 'Por proyecto', nivel: 'Senior', sector: 'Construcción', salarioMin: 1400, salarioMax: 2000, fecha: haceNDias(10), estado: 'Activa',
      descripcion: 'Supervisa la ejecución de proyectos residenciales y comerciales.',
      responsabilidades: ['Controlar avance de obra', 'Gestionar subcontratistas', 'Garantizar normas de seguridad'],
      requisitos: ['Ingeniería Civil o Arquitectura', '4 años de experiencia', 'Manejo de MS Project'],
      beneficios: ['Vehículo', 'Seguro', 'Bono por entrega'] },
    { id: 11, titulo: 'Gerente de Producto Digital', empresaId: 2, ubicacion: 'Remoto', modalidad: 'Remoto', tipo: 'Tiempo completo', contrato: 'Indefinido', nivel: 'Gerencial', sector: 'Finanzas', salarioMin: 3000, salarioMax: 4200, fecha: haceNDias(12), estado: 'Activa',
      descripcion: 'Lidera la visión y estrategia de nuestra app de banca móvil.',
      responsabilidades: ['Definir roadmap del producto', 'Liderar equipos multidisciplinarios', 'Medir resultados de negocio'],
      requisitos: ['6+ años en producto', 'Experiencia en fintech', 'Inglés avanzado'],
      beneficios: ['Acciones de la empresa', 'Seguro familiar', 'Trabajo remoto'] },
    { id: 12, titulo: 'Asistente Administrativo', empresaId: 3, ubicacion: 'Ciudad de Guatemala, GT', modalidad: 'Presencial', tipo: 'Medio tiempo', contrato: 'Temporal', nivel: 'Junior', sector: 'Salud', salarioMin: 500, salarioMax: 650, fecha: haceNDias(14), estado: 'Activa',
      descripcion: 'Apoya las labores administrativas de la clínica central.',
      responsabilidades: ['Agendar citas', 'Atención al cliente', 'Manejo de archivo'],
      requisitos: ['Bachillerato completo', 'Office intermedio', 'Buena actitud'],
      beneficios: ['Horario matutino', 'Seguro médico'] }
  ],

  // ---------- Tabla: usuarios (candidatos, empresas y administradores) ----------
  usuarios: [
    { id: 1, nombre: 'María', apellidos: 'López', email: 'maria@correo.com', telefono: '+504 9988-7766', rol: 'candidato', titular: 'Desarrolladora Frontend', ubicacion: 'Tegucigalpa, HN', habilidades: ['JavaScript', 'React', 'CSS', 'Figma'], estado: 'Activo', registro: haceNDias(40) },
    { id: 2, nombre: 'Carlos', apellidos: 'Martínez', email: 'carlos@correo.com', telefono: '+504 9123-4567', rol: 'candidato', titular: 'Analista de Datos', ubicacion: 'San Pedro Sula, HN', habilidades: ['SQL', 'Python', 'Power BI'], estado: 'Activo', registro: haceNDias(32) },
    { id: 3, nombre: 'Ana', apellidos: 'Rodríguez', email: 'ana@correo.com', telefono: '+502 5555-1212', rol: 'candidato', titular: 'Enfermera Profesional', ubicacion: 'Guatemala, GT', habilidades: ['Atención al paciente', 'Primeros auxilios'], estado: 'Activo', registro: haceNDias(20) },
    { id: 4, nombre: 'Luis', apellidos: 'Hernández', email: 'luis@correo.com', telefono: '+503 7777-8888', rol: 'candidato', titular: 'Diseñador Gráfico', ubicacion: 'San Salvador, SV', habilidades: ['Illustrator', 'Figma', 'Branding'], estado: 'Suspendido', registro: haceNDias(15) },
    { id: 5, nombre: 'Recursos Humanos', apellidos: 'Nexo Digital', email: 'empresa@nexodigital.com', telefono: '+504 2234-5678', rol: 'empresa', titular: 'Reclutador', ubicacion: 'Tegucigalpa, HN', habilidades: [], estado: 'Activo', registro: haceNDias(60) },
    { id: 6, nombre: 'Admin', apellidos: 'ChambeaSV', email: 'admin@tsearch.com', telefono: '', rol: 'admin', titular: 'Administrador', ubicacion: '', habilidades: [], estado: 'Activo', registro: haceNDias(90) },
    { id: 7, nombre: 'Sofía', apellidos: 'Castillo', email: 'sofia@correo.com', telefono: '+506 8888-1111', rol: 'candidato', titular: 'Ingeniera Eléctrica', ubicacion: 'San José, CR', habilidades: ['AutoCAD', 'PVsyst', 'Gestión de proyectos'], estado: 'Activo', registro: haceNDias(8) }
  ],

  // ---------- Tabla: postulaciones (usuario <-> empleo) ----------
  postulaciones: [
    { id: 1, empleoId: 1, usuarioId: 1, fecha: haceNDias(1), estado: 'En revisión', carta: 'Me encantaría formar parte del equipo...' },
    { id: 2, empleoId: 1, usuarioId: 2, fecha: haceNDias(1), estado: 'Recibida', carta: 'Tengo experiencia en APIs con Node.' },
    { id: 3, empleoId: 9, usuarioId: 4, fecha: haceNDias(2), estado: 'Entrevista', carta: 'Soy estudiante de último año.' },
    { id: 4, empleoId: 3, usuarioId: 2, fecha: haceNDias(3), estado: 'Entrevista', carta: 'Analista con 3 años de experiencia.' },
    { id: 5, empleoId: 2, usuarioId: 1, fecha: haceNDias(2), estado: 'Recibida', carta: 'Adjunto mi portafolio.' },
    { id: 6, empleoId: 4, usuarioId: 3, fecha: haceNDias(4), estado: 'Contratado', carta: '' },
    { id: 7, empleoId: 8, usuarioId: 7, fecha: haceNDias(5), estado: 'En revisión', carta: '' }
  ],

  // ---------- Tabla: resenas (valoraciones de empresas) ----------
  resenas: [
    { id: 1, empresaId: 1, autor: 'Ex empleado - Desarrollador', puntuacion: 5, titulo: 'Excelente ambiente', comentario: 'Gran cultura de aprendizaje y líderes que apoyan tu crecimiento.', fecha: haceNDias(5), reportada: false },
    { id: 2, empresaId: 1, autor: 'Empleado actual - QA', puntuacion: 4, titulo: 'Buen lugar para crecer', comentario: 'Proyectos interesantes, a veces hay presión por entregas.', fecha: haceNDias(12), reportada: false },
    { id: 3, empresaId: 2, autor: 'Ex empleado - Cajero', puntuacion: 3, titulo: 'Estable pero rígido', comentario: 'Buenas prestaciones, pero procesos muy burocráticos.', fecha: haceNDias(20), reportada: false },
    { id: 4, empresaId: 3, autor: 'Enfermera', puntuacion: 4, titulo: 'Vocación de servicio', comentario: 'Excelente equipo médico, turnos pesados.', fecha: haceNDias(8), reportada: false },
    { id: 5, empresaId: 6, autor: 'Diseñador', puntuacion: 5, titulo: 'Creatividad al máximo', comentario: 'Te dan libertad creativa y el equipo es muy unido.', fecha: haceNDias(3), reportada: false },
    { id: 6, empresaId: 5, autor: 'Ex empleado - Bodega', puntuacion: 2, titulo: 'Mucha carga laboral', comentario: 'Horarios extendidos sin compensación justa. ¡¡¡PÉSIMO!!!', fecha: haceNDias(6), reportada: true },
    { id: 7, empresaId: 7, autor: 'Ingeniero', puntuacion: 5, titulo: 'Propósito real', comentario: 'Trabajar en energía limpia es muy motivador.', fecha: haceNDias(9), reportada: false },
    { id: 8, empresaId: 8, autor: 'Maestro de obra', puntuacion: 4, titulo: 'Pagan puntual', comentario: 'Empresa seria y responsable con sus trabajadores.', fecha: haceNDias(15), reportada: false },
    { id: 9, empresaId: 4, autor: 'Tutora', puntuacion: 4, titulo: 'Flexibilidad', comentario: 'Ideal para quien estudia y trabaja.', fecha: haceNDias(11), reportada: false }
  ],

  // ---------- Tabla: foros (hilos de discusión) ----------
  foros: [
    { id: 1, titulo: '¿Qué preguntas técnicas hacen en entrevistas de Node.js?', categoria: 'Tecnología', etiqueta: 'Semi-senior', autor: 'María López', fecha: haceNDias(1), vistas: 234, reportado: false,
      contenido: 'Tengo una entrevista la próxima semana para un puesto Full Stack. ¿Qué temas me recomiendan repasar?',
      respuestas: [{ autor: 'Carlos Martínez', texto: 'Repasa event loop, promesas, async/await y middlewares de Express.', fecha: haceNDias(1) }, { autor: 'Sofía Castillo', texto: '¡También seguridad básica: JWT, CORS y validación de datos!', fecha: haceNDias(0) }] },
    { id: 2, titulo: 'Trabajo remoto vs. presencial: ¿qué prefieren las empresas en 2026?', categoria: 'Remoto', etiqueta: 'General', autor: 'Luis Hernández', fecha: haceNDias(2), vistas: 512, reportado: false,
      contenido: 'Veo cada vez más ofertas híbridas. ¿Cuál ha sido su experiencia?',
      respuestas: [{ autor: 'Ana Rodríguez', texto: 'En salud casi todo es presencial, obviamente 😅', fecha: haceNDias(2) }] },
    { id: 3, titulo: 'Mi primer empleo como Junior: consejos para negociar salario', categoria: 'Junior', etiqueta: 'Junior', autor: 'Ana Rodríguez', fecha: haceNDias(3), vistas: 389, reportado: false,
      contenido: 'Me ofrecieron mi primer trabajo, pero no sé si el salario es justo. ¿Cómo negocio?',
      respuestas: [{ autor: 'María López', texto: 'Investiga rangos en el portal y pide un 10-15% más del ofrecido con argumentos.', fecha: haceNDias(3) }] },
    { id: 4, titulo: 'Certificaciones que valen la pena en Finanzas', categoria: 'Finanzas', etiqueta: 'Senior', autor: 'Carlos Martínez', fecha: haceNDias(5), vistas: 178, reportado: false,
      contenido: '¿CFA, FRM o un MBA? ¿Qué recomiendan para crecer en banca?', respuestas: [] },
    { id: 5, titulo: 'GANA DINERO FÁCIL DESDE CASA!!! click aquí', categoria: 'Remoto', etiqueta: 'General', autor: 'usuario123', fecha: haceNDias(1), vistas: 12, reportado: true,
      contenido: 'Contenido sospechoso de spam.', respuestas: [] },
    { id: 6, titulo: 'Portafolio de UI/UX: ¿Behance o sitio propio?', categoria: 'Marketing', etiqueta: 'Junior', autor: 'Luis Hernández', fecha: haceNDias(6), vistas: 145, reportado: false,
      contenido: 'Estoy armando mi portafolio, ¿qué funciona mejor con los reclutadores?',
      respuestas: [{ autor: 'Creativa Studio', texto: 'Nosotros valoramos ver el proceso, no solo el resultado final.', fecha: haceNDias(5) }] }
  ],

  // ---------- Tabla: alertas de empleo del usuario ----------
  alertas: [
    { id: 1, usuarioId: 1, termino: 'Desarrollador Web', ubicacion: 'Tegucigalpa', frecuencia: 'Diaria', canal: 'Correo', activa: true },
    { id: 2, usuarioId: 1, termino: 'Diseñador UI/UX', ubicacion: 'Remoto', frecuencia: 'Semanal', canal: 'SMS', activa: true },
    { id: 3, usuarioId: 1, termino: 'React', ubicacion: 'Remoto', frecuencia: 'Inmediata', canal: 'Correo', activa: false }
  ],

  // ---------- Recursos (artículos, tutoriales y videos) ----------
  recursos: [
    { id: 1, titulo: 'Las 15 preguntas más comunes en una entrevista', categoria: 'Entrevistas', tipo: 'Artículo', duracion: '8 min lectura', icono: 'bi-chat-quote', color: '#0a66c2', resumen: 'Aprende a responder con el método STAR y destaca frente a otros candidatos.' },
    { id: 2, titulo: 'Cómo crear un currículum que pase los filtros ATS', categoria: 'Currículum', tipo: 'Tutorial', duracion: '12 min', icono: 'bi-file-earmark-person', color: '#12b886', resumen: 'Formato, palabras clave y errores que hacen que tu CV sea descartado.' },
    { id: 3, titulo: 'Lenguaje corporal en entrevistas virtuales', categoria: 'Entrevistas', tipo: 'Video', duracion: '6:40', icono: 'bi-camera-video', color: '#e03131', resumen: 'Iluminación, postura y contacto visual frente a la cámara.' },
    { id: 4, titulo: 'Habilidades blandas más buscadas en 2026', categoria: 'Habilidades', tipo: 'Artículo', duracion: '5 min lectura', icono: 'bi-people', color: '#7048e8', resumen: 'Comunicación, adaptabilidad y pensamiento crítico: cómo demostrarlas.' },
    { id: 5, titulo: 'Plantilla de carta de presentación', categoria: 'Currículum', tipo: 'Tutorial', duracion: '4 min', icono: 'bi-envelope-paper', color: '#f08c00', resumen: 'Estructura en 4 párrafos para captar la atención del reclutador.' },
    { id: 6, titulo: 'Aprende Excel para el trabajo desde cero', categoria: 'Habilidades', tipo: 'Video', duracion: '22:15', icono: 'bi-table', color: '#2b8a3e', resumen: 'Tablas dinámicas, BUSCARV y gráficos en una sola sesión.' },
    { id: 7, titulo: 'Cómo negociar tu salario sin miedo', categoria: 'Carrera', tipo: 'Artículo', duracion: '7 min lectura', icono: 'bi-cash-coin', color: '#0c9a6e', resumen: 'Investiga, ancla y argumenta: la guía práctica.' },
    { id: 8, titulo: 'Construye tu marca personal en redes profesionales', categoria: 'Carrera', tipo: 'Video', duracion: '10:05', icono: 'bi-person-badge', color: '#d6336c', resumen: 'Optimiza tu perfil y publica contenido de valor.' }
  ],

  // ---------- Noticias del sector laboral ----------
  noticias: [
    { id: 1, titulo: 'El empleo tecnológico crece 18% en Centroamérica', fecha: haceNDias(1), fuente: 'Observatorio Laboral', resumen: 'La demanda de desarrolladores y analistas de datos sigue en aumento.' },
    { id: 2, titulo: 'Nuevas regulaciones para el teletrabajo en la región', fecha: haceNDias(3), fuente: 'Diario Económico', resumen: 'Los gobiernos actualizan las leyes para proteger a trabajadores remotos.' },
    { id: 3, titulo: 'Las energías renovables generarán 50,000 empleos', fecha: haceNDias(6), fuente: 'Revista Energía', resumen: 'Ingenieros y técnicos serán los perfiles más solicitados.' },
    { id: 4, titulo: 'Ferias de empleo virtuales: fechas de noviembre', fecha: haceNDias(8), fuente: 'ChambeaSV', resumen: 'Más de 120 empresas participarán en las próximas ferias en línea.' }
  ]
};

/* ============================================================
   Store: capa de acceso a datos conectada a PostgreSQL (Supabase)
   con caché local reactiva para mantener compatibilidad síncrona
   en todas las pantallas del frontend:
   - syncFromDB()          -> GET /api/sync (trae todas las tablas de Supabase)
   - get('empleos')        -> SELECT * FROM empleos
   - add('empleos', {...}) -> INSERT INTO empleos (POST /api/empleos)
   - update('empleos', id, {...}) -> UPDATE empleos (PUT /api/empleos/:id)
   - remove('empleos', id) -> DELETE FROM empleos (DELETE /api/empleos/:id)
   ============================================================ */
const Store = {
  PREFIX: 'tl_',
  get(tabla) {
    const guardado = localStorage.getItem(this.PREFIX + tabla);
    return guardado ? JSON.parse(guardado) : structuredClone(DATOS_INICIALES[tabla] || []);
  },
  set(tabla, datos) { localStorage.setItem(this.PREFIX + tabla, JSON.stringify(datos)); },
  find(tabla, id) { return this.get(tabla).find((r) => r.id === Number(id)); },
  add(tabla, registro) {
    const datos = this.get(tabla);
    registro.id = datos.length ? Math.max(...datos.map((r) => r.id)) + 1 : 1;
    const registroLocal = { ...registro };
    delete registroLocal.password;
    datos.unshift(registroLocal);
    this.set(tabla, datos);

    // Persistencia asíncrona en Supabase PostgreSQL
    fetch(`/api/${tabla}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro)
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then((creado) => {
        if (creado && creado.id) {
          const actualizados = this.get(tabla).map((x) => (x.id === registroLocal.id ? { ...x, ...creado } : x));
          this.set(tabla, actualizados);
        }
      })
      .catch((err) => console.warn(`Error guardando en PostgreSQL (${tabla}):`, err.message));

    return registroLocal;
  },
  update(tabla, id, cambios) {
    const datos = this.get(tabla).map((r) => (r.id === Number(id) ? { ...r, ...cambios } : r));
    this.set(tabla, datos);

    // Actualización asíncrona en Supabase PostgreSQL
    fetch(`/api/${tabla}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cambios)
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      })
      .catch((err) => console.warn(`Error actualizando en PostgreSQL (${tabla}/${id}):`, err.message));
  },
  remove(tabla, id) {
    this.set(tabla, this.get(tabla).filter((r) => r.id !== Number(id)));

    // Eliminación asíncrona en Supabase PostgreSQL
    fetch(`/api/${tabla}/${id}`, { method: 'DELETE' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      })
      .catch((err) => console.warn(`Error eliminando en PostgreSQL (${tabla}/${id}):`, err.message));
  },
  async syncFromDB() {
    try {
      const res = await fetch('/api/sync');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      if (json.ok && json.datos) {
        // Guardados: convertir a mapa por usuarioId para uso rápido
        const guardados = json.datos.guardados || [];
        delete json.datos.guardados;

        const huboCambios = Object.entries(json.datos).some(([tabla, filas]) => {
          const previo = localStorage.getItem(this.PREFIX + tabla);
          const nuevo = JSON.stringify(filas);
          if (previo !== nuevo) {
            localStorage.setItem(this.PREFIX + tabla, nuevo);
            return true;
          }
          return false;
        });

        // Sincronizar guardados: guardar mapa completo en localStorage para acceso rápido
        const mapaGuardados = {};
        guardados.forEach(({ usuarioId, empleoId }) => {
          if (!mapaGuardados[usuarioId]) mapaGuardados[usuarioId] = [];
          mapaGuardados[usuarioId].push(empleoId);
        });
        const guardadosStr = JSON.stringify(mapaGuardados);
        const guardadosPrev = localStorage.getItem('tl_guardados_db');
        const guardadosCambiaron = guardadosPrev !== guardadosStr;
        if (guardadosCambiaron) localStorage.setItem('tl_guardados_db', guardadosStr);

        // Si es la primera sincronización desde Supabase en esta pestaña, refrescar vista con datos reales
        if ((huboCambios || guardadosCambiaron) && !sessionStorage.getItem('tl_db_synced')) {
          sessionStorage.setItem('tl_db_synced', '1');
          location.reload();
        }
        return true;
      }
    } catch (err) {
      console.warn('PostgreSQL no disponible; se mantienen los datos locales:', err.message);
      return false;
    }
    return false;
  },
  reset() {
    Object.keys(localStorage).filter((k) => k.startsWith(this.PREFIX)).forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem('tl_db_synced');
    fetch('/api/reset', { method: 'POST' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      })
      .catch((err) => console.warn('No se pudo reiniciar PostgreSQL; se restablecen los datos locales:', err.message))
      .finally(() => location.reload());
  }
};

// Sincronizar automáticamente con Supabase al cargar el navegador
Store.syncFromDB();
