import React from 'react';
import { X, Loader2, Hash, Calendar, User, ShoppingBag, TrendingUp } from 'lucide-react';
import { Salesperson } from '../../types';
import { CurrencyFormatter, formatDate } from '../../lib/formatters';

interface SalespersonModalProps {
  show: boolean;
  salesperson: Salesperson | null;
  data: any[];
  loading: boolean;
  onClose: () => void;
}

export default function SalespersonModal({ show, salesperson, data, loading, onClose }: SalespersonModalProps) {
  if (!show) return null;

  const activeOrders = data.filter(d => d.status !== 'CANCELADO');
  const cancelledOrders = data.filter(d => d.status === 'CANCELADO');
  const totalActive = activeOrders.reduce((acc, curr) => acc + (Number(curr.valor_pedido) || 0), 0);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-4">
            <img
              src={salesperson?.avatar_url || ''}
              className="w-12 h-12 rounded-full border border-slate-700"
              alt=""
            />
            <div>
              <h2 className="text-lg md:text-2xl font-black uppercase tracking-widest text-white">
                {salesperson?.nome_exibicao}
              </h2>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Vendas do Período</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-500" size={48} />
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Buscando pedidos...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-24 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
              <ShoppingBag size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Nenhum pedido encontrado no período.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.map((item, idx) => {
                const isCancelado = item.status === 'CANCELADO';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col p-5 rounded-3xl border transition-all gap-4 group ${
                      isCancelado 
                        ? 'bg-red-500/5 border-red-500/20 opacity-60' 
                        : 'bg-white/5 border-white/10 hover:border-blue-500/40 hover:bg-white/10 shadow-xl'
                    }`}
                  >
                    {/* Top Row: Order ID & Date */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${isCancelado ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                          <Hash size={14} className={isCancelado ? 'text-red-400' : 'text-blue-400'} />
                        </div>
                        <span className={`font-mono font-black text-sm ${isCancelado ? 'text-red-400' : 'text-blue-400'}`}>
                          #{item.pv || '---'}
                        </span>
                        {isCancelado && (
                          <span className="text-[9px] font-black uppercase bg-red-500/20 text-red-400 px-2 py-1 rounded-lg">Cancelado</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {item.data_venda ? formatDate(item.data_venda) : '---'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Customer */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <User size={10} className="text-slate-600" />
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Cliente</span>
                      </div>
                      <p className="text-white font-bold text-base md:text-lg truncate leading-tight">
                        {item.cliente || 'Consumidor Final'}
                      </p>
                    </div>

                    {/* Bottom Row: Value & Status */}
                    <div className="flex justify-between items-end pt-4 border-t border-white/5 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Valor do Pedido</span>
                        <span className={`text-xl md:text-2xl font-black tracking-tighter ${
                          isCancelado ? 'text-red-400/50 line-through' : 'text-emerald-400'
                        }`}>
                          {CurrencyFormatter.format(item.valor_pedido)}
                        </span>
                      </div>
                      {isCancelado && (
                        <div className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border bg-red-500/10 text-red-400 border-red-500/20">
                          Estornado
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 bg-slate-800/50 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-12">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag size={12} className="text-slate-500" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Pedidos</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-white">{activeOrders.length}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={12} className="text-emerald-500" />
                <span className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest">Valor Total</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-emerald-500 tracking-tighter">
                {CurrencyFormatter.format(totalActive)}
              </span>
            </div>
            {cancelledOrders.length > 0 && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <X size={12} className="text-red-500" />
                  <span className="text-[10px] text-red-500/70 font-black uppercase tracking-widest">Cancelados</span>
                </div>
                <span className="text-2xl md:text-3xl font-black text-red-400">{cancelledOrders.length}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
}
