import Modal from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', danger }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} footer={
      <>
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:bg-zinc-800">Cancelar</button>
        <button onClick={onConfirm} className={`px-3 py-1.5 rounded-lg text-xs text-white ${danger ? 'bg-rose-600' : 'bg-blue-600'}`}>{confirmLabel}</button>
      </>
    }>
      <p className="text-sm text-zinc-300">{message}</p>
    </Modal>
  );
}
