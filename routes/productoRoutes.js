import express from 'express';
import { getPrendas, createPrenda, deletePrenda, updatePrenda } from '../controllers/productoController.js';

const router = express.Router();

router.get('/', getPrendas);          // Leer todas
router.post('/', createPrenda);        // Crear una
router.put('/:id', updatePrenda);      // Actualizar una por ID (Ej: /api/prendas/1)
router.delete('/:id', deletePrenda);   // Eliminar una por ID (Ej: /api/prendas/1)

export default router;