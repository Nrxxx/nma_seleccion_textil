import supabase from '../config/database.js';

export const obtenerProductos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*');

    if (error) throw error;

    // Mapear para asegurar que 'fotos' siempre sea un arreglo utilizable en el carrusel
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
        imagen_url: fotosList[0] || '' // Para retrocompatibilidad
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
    const listaFotos = fotos || (imagen_url ? [imagen_url] : []);

    const { data, error } = await supabase
      .from('productos')
      .update({ nombre_prenda, marca, talla, precio: Number(precio), fotos: listaFotos })
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