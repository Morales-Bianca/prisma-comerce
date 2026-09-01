const express = require('express');
const pool = require('../db');

const router = express.Router();

// ELIMINAR factura (no elimina la venta, solo el comprobante)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const factura = await client.query('SELECT * FROM facturas WHERE id = $1', [id]);

    if (factura.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Factura no encontrada.' });
    }

    await client.query('DELETE FROM facturas WHERE id = $1', [id]);
    await client.query('UPDATE ventas SET con_factura = false WHERE id = $1', [factura.rows[0].venta_id]);

    await client.query('COMMIT');
    res.json({ mensaje: 'Factura eliminada.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la factura.' });
  } finally {
    client.release();
  }
});

module.exports = router;
