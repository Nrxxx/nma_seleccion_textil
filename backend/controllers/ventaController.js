import supabase from '../config/database.js';

// Obtener ventas
export const obtenerVentas = async (req, res) => {
  try {
    const { data, error } = await supabase.from('ventas').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Registrar una venta
export const registrarVenta = async (req, res) => {
  try {
    const { usuario_id, total, detalles } = req.body; // detalles puede ser un JSON o array según tu diseño
    const { data, error } = await supabase
      .from('ventas')
      .insert([{ usuario_id, total, detalles }])
      .select();

    if (error) throw error;
    res.status(201).json({ mensaje: 'Venta registrada con éxito', venta: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};