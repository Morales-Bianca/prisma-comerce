const pool = require('./db');

async function sembrar() {
  const categorias = ['Abarrotes', 'Bebidas', 'Lácteos', 'Limpieza', 'Otros'];

  try {
    for (const nombre of categorias) {
      await pool.query('INSERT INTO categorias (nombre) VALUES ($1)', [nombre]);
    }
    console.log('Categorías creadas con éxito.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    pool.end();
  }
}

sembrar();