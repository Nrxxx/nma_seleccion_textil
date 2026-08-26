import express from 'express';
import { obtenerProductos, crearProducto } 
from '../controllers/productoController.js';

const router = express.Router();

// Leer todos los productos
router.get('/', obtenerProductos);

// Crear un producto
router.post('/', crearProducto);

export default router;