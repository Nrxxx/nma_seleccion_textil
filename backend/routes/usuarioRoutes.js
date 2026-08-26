import express from 'express';
import { obtenerUsuarios, registrarUsuario, loginUsuario } from '../controllers/usuarioController.js';

const router = express.Router();

// Obtener la lista completa de usuarios
router.get('/', obtenerUsuarios);

// Crear/Registrar un nuevo usuario
router.post('/registro', registrarUsuario);

// Iniciar sesión
router.post('/login', loginUsuario);

export default router;