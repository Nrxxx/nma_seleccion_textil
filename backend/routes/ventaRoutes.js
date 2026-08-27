import express from 'express';
import { obtenerVentas, registrarVenta, aprobarVenta, cancelarVenta } from '../controllers/ventaController.js';

const router = express.Router();

// Leer todas las ventas
router.get('/', obtenerVentas);

// Registrar una nueva venta / reserva
router.post('/', registrarVenta);

// Aprobar abono de reserva
router.patch('/:id/aprobar', aprobarVenta);

// Cancelar reserva y liberar prendas
router.patch('/:id/cancelar', cancelarVenta);

export default router;