import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import productoRoutes from './routes/productoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import ventaRoutes from './routes/ventaRoutes.js';

const app = express();
app.use(express.json());

// Enlace de todos los módulos a sus URLs bases
app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/ventas', ventaRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Servidor ejecutándose correctamente de forma impecable.');
});

app.listen(PORT, () => {
  console.log(`💻 Servidor corriendo en el puerto http://localhost:${PORT}`);
});