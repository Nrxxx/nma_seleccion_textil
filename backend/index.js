import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors'; // <- Importar cors
import productoRoutes from './routes/productoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import ventaRoutes from './routes/ventaRoutes.js';

const app = express();

app.use(cors()); // <- Habilitar CORS para permitir peticiones desde el frontend
app.use(express.json());

app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/ventas', ventaRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`💻 Servidor corriendo en el puerto http://localhost:${PORT}`);
});