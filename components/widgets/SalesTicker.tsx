import React from 'react';
import { Sale } from '../../types';
import { CurrencyFormatter } from '../../lib/formatters';

interface SalesTickerProps {
  sales: Sale[];
}

const SaleItem: React.FC<{ sale: Sale }> = ({ sale }) => (
  <div className="flex-shrink-0 flex items-center gap-3 bg-slate-900/90 border border-emerald-500/30 rounded-2xl px-6 py-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-3xl">💰</div>
    <div className="flex flex-col">
      <span className="text-emerald-400 font-black text-2xl tracking-tighter leading-none">
        {CurrencyFormatter.format(sale.valor_pedido)}
      </span>
      <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-80 mt-1">
        {sale.vendedor_nome_origem}
      </span>
    </div>
    <div className="ml-4 pl-4 border-l border-white/10">
      <span className="text-[10px] text-slate-500 font-mono font-bold">VENDA REALIZADA</span>
    </div>
  </div>
);

export default function SalesTicker({ sales }: SalesTickerProps) {
  if (sales.length === 0) return null;
  return (
    <div className="w-full flex justify-center gap-4 overflow-x-auto hide-scrollbar py-2">
      {sales.map((sale) => (
        <SaleItem key={sale.id} sale={sale} />
      ))}
    </div>
  );
}
