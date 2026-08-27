import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import productoRoutes from './routes/productoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import ventaRoutes from './routes/ventaRoutes.js';
import { iniciarCronJobs } from './services/cronService.js'; // <- Importar el cron

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/ventas', ventaRoutes);

// Iniciar tarea programada de liberación de prendas
iniciarCronJobs();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`💻 Servidor corriendo en el puerto http://localhost:${PORT}`);
});