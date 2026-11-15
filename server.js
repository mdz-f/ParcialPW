/**
 * ============================================================
 *  T-Search - Servidor Backend con PostgreSQL (Supabase)
 * ============================================================
 *  Servidor Express que entrega los archivos estáticos de /public
 *  y expone la API REST conectada a la base de datos en Supabase.
 * ============================================================
 */
require('dotenv').config({ quiet: true });
const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('./database/db');

const app = express();
// Evita que si PORT quedó en 5432 o 6543 (puertos de PostgreSQL) se use para el servidor web
const rawPort = Number(process.env.APP_PORT || process.env.PORT || 3000);
const PORT = (rawPort === 5432 || rawPort === 6543) ? 3000 : rawPort;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ------------------------------------------------------------
   Mapeadores entre columnas PostgreSQL (snake_case)
   y propiedades del Frontend (camelCase)
   ------------------------------------------------------------ */
const Mappers = {
  empresas: (r) => ({
    id: r.id,
    usuarioId: r.usuario_id,
    nombre: r.nombre,
    sector: r.sector,
    color: r.color,
    ubicacion: r.ubicacion,
    empleados: r.empleados,
    web: r.web,
    email: r.email,
    telefono: r.telefono,
    direccion: r.direccion,
    descripcion: r.descripcion,
    verificada: r.verificada,
    propia: r.propia
  }),
  empleos: (r) => ({
    id: r.id,
    titulo: r.titulo,
    empresaId: r.empresa_id,
    ubicacion: r.ubicacion,
    modalidad: r.modalidad,
    tipo: r.tipo,
    contrato: r.contrato,
    nivel: r.nivel,
    sector: r.sector,
    salarioMin: Number(r.salario_min),
    salarioMax: Number(r.salario_max),
    fecha: r.fecha,
    estado: r.estado,
    descripcion: r.descripcion,
    responsabilidades: r.responsabilidades || [],
    requisitos: r.requisitos || [],
    beneficios: r.beneficios || [],
    contactoEmail: r.contacto_email || '',
    contactoTelefono: r.contacto_telefono || ''
  }),
  usuarios: (r) => ({
    id: r.id,
    nombre: r.nombre,
    apellidos: r.apellidos,
    email: r.email,
    telefono: r.telefono,
    rol: r.rol,
    titular: r.titular,
    ubicacion: r.ubicacion,
    habilidades: r.habilidades || [],
    cv: r.cv,
    estado: r.estado,
    registro: r.registro
  }),
  postulaciones: (r) => ({
    id: r.id,
    empleoId: r.empleo_id,
    usuarioId: r.usuario_id,
    fecha: r.fecha,
    estado: r.estado,
    carta: r.carta,
    cvAdjunto: r.cv_adjunto,
    propia: r.propia
  }),
  resenas: (r) => ({
    id: r.id,
    empresaId: r.empresa_id,
    usuarioId: r.usuario_id,
    autor: r.autor,
    puntuacion: Number(r.puntuacion),
    titulo: r.titulo,
    comentario: r.comentario,
    fecha: r.fecha,
    reportada: r.reportada
  }),
  foros: (r) => ({
    id: r.id,
    usuarioId: r.usuario_id,
    titulo: r.titulo,
    categoria: r.categoria,
    etiqueta: r.etiqueta,
    autor: r.autor,
    fecha: r.fecha,
    vistas: r.vistas,
    reportado: r.reportado,
    contenido: r.contenido,
    respuestas: Array.isArray(r.respuestas) ? r.respuestas : []
  }),
  alertas: (r) => ({
    id: r.id,
    usuarioId: r.usuario_id,
    termino: r.termino,
    ubicacion: r.ubicacion,
    frecuencia: r.frecuencia,
    canal: r.canal,
    activa: r.activa
  }),
  recursos: (r) => ({
    id: r.id,
    titulo: r.titulo,
    categoria: r.categoria,
    tipo: r.tipo,
    duracion: r.duracion,
    icono: r.icono,
    color: r.color,
    resumen: r.resumen
  }),
  noticias: (r) => ({
    id: r.id,
    titulo: r.titulo,
    fecha: r.fecha,
    fuente: r.fuente,
    resumen: r.resumen
  })
};

const TABLAS_PERMITIDAS = Object.keys(Mappers);

/* ------------------------------------------------------------
   1. Estado del servidor y conexión a Supabase
   ------------------------------------------------------------ */
app.get('/api/estado', async (req, res) => {
  try {
    const info = await db.verificarConexion();
    res.json({
      ok: true,
      mensaje: 'Servidor T-Search conectado a Supabase PostgreSQL',
      baseDeDatos: info
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error conectando a Supabase PostgreSQL',
      error: err.message
    });
  }
});

/* ------------------------------------------------------------
   2. Sincronización inicial de todas las tablas para el Frontend
   ------------------------------------------------------------ */
app.get('/api/sync', async (req, res) => {
  try {
    const [empresas, empleos, usuarios, postulaciones, resenas, foros, alertas, recursos, noticias] =
      await Promise.all([
        db.query('SELECT * FROM empresas ORDER BY id ASC'),
        db.query('SELECT * FROM empleos ORDER BY fecha DESC, id DESC'),
        db.query('SELECT * FROM usuarios ORDER BY id ASC'),
        db.query('SELECT * FROM postulaciones ORDER BY fecha DESC, id DESC'),
        db.query('SELECT * FROM resenas ORDER BY fecha DESC, id DESC'),
        db.query('SELECT * FROM foros ORDER BY fecha DESC, id DESC'),
        db.query('SELECT * FROM alertas ORDER BY id DESC'),
        db.query('SELECT * FROM recursos ORDER BY id ASC'),
        db.query('SELECT * FROM noticias ORDER BY fecha DESC, id ASC')
      ]);

    res.json({
      ok: true,
      datos: {
        empresas: empresas.rows.map(Mappers.empresas),
        empleos: empleos.rows.map(Mappers.empleos),
        usuarios: usuarios.rows.map(Mappers.usuarios),
        postulaciones: postulaciones.rows.map(Mappers.postulaciones),
        resenas: resenas.rows.map(Mappers.resenas),
        foros: foros.rows.map(Mappers.foros),
        alertas: alertas.rows.map(Mappers.alertas),
        recursos: recursos.rows.map(Mappers.recursos),
        noticias: noticias.rows.map(Mappers.noticias)
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ------------------------------------------------------------
   3. Reiniciar / Ejecutar script SQL base (database/schema.sql)
   ------------------------------------------------------------ */
app.post('/api/reset', async (req, res) => {
  try {
    const sqlPath = path.join(__dirname, 'database', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await db.query(sql);
    res.json({ ok: true, mensaje: 'Base de datos restablecida con los datos iniciales.' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ------------------------------------------------------------
   4. CRUD Genérico y Específico por Tabla (/api/:tabla)
   ------------------------------------------------------------ */

// LISTAR TODOS (GET /api/:tabla)
app.get('/api/:tabla', async (req, res) => {
  const { tabla } = req.params;
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    return res.status(404).json({ ok: false, error: 'Tabla no válida' });
  }
  try {
    const result = await db.query(`SELECT * FROM ${tabla} ORDER BY id DESC`);
    res.json(result.rows.map(Mappers[tabla]));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// OBTENER UNO POR ID (GET /api/:tabla/:id)
app.get('/api/:tabla/:id', async (req, res) => {
  const { tabla, id } = req.params;
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    return res.status(404).json({ ok: false, error: 'Tabla no válida' });
  }
  try {
    const result = await db.query(`SELECT * FROM ${tabla} WHERE id = $1`, [Number(id)]);
    if (!result.rows.length) return res.status(404).json({ ok: false, error: 'Registro no encontrado' });
    res.json(Mappers[tabla](result.rows[0]));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// INSERTAR (POST /api/:tabla)
app.post('/api/:tabla', async (req, res) => {
  const { tabla } = req.params;
  const b = req.body || {};

  try {
    let result;
    switch (tabla) {
      case 'usuarios':
        result = await db.query(
          `INSERT INTO usuarios (nombre, apellidos, email, password_hash, telefono, rol, titular, ubicacion, habilidades, cv, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [
            b.nombre || 'Usuario',
            b.apellidos || '',
            b.email,
            b.password || '123456',
            b.telefono || '',
            b.rol || 'candidato',
            b.titular || '',
            b.ubicacion || '',
            Array.isArray(b.habilidades) ? b.habilidades : [],
            b.cv || null,
            b.estado || 'Activo'
          ]
        );
        break;

      case 'empresas':
        result = await db.query(
          `INSERT INTO empresas (usuario_id, nombre, sector, color, ubicacion, empleados, web, email, telefono, direccion, descripcion, verificada, propia)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *`,
          [
            b.usuarioId || null,
            b.nombre,
            b.sector || 'Tecnología',
            b.color || '#0a66c2',
            b.ubicacion || '',
            b.empleados || '10-50',
            b.web || '',
            b.email || '',
            b.telefono || '',
            b.direccion || '',
            b.descripcion || '',
            Boolean(b.verificada),
            b.propia !== undefined ? Boolean(b.propia) : true
          ]
        );
        break;

      case 'empleos':
        result = await db.query(
          `INSERT INTO empleos (empresa_id, titulo, ubicacion, modalidad, tipo, contrato, nivel, sector, salario_min, salario_max, estado, descripcion, responsabilidades, requisitos, beneficios, contacto_email, contacto_telefono)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           RETURNING *`,
          [
            Number(b.empresaId || b.empresa_id || 1),
            b.titulo,
            b.ubicacion || 'Remoto',
            b.modalidad || 'Presencial',
            b.tipo || 'Tiempo completo',
            b.contrato || 'Indefinido',
            b.nivel || 'Junior',
            b.sector || 'Tecnología',
            Number(b.salarioMin ?? b.salario_min ?? 0),
            Number(b.salarioMax ?? b.salario_max ?? 0),
            b.estado || 'Activa',
            b.descripcion || '',
            Array.isArray(b.responsabilidades) ? b.responsabilidades : [],
            Array.isArray(b.requisitos) ? b.requisitos : [],
            Array.isArray(b.beneficios) ? b.beneficios : [],
            b.contactoEmail || b.contacto_email || '',
            b.contactoTelefono || b.contacto_telefono || ''
          ]
        );
        break;

      case 'postulaciones':
        result = await db.query(
          `INSERT INTO postulaciones (empleo_id, usuario_id, estado, carta, cv_adjunto, propia)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (empleo_id, usuario_id)
           DO UPDATE SET carta = EXCLUDED.carta, fecha = NOW()
           RETURNING *`,
          [
            Number(b.empleoId || b.empleo_id),
            Number(b.usuarioId || b.usuario_id || 1),
            b.estado || 'Recibida',
            b.carta || '',
            b.cvAdjunto || null,
            b.propia !== undefined ? Boolean(b.propia) : true
          ]
        );
        break;

      case 'resenas':
        result = await db.query(
          `INSERT INTO resenas (empresa_id, usuario_id, autor, puntuacion, titulo, comentario, reportada)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            Number(b.empresaId || b.empresa_id),
            b.usuarioId ? Number(b.usuarioId) : null,
            b.autor || 'Usuario anónimo',
            Number(b.puntuacion || 5),
            b.titulo,
            b.comentario,
            Boolean(b.reportada)
          ]
        );
        break;

      case 'foros':
        result = await db.query(
          `INSERT INTO foros (usuario_id, titulo, categoria, etiqueta, autor, contenido, vistas, reportado, respuestas)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
           RETURNING *`,
          [
            b.usuarioId ? Number(b.usuarioId) : null,
            b.titulo,
            b.categoria || 'General',
            b.etiqueta || 'General',
            b.autor || 'Usuario',
            b.contenido,
            Number(b.vistas || 1),
            Boolean(b.reportado),
            JSON.stringify(b.respuestas || [])
          ]
        );
        break;

      case 'alertas':
        result = await db.query(
          `INSERT INTO alertas (usuario_id, termino, ubicacion, frecuencia, canal, activa)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            Number(b.usuarioId || b.usuario_id || 1),
            b.termino,
            b.ubicacion || 'Cualquiera',
            b.frecuencia || 'Diaria',
            b.canal || 'Correo',
            b.activa !== undefined ? Boolean(b.activa) : true
          ]
        );
        break;

      default:
        return res.status(400).json({ ok: false, error: `Inserción no configurada para ${tabla}` });
    }

    res.status(201).json(Mappers[tabla](result.rows[0]));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ACTUALIZAR (PUT /api/:tabla/:id)
app.put('/api/:tabla/:id', async (req, res) => {
  const { tabla, id } = req.params;
  const cambios = req.body || {};
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    return res.status(404).json({ ok: false, error: 'Tabla no válida' });
  }

  // Traducción de claves camelCase a columnas snake_case
  const mapaColumnas = {
    empresaId: 'empresa_id',
    usuarioId: 'usuario_id',
    empleoId: 'empleo_id',
    salarioMin: 'salario_min',
    salarioMax: 'salario_max',
    contactoEmail: 'contacto_email',
    contactoTelefono: 'contacto_telefono',
    cvAdjunto: 'cv_adjunto'
  };

  try {
    const sets = [];
    const valores = [];
    let idx = 1;

    for (const [k, val] of Object.entries(cambios)) {
      if (k === 'id') continue;
      const col = mapaColumnas[k] || k;
      if (col === 'respuestas') {
        sets.push(`${col} = $${idx++}::jsonb`);
        valores.push(JSON.stringify(val));
      } else {
        sets.push(`${col} = $${idx++}`);
        valores.push(val);
      }
    }

    if (!sets.length) {
      return res.status(400).json({ ok: false, error: 'No se enviaron campos para actualizar' });
    }

    valores.push(Number(id));
    const sql = `UPDATE ${tabla} SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await db.query(sql, valores);

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, error: 'Registro no encontrado' });
    }
    res.json(Mappers[tabla](result.rows[0]));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ELIMINAR (DELETE /api/:tabla/:id)
app.delete('/api/:tabla/:id', async (req, res) => {
  const { tabla, id } = req.params;
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    return res.status(404).json({ ok: false, error: 'Tabla no válida' });
  }
  try {
    await db.query(`DELETE FROM ${tabla} WHERE id = $1`, [Number(id)]);
    res.json({ ok: true, id: Number(id) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Cualquier ruta desconocida que no sea /api regresa a index.html
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`✅ T-Search corriendo en http://localhost:${PORT}`);
  try {
    const info = await db.verificarConexion();
    console.log(`🗄️  Conectado a Supabase PostgreSQL [${info.host}] (${info.tablasCreadas}/${info.totalEsperadas} tablas detectadas)`);
  } catch (err) {
    console.warn(`⚠️  Aviso de conexión a Supabase: ${err.message}`);
  }
});
