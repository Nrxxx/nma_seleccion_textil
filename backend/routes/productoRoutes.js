import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  obtenerProductos, 
  crearProducto, 
  actualizarProducto, 
  eliminarProducto 
} from '../controllers/productoController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.put('/:id', upload.array('fotos', 3), actualizarProducto);
router.delete('/:id', eliminarProducto);

export default router;