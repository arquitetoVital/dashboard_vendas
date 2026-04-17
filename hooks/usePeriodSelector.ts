import { useState } from 'react';

export interface RawPeriod { mes: number; ano: number; }

export function usePeriodSelector() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const saved = localStorage.getItem('dashboard_selected_period');
    const now = new Date();
    return saved || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [rawPeriods, setRawPeriods] = useState<RawPeriod[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  const selectPeriod = (val: string) => {
    setSelectedPeriod(val);
    localStorage.setItem('dashboard_selected_period', val);
    setShowSelector(false);
  };

  return { selectedPeriod, rawPeriods, setRawPeriods, showSelector, setShowSelector, selectPeriod };
}
