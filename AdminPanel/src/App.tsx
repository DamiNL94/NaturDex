// ================================================================================================
// App.tsx — raíz de la aplicación: sesión y conmutación entre acceso y panel.
// ------------------------------------------------------------------------------------------------
// La "fuente de verdad" de la sesión es la consulta `overview` de admin.php: si responde 401/403
// se muestra el acceso (403 = cuenta sin rol de administrador, se enseña el motivo del servidor).
// TanStack Query cachea e invalida todas las lecturas; no hay estado global manual.
// ================================================================================================
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { api, ApiError, type Overview } from './api';
import { ToastProvider } from './toast';
import Login from './Login';
import Panel from './Panel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false }
  }
});

function Root() {
  const overview = useQuery({
    queryKey: ['overview'],
    queryFn: () => api<Overview>('/admin.php?action=overview')
  });

  if (overview.isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-100">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-700 border-t-transparent" aria-label="Cargando…" />
      </div>
    );
  }

  if (overview.isError || !overview.data) {
    const err = overview.error;
    const forbidden = err instanceof ApiError && err.status === 403 ? err.message : null;
    return <Login forbiddenMsg={forbidden} onDone={() => overview.refetch()} />;
  }

  return <Panel overview={overview.data} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Root />
      </ToastProvider>
    </QueryClientProvider>
  );
}
