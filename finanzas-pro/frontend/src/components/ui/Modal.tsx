import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ open, onClose, title, children, footer }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="text-sm font-medium">{title}</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-800"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="px-4 py-3 border-t border-zinc-800 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
