// ================================================================================================
// toast.tsx — avisos flotantes ("Guardado ✓", errores de la API…) vía contexto de React.
// ================================================================================================
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

interface ToastState {
  msg: string;
  isError: boolean;
}

type ShowToast = (msg: string, isError?: boolean) => void;

const ToastContext = createContext<ShowToast>(() => {});

export function useToast(): ShowToast {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback<ShowToast>((msg, isError = false) => {
    setToast({ msg, isError });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), isError ? 6000 : 3500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-50 max-w-[min(90vw,34rem)] -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.isError ? 'bg-red-700' : 'bg-emerald-800'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}
