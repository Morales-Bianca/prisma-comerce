const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT s.*, p.nombre AS producto_nombre, u.nombre AS registrado_por
      FROM salidas_inventario s
      JOIN productos p ON s.producto_id = p.id
      LEFT JOIN usuarios u ON s.usuario_id = u.id
      ORDER BY s.fecha DESC
    `);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener salidas.' });
  }
});

router.post('/', async (req, res) => {
  const { producto_id, cantidad, motivo, usuario_id } = req.body;

  if (!producto_id || !cantidad || cantidad <= 0 || !motivo) {
    return res.status(400).json({ error: 'Producto, cantidad y motivo son obligatorios.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const salida = await client.query(
      `INSERT INTO salidas_inventario (producto_id, cantidad, motivo, usuario_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [producto_id, cantidad, motivo, usuario_id]
    );

    await client.query(
      'UPDATE productos SET stock = GREATEST(stock - $1, 0) WHERE id = $2',
      [cantidad, producto_id]
    );

    await client.query('COMMIT');
    res.status(201).json(salida.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la salida.' });
  } finally {
    client.release();
  }
});

module.exports = router;
