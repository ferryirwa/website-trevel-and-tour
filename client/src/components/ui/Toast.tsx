
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const TOAST_META: Record<
  ToastType,
  { icon: any; bg: string; border: string; text: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-white',
    border: 'border-green-200',
    text: 'text-green-800',
    iconColor: 'text-green-600',
  },
  error: {
    icon: XCircle,
    bg: 'bg-white',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-error',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-white',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    iconColor: 'text-yellow-600',
  },
  info: {
    icon: Info,
    bg: 'bg-white',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-600',
  },
};

export function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: string) => void;
}) {
  const meta = TOAST_META[toast.type];
  const Icon = meta.icon;

  useEffect(() => {
    const duration = toast.duration ?? 3500;
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 w-full max-w-sm ${meta.bg} ${meta.border} border rounded-card shadow-card px-4 py-3 animate-toast-in`}
    >
      <Icon className={`${meta.iconColor} shrink-0 mt-0.5`} size={20} />
      <p className={`text-sm font-medium ${meta.text} flex-1`}>{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-neutral-mid hover:text-neutral-dark shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
}
