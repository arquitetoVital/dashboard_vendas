import { supabase } from '../lib/supabase';

interface RankingFilter {
  mes?: number;
  ano?: number;
  minAno?: number;
}

export async function fetchRankingHistorico(filter: RankingFilter = {}) {
  let query = supabase.from('vw_ranking_historico').select('*');
  if (filter.mes !== undefined && filter.ano !== undefined) {
    query = query.eq('mes', filter.mes).eq('ano', filter.ano);
  } else if (filter.minAno !== undefined) {
    query = query.gte('ano', filter.minAno);
  }
  const { data, error } = await query;
  if (error) console.error('[ranking.service]:', error);
  return data ?? [];
}

export async function fetchParticipacaoVendedores(mes: number, ano: number) {
  const { data, error } = await supabase
    .from('vw_participacao_vendedores_historico')
    .select('codigo_omie, vendedor_display, pct_participacao')
    .eq('mes', mes)
    .eq('ano', ano);
  if (error) console.error('[ranking.service] participacao:', error);
  return data ?? [];
}

export async function fetchAvailablePeriods() {
  const { data, error } = await supabase
    .from('vw_ranking_historico')
    .select('mes, ano')
    .order('ano', { ascending: false })
    .order('mes', { ascending: false });
  if (error) console.error('[ranking.service] periods:', error);
  return data ?? [];
}
