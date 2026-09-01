const express = require('express');
const pool = require('../db');

const router = express.Router();

// LISTAR ventas con sus items (para Facturas y Reportes)
router.get('/', async (req, res) => {
  try {
    const ventas = await pool.query('SELECT * FROM ventas ORDER BY fecha DESC');

    const ventasConItems = await Promise.all(
      ventas.rows.map(async (venta) => {
        const items = await pool.query(
          `SELECT dv.cantidad, dv.precio_unitario, p.nombre
           FROM detalle_ventas dv
           JOIN productos p ON dv.producto_id = p.id
           WHERE dv.venta_id = $1`,
          [venta.id]
        );

        const factura = await pool.query('SELECT * FROM facturas WHERE venta_id = $1', [venta.id]);

        return { ...venta, items: items.rows, factura: factura.rows[0] || null };
      })
    );

    res.json(ventasConItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener ventas.' });
  }
});

// CREAR una venta completa (venta + detalle + movimiento de caja + factura + descuento de stock)
router.post('/', async (req, res) => {
  const { usuario_id, cliente_nombre, cliente_documento, metodo_pago, con_factura, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'La venta debe tener al menos un producto.' });
  }

  const total = items.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Crear la venta
    const ventaResult = await client.query(
      `INSERT INTO ventas (usuario_id, cliente_nombre, cliente_documento, metodo_pago, total, con_factura)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [usuario_id, cliente_nombre, cliente_documento, metodo_pago, total, con_factura]
    );
    const venta = ventaResult.rows[0];

    // 2. Crear el detalle y descontar stock
    for (const item of items) {
      await client.query(
        `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [venta.id, item.producto_id, item.cantidad, item.precio_unitario]
      );

      await client.query(
        `UPDATE productos SET stock = stock - $1 WHERE id = $2`,
        [item.cantidad, item.producto_id]
      );
    }

    // 3. Registrar el movimiento de caja automático
    await client.query(
      `INSERT INTO movimientos_caja (tipo, concepto, categoria, monto, usuario_id)
       VALUES ('Ingreso', $1, 'Ventas', $2, $3)`,
      [`Venta #${venta.id}`, total, usuario_id]
    );

    // 4. Si corresponde, crear la factura
    let factura = null;
    if (con_factura) {
      const numero = `F-${String(venta.id).padStart(4, '0')}`;
      const facturaResult = await client.query(
        `INSERT INTO facturas (venta_id, numero) VALUES ($1, $2) RETURNING *`,
        [venta.id, numero]
      );
      factura = facturaResult.rows[0];
    }

    await client.query('COMMIT');
    res.status(201).json({ venta, factura });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la venta.' });
  } finally {
    client.release();
  }
});
// ELIMINAR venta completa (detalle, factura si existe, movimiento de caja, y revierte el stock)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const ventaResult = await client.query('SELECT * FROM ventas WHERE id = $1', [id]);
    if (ventaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venta no encontrada.' });
    }

    const detalle = await client.query('SELECT * FROM detalle_ventas WHERE venta_id = $1', [id]);

    // Revertir el stock de cada producto vendido
    for (const item of detalle.rows) {
      await client.query('UPDATE productos SET stock = stock + $1 WHERE id = $2', [item.cantidad, item.producto_id]);
    }

    await client.query('DELETE FROM detalle_ventas WHERE venta_id = $1', [id]);
    await client.query('DELETE FROM facturas WHERE venta_id = $1', [id]);
    await client.query(`DELETE FROM movimientos_caja WHERE concepto = $1`, [`Venta #${id}`]);
    await client.query('DELETE FROM ventas WHERE id = $1', [id]);

    await client.query('COMMIT');
    res.json({ mensaje: 'Venta eliminada y stock revertido.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la venta.' });
  } finally {
    client.release();
  }
});

module.exports = router;
