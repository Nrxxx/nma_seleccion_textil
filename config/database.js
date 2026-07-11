import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar las variables de entorno
dotenv.config();

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Prueba rápida de conexión
try {
  const connection = await pool.getConnection();
  console.log('🚀 ¡Conexión exitosa a MySQL (nma_seleccion_textil)!');
  connection.release();
} catch (error) {
  console.error('❌ Error crítico al conectar a la base de datos:', error.message);
}

export default pool;