import express from 'express';
import { obtenerVentas } 
from '../controllers/ventaController.js';

const router = express.Router();

// Leer todas las ventas
router.get('/', obtenerVentas);

export default router;