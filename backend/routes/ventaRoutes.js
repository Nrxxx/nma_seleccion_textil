import express from 'express';
import { obtenerVentas, registrarVenta } from '../controllers/ventaController.js';

const router = express.Router();

// Leer todas las ventas
router.get('/', obtenerVentas);

// Registrar una nueva venta / reserva
router.post('/', registrarVenta);

export default router;