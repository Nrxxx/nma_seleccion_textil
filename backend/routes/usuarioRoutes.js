import express from 'express';
import { obtenerUsuarios } 
from '../controllers/usuarioController.js';

const router = express.Router();

// Leer todos los usuarios
router.get('/', obtenerUsuarios);

export default router;