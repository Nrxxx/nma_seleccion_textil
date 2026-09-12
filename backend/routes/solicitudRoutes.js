import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { 
  crearSolicitud, 
  obtenerSolicitudesPendientes, 
  aprobarSolicitud, 
  rechazarSolicitud 
} from '../controllers/solicitudController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
    cb(null, nombreUnico);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Formato no soportado.'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.post('/', upload.array('fotos', 3), crearSolicitud);
router.get('/pendientes', obtenerSolicitudesPendientes);
router.patch('/:id/aprobar', aprobarSolicitud);
router.patch('/:id/rechazar', rechazarSolicitud);

export default router;