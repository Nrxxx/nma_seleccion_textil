import supabase from '../config/database.js';

export const obtenerVentas = async (req, res) => {
  try {
    const { data, error } = await supabase.from('ventas').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const registrarVenta = async (req, res) => {
  try {
    const { usuario_id, total, detalles } = req.body;

    // 1. Guardar el registro en la tabla ventas
    const { data, error } = await supabase
      .from('ventas')
      .insert([{ usuario_id: usuario_id || null, total, detalles }])
      .select();

    if (error) throw error;

    // 2. Cambiar nombre de 'prendas' a 'productos'
    if (Array.isArray(detalles) && detalles.length > 0) {
      const idsProductos = detalles.map((item) => item.id_prenda || item.id);

      const { error: updateError } = await supabase
        .from('productos') // <- Cambiado de 'prendas' a 'productos'
        .update({ estado: 'reservado' }) // Asegúrate de tener una columna 'estado' en la tabla productos
        .in('id', idsProductos); // Ajusta a 'id' o 'id_prenda' según la columna clave de tu tabla

      if (updateError) {
        console.error('⚠️ No se pudo actualizar el estado del producto:', updateError.message);
      }
    }

    res.status(201).json({ mensaje: 'Venta registrada con éxito', venta: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};