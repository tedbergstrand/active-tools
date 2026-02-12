import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'default' }) {
  const isDanger = variant === 'danger';

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-5">
        {isDanger && (
          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle size={20} className="text-red-400 shrink-0" />
            <p className="text-sm text-gray-300">{message}</p>
          </div>
        )}
        {!isDanger && <p className="text-sm text-gray-300">{message}</p>}

        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant={isDanger ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
