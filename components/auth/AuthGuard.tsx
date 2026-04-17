import React, { useEffect, useState, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, Lock } from 'lucide-react';

function AuthLogic({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate(); // Equivalente ao useRouter().replace
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Check de tokens na URL
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (token) {
        const safeRefreshToken = refreshToken || token;

        const { error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: safeRefreshToken
        });

        if (!error) {
          setIsAuthenticated(true);
          // No React Router, navigate('/', { replace: true }) equivale ao router.replace('/')
          navigate('/', { replace: true });
          return;
        } else {
          console.error("Token session error: ", error);
          setAuthError(error.message);
        }
      }

      // 2. Tenta recuperar sessão existente
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (session) {
        setIsAuthenticated(true);
      } else {
        if (sessionError) setAuthError(sessionError.message);
        setIsAuthenticated(false);
      }
    };

    handleAuth();
  }, [searchParams, navigate]);

  // Estados de Loading e Erro (Permanecem iguais)
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#081437] flex flex-col items-center justify-center text-blue-50">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-lg font-medium text-blue-200/70">Verificando credenciais...</p>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#081437] flex flex-col items-center justify-center text-blue-50 p-4">
        <div className="bg-[#0d1f54] border border-[#1a2e75] rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-blue-200/70 mb-6">
            Você precisa se autenticar no portal principal para acessar este dashboard.
          </p>
          {authError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-[11px] text-red-400 break-words text-left">
              <strong>Motivo da falha:</strong> {authError}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#081437] flex flex-col items-center justify-center text-blue-50">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-lg font-medium text-blue-200/70">Carregando...</p>
      </div>
    }>
      <AuthLogic>{children}</AuthLogic>
    </Suspense>
  );
}