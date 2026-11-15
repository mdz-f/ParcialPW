const db = require('../../database/db');

const COLUMNAS = {
  titulo: 'titulo',
  empresaId: 'empresa_id',
  ubicacion: 'ubicacion',
  modalidad: 'modalidad',
  tipo: 'tipo',
  contrato: 'contrato',
  nivel: 'nivel',
  sector: 'sector',
  salarioMin: 'salario_min',
  salarioMax: 'salario_max',
  estado: 'estado',
  descripcion: 'descripcion',
  responsabilidades: 'responsabilidades',
  requisitos: 'requisitos',
  beneficios: 'beneficios',
  contactoEmail: 'contacto_email',
  contactoTelefono: 'contacto_telefono'
};

async function listar() {
  const result = await db.query('SELECT * FROM empleos ORDER BY fecha DESC, id DESC');
  return result.rows;
}

async function buscarPorId(id) {
  const result = await db.query('SELECT * FROM empleos WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function crear(empleo) {
  const result = await db.query(
    `INSERT INTO empleos
      (empresa_id, titulo, ubicacion, modalidad, tipo, contrato, nivel, sector,
       salario_min, salario_max, estado, descripcion, responsabilidades,
       requisitos, beneficios, contacto_email, contacto_telefono)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING *`,
    [
      Number(empleo.empresaId),
      empleo.titulo.trim(),
      empleo.ubicacion.trim(),
      empleo.modalidad || 'Presencial',
      empleo.tipo || 'Tiempo completo',
      empleo.contrato || 'Indefinido',
      empleo.nivel || 'Junior',
      empleo.sector.trim(),
      Number(empleo.salarioMin ?? 0),
      Number(empleo.salarioMax ?? 0),
      empleo.estado || 'Activa',
      empleo.descripcion || '',
      empleo.responsabilidades || [],
      empleo.requisitos || [],
      empleo.beneficios || [],
      empleo.contactoEmail || '',
      empleo.contactoTelefono || ''
    ]
  );
  return result.rows[0];
}

async function actualizar(id, cambios) {
  const asignaciones = [];
  const valores = [];

  for (const [campo, valor] of Object.entries(cambios)) {
    const columna = COLUMNAS[campo];
    if (!columna) continue;
    valores.push(valor);
    asignaciones.push(`${columna} = $${valores.length}`);
  }

  if (!asignaciones.length) return null;

  valores.push(id);
  const result = await db.query(
    `UPDATE empleos SET ${asignaciones.join(', ')} WHERE id = $${valores.length} RETURNING *`,
    valores
  );
  return result.rows[0] || null;
}

async function eliminar(id) {
  const result = await db.query('DELETE FROM empleos WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };