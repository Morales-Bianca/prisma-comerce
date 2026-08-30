const express = require('express');
const pool = require('../db');

const router = express.Router();

// LISTAR entradas de inventario (historial)
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT e.*, p.nombre AS producto_nombre, u.nombre AS registrado_por
      FROM entradas_inventario e
      JOIN productos p ON e.producto_id = p.id
      LEFT JOIN usuarios u ON e.usuario_id = u.id
      ORDER BY e.fecha DESC
    `);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener entradas de inventario.' });
  }
});

// REGISTRAR entrada (aumenta el stock automáticamente)
router.post('/', async (req, res) => {
  const { producto_id, cantidad, origen, usuario_id } = req.body;

  if (!producto_id || !cantidad || cantidad <= 0 || !origen) {
    return res.status(400).json({ error: 'Producto, cantidad y origen son obligatorios.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const entrada = await client.query(
      `INSERT INTO entradas_inventario (producto_id, cantidad, origen, usuario_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [producto_id, cantidad, origen, usuario_id]
    );

    await client.query(
      'UPDATE productos SET stock = stock + $1 WHERE id = $2',
      [cantidad, producto_id]
    );

    await client.query('COMMIT');
    res.status(201).json(entrada.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la entrada.' });
  } finally {
    client.release();
  }
});

module.exports = router;