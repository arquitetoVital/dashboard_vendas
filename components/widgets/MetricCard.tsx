import React from 'react';
import { CurrencyFormatter } from '../../lib/formatters';

interface MetricCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  today: number;
  yesterday: number;
  colorClass: string;
  isCurrency?: boolean;
  onTodayClick?: () => void;
  onYesterdayClick?: () => void;
  className?: string;
}

export default function MetricCard({
  title,
  icon: Icon,
  today,
  yesterday,
  colorClass,
  isCurrency = false,
  onTodayClick,
  onYesterdayClick,
  className = "",
}: MetricCardProps) {
  const format = (val: number) => isCurrency ? CurrencyFormatter.format(val) : String(Math.floor(val));

  return (
    <div className={`flex flex-col bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl flex-1 min-h-[100px] md:min-h-0 shadow-2xl transition-all hover:border-white/20 ${className}`}>
      <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center gap-3 shrink-0">
        <div className={`flex items-center justify-center w-5 h-5 rounded-xl ${colorClass} bg-opacity-20`}>
          <Icon className={`w-3 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <span className="text-[10px] md:text-[12px] lg:text-[14px] xl:text-[16px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-white/5 flex-1 min-h-0">
        <button
          onClick={onTodayClick}
          disabled={!onTodayClick}
          className={`flex flex-col justify-center items-center py-0.5 px-1 xl:py-1 xl:px-1.5 transition-all group ${onTodayClick ? 'hover:bg-emerald-500/5 cursor-pointer active:scale-95' : ''}`}
        >
          <span className="text-[9px] md:text-[11px] lg:text-[13px] xl:text-[15px] font-black text-emerald-500 uppercase tracking-widest mb-1">Hoje</span>
          <span className="text-[18px] md:text-[20px] lg:text-[32px] xl:text-[32px] font-black text-white leading-tight tracking-tightest whitespace-nowrap px-1">
            {format(today || 0)}
          </span>
        </button>
        <button
          onClick={onYesterdayClick}
          disabled={!onYesterdayClick}
          className={`flex flex-col justify-center items-center py-0.5 px-1 xl:py-1 xl:px-1.5 transition-all group ${onYesterdayClick ? 'hover:bg-blue-500/5 cursor-pointer active:scale-95' : ''}`}
        >
          <span className="text-[9px] md:text-[11px] lg:text-[13px] xl:text-[15px] font-black text-slate-500 uppercase tracking-widest mb-1">Ontem</span>
          <span className="text-[16px] md:text-[18px] lg:text-[22px] xl:text-[28px] font-bold text-slate-500 leading-tight tracking-tightest whitespace-nowrap px-1">
            {format(yesterday || 0)}
          </span>
        </button>
      </div>
    </div>
  );
}
