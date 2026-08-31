import supabase from '../config/database.js';

// 1. Obtener prendas aprobadas (Para el catálogo público de la tienda)
export const obtenerProductos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('estado', 'disponible');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Obtener prendas pendientes de aprobación (Solo para el Admin)
export const obtenerPrendasPendientes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('estado', 'pendiente');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Crear / Postular producto por el usuario (Estado inicial: 'pendiente')
export const crearProducto = async (req, res) => {
  try {
    const { nombre_prenda, talla, marca, precio, imagen_url, usuario_id } = req.body;

    const { data, error } = await supabase
      .from('productos')
      .insert([{ 
        nombre_prenda, 
        talla, 
        marca, 
        precio, 
        imagen_url, 
        usuario_id: usuario_id || null,
        estado: 'pendiente' 
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ mensaje: 'Prenda enviada a revisión con éxito', producto: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Cambiar estado de la prenda (Aprobar -> 'disponible', Rechazar -> 'rechazado')
export const cambiarEstadoPrenda = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const { data, error } = await supabase
      .from('productos')
      .update({ estado })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ mensaje: `Prenda actualizada a: ${estado}`, producto: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Actualizar un producto existente
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_prenda, talla, marca, precio, imagen_url } = req.body;

    const { data, error } = await supabase
      .from('productos')
      .update({ nombre_prenda, talla, marca, precio, imagen_url })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ mensaje: 'Producto actualizado correctamente', producto: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Eliminar un producto
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};