import React, { useRef, useState, useEffect } from 'react';
import { Salesperson } from '../../types';
import { CurrencyFormatter } from '../../lib/formatters';
import { GOAL_COLORS } from '../../constants';

interface LeaderboardProps {
  salespeople: Salesperson[];
  onSalespersonClick?: (salesperson: Salesperson) => void;
}

export default function Leaderboard({ salespeople, onSalespersonClick }: LeaderboardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sortedSalespeople = [...salespeople].sort((a, b) => (b.total_vendas || 0) - (a.total_vendas || 0));

  const topThree = sortedSalespeople.slice(0, 3);
  const others = sortedSalespeople.slice(3);
  
  // For desktop scrolling, we use a duplicated list of the remaining salespeople
  const scrollList = others.length > 0 ? [...others, ...others, ...others] : [];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || isMobile || others.length <= 3) return;
    
    let animationFrameId: number;
    let accumulatedScroll = 0;
    const scrollSpeed = 0.5; // Adjust speed as needed

    const scrollLoop = () => {
      if (!isPaused && container) {
        accumulatedScroll += scrollSpeed;
        if (accumulatedScroll >= 1) {
          container.scrollTop += Math.floor(accumulatedScroll);
          accumulatedScroll %= 1;
        }

        const listUnitHeight = container.scrollHeight / 3;
        if (container.scrollTop >= listUnitHeight * 2) {
          container.scrollTop = listUnitHeight;
        }
      }
      animationFrameId = requestAnimationFrame(scrollLoop);
    };

    animationFrameId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isMobile, others.length]);

  const renderRow = (person: Salesperson, rank: number, key: string) => {
    const percentualAtingido = Number(person.percentual_atingido || 0);
    const fillWidth = Math.min(percentualAtingido, 100);
    const colors = GOAL_COLORS.getBySalesperson(percentualAtingido);
    const isTopThree = rank <= 3;

    return (
      <button
        key={key}
        onClick={() => onSalespersonClick?.(person)}
        className={`relative w-full rounded-xl overflow-hidden border mb-2 bg-[#151c2c] transition-all duration-300 text-left outline-none focus:ring-2 focus:ring-blue-500 ${onSalespersonClick ? 'hover:border-blue-400/60 cursor-pointer active:scale-[0.99]' : ''} ${isTopThree ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.01]' : colors.border}`}
      >
        <div className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out ${colors.bg}`} style={{ width: `${fillWidth}%` }}>
          <div className={`absolute inset-y-0 right-0 w-1 ${colors.bar} ${colors.shadow}`}></div>
        </div>
        <div className="relative z-10 flex items-center p-3 gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black shrink-0 ${rank === 1 ? 'bg-yellow-500 text-slate-900 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : rank === 2 ? 'bg-slate-300 text-slate-900' : rank === 3 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {rank}º
          </div>
          <img
            src={person.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.nome_exibicao)}&background=random&color=fff&size=256&bold=true`}
            className={`w-12 h-12 rounded-full border object-cover aspect-square shadow-lg shrink-0 ${isTopThree ? 'border-blue-400' : 'border-slate-700'}`}
            alt={person.nome_exibicao}
          />
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-white leading-tight ${isTopThree ? 'text-base md:text-lg' : 'text-sm md:text-base'} ${isMobile ? '' : 'truncate'}`}>
              {person.nome_exibicao}
            </p>
            
            {isMobile ? (
              <div className="mt-1 flex flex-col gap-1">
                <div className="flex items-center gap-x-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Pedidos:</span>
                    <span className="text-[10px] text-white font-black">{person.total_pedidos}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Meta:</span>
                    <span className={`text-[10px] font-black ${colors.text}`}>{percentualAtingido.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-x-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Part.:</span>
                    <span className="text-[10px] text-blue-400 font-black">{(person.pct_participacao || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Total:</span>
                    <span className="text-[10px] text-white font-black">{CurrencyFormatter.format(person.total_vendas || 0)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-[10px] md:text-[12px] xl:text-[14px] text-slate-500 font-bold uppercase">{person.total_pedidos} pedidos</p>
                <span className="text-slate-700 text-[8px] md:text-[10px]">•</span>
                <p className={`text-[10px] md:text-[12px] xl:text-[14px] font-black uppercase ${colors.text}`}>{percentualAtingido.toFixed(1)}% Meta</p>
                <span className="text-slate-700 text-[8px] md:text-[10px]">•</span>
                <p className="text-[10px] md:text-[12px] xl:text-[14px] font-black uppercase text-blue-400">{(person.pct_participacao || 0).toFixed(1)}% Part.</p>
              </div>
            )}
          </div>
          
          {!isMobile && (
            <div className={`text-right font-black text-white whitespace-nowrap ${isTopThree ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>
              {CurrencyFormatter.format(person.total_vendas || 0)}
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div 
      className="flex flex-col min-h-[600px] lg:h-full bg-slate-900/80 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl transition-all hover:border-white/20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="px-6 py-5 bg-white/5 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest flex items-center gap-3">🏆 Ranking</h2>
        <span className="text-[10px] font-black bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 text-blue-400 uppercase tracking-widest">
          {salespeople.length} Vendedores
        </span>
      </div>

      {/* Top 3 Fixed Section - Only on Desktop */}
      {topThree.length > 0 && !isMobile && (
        <div className="p-4 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Destaques do Pódio</span>
          </div>
          {topThree.map((p, i) => renderRow(p, i + 1, `top-${p.nome_exibicao}-${i}`))}
        </div>
      )}
      
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-slate-900/50 to-transparent z-10 pointer-events-none"></div>
        {isMobile ? (
          <div className="h-[500px] overflow-y-auto p-4 hide-scrollbar">
            {sortedSalespeople.map((p, i) => renderRow(p, i + 1, `mobile-${p.nome_exibicao}-${i}`))}
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="h-full overflow-y-auto p-4 hide-scrollbar"
          >
            {scrollList.map((p, i) => {
              const baseRank = 4;
              const othersCount = others.length || 1;
              const rank = (i % othersCount) + baseRank;
              return renderRow(p, rank, `scroll-${p.nome_exibicao}-${i}`);
            })}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-900/50 to-transparent z-10 pointer-events-none"></div>
      </div>
    </div>
  );
}
