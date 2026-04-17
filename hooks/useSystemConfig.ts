import { useState, useEffect, useCallback } from 'react';
import { fetchSystemConfig } from '../services/config.service';

export interface SystemConfig {
  alertActive: boolean;
  alertMessage: string;
  realtimeEnabled: boolean;
  reportAlertEnabled: boolean;
  reportAlertMessage: string;
  reportAlertWhatsapp: string;
}

const DEFAULT: SystemConfig = {
  alertActive: false, alertMessage: '', realtimeEnabled: true,
  reportAlertEnabled: false, reportAlertMessage: '', reportAlertWhatsapp: '',
};

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const d = await fetchSystemConfig();
      console.log('[useSystemConfig] Config fetched:', d);
      
      const isMaint = d['sistema_manutencao'];
      console.log('[useSystemConfig] Maintenance value from DB:', isMaint, typeof isMaint);
      
      const isMaintenanceActive = 
        isMaint === 'true' || 
        (isMaint as any) === true || 
        isMaint === '1' || 
        (isMaint as any) === 1 || 
        String(isMaint).toLowerCase() === 'true';

      // For debugging in console
      (window as any).SYSTEM_CONFIG = d;
      (window as any).IS_MAINTENANCE = isMaintenanceActive;

      setConfig({
        alertActive: d['sistema_manutencao_alerta'] === 'true',
        alertMessage: d['manutenção_comunicado_alerta'] || '',
        realtimeEnabled: d['sistema_realtime'] !== 'false',
        reportAlertEnabled: d['sistema_aviso_repport'] === 'true',
        reportAlertMessage: d['sistema_aviso_descricao_repport'] || '',
        reportAlertWhatsapp: d['sistema_aviso_whatsapp_repport'] || '',
      });
    } catch (err) {
      console.error('[useSystemConfig] Error refreshing config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { config, loadingConfig: loading, refreshConfig: refresh };
}
