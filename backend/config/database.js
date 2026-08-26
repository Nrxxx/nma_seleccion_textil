import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY en el .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 ¡Cliente de Supabase inicializado correctamente para NMA Selección Textil!');

export default supabase;