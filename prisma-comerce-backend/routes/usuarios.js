const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

// LISTAR usuarios (sin exponer la contraseña)
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nombre, rol, activo FROM usuarios ORDER BY nombre'
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

// CREAR usuario
router.post('/', async (req, res) => {
  const { nombre, rol, contrasena } = req.body;

  if (!nombre || !rol || !contrasena) {
    return res.status(400).json({ error: 'Nombre, rol y contraseña son obligatorios.' });
  }

  try {
    const claveHash = await bcrypt.hash(contrasena, 10);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, rol, clave_hash, activo)
       VALUES ($1, $2, $3, true) RETURNING id, nombre, rol, activo`,
      [nombre, rol, claveHash]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ese nombre de usuario ya existe.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al crear el usuario.' });
  }
});

// EDITAR usuario (nombre, rol, activo, y opcionalmente contraseña)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, rol, activo, contrasena } = req.body;

  try {
    let resultado;

    if (contrasena) {
      const claveHash = await bcrypt.hash(contrasena, 10);
      resultado = await pool.query(
        `UPDATE usuarios SET nombre=$1, rol=$2, activo=$3, clave_hash=$4
         WHERE id=$5 RETURNING id, nombre, rol, activo`,
        [nombre, rol, activo, claveHash, id]
      );
    } else {
      resultado = await pool.query(
        `UPDATE usuarios SET nombre=$1, rol=$2, activo=$3
         WHERE id=$4 RETURNING id, nombre, rol, activo`,
        [nombre, rol, activo, id]
      );
    }

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al editar el usuario.' });
  }
});

module.exports = router;