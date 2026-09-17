import supabase from '../config/database.js';

export const obtenerProductos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*');

    if (error) throw error;

    // Buscar para asegurar que 'fotos' siempre sea un arreglo utilizable en el carrusel
    const productosFormateados = data.map(p => {
      let fotosList = [];
      if (Array.isArray(p.fotos)) {
        fotosList = p.fotos;
      } else if (typeof p.fotos === 'string') {
        try { fotosList = JSON.parse(p.fotos); } catch(e) { fotosList = [p.fotos]; }
      } else if (p.imagen_url) {
        fotosList = [p.imagen_url];
      }

      return {
        ...p,
        fotos: fotosList,
        imagen_url: fotosList[0] || '' // Para la retrocompatibilidad
      };
    });

    res.json(productosFormateados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const crearProducto = async (req, res) => {
  try {
    const { nombre_prenda, marca, talla, precio, fotos, imagen_url } = req.body;
    const listaFotos = fotos || (imagen_url ? [imagen_url] : []);

    const { data, error } = await supabase
      .from('productos')
      .insert([{ nombre_prenda, marca, talla, precio: Number(precio), fotos: listaFotos, estado: 'disponible' }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_prenda, marca, talla, precio, fotos, imagen_url } = req.body;
    
    let updateData = { nombre_prenda, marca, talla, precio: Number(precio) };

    // Si mandan fotos como texto o url
    if (fotos || imagen_url) {
        updateData.fotos = fotos || (imagen_url ? [imagen_url] : []);
    }

    // Si suben archivos nuevos desde el frontend por el usuario
    if (req.files && req.files.length > 0) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fotosUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
        updateData.fotos = fotosUrls;
    }

    const { data, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw error;
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};