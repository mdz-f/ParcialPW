const Empleos = require('../models/empleos.model');

const CAMPOS_ACTUALIZABLES = [
  'titulo', 'empresaId', 'ubicacion', 'modalidad', 'tipo', 'contrato', 'nivel',
  'sector', 'salarioMin', 'salarioMax', 'estado', 'descripcion',
  'responsabilidades', 'requisitos', 'beneficios', 'contactoEmail', 'contactoTelefono'
];

function mapear(empleo) {
  return {
    id: empleo.id,
    titulo: empleo.titulo,
    empresaId: empleo.empresa_id,
    ubicacion: empleo.ubicacion,
    modalidad: empleo.modalidad,
    tipo: empleo.tipo,
    contrato: empleo.contrato,
    nivel: empleo.nivel,
    sector: empleo.sector,
    salarioMin: Number(empleo.salario_min),
    salarioMax: Number(empleo.salario_max),
    fecha: empleo.fecha,
    estado: empleo.estado,
    descripcion: empleo.descripcion,
    responsabilidades: empleo.responsabilidades || [],
    requisitos: empleo.requisitos || [],
    beneficios: empleo.beneficios || [],
    contactoEmail: empleo.contacto_email || '',
    contactoTelefono: empleo.contacto_telefono || ''
  };
}

function obtenerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function esObjeto(valor) {
  return valor && typeof valor === 'object' && !Array.isArray(valor);
}

async function listar(req, res) {
  const empleos = await Empleos.listar();
  res.json(empleos.map(mapear));
}

async function obtener(req, res) {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'El id del empleo no es válido' });

  const empleo = await Empleos.buscarPorId(id);
  if (!empleo) return res.status(404).json({ ok: false, error: 'Empleo no encontrado' });
  res.json(mapear(empleo));
}

async function crear(req, res) {
  const empleo = req.body;
  if (!esObjeto(empleo)) return res.status(400).json({ ok: false, error: 'El cuerpo de la solicitud no es válido' });

  const empresaId = obtenerId(empleo.empresaId);
  if (!empresaId || !String(empleo.titulo || '').trim() ||
      !String(empleo.ubicacion || '').trim() || !String(empleo.sector || '').trim()) {
    return res.status(400).json({
      ok: false,
      error: 'Empresa, título, ubicación y sector son obligatorios'
    });
  }

  const salarioMin = Number(empleo.salarioMin ?? 0);
  const salarioMax = Number(empleo.salarioMax ?? 0);
  if (!Number.isFinite(salarioMin) || !Number.isFinite(salarioMax) ||
      salarioMin < 0 || salarioMax < salarioMin) {
    return res.status(400).json({ ok: false, error: 'El rango salarial no es válido' });
  }

  const creado = await Empleos.crear({ ...empleo, empresaId, salarioMin, salarioMax });
  res.status(201).json(mapear(creado));
}

async function actualizar(req, res) {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'El id del empleo no es válido' });
  if (!esObjeto(req.body)) return res.status(400).json({ ok: false, error: 'El cuerpo de la solicitud no es válido' });

  const cambios = Object.fromEntries(
    Object.entries(req.body).filter(([campo]) => CAMPOS_ACTUALIZABLES.includes(campo))
  );
  if (!Object.keys(cambios).length) {
    return res.status(400).json({ ok: false, error: 'No se enviaron campos válidos para actualizar' });
  }

  if (cambios.empresaId !== undefined && !obtenerId(cambios.empresaId)) {
    return res.status(400).json({ ok: false, error: 'La empresa no es válida' });
  }
  for (const campo of ['salarioMin', 'salarioMax']) {
    if (cambios[campo] !== undefined &&
        (!Number.isFinite(Number(cambios[campo])) || Number(cambios[campo]) < 0)) {
      return res.status(400).json({ ok: false, error: 'El salario debe ser un número igual o mayor que cero' });
    }
  }
  for (const campo of ['responsabilidades', 'requisitos', 'beneficios']) {
    if (cambios[campo] !== undefined && !Array.isArray(cambios[campo])) {
      return res.status(400).json({ ok: false, error: `${campo} debe ser una lista` });
    }
  }

  const actualizado = await Empleos.actualizar(id, cambios);
  if (!actualizado) return res.status(404).json({ ok: false, error: 'Empleo no encontrado' });
  res.json(mapear(actualizado));
}

async function eliminar(req, res) {
  const id = obtenerId(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'El id del empleo no es válido' });
  if (!await Empleos.eliminar(id)) {
    return res.status(404).json({ ok: false, error: 'Empleo no encontrado' });
  }
  res.json({ ok: true, id });
}

module.exports = { listar, obtener, crear, actualizar, eliminar };