import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Sale, Salesperson } from '../../types';
import { ASSETS, REFRESH_INTERVAL_MS, TICKER_EXPIRY_MS } from '../../constants';
import { fetchSalesByDayGrouped, fetchSalespersonOrders } from '../../services/sales.service';
import { fetchAvailablePeriods } from '../../services/ranking.service';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { useRealtimeSales } from '../../hooks/useRealtimeSales';
import { usePeriodSelector } from '../../hooks/usePeriodSelector';
import KioskLayout from '../layout/KioskLayout';
import Header from '../ui/Header';
import Footer from '../ui/Footer';
import StatsPanel from '../widgets/StatsPanel';
import Leaderboard from '../widgets/Leaderboard';
import SalesTicker from '../widgets/SalesTicker';
import SalespersonModal from '../modals/SalespersonModal';
import DetailModal from '../modals/DetailModal';

export default function Dashboard() {
  // --- Hooks ---
  const { metrics, salespeople, loading, isRefreshing, lastUpdated, fetchData } = useDashboardData();
  const { config, refreshConfig } = useSystemConfig();
  const { selectedPeriod, rawPeriods, setRawPeriods, showSelector, setShowSelector, selectPeriod } = usePeriodSelector();

  // --- Local state ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

  const [detailModal, setDetailModal] = useState<{
    show: boolean; day: 'today' | 'yesterday'; data: Array<{ nome: string; total: number; pedidos: number }>; loading: boolean;
  }>({ show: false, day: 'today', data: [], loading: false });

  const [salespersonModal, setSalespersonModal] = useState<{
    show: boolean; salesperson: Salesperson | null; data: any[]; loading: boolean;
  }>({ show: false, salesperson: null, data: [], loading: false });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Effects ---
  useEffect(() => {
    audioRef.current = new Audio(ASSETS.NOTIFICATION_SOUND);
    audioRef.current.volume = 1.0;
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fetch available periods once on mount
  useEffect(() => {
    fetchAvailablePeriods().then(data => {
      if (data && data.length > 0) setRawPeriods(data as any[]);
    });
  }, [setRawPeriods]);

  // Initial + periodic data refresh
  useEffect(() => {
    fetchData(selectedPeriod);
    refreshConfig();
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    const refreshTimer = setInterval(() => {
      fetchData(selectedPeriod, true);
      refreshConfig();
    }, REFRESH_INTERVAL_MS);
    return () => {
      clearInterval(clockTimer);
      clearInterval(refreshTimer);
    };
  }, [selectedPeriod, fetchData, refreshConfig]);

  // --- Handlers ---
  const playSaleSound = useCallback(() => {
    if (audioRef.current) {
      const clone = audioRef.current.cloneNode() as HTMLAudioElement;
      clone.volume = 1.0;
      clone.play().catch(e => console.warn('Autoplay bloqueado.', e));
    }
  }, []);

  const registerSaleWithExpiry = useCallback((sale: Sale) => {
    setRecentSales(prev => {
      // De-duplicate by ID, PV, or content (Value, Client, Date)
      const isDuplicate = prev.find(s => 
        s.id === sale.id || 
        (s.pv && sale.pv && s.pv === sale.pv) ||
        (s.valor_pedido === sale.valor_pedido && 
         s.cliente === sale.cliente && 
         s.data_venda === sale.data_venda)
      );
      if (isDuplicate) return prev;
      return [sale, ...prev].slice(0, 8);
    });
    setTimeout(() => {
      setRecentSales(prev => prev.filter(s => s.id !== sale.id));
    }, TICKER_EXPIRY_MS);
  }, []);

  const handleNewSale = useCallback((sale: Sale) => {
    playSaleSound();
    registerSaleWithExpiry(sale);
  }, [playSaleSound, registerSaleWithExpiry]);

  const handleRefresh = useCallback(() => {
    fetchData(selectedPeriod, true);
  }, [fetchData, selectedPeriod]);

  const handlePeriodSelect = (val: string) => {
    selectPeriod(val);
    fetchData(val, salespeople.length > 0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const fetchDetailedSales = async (day: 'today' | 'yesterday') => {
    setDetailModal(prev => ({ ...prev, show: true, day, loading: true, data: [] }));
    try {
      const date = new Date();
      if (day === 'yesterday') date.setDate(date.getDate() - 1);
      
      // Use local date string to avoid UTC offset issues (resetting at 21h)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${d}`;
      
      const rawData = await fetchSalesByDayGrouped(dateStr);
      
      // De-duplicate by ID and content (Value, Client, Date) to ensure accuracy
      const seenIds = new Set();
      const seenContent = new Set();
      const uniqueSales = rawData.filter((sale: any) => {
        if (seenIds.has(sale.id)) return false;
        const contentKey = `${sale.valor_pedido}_${sale.cliente}_${sale.data_venda}`;
        if (seenContent.has(contentKey)) return false;
        seenIds.add(sale.id);
        seenContent.add(contentKey);
        return true;
      });

      const grouped = uniqueSales.reduce((acc: any, sale: any) => {
        const name = sale.vendedor_nome_origem;
        if (!acc[name]) acc[name] = { nome: name, total: 0, pedidos: 0 };
        acc[name].total += Number(sale.valor_pedido);
        acc[name].pedidos += 1;
        return acc;
      }, {});
      const sorted = Object.values(grouped).sort((a: any, b: any) => b.total - a.total) as Array<{ nome: string; total: number; pedidos: number }>;
      setDetailModal(prev => ({ ...prev, data: sorted, loading: false }));
    } catch {
      setDetailModal(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchSalespersonData = async (salesperson: Salesperson) => {
    setSalespersonModal({ show: true, salesperson, data: [], loading: true });
    try {
      const rawData = await fetchSalespersonOrders({
        codigoOmie: salesperson.codigo_omie,
        nomeExibicao: salesperson.nome_exibicao,
        period: selectedPeriod,
      });
      
      // De-duplicate by ID, PV, and content (Value, Client, Date)
      const uniqueData = rawData.reduce((acc: any[], current: any) => {
        const isDuplicate = acc.find(item => 
          item.id === current.id || 
          (item.pv && current.pv && item.pv === current.pv) ||
          (item.valor_pedido === current.valor_pedido && 
           item.cliente === current.cliente && 
           item.data_venda === current.data_venda)
        );
        if (!isDuplicate) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      setSalespersonModal(prev => ({ ...prev, data: uniqueData, loading: false }));
    } catch {
      setSalespersonModal(prev => ({ ...prev, loading: false }));
    }
  };

  // --- Realtime subscription ---
  useRealtimeSales({
    enabled: config.realtimeEnabled,
    selectedPeriod,
    onNewSale: handleNewSale,
    onRefresh: handleRefresh,
  });

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
        <p className="animate-pulse font-bold tracking-widest uppercase text-xs md:text-sm">Sincronizando...</p>
      </div>
    );
  }

  return (
    <KioskLayout>
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>

      {/* Modals */}
      <SalespersonModal
        show={salespersonModal.show}
        salesperson={salespersonModal.salesperson}
        data={salespersonModal.data}
        loading={salespersonModal.loading}
        onClose={() => setSalespersonModal(prev => ({ ...prev, show: false }))}
      />

      <DetailModal
        show={detailModal.show}
        day={detailModal.day}
        data={detailModal.data}
        loading={detailModal.loading}
        onClose={() => setDetailModal(prev => ({ ...prev, show: false }))}
      />

      {/* Header */}
      <Header
        selectedPeriod={selectedPeriod}
        rawPeriods={rawPeriods}
        showSelector={showSelector}
        setShowSelector={setShowSelector}
        onSelectPeriod={handlePeriodSelect}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      {/* Main content - 50/50 split */}
      <main className="flex-1 flex flex-col lg:flex-row p-5 gap-4 lg:gap-5 overflow-y-auto lg:overflow-hidden">
        
        {/* Coluna do StatsPanel */}
        <div className="w-full lg:w-[50%] lg:h-full shrink-0 flex flex-col">
          <StatsPanel
            metrics={metrics}
            selectedMonth={selectedPeriod}
            onMetricClick={(day) => fetchDetailedSales(day)}
          />
        </div>
        <div className="w-full lg:w-[50%] lg:h-full min-h-[500px] flex flex-col">
          <Leaderboard
            salespeople={salespeople}
            onSalespersonClick={(p) => fetchSalespersonData(p)}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer
        currentTime={currentTime}
        metrics={metrics}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Floating Sales Ticker */}
      <div className={`fixed bottom-16 md:bottom-20 left-0 right-0 z-[60] px-4 transition-all duration-500 ${recentSales.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <SalesTicker sales={recentSales} />
      </div>
    </KioskLayout>
  );
}
