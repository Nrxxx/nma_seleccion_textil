import supabase from '../config/database.js';

// 1. Obtener todos los productos
export const obtenerProductos = async (req, res) => {
  try {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Crear un nuevo producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre_prenda, talla, marca, precio, imagen_url } = req.body;
    const { data, error } = await supabase
      .from('productos')
      .insert([{ nombre_prenda, talla, marca, precio, imagen_url }])
      .select();

    if (error) throw error;
    res.status(201).json({ mensaje: 'Producto creado exitosamente', producto: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Actualizar un producto existente
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

// 4. Eliminar un producto
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