import React from 'react';
import { Calendar, ChevronDown, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ASSETS } from '../../constants';
import PeriodSelector from './PeriodSelector';

interface RawPeriod {
  mes: number;
  ano: number;
}

interface HeaderProps {
  selectedPeriod: string;
  rawPeriods: RawPeriod[];
  showSelector: boolean;
  setShowSelector: (v: boolean) => void;
  onSelectPeriod: (val: string) => void;
  isRefreshing: boolean;
  lastUpdated: Date;
  onLogout?: () => void;
}

function getPeriodLabel(selectedPeriod: string, rawPeriods: RawPeriod[]): string {
  if (selectedPeriod === '6_MONTHS') return 'Últimos 6 Meses';
  if (selectedPeriod === 'ANNUAL_2026') return 'Ano de 2026';
  const parts = selectedPeriod.split('-');
  if (parts.length >= 2) {
    const mesStr = parts[1].padStart(2, '0');
    const date = new Date(`${parts[0]}-${mesStr}-01T00:00:00`);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
    }
  }
  return 'Selecionar Período';
}

export default function Header({
  selectedPeriod,
  rawPeriods,
  showSelector,
  setShowSelector,
  onSelectPeriod,
  isRefreshing,
  lastUpdated,
  onLogout,
}: HeaderProps) {
  const currentMonthLabel = getPeriodLabel(selectedPeriod, rawPeriods);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await supabase.auth.signOut().then(() => {
        window.location.href = '/'; // Redireciona para a página inicial após logout
      });
    }
  };

  return (
    <header className="h-[7vh] min-h-[60px] md:min-h-[65px] px-4 md:px-6 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl flex justify-between items-center z-50 shrink-0">
      <div className="flex items-center gap-3 md:gap-4">
        <img
          src={ASSETS.LOGO}
          alt="Logo"
          className="h-6 md:h-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        />
        <div className="h-6 w-px bg-white/10 hidden md:block"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/80 hidden md:block">
          Realtime Data Analytics
        </span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative">
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="flex items-center gap-3 bg-slate-900/80 border border-white/10 hover:border-blue-500/50 rounded-xl px-4 py-2 transition-all duration-300 group shadow-lg"
          >
            <Calendar className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">{currentMonthLabel}</span>
            <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-500 ${showSelector ? 'rotate-180' : ''}`} />
          </button>

          <PeriodSelector
            selectedPeriod={selectedPeriod}
            rawPeriods={rawPeriods}
            showSelector={showSelector}
            setShowSelector={setShowSelector}
            onSelect={onSelectPeriod}
          />
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">
              {isRefreshing ? 'Atualizando...' : `Sinc: ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
            </span>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-blue-500 animate-spin' : 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse'}`}></div>
              <span className="text-[10px] md:text-[12px] font-black text-white leading-none uppercase">Online</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-400 transition-colors p-2"
        >
          <LogOut className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
        </button>
      </div>
    </header>
  );
}
