const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
  const { nombre, contrasena } = req.body;

  if (!nombre || !contrasena) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
  }

  try {
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE nombre = $1',
      [nombre]
    );

    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Este usuario está inactivo.' });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.clave_hash);

    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

module.exports = router;