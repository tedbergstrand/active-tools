import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, className = '', preventBackdropClose = false }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={preventBackdropClose ? undefined : onClose}
      />
      <div className={`relative bg-[#1a1d27] border border-[#2e3347] rounded-t-2xl sm:rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2e3347]">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-2.5 -mr-1 hover:bg-[#2e3347] active:bg-[#3e4357] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
