import cron from 'node-cron';
import supabase from '../config/database.js';

// Tarea programada: Se ejecuta cada 10 minutos para liberar prendas vencidas
export const iniciarCronJobs = () => {
  cron.schedule('*/10 * * * *', async () => {
    console.log('🔍 Verificando reservas expiradas (24h transcurridas)...');
    try {
      const ahora = new Date().toISOString();

      // 1. Obtener prendas cuya fecha limite haya pasado
      const { data: prendasExpiradas, error: errProductos } = await supabase
        .from('productos')
        .select('id_prenda, id')
        .eq('estado', 'reservado')
        .lt('reservado_hasta', ahora);

      if (errProductos) throw errProductos;

      if (prendasExpiradas && prendasExpiradas.length > 0) {
        const ids = prendasExpiradas.map(p => p.id_prenda || p.id);

        // 2. Cambiar estado de las prendas a disponible
        await supabase
          .from('productos')
          .update({ estado: 'disponible', reservado_hasta: null })
          .in('id', ids);

        console.log(`✅ Se liberaron ${ids.length} prendas por vencimiento de 24h.`);
      }
    } catch (error) {
      console.error('❌ Error en tarea programada de liberación:', error.message);
    }
  });
};