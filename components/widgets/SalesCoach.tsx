import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { fetchMotivationalQuotes } from '../../services/config.service';
import { MotivationalQuote } from '../../types';
import { QUOTE_ROTATION_MS } from '../../constants';

export default function SalesCoach() {
  const [quotes, setQuotes] = useState<MotivationalQuote[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    fetchMotivationalQuotes().then((data) => {
      if (data && data.length > 0) setQuotes(data);
    });
  }, []);

  useEffect(() => {
    if (quotes.length === 0) return;
    const interval = setInterval(() => setQuoteIndex((p) => (p + 1) % quotes.length), QUOTE_ROTATION_MS);
    return () => clearInterval(interval);
  }, [quotes]);

  const currentQuote = quotes[quoteIndex] || {
    frase: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.',
    autor: 'Robert Collier',
  };

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-3 md:p-4 xl:p-5 shadow-2xl backdrop-blur-xl shrink-0 transition-all hover:border-white/20">
      <div className="flex items-start gap-4">
        <div className="shrink-0 p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500">
          <Sparkles className="animate-pulse w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] md:text-[14px] xl:text-[18px] text-slate-100 font-bold italic leading-relaxed">
            "{currentQuote.frase}"
          </p>
          {currentQuote.autor && currentQuote.autor !== 'Desconhecido' && (
            <span className="text-[8px] md:text-[9px] xl:text-[10px] text-slate-500 uppercase mt-2 font-black block tracking-widest opacity-60">
              - {currentQuote.autor}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
