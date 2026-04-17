import React, { useState, useMemo } from 'react';
import { Activity, TrendingUp, Zap, Calendar, CheckCircle2, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

interface RawPeriod {
  mes: number;
  ano: number;
}

interface PeriodOption {
  value: string;
  label: string;
  type: 'range' | 'month' | 'year';
  icon: React.ReactNode;
}

interface PeriodSelectorProps {
  selectedPeriod: string;
  rawPeriods: RawPeriod[];
  showSelector: boolean;
  setShowSelector: (v: boolean) => void;
  onSelect: (val: string) => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function buildPeriodOptions(rawPeriods: RawPeriod[]): PeriodOption[] {
  const years = Array.from(new Set(rawPeriods.map(p => p.ano))).sort((a, b) => b - a);
  
  const ranges: PeriodOption[] = [
    { value: '6_MONTHS', label: 'Últimos 6 Meses', type: 'range', icon: <Activity size={14} /> },
  ];

  years.forEach(year => {
    ranges.push({
      value: `ANNUAL_${year}`,
      label: `Ano de ${year}`,
      type: 'year',
      icon: <TrendingUp size={14} />
    });
    ranges.push({
      value: `SEMESTER_1_${year}`,
      label: `1º Semestre ${year}`,
      type: 'range',
      icon: <LayoutGrid size={14} />
    });
    ranges.push({
      value: `SEMESTER_2_${year}`,
      label: `2º Semestre ${year}`,
      type: 'range',
      icon: <LayoutGrid size={14} />
    });
  });

  return ranges;
}

export default function PeriodSelector({
  selectedPeriod,
  rawPeriods,
  showSelector,
  setShowSelector,
  onSelect,
}: PeriodSelectorProps) {
  const [activeTab, setActiveTab] = useState<'ranges' | 'calendar'>('ranges');
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const now = new Date();
  const ranges = useMemo(() => buildPeriodOptions(rawPeriods), [rawPeriods]);
  
  const availableYears = useMemo(() => {
    const years = new Set<number>([now.getFullYear()]);
    rawPeriods.forEach(p => years.add(p.ano));
    return Array.from(years).sort((a, b) => b - a);
  }, [rawPeriods]);

  const handleYearChange = (delta: number) => {
    setViewYear(prev => prev + delta);
  };

  const isSelected = (year: number, month: number) => {
    const val = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    return selectedPeriod === val;
  };

  const handleMonthSelect = (month: number) => {
    const val = `${viewYear}-${String(month + 1).padStart(2, '0')}-01`;
    onSelect(val);
  };

  if (!showSelector) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={() => setShowSelector(false)}></div>
      <div className="absolute top-full right-0 mt-3 w-80 bg-[#0f172a] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header Tabs */}
        <div className="flex border-b border-white/5 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('ranges')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'ranges' ? 'text-blue-400 bg-blue-400/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Períodos
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'calendar' ? 'text-emerald-400 bg-emerald-400/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Calendário
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto max-h-[450px] custom-scrollbar">
          {activeTab === 'ranges' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
                    onSelect(current);
                  }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                >
                  <Zap size={12} /> Mês Atual
                </button>
                <button
                  onClick={() => onSelect('6_MONTHS')}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                >
                  <Activity size={12} /> Semestre
                </button>
              </div>

              <div>
                <span className="px-1 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Análises Consolidadas
                </span>
                <div className="space-y-4">
                  {/* Rolling Range */}
                  <div className="space-y-1">
                    {ranges.filter(r => r.value === '6_MONTHS').map(m => (
                      <button
                        key={m.value}
                        onClick={() => onSelect(m.value)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left w-full group ${selectedPeriod === m.value ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                      >
                        <div className={`p-1.5 rounded-lg ${selectedPeriod === m.value ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'} transition-colors`}>
                          {m.icon}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider flex-1">{m.label}</span>
                        {selectedPeriod === m.value && <CheckCircle2 size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>

                  {/* Yearly Groups */}
                  {Array.from(new Set(ranges.filter(r => r.value !== '6_MONTHS').map(r => r.value.split('_').pop()))).sort((a, b) => Number(b) - Number(a)).map(year => (
                    <div key={year} className="space-y-1">
                      <span className="px-1 text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">
                        Ano {year}
                      </span>
                      {ranges.filter(r => r.value.endsWith(`_${year}`)).map(m => (
                        <button
                          key={m.value}
                          onClick={() => onSelect(m.value)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left w-full group ${selectedPeriod === m.value ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                        >
                          <div className={`p-1.5 rounded-lg ${selectedPeriod === m.value ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'} transition-colors`}>
                            {m.icon}
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider flex-1">{m.label}</span>
                          {selectedPeriod === m.value && <CheckCircle2 size={14} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Year Selector */}
              <div className="flex items-center justify-between mb-4 bg-slate-900/50 rounded-xl p-1 border border-white/5">
                <button
                  onClick={() => handleYearChange(-1)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-black text-white tracking-widest">{viewYear}</span>
                <button
                  onClick={() => handleYearChange(1)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-3 gap-2">
                {MONTH_NAMES.map((month, idx) => {
                  const active = isSelected(viewYear, idx);
                  return (
                    <button
                      key={month}
                      onClick={() => handleMonthSelect(idx)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${active ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400'}`}
                    >
                      {month.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-900/80 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid size={10} className="text-slate-600" />
            <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">v2.6.0 Enterprise</span>
          </div>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-blue-500"></div>
            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
            <div className="w-1 h-1 rounded-full bg-amber-500"></div>
          </div>
        </div>
      </div>
    </>
  );
}

