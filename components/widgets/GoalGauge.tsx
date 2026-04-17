import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { DashboardMetrics } from '../../types';
import { CurrencyFormatter, CompactCurrencyFormatter } from '../../lib/formatters';

interface GoalGaugeProps {
  metrics: DashboardMetrics;
}

export default function GoalGauge({ metrics }: GoalGaugeProps) {
  const [animatedPct, setAnimatedPct] = useState(0);

  const percentage = Number(metrics.percentual_meta_global || 0);
  const visualPercentage = Math.min(Math.max(percentage, 0), 100);
  const dashOffset = 100 - visualPercentage;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPct(Math.floor(percentage));
    }, 500);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-0 relative">
      <div className="relative w-full max-w-[580px] aspect-[1/0.85] flex flex-col items-center justify-center">
        <svg viewBox="0 0 200 150" className="w-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] max-w-[200px] md:max-w-[300px] xl:max-w-[360px] mx-auto">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <path
            d="M 40 130 A 75 75 0 1 1 160 130"
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
          />

          <path
            d="M 40 130 A 75 75 0 1 1 160 130"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            filter="url(#glow)"
            className="transition-all duration-[2000ms] ease-out"
          />

          <g transform="translate(100, 95)">
            <text textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="42" fontWeight="900" className="tracking-tighter">
              {animatedPct}
            </text>
            <text x={animatedPct >= 100 ? "40" : "30"} y="-4" textAnchor="start" dominantBaseline="middle" fill="#94a3b8" fontSize="15" fontWeight="900">
              %
            </text>
          </g>
        </svg>

        <div className="w-full flex flex-col gap-1 md:gap-2 mt-1 xl:mt-2 px-4 md:px-8">
          <div className="flex justify-between items-end border-b border-white/5 pb-2 md:pb-3 gap-x-2 md:gap-x-12">
            <div className="flex flex-col items-start shrink-0">
              <span className="text-[8px] md:text-[12px] xl:text-[14px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Venda Total</span>
              <span className="text-[14px] sm:text-[18px] md:text-[28px] xl:text-[36px] font-black text-white tracking-tightest leading-none px-0.5">
                {CurrencyFormatter.format(metrics.valor_mes || 0)}
              </span>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-[8px] md:text-[12px] xl:text-[14px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Meta</span>
              <span className="text-[14px] sm:text-[18px] md:text-[28px] xl:text-[36px] font-black text-blue-400 tracking-tightest leading-none px-0.5">
                {CompactCurrencyFormatter.format(metrics.meta_global || 0)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-slate-400 px-0.5 mt-1">
            <div className="flex items-center gap-3 md:gap-10">
              <div className="flex items-center gap-2">
                <History className="text-slate-600 w-3 h-3 md:w-4 md:h-4" />
                <div className="flex flex-col">
                  <span className="text-[7px] md:text-[10px] xl:text-[12px] font-black uppercase tracking-widest text-slate-600 leading-none mb-0.5">Mês Passado</span>
                  <span className="text-[11px] md:text-[18px] xl:text-[22px] font-bold font-mono text-slate-400 tracking-tight">
                    {CurrencyFormatter.format(metrics.valor_mes_passado || 0)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col border-l border-white/5 pl-3 md:pl-10">
                <span className="text-[7px] md:text-[10px] xl:text-[12px] font-black uppercase tracking-widest text-slate-600 leading-none mb-0.5">Pedidos M.P.</span>
                <span className="text-[11px] md:text-[18px] xl:text-[22px] font-black text-slate-200 font-mono tracking-tight">
                  {metrics.pv_mes_passado || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
