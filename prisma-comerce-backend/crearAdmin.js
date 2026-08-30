const bcrypt = require('bcrypt');
const pool = require('./db');

async function crearAdmin() {
  const nombre = 'Bianca';
  const contrasena = '123456'; // cámbiala luego por una más segura
  const rol = 'Administrador';

  const claveHash = await bcrypt.hash(contrasena, 10);

  try {
    await pool.query(
      'INSERT INTO usuarios (nombre, rol, clave_hash, activo) VALUES ($1, $2, $3, true)',
      [nombre, rol, claveHash]
    );
    console.log(`Usuario "${nombre}" creado con éxito. Contraseña: ${contrasena}`);
  } catch (error) {
    console.error('Error creando el usuario:', error.message);
  } finally {
    pool.end();
  }
}

crearAdmin();