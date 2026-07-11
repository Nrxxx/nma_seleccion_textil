import pool from '../config/database.js';

// 1. Obtener todos los usuarios registrados
export const getUsuarios = async (req, res) => {
  try {
    // Traemos los datos básicos (excluyendo la contraseña por seguridad)
    const [rows] = await pool.query('SELECT id_usuario, nombre, correo, rol, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al consultar los usuarios.'
    });
  }
};

// 2. Registrar un nuevo usuario (Administrador)
export const createUsuario = async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;

  // Validación de campos requeridos por tu base de datos
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios (nombre, correo o contrasena).'
    });
  }

  try {
    const query = `
      INSERT INTO usuarios (nombre, correo, contrasena, rol) 
      VALUES (?, ?, ?, ?)
    `;
    // Si no mandan rol, el sistema le asigna 'admin' por defecto
    const values = [nombre, correo, contrasena, rol || 'admin'];
    
    const [result] = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Usuario administrador registrado correctamente.',
      id_usuario: result.insertId
    });
  } catch (error) {
    console.error('Error al insertar usuario:', error.message);
    
    // Validar si el correo ya existe (llave única en SQL)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya se encuentra registrado.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error en el servidor al registrar el usuario.'
    });
  }
};