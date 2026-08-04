import express from 'express';
import dotenv from 'dotenv';
import pool from './config/database.js';
import productoRoutes from './routes/productoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import ventaRoutes from './routes/ventaRoutes.js'; // <- 1. Importamos la ruta de ventas

dotenv.config();

const app = express();
app.use(express.json());

// Enlace de todos los módulos a sus URLs bases
app.use('/api/prendas', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/ventas', ventaRoutes); // <- 2. Conectamos la URL base de ventas

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Servidor ejecutándose correctamente de forma impecable.');
});

app.listen(PORT, () => {
  console.log(`💻 Servidor corriendo en el puerto http://localhost:${PORT}`);
});