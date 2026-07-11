import pool from '../config/database.js';

// 1. Obtener el historial de ventas
export const getVentas = async (req, res) => {
  try {
    // Hacemos un JOIN para traer la información de la prenda junto con la venta
    const query = `
      SELECT v.id_venta, v.id_prenda, p.nombre_prenda, v.total_pago, v.metodo_pago, v.fecha_venta
      FROM ventas v
      INNER JOIN prendas p ON v.id_prenda = p.id_prenda
      ORDER BY v.fecha_venta DESC
    `;
    const [rows] = await pool.query(query);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al consultar el historial de ventas.'
    });
  }
};

// 2. Registrar una nueva Venta
export const createVenta = async (req, res) => {
  const { id_prenda, total_pago, metodo_pago } = req.body;

  // Validación de campos obligatorios
  if (!id_prenda || !total_pago || !metodo_pago) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios (id_prenda, total_pago o metodo_pago).'
    });
  }

  try {
    // Opcional: Podríamos verificar primero si la prenda existe y está disponible
    const [prenda] = await pool.query('SELECT disponibilidad FROM prendas WHERE id_prenda = ?', [id_prenda]);
    
    if (prenda.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'La prenda especificada no existe en el inventario.'
      });
    }

    // Insertar la venta
    const queryInsert = `
      INSERT INTO ventas (id_prenda, total_pago, metodo_pago) 
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(queryInsert, [id_prenda, total_pago, metodo_pago]);

    // Actualizar la disponibilidad de la prenda a FALSE (ya se vendió)
    await pool.query('UPDATE prendas SET disponibilidad = FALSE WHERE id_prenda = ?', [id_prenda]);

    res.status(201).json({
      success: true,
      message: 'Venta registrada e inventario actualizado de forma impecable.',
      id_venta: result.insertId
    });
  } catch (error) {
    console.error('Error al registrar venta:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al procesar la venta.'
    });
  }
};