import React from 'react';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardMetrics } from '../../types';
import { CurrencyFormatter } from '../../lib/formatters';
import { getWorkingDaysInMonth, getWorkingDaysPassed } from '../../lib/workdays';

interface RunRateCardProps {
  metrics: DashboardMetrics;
  selectedMonth: string;
}

export default function RunRateCard({ metrics, selectedMonth }: RunRateCardProps) {
  const isRange = selectedMonth.includes('_');

  let totalDays = 0;
  let passedDays = 0;
  const now = new Date();

  if (isRange) {
    if (selectedMonth === 'ANNUAL_2026') {
      totalDays = getWorkingDaysInMonth(2026, 0) * 12;
      if (now.getFullYear() > 2026) {
        passedDays = totalDays;
      } else if (now.getFullYear() < 2026) {
        passedDays = 0;
      } else {
        passedDays = 0;
        for (let m = 0; m < now.getMonth(); m++) passedDays += getWorkingDaysInMonth(2026, m);
        passedDays += getWorkingDaysPassed(2026, now.getMonth());
      }
    } else {
      // 6 months
      totalDays = 0;
      passedDays = 0;
      const start = new Date();
      start.setMonth(start.getMonth() - 5);
      start.setDate(1);

      for (let i = 0; i < 6; i++) {
        const d = new Date(start);
        d.setMonth(d.getMonth() + i);
        const mTotal = getWorkingDaysInMonth(d.getFullYear(), d.getMonth());
        totalDays += mTotal;

        if (d.getFullYear() < now.getFullYear() || (d.getFullYear() === now.getFullYear() && d.getMonth() < now.getMonth())) {
          passedDays += mTotal;
        } else if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
          passedDays += getWorkingDaysPassed(d.getFullYear(), d.getMonth());
        }
      }
    }
  } else {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthIndex = month - 1;
    totalDays = getWorkingDaysInMonth(year, monthIndex);

    if (year < now.getFullYear() || (year === now.getFullYear() && monthIndex < now.getMonth())) {
      passedDays = totalDays;
    } else if (year === now.getFullYear() && monthIndex === now.getMonth()) {
      passedDays = getWorkingDaysPassed(year, monthIndex);
    } else {
      passedDays = 0;
    }
  }

  const idealDaily = metrics.meta_global / Math.max(totalDays, 1);
  const currentDaily = metrics.valor_mes / Math.max(passedDays, 1);
  const isAbove = currentDaily >= idealDaily;
  const showRunRate = passedDays > 0;

  return (
    <div className="flex flex-col bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl h-full min-h-[240px] md:min-h-0 shadow-2xl transition-all hover:border-white/20">
      <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-xl bg-blue-500 bg-opacity-20">
            <Calendar className="w-3 md:w-4 text-blue-500" />
          </div>
          <span className="text-[10px] md:text-[14px] lg:text-[16px] xl:text-[18px] font-black text-slate-400 uppercase tracking-[0.2em]">Ritmo de Meta</span>
        </div>
        {showRunRate && (
          <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${isAbove ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} border ${isAbove ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
            {isAbove ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
              {isAbove ? 'No Ritmo' : 'Abaixo'}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col divide-y divide-white/5 flex-1 min-h-0">
        <div className="flex-1 flex flex-col justify-center items-center py-1.5 px-3 xl:py-2.5 xl:px-4 text-center">
          <span className="text-[10px] md:text-[12px] lg:text-[14px] xl:text-[16px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Meta Diária Ideal</span>
          <span className="text-[22px] md:text-[26px] lg:text-[32px] xl:text-[42px] font-black text-white leading-tight tracking-tightest whitespace-nowrap px-1">
            {CurrencyFormatter.format(idealDaily)}
          </span>
          <div className="mt-1.5 flex items-center gap-2 opacity-40">
            <div className="h-px w-2 bg-slate-600"></div>
            <span className="text-[10px] md:text-[12px] lg:text-[14px] xl:text-[16px] text-slate-400 uppercase font-black tracking-widest">Base: {Math.round(totalDays)}d úteis</span>
            <div className="h-px w-2 bg-slate-600"></div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center py-1.5 px-3 xl:py-2.5 xl:px-4 text-center">
          <span className={`text-[10px] md:text-[12px] lg:text-[14px] xl:text-[16px] font-black uppercase tracking-[0.2em] mb-1 ${isAbove ? 'text-emerald-500' : 'text-red-500'}`}>
            Média Real {isRange ? 'Período' : 'Atual'}
          </span>
          <span className={`text-[22px] md:text-[26px] lg:text-[32px] xl:text-[42px] font-black leading-tight tracking-tightest whitespace-nowrap px-1 ${isAbove ? 'text-emerald-400' : 'text-red-400'}`}>
            {CurrencyFormatter.format(currentDaily)}
          </span>
          <div className="mt-1.5 flex items-center gap-2 opacity-40">
            <div className="h-px w-2 bg-slate-600"></div>
            <span className="text-[10px] md:text-[12px] lg:text-[14px] xl:text-[16px] text-slate-400 uppercase font-black tracking-widest">Base: {Math.round(passedDays)}d decorridos</span>
            <div className="h-px w-2 bg-slate-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
