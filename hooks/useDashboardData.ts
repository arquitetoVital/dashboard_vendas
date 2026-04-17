import { useState, useCallback } from 'react';
import { DashboardMetrics, Salesperson } from '../types';
import { fetchKpiGlobal, fetchHistoricoEmpresa } from '../services/kpi.service';
import { fetchRankingHistorico, fetchParticipacaoVendedores } from '../services/ranking.service';
import { fetchSalesByDate } from '../services/sales.service';

export const DEFAULT_METRICS: DashboardMetrics = {
  pv_hoje: 0, pv_ontem: 0, pv_mes: 0, pv_mes_passado: 0,
  valor_hoje: 0, valor_ontem: 0, valor_mes: 0, valor_mes_passado: 0,
  meta_global: 0, percentual_meta_global: 0, total_vendedores: 0,
};

function mapRow(p: any): Salesperson {
  const display = p.vendedor_display || p.nome_exibicao || '';
  return {
    nome_exibicao: display,
    codigo_omie: p.codigo_omie ?? null,
    avatar_url: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(display)}&background=random&color=fff&size=256&bold=true`,
    total_pedidos: Number(p.total_pedidos || 0),
    total_vendas: Number(p.total_vendido || p.total_vendas || 0),
    meta_individual: Number(p.meta_individual || 0),
    percentual_atingido: Number(p.pct_meta_atingida ?? p.percentual_atingido ?? 0),
    pct_participacao: Number(p.pct_participacao || 0),
    status_meta: p.status_meta ?? null,
    ativo: p.ativo ?? true,
  };
}

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEFAULT_METRICS);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = useCallback(async (period: string, silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    try {
      const now = new Date();
      const currentMes = now.getMonth() + 1;
      const currentAno = now.getFullYear();
      const isRange = period.includes('_');
      let targetMes = currentMes;
      let targetAno = currentAno;
      if (!isRange) {
        const parts = period.split('-');
        targetAno = Number(parts[0]);
        targetMes = Number(parts[1]);
      }
      const isCurrentMonth = !isRange && targetMes === currentMes && targetAno === currentAno;

      // --- KPI ---
      if (isCurrentMonth) {
        // Formata data local YYYY-MM-DD sem usar UTC (evita reset às 21h)
        const toLocalDateString = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const todayStr = toLocalDateString(now);
        const yest = new Date(now); 
        yest.setDate(yest.getDate() - 1);
        const yesterdayStr = toLocalDateString(yest);
        
        const prevMes = currentMes === 1 ? 12 : currentMes - 1;
        const prevAno = currentMes === 1 ? currentAno - 1 : currentAno;

        const [kpi, todaySalesRaw, yesterdaySalesRaw, prevMonthData] = await Promise.all([
          fetchKpiGlobal(),
          fetchSalesByDate(todayStr),
          fetchSalesByDate(yesterdayStr),
          fetchHistoricoEmpresa({ mes: prevMes, ano: prevAno }),
        ]);

        // De-duplicate sales by ID and content (Value, Client, Date)
        const deDuplicate = (sales: any[]) => {
          const seenIds = new Set();
          const seenContent = new Set();
          return sales.filter(s => {
            if (seenIds.has(s.id)) return false;
            
            // Content key: Value + Client + Date
            const contentKey = `${s.valor_pedido}_${s.cliente}_${s.data_venda}`;
            if (seenContent.has(contentKey)) return false;
            
            seenIds.add(s.id);
            seenContent.add(contentKey);
            return true;
          });
        };

        const todaySales = deDuplicate(todaySalesRaw);
        const yesterdaySales = deDuplicate(yesterdaySalesRaw);

        const prevMonth = prevMonthData[0] ?? null;

        if (kpi) {
          const valorMes = Number(kpi.total_vendido_empresa) || 0;
          const pvMes = Number(kpi.total_pedidos_empresa) || 0;
          const metaGlobal = Number(kpi.meta_global || kpi.meta_global_empresa) || 29000000;

          setMetrics({
            valor_mes: valorMes,
            pv_mes: pvMes,
            meta_global: metaGlobal,
            percentual_meta_global: metaGlobal > 0 ? (valorMes / metaGlobal) * 100 : 0,
            total_vendedores: Number(kpi.vendedores_ativos) || 0,
            valor_hoje: todaySales.reduce((s: number, r: any) => s + Number(r.valor_pedido), 0),
            pv_hoje: todaySales.length,
            valor_ontem: yesterdaySales.reduce((s: number, r: any) => s + Number(r.valor_pedido), 0),
            pv_ontem: yesterdaySales.length,
            valor_mes_passado: Number(prevMonth?.total_vendido) || 0,
            pv_mes_passado: Number(prevMonth?.total_pedidos) || 0,
          });
        } else { setMetrics(DEFAULT_METRICS); }

      } else if (isRange) {
        const getSixMonthsAgoDate = () => {
          const d = new Date();
          d.setMonth(d.getMonth() - 5);
          d.setDate(1);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        let hist: any[] = [];
        if (period === '6_MONTHS') {
          hist = await fetchHistoricoEmpresa({ fromDate: getSixMonthsAgoDate() });
        } else if (period.startsWith('ANNUAL_')) {
          const year = Number(period.split('_')[1]);
          hist = await fetchHistoricoEmpresa({ exactAno: year });
        } else if (period.startsWith('SEMESTER_')) {
          const parts = period.split('_');
          const sem = Number(parts[1]);
          const year = Number(parts[2]);
          const allYear = await fetchHistoricoEmpresa({ exactAno: year });
          hist = allYear.filter(h => sem === 1 ? h.mes <= 6 : h.mes >= 7);
        }

        if (hist.length > 0) {
          const agg = hist.reduce((a: any, c: any) => {
            return {
              valor_mes: a.valor_mes + (Number(c.total_vendido || 0)),
              pv_mes: a.pv_mes + (Number(c.total_pedidos || 0)),
              meta_global: a.meta_global + (Number(c.meta_global || 0)),
              total_vendedores: Math.max(a.total_vendedores, (Number(c.vendedores_ativos || 0))),
            };
          }, { valor_mes: 0, pv_mes: 0, meta_global: 0, total_vendedores: 0 });
          setMetrics({ ...DEFAULT_METRICS, ...agg, percentual_meta_global: agg.meta_global > 0 ? (agg.valor_mes / agg.meta_global) * 100 : 0 });
        } else { setMetrics(DEFAULT_METRICS); }

      } else {
        const [hist] = await Promise.all([
          fetchHistoricoEmpresa({ mes: targetMes, ano: targetAno }),
        ]);

        const d = hist[0] ?? null;
        if (d) {
          const valorMes = Number(d.total_vendido) || 0;
          const pvMes = Number(d.total_pedidos) || 0;
          const metaGlobal = Number(d.meta_global) || (targetMes === 3 && targetAno === 2026 ? 29000000 : 0);

          setMetrics({
            ...DEFAULT_METRICS,
            valor_mes: valorMes,
            pv_mes: pvMes,
            meta_global: metaGlobal,
            percentual_meta_global: metaGlobal > 0 ? (valorMes / metaGlobal) * 100 : 0,
            total_vendedores: Number(d.vendedores_ativos) || 0,
          });
        } else { setMetrics(DEFAULT_METRICS); }
      }

      // --- RANKING ---
      if (isRange) {
        let minAno = new Date().getFullYear() - 1;
        if (period.includes('_')) {
          const parts = period.split('_');
          const lastPart = parts[parts.length - 1];
          if (!isNaN(Number(lastPart))) minAno = Number(lastPart);
        }

        const rankData = await fetchRankingHistorico({ minAno });
        let filtered = rankData;
        
        if (period === '6_MONTHS') {
          const valid = new Set<string>();
          for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            valid.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
          }
          filtered = rankData.filter((r: any) => valid.has(`${r.ano}-${r.mes}`));
        } else if (period.startsWith('ANNUAL_')) {
          const year = Number(period.split('_')[1]);
          filtered = rankData.filter((r: any) => r.ano === year);
        } else if (period.startsWith('SEMESTER_')) {
          const parts = period.split('_');
          const sem = Number(parts[1]);
          const year = Number(parts[2]);
          filtered = rankData.filter((r: any) => r.ano === year && (sem === 1 ? r.mes <= 6 : r.mes >= 7));
        }
        const grouped = filtered.reduce((acc: any, curr: any) => {
          const key = curr.codigo_omie || curr.vendedor_display;
          if (!acc[key]) acc[key] = { ...curr, _tv: 0, _tp: 0, _mi: 0 };
          acc[key]._tv += Number(curr.total_vendido || 0);
          acc[key]._tp += Number(curr.total_pedidos || 0);
          acc[key]._mi += Number(curr.meta_individual || 0);
          return acc;
        }, {});
        setSalespeople(
          Object.values(grouped)
            .map((p: any) => ({
              ...mapRow({ ...p, total_vendido: p._tv, total_pedidos: p._tp, meta_individual: p._mi }),
              percentual_atingido: p._mi > 0 ? (p._tv / p._mi) * 100 : 0,
            }))
            .filter((p: any) => p.total_vendas > 0 && p.ativo !== false)
            .sort((a: any, b: any) => b.total_vendas - a.total_vendas)
        );
      } else {
        const [rankData, participacaoData] = await Promise.all([
          fetchRankingHistorico({ mes: targetMes, ano: targetAno }),
          fetchParticipacaoVendedores(targetMes, targetAno)
        ]);

        const merged = rankData.map((r: any) => {
          const part = participacaoData.find((p: any) => 
            (p.codigo_omie && p.codigo_omie === r.codigo_omie) || 
            (p.nome_exibicao && p.nome_exibicao === r.nome_exibicao)
          );
          return { ...r, pct_participacao: part?.pct_participacao || 0 };
        });

        setSalespeople(
          merged
            .filter((p: any) => Number(p.total_vendido || 0) > 0 && p.ativo !== false)
            .map(mapRow)
        );
      }

      setLastUpdated(new Date());
    } catch (e) {
      console.error('[useDashboardData]', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  return { metrics, salespeople, loading, isRefreshing, lastUpdated, fetchData };
}
