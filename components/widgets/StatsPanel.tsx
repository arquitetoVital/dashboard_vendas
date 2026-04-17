import React from 'react';
import { DollarSign, Hash } from 'lucide-react';
import { DashboardMetrics } from '../../types';
import GoalGauge from './GoalGauge';
import MetricCard from './MetricCard';
import RunRateCard from './RunRateCard';

interface StatsPanelProps {
  metrics: DashboardMetrics;
  selectedMonth: string;
  onMetricClick?: (day: 'today' | 'yesterday', type: 'value' | 'volume') => void;
}

export default function StatsPanel({ metrics, selectedMonth, onMetricClick }: StatsPanelProps) {
  return (
    <div className="flex flex-col gap-2 md:gap-3 xl:gap-3 w-full lg:h-full lg:overflow-hidden">
      {/* Gauge Central */}
      <div className="flex-none lg:flex-[5] min-h-[250px] md:min-h-0 flex items-center justify-center bg-slate-950/40 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-inner p-2 overflow-hidden tv-glow">
        <GoalGauge metrics={metrics} />
      </div>

      {/* Layout Responsivo: 1 coluna no mobile, 2 no desktop */}
      <div className="flex-none lg:flex-[5] min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        {/* Coluna Esquerda - MetricCards empilhados */}
        <div className="flex flex-col gap-4 h-full">
          <MetricCard
            title="Venda Diária"
            icon={DollarSign}
            today={metrics.valor_hoje}
            yesterday={metrics.valor_ontem}
            colorClass="bg-emerald-500"
            isCurrency={true}
            onTodayClick={() => onMetricClick?.('today', 'value')}
            onYesterdayClick={() => onMetricClick?.('yesterday', 'value')}
          />
          <MetricCard
            title="Volume de Pedidos"
            icon={Hash}
            today={metrics.pv_hoje}
            yesterday={metrics.pv_ontem}
            colorClass="bg-blue-500"
            isCurrency={false}
            onTodayClick={() => onMetricClick?.('today', 'volume')}
            onYesterdayClick={() => onMetricClick?.('yesterday', 'volume')}
          />
        </div>

        {/* Coluna Direita - Ritmo de Meta */}
        <div className="h-full">
          <RunRateCard metrics={metrics} selectedMonth={selectedMonth} />
        </div>
      </div>
    </div>
  );
}
