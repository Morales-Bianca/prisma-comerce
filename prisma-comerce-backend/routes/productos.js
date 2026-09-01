const express = require('express');
const pool = require('../db');

const router = express.Router();

// LISTAR productos, con el nombre de la categoría incluido
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.nombre
    `);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos.' });
  }
});

// CREAR producto
router.post('/', async (req, res) => {
  const { nombre, codigo_barras, categoria_id, unidad, precio_venta, precio_compra, stock, stock_minimo } = req.body;

  if (!nombre || precio_venta == null || precio_compra == null) {
    return res.status(400).json({ error: 'Nombre, precio de venta y precio de compra son obligatorios.' });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO productos (nombre, codigo_barras, categoria_id, unidad, precio_venta, precio_compra, stock, stock_minimo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nombre, codigo_barras, categoria_id, unidad, precio_venta, precio_compra, stock ?? 0, stock_minimo ?? 0]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el producto.' });
  }
});

// CREAR VARIOS productos de una vez
router.post('/bulk', async (req, res) => {
  const { productos } = req.body;

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Debes enviar al menos un producto.' });
  }

  const client = await pool.connect();
  const creados = [];
  const errores = [];

  try {
    await client.query('BEGIN');

    for (let i = 0; i < productos.length; i++) {
      const p = productos[i];

      if (!p.nombre || p.precio_venta == null || p.precio_compra == null) {
        errores.push(`Fila ${i + 1}: faltan datos obligatorios.`);
        continue;
      }

      const resultado = await client.query(
        `INSERT INTO productos (nombre, codigo_barras, categoria_id, unidad, precio_venta, precio_compra, stock, stock_minimo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [p.nombre, p.codigo_barras || null, p.categoria_id || null, p.unidad || 'Unidad',
         p.precio_venta, p.precio_compra, p.stock ?? 0, p.stock_minimo ?? 0]
      );
      creados.push(resultado.rows[0]);
    }

    await client.query('COMMIT');
    res.status(201).json({ creados: creados.length, errores });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al cargar los productos.' });
  } finally {
    client.release();
  }
});

// EDITAR producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, codigo_barras, categoria_id, unidad, precio_venta, precio_compra, stock, stock_minimo } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE productos SET nombre=$1, codigo_barras=$2, categoria_id=$3, unidad=$4,
       precio_venta=$5, precio_compra=$6, stock=$7, stock_minimo=$8
       WHERE id=$9 RETURNING *`,
      [nombre, codigo_barras, categoria_id, unidad, precio_venta, precio_compra, stock, stock_minimo, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al editar el producto.' });
  }
});

module.exports = router;
