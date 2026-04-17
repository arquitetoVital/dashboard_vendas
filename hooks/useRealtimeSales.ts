import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Sale } from '../types';

interface Options {
  enabled: boolean;
  selectedPeriod: string;
  onNewSale: (sale: Sale) => void;
  onRefresh: () => void;
}

export function useRealtimeSales({ enabled, selectedPeriod, onNewSale, onRefresh }: Options) {
  const periodRef = useRef(selectedPeriod);
  useEffect(() => { periodRef.current = selectedPeriod; }, [selectedPeriod]);

  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel('realtime-vendas-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vendas' }, (payload) => {
        const raw = payload.new as any;
        let saleMonthRef = '';
        if (raw.mes_referencia && raw.ano_referencia) {
          saleMonthRef = `${raw.ano_referencia}-${String(raw.mes_referencia).padStart(2, '0')}-01`;
        } else if (raw.data_venda) {
          saleMonthRef = `${raw.data_venda.substring(0, 7)}-01`;
        }
        const current = periodRef.current;
        if (saleMonthRef === current || current.includes('_')) {
          onNewSale(raw as Sale);
          setTimeout(onRefresh, 500);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [enabled, onNewSale, onRefresh]);
}
