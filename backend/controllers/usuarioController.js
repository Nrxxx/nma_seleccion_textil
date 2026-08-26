import bcrypt from 'bcryptjs';
import supabase from '../config/database.js';

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const { data, error } = await supabase.from('usuarios').select('id, nombre, email, rol, created_at');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Registrar nuevo usuario con contraseña encriptada
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Generar el hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, email, password: passwordHash, rol: rol || 'cliente' }])
      .select('id, nombre, email, rol');

    if (error) throw error;

    res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login de usuario con verificación de hash
export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuario únicamente por email
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 2. Comparar la contraseña ingresada contra el hash guardado
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Omitir el hash en la respuesta enviada al cliente
    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({ mensaje: 'Login exitoso', usuario: usuarioSinPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};