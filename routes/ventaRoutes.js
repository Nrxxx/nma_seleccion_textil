import express from 'express';
import { getVentas, createVenta } from '../controllers/ventaController.js';

const router = express.Router();

router.get('/', getVentas);     // URL: http://localhost:3000/api/ventas
router.post('/', createVenta);   // URL: http://localhost:3000/api/ventas

export default router;