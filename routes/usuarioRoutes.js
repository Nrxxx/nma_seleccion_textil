import express from 'express';
import { getUsuarios, createUsuario } from '../controllers/usuarioController.js';

const router = express.Router();

router.get('/', getUsuarios);    // URL: http://localhost:3000/api/usuarios (Leer)
router.post('/', createUsuario);  // URL: http://localhost:3000/api/usuarios (Crear)

export default router;