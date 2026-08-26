import supabase from '../config/database.js';

// Obtener usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const { data, error } = await supabase.from('usuarios').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Registrar usuario
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, email, password, rol: rol || 'cliente' }])
      .select();

    if (error) throw error;
    res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login de usuario
export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({ mensaje: 'Login exitoso', usuario: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};