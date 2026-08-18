import supabase from '../config/database.js';

// Obtener todos los productos
export const obtenerProductos = async (req, res) => {
  try {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    const { data, error } = await supabase
      .from('productos')
      .insert([{ nombre, descripcion, precio, stock, categoria }])
      .select();

    if (error) throw error;
    res.status(201).json({ mensaje: 'Producto creado exitosamente', producto: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un producto
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    const { data, error } = await supabase
      .from('productos')
      .update({ nombre, descripcion, precio, stock, categoria })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ mensaje: 'Producto actualizado exitosamente', producto: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un producto
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw error;
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};