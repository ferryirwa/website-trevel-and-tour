
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Toaster, type ToastData, type ToastType } from '@/components/ui/Toast';

interface ToastAPI {
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastAPI | null>(null);

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `toast-${Date.now()}-${idCounter}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  const push = useCallback(
    (type: ToastType, message: string, duration = 3500) => {
      const id = nextId();
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      return id;
    },
    []
  );

  const api = useMemo<ToastAPI>(
    () => ({
      success: (msg, d) => push('success', msg, d),
      error: (msg, d) => push('error', msg, d),
      warning: (msg, d) => push('warning', msg, d),
      info: (msg, d) => push('info', msg, d),
      dismiss,
      dismissAll,
    }),
    [push, dismiss, dismissAll]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}
