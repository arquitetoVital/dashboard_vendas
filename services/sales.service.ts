import { supabase } from '../lib/supabase';

export async function fetchSalesByDate(dateStr: string) {
  const { data, error } = await supabase
    .from('vendas').select('id, valor_pedido, vendedor_nome_origem, cliente, data_venda')
    .eq('data_venda', dateStr)
    .not('status', 'in', '("DELETADO","CANCELADO")');
  if (error) console.error('[sales.service] byDate:', error);
  return data ?? [];
}

export async function fetchSalesByDayGrouped(dateStr: string) {
  const { data, error } = await supabase
    .from('vendas').select('id, vendedor_nome_origem, valor_pedido')
    .eq('data_venda', dateStr);
  if (error) console.error('[sales.service] grouped:', error);
  return data ?? [];
}

interface SalespersonOrdersParams {
  codigoOmie?: string | null;
  nomeExibicao: string;
  period: string;
}

export async function fetchSalespersonOrders({ codigoOmie, nomeExibicao, period }: SalespersonOrdersParams) {
  let query = codigoOmie
    ? supabase.from('vendas').select('*').eq('codigo_vendedor_omie', codigoOmie)
    : supabase.from('vendas').select('*').or(
        `vendedor_nome_origem.ilike.%${nomeExibicao}%,vendedor_oficial.ilike.%${nomeExibicao}%`
      );

  if (period === '6_MONTHS') {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    query = query.gte('data_venda', `${year}-${month}-${day}`);
  } else if (period === 'ANNUAL_2026') {
    query = query.eq('ano_referencia', 2026);
  } else {
    const parts = period.split('-');
    query = query.eq('ano_referencia', Number(parts[0])).eq('mes_referencia', String(Number(parts[1])));
  }

  const { data, error } = await query
    .not('status', 'in', '("DELETADO","CANCELADO")')
    .order('data_venda', { ascending: false });
  if (error) console.error('[sales.service] salesperson:', error);
  return data ?? [];
}
