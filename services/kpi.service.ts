import { supabase } from '../lib/supabase';

export async function fetchKpiGlobal() {
  const { data, error } = await supabase.from('vw_kpi_global').select('*').maybeSingle();
  if (error) console.error('[kpi.service] vw_kpi_global:', error);
  return data ?? null;
}

interface HistoricoFilter {
  mes?: number;
  ano?: number;
  fromDate?: string;
  exactAno?: number;
}

export async function fetchHistoricoEmpresa(filter: HistoricoFilter = {}) {
  let query = supabase.from('vw_historico_empresa').select('*');
  if (filter.mes !== undefined && filter.ano !== undefined) {
    query = query.eq('mes', filter.mes).eq('ano', filter.ano);
  } else if (filter.fromDate) {
    query = query.gte('data_referencia', filter.fromDate);
  } else if (filter.exactAno !== undefined) {
    query = query.eq('ano', filter.exactAno);
  }
  const { data, error } = await query;
  if (error) console.error('[kpi.service] vw_historico_empresa:', error);
  return data ?? [];
}
