import { supabase } from '../lib/supabase';

const CONFIG_KEYS = [
  'sistema_manutencao_alerta', 'manutenção_comunicado_alerta',
  'sistema_realtime', 'sistema_aviso_repport', 'sistema_aviso_descricao_repport',
  'sistema_aviso_whatsapp_repport',
] as const;

export type ConfigKey = typeof CONFIG_KEYS[number];
export type ConfigMap = Partial<Record<ConfigKey, string>>;

export async function fetchSystemConfig(): Promise<ConfigMap> {
  try {
    // Check if table exists/is accessible
    const { count, error: countError } = await supabase
      .from('configuracoes')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('[config.service] Table accessibility error:', countError);
    } else {
      console.log('[config.service] Table row count:', count);
    }

    const { data, error } = await supabase
      .from('configuracoes')
      .select('chave, valor');
    
    if (error) {
      console.error('[config.service] Error fetching config:', error);
      return {};
    }
    
    console.log('[config.service] All config rows from DB:', data);
    
    // Filter only the keys we are interested in, but log everything for debugging
    const filteredData = (data ?? []).filter(c => (CONFIG_KEYS as readonly string[]).includes(c.chave));
    console.log('[config.service] Filtered config data:', filteredData);
    
    const config = Object.fromEntries((data ?? []).map(c => [c.chave, c.valor])) as ConfigMap;
    return config;
  } catch (err) {
    console.error('[config.service] Unexpected error:', err);
    return {};
  }
}

export async function updateConfig(chave: ConfigKey, valor: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('configuracoes')
      .update({ valor })
      .eq('chave', chave);
    
    if (error) {
      console.error(`[config.service] Error updating config ${chave}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[config.service] Unexpected error updating config ${chave}:`, err);
    return false;
  }
}

export async function fetchMotivationalQuotes() {
  const { data, error } = await supabase.from('frases_motivacionais').select('*').eq('ativo', true);
  if (error) console.error('[config.service] quotes:', error);
  return data ?? [];
}
