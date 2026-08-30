const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener categorías.' });
  }
});

module.exports = router;