import supabase from '../config/database.js';

// 1. Crear nueva solicitud de prenda recibiendo archivos locales cargados vía Multer
export const crearSolicitud = async (req, res) => {
  try {
    const { usuario_id, nombre_prenda, talla, marca, precio_estimado, descripcion } = req.body;

    // Verificar si se subieron archivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Debes subir al menos una imagen (JPG o PNG)' });
    }

    // Construir URLs absolutas servidas desde el backend
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fotosUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);

    const { data, error } = await supabase
      .from('solicitudes_prendas')
      .insert([{
        usuario_id: usuario_id || null,
        nombre_prenda,
        talla,
        marca,
        precio_estimado: Number(precio_estimado),
        fotos: fotosUrls,
        descripcion: descripcion || '',
        estado: 'pendiente'
      }])
      .select();

    if (error) throw error;

    res.status(201).json({ 
      mensaje: 'Solicitud e imágenes subidas a revisión exitosamente', 
      solicitud: data[0] 
    });
  } catch (error) {
    console.error('Error en crearSolicitud:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// 2. Obtener solicitudes pendientes para el Admin
export const obtenerSolicitudesPendientes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('solicitudes_prendas')
      .select('*')
      .eq('estado', 'pendiente');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Aprobar solicitud y publicar en el catalogo con todas sus fotos
export const aprobarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: solicitud, error: errFetch } = await supabase
      .from('solicitudes_prendas')
      .select('*')
      .eq('id', id)
      .single();

    if (errFetch || !solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });

    // Extraer arreglo de fotos y primera foto de respaldo
    const fotosArray = Array.isArray(solicitud.fotos) ? solicitud.fotos : [solicitud.fotos];
    const primerFoto = fotosArray[0] || '';

    // Se inserta guardando tanto 'fotos' como 'imagen_url' por la compatibilidad de la tabla
    const { error: errInsert } = await supabase
      .from('productos')
      .insert([{
        nombre_prenda: solicitud.nombre_prenda,
        talla: solicitud.talla,
        marca: solicitud.marca,
        precio: solicitud.precio_estimado,
        fotos: fotosArray,
        imagen_url: primerFoto,
        estado: 'disponible',
        usuario_id: solicitud.usuario_id // Se vincula la prenda al dueño
      }]);

    if (errInsert) {
      console.error('Error de Supabase al insertar producto:', errInsert.message);
      throw errInsert;
    }

    // Actualizar estado de la solicitud
    await supabase
      .from('solicitudes_prendas')
      .update({ estado: 'aprobada' })
      .eq('id', id);

    res.json({ mensaje: 'Solicitud aprobada e ingresada al inventario' });
  } catch (error) {
    console.error('Error en aprobarSolicitud:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// 4. Rechazar solicitud
export const rechazarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('solicitudes_prendas')
      .update({ estado: 'rechazada' })
      .eq('id', id);

    if (error) throw error;

    res.json({ mensaje: 'Solicitud rechazada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};