const express = require('express');
const pool = require('../db');

const router = express.Router();

// LISTAR movimientos
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT m.*, u.nombre AS registrado_por
      FROM movimientos_caja m
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      ORDER BY m.fecha DESC
    `);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener movimientos.' });
  }
});

// CREAR movimiento manual (ingreso o egreso)
router.post('/', async (req, res) => {
  const { tipo, concepto, categoria, monto, usuario_id } = req.body;

  if (!tipo || !concepto || !categoria || monto == null) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO movimientos_caja (tipo, concepto, categoria, monto, usuario_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tipo, concepto, categoria, monto, usuario_id]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el movimiento.' });
  }
});

module.exports = router;