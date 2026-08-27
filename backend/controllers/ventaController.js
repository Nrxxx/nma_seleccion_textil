import supabase from '../config/database.js';

// Obtener todas las ventas
export const obtenerVentas = async (req, res) => {
  try {
    const { data, error } = await supabase.from('ventas').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear/Registrar una nueva venta con abono del 50%
export const registrarVenta = async (req, res) => {
  try {
    const { usuario_id, total, detalles } = req.body;

    if (!total || total <= 0) {
      return res.status(400).json({ error: 'El total debe ser mayor a 0' });
    }

    const montoAbonado = total / 2;
    const montoPendiente = total / 2;
    const fechaExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // 1. Insertar la venta en 'ventas'
    const { data: venta, error: errorVenta } = await supabase
      .from('ventas')
      .insert([
        {
          usuario_id: usuario_id || null,
          total: total,
          detalles: detalles || null,
          monto_abonado: montoAbonado,
          monto_pendiente: montoPendiente,
          estado_pago: 'pendiente_abono',
          fecha_expiracion: fechaExpiracion
        }
      ])
      .select()
      .single();

    if (errorVenta) throw errorVenta;

    // 2. Marcar las prendas involucradas como 'reservado' en la tabla 'productos'
    if (detalles && Array.isArray(detalles) && detalles.length > 0) {
      const idsPrendas = detalles.map(item => item.id_prenda || item.id);

      const { error: errorProductos } = await supabase
        .from('productos')
        .update({ estado: 'reservado' })
        .in('id', idsPrendas);

      if (errorProductos) throw errorProductos;
    }

    res.status(201).json({
      mensaje: 'Reserva registrada con éxito.',
      venta: venta,
      monto_a_pagar: montoAbonado,
      fecha_expiracion: fechaExpiracion
    });
  } catch (error) {
    console.error('Error al registrar venta:', error);
    res.status(500).json({ error: error.message });
  }
};

// Aprobar abono de reserva (Admin verifica pago en Nequi)
export const aprobarVenta = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('ventas')
      .update({ estado_pago: 'abonado' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      mensaje: 'Abono verificado y reserva confirmada.',
      venta: data
    });
  } catch (error) {
    console.error('Error al aprobar venta:', error);
    res.status(500).json({ error: error.message });
  }
};

// Cancelar reserva y devolver prendas a 'disponible'
export const cancelarVenta = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Consultar los detalles de la venta para saber qué prendas liberar
    const { data: venta, error: errorFetch } = await supabase
      .from('ventas')
      .select('detalles')
      .eq('id', id)
      .single();

    if (errorFetch) throw errorFetch;

    // 2. Cambiar estado de la venta a 'cancelado'
    const { error: errorUpdateVenta } = await supabase
      .from('ventas')
      .update({ estado_pago: 'cancelado' })
      .eq('id', id);

    if (errorUpdateVenta) throw errorUpdateVenta;

    // 3. Devolver los productos al estado 'disponible'
    if (venta && venta.detalles && Array.isArray(venta.detalles)) {
      const idsPrendas = venta.detalles.map(item => item.id_prenda || item.id);

      const { error: errorProductos } = await supabase
        .from('productos')
        .update({ estado: 'disponible' })
        .in('id', idsPrendas);

      if (errorProductos) throw errorProductos;
    }

    res.json({ mensaje: 'Reserva cancelada y prendas liberadas con éxito.' });
  } catch (error) {
    console.error('Error al cancelar venta:', error);
    res.status(500).json({ error: error.message });
  }
};