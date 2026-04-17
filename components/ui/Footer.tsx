import React from 'react';
import { Clock, TrendingUp, Zap, Activity, Monitor } from 'lucide-react';
import { DashboardMetrics } from '../../types';
import { CurrencyFormatter } from '../../lib/formatters';

interface FooterProps {
  currentTime: Date;
  metrics: DashboardMetrics;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function Footer({ currentTime, metrics, isFullscreen, onToggleFullscreen }: FooterProps) {
  return (
    <footer className="next-level-footer h-[6vh] min-h-[45px] flex items-center justify-between px-4 md:px-6 z-50 shrink-0 border-t border-white/10 relative overflow-hidden bg-[#020617]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

      <div className="flex items-center gap-3 md:gap-8 z-10 shrink-0">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="bg-slate-900/80 p-1 md:p-1.5 rounded-lg border border-white/10 text-slate-400">
            <Clock className="w-[12px] h-[12px] md:w-[16px] md:h-[16px]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] md:text-[14px] font-black text-white leading-none">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[7px] md:text-[8px] text-blue-500/70 font-bold uppercase tracking-[0.2em] hidden sm:block">Brasília</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 border-l border-white/10 pl-6">
          <div className="bg-slate-900/80 p-1.5 rounded-lg border border-white/10 text-slate-400">
            <TrendingUp size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-black text-white leading-none">
              +{metrics.percentual_meta_global.toFixed(1)}%
            </span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest opacity-60">
              Meta: {CurrencyFormatter.format(metrics.meta_global || 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center overflow-hidden px-2 md:px-10 relative">
        {/* Gradientes de Máscara (Fade) */}
        <div className="absolute inset-y-0 left-0 w-6 md:w-20 bg-gradient-to-r from-[#020617] to-transparent z-20 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-6 md:w-20 bg-gradient-to-l from-[#020617] to-transparent z-20 pointer-events-none"></div>

        {/* Container da Animação */}
        <div className="ticker-text-scroll flex items-center">
          
          {/* Bloco 1 */}
          <div className="flex flex-row items-center gap-4 md:gap-10 px-4 whitespace-nowrap">
            <div className="flex items-center gap-2 text-[8px] md:text-[14px] font-black uppercase tracking-[0.1em] md:tracking-[0.3em] text-gradient-silver">
              <Zap size={12} className="text-blue-500 shrink-0" />
              <span className="whitespace-nowrap">SISTEMA ATUALIZADO EM TEMPO REAL</span>
            </div>
            
            <span className="text-white/20">•</span>
            
            <div className="flex items-center gap-2 text-[8px] md:text-[14px] font-black uppercase tracking-[0.1em] md:tracking-[0.3em] text-gradient-silver">
              <Activity size={12} className="text-emerald-500 shrink-0" />
              <span className="whitespace-nowrap">NOVAS VENDAS IMPACTAM O RUMO DA META</span>
            </div>
          </div>

          {/* Bloco 2 (Cópia exata para o loop infinito) */}
          <div className="flex flex-row items-center gap-4 md:gap-10 px-4 whitespace-nowrap">
            <div className="flex items-center gap-2 text-[8px] md:text-[14px] font-black uppercase tracking-[0.1em] md:tracking-[0.3em] text-gradient-silver">
              <Zap size={12} className="text-blue-500 shrink-0" />
              <span className="whitespace-nowrap">SISTEMA ATUALIZADO EM TEMPO REAL</span>
            </div>
            
            <span className="text-white/20">•</span>
            
            <div className="flex items-center gap-2 text-[8px] md:text-[14px] font-black uppercase tracking-[0.1em] md:tracking-[0.3em] text-gradient-silver">
              <Activity size={12} className="text-emerald-500 shrink-0" />
              <span className="whitespace-nowrap">NOVAS VENDAS IMPACTAM O RUMO DA META</span>
            </div>
          </div>

        </div>
      </div>

      <div className="flex items-center justify-end gap-2 md:gap-4 z-10 shrink-0">
        <div className="hidden sm:flex items-center gap-2 mr-2 md:mr-4 bg-emerald-500/10 px-2 md:px-3 py-1 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
        </div>
        {!isFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="group flex items-center gap-2 px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all duration-300 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            <Monitor className="w-[12px] h-[12px] md:w-[18px] md:h-[18px]" />
            <span className="text-[8px] md:text-[11px] font-black uppercase tracking-widest hidden xs:inline">Apresentar</span>
          </button>
        )}
      </div>
    </footer>
  );
}
