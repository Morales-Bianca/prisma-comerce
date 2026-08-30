const express = require('express');
const pool = require('../db');

const router = express.Router();

// OBTENER la configuración (crea una fila por defecto si no existe ninguna)
router.get('/', async (req, res) => {
  try {
    let resultado = await pool.query('SELECT * FROM configuracion LIMIT 1');

    if (resultado.rows.length === 0) {
      resultado = await pool.query('INSERT INTO configuracion DEFAULT VALUES RETURNING *');
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la configuración.' });
  }
});

// ACTUALIZAR la configuración
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_negocio, direccion, telefono, nit, moneda, alerta_stock_bajo, emitir_factura_default } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE configuracion SET nombre_negocio=$1, direccion=$2, telefono=$3, nit=$4,
       moneda=$5, alerta_stock_bajo=$6, emitir_factura_default=$7
       WHERE id=$8 RETURNING *`,
      [nombre_negocio, direccion, telefono, nit, moneda, alerta_stock_bajo, emitir_factura_default, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la configuración.' });
  }
});

module.exports = router;