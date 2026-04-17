import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { CurrencyFormatter } from '../../lib/formatters';

interface DetailModalProps {
  show: boolean;
  day: 'today' | 'yesterday';
  data: Array<{ nome: string; total: number; pedidos: number }>;
  loading: boolean;
  onClose: () => void;
}

export default function DetailModal({ show, day, data, loading, onClose }: DetailModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-lg md:text-3xl font-black uppercase tracking-widest">
            Performance de {day === 'today' ? 'Hoje' : 'Ontem'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {loading ? (
            <Loader2 className="animate-spin mx-auto my-12 text-blue-500" size={40} />
          ) : (
            <div className="space-y-3">
              {data.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                  <span className="font-bold text-sm md:text-base">{idx + 1}º {item.nome}</span>
                  <span className="font-black text-sm md:text-lg">{CurrencyFormatter.format(item.total)}</span>
                </div>
              ))}
              {data.length === 0 && (
                <p className="text-center text-slate-500 font-bold uppercase tracking-widest py-12">
                  Nenhuma venda registrada.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
