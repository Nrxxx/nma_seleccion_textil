import express from 'express';
import { 
  obtenerProductos, 
  obtenerPrendasPendientes,
  crearProducto, 
  cambiarEstadoPrenda,
  actualizarProducto, 
  eliminarProducto 
} from '../controllers/productoController.js';

const router = express.Router();

router.get('/', obtenerProductos);
router.get('/pendientes', obtenerPrendasPendientes);
router.post('/', crearProducto);
router.patch('/:id/estado', cambiarEstadoPrenda);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

export default router;