import pool from '../config/database.js';

// 1. Obtener todas las prendas del inventario
export const getPrendas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM prendas ORDER BY fecha_ingreso DESC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener prendas:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al consultar el inventario.'
    });
  }
};

// 2. Registrar una nueva prenda en el sistema
export const createPrenda = async (req, res) => {
  const { nombre_prenda, categoria, talla, marca, precio, estado_prenda } = req.body;

  // Validación básica de campos obligatorios
  if (!nombre_prenda || !categoria || !talla || !precio) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios (nombre, categoria, talla o precio).'
    });
  }

  try {
    const query = `
      INSERT INTO prendas (nombre_prenda, categoria, talla, marca, precio, estado_prenda) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [nombre_prenda, categoria, talla, marca || 'Genérica', precio, estado_prenda || 'Excelente'];
    
    const [result] = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Prenda registrada de forma impecable.',
      id_prenda: result.insertId
    });
  } catch (error) {
    console.error('Error al insertar prenda:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al registrar la prenda.'
    });
  }
};

// 3. Eliminar una prenda por su ID
export const deletePrenda = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM prendas WHERE id_prenda = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la prenda que deseas eliminar.'
      });
    }

    res.json({
      success: true,
      message: 'Prenda eliminada correctamente del inventario.'
    });
  } catch (error) {
    console.error('Error al eliminar prenda:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al intentar eliminar la prenda.'
    });
  }
};

// 4. Actualizar los datos de una prenda
export const updatePrenda = async (req, res) => {
  const { id } = req.params;
  const { nombre_prenda, categoria, talla, marca, precio, estado_prenda, disponibilidad } = req.body;

  try {
    const query = `
      UPDATE prendas 
      SET nombre_prenda = ?, categoria = ?, talla = ?, marca = ?, precio = ?, estado_prenda = ?, disponibilidad = ?
      WHERE id_prenda = ?
    `;
    const values = [nombre_prenda, categoria, talla, marca, precio, estado_prenda, disponibilidad, id];

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la prenda para actualizar.'
      });
    }

    res.json({
      success: true,
      message: 'Prenda actualizada de forma impecable.'
    });
  } catch (error) {
    console.error('Error al actualizar prenda:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al actualizar la prenda.'
    });
  }
};