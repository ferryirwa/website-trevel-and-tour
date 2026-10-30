import { useEffect, useCallback, type HTMLAttributes } from "react";

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function Modal({ isOpen, onClose, title, className, children, ...props }: ModalProps) {
  if (!isOpen) return null;

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleEsc]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" {...props}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-card shadow-2xl w-full max-w-lg p-6 mx-4">
        {title && <h2 className="text-xl font-bold text-neutral-dark mb-4">{title}</h2>}
        <div className="relative">{children}</div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-mid hover:text-neutral-dark"
        >
          ×
        </button>
      </div>
    </div>
  );
}
