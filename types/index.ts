export interface Sale {
  id: string;
  vendedor_nome_origem: string;
  vendedor_oficial?: string;
  codigo_vendedor_omie?: string;
  cliente: string | null;
  valor_pedido: number;
  data_venda: string;
  mes_referencia?: string;
  ano_referencia?: number;
  created_at: string;
  status: string;
  pv?: string | number;
}

export interface Salesperson {
  nome_exibicao: string;
  codigo_omie?: string;
  avatar_url: string | null;
  total_pedidos: number;
  total_vendas: number;
  meta_individual: number;
  percentual_atingido: number;
  pct_participacao?: number;
  status_meta?: string;
  projecao_fim_mes?: number;
  media_diaria?: number;
  last_sale_time?: Date;
  last_sale_value?: number;
  ativo?: boolean;
}

export interface DashboardMetrics {
  pv_hoje: number;
  pv_ontem: number;
  valor_hoje: number;
  valor_ontem: number;
  pv_mes: number;
  pv_mes_passado: number;
  valor_mes: number;
  valor_mes_passado: number;
  meta_global: number;
  percentual_meta_global: number;
  total_vendedores: number;
}

export interface HistoricalRanking {
  mes: number;
  ano: number;
  mes_referencia: string;
  nome_exibicao: string;
  codigo_omie?: string;
  avatar_url: string | null;
  total_pedidos: number;
  total_vendas: number;
  meta_individual: number;
  percentual_atingido: number;
  status_meta?: string;
  ativo?: boolean;
}

export interface MotivationalQuote {
  id: number;
  frase: string;
  autor: string;
}
