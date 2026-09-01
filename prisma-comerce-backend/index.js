const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const authRoutes = require('./routes/auth');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const movimientosRoutes = require('./routes/movimientos');
const usuariosRoutes = require('./routes/usuarios');
const configuracionRoutes = require('./routes/configuracion');
const entradasRoutes = require('./routes/entradas');
const salidasRoutes = require('./routes/salidas');
const facturasRoutes = require('./routes/facturas');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/entradas', entradasRoutes);
app.use('/api/salidas', salidasRoutes);
app.use('/api/facturas', facturasRoutes);

app.get('/api/ping', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');
    res.json({ mensaje: 'Servidor y base de datos funcionando', hora: resultado.rows[0].now });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error conectando a la base de datos' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
