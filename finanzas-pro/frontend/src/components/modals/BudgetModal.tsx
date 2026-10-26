import { useState } from 'react';
import { api } from '../../services/api';
import Modal from '../ui/Modal';
import { money } from '../../lib/format';
import { useToast } from '../ui/Toast';

interface Props { open: boolean; onClose: () => void; categoryId: string; categoryName: string; month: string; currentLimit: number; onSaved: () => void }

export default function BudgetModal({ open, onClose, categoryId, categoryName, month, currentLimit, onSaved }: Props) {
  const [amount, setAmount] = useState(currentLimit);
  const { toast } = useToast();

  const save = async () => {
    try {
      await api.createBudget({ period: month, category_id: categoryId, budgeted_amount: amount });
      toast('success', 'Presupuesto actualizado');
      onSaved();
      onClose();
    } catch { toast('error', 'Error'); }
  };

  return (
    <Modal open={open} onClose={onClose} title={categoryName} footer={
      <><button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:bg-zinc-800">Cancelar</button>
      <button onClick={save} className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white">Guardar</button></>
    }>
      <div className="space-y-3">
        <div className="text-xs text-zinc-500">Mes: {month}</div>
        <div><label className="text-[10px] text-zinc-500">Límite</label>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full mt-1 px-2 py-1.5 rounded-lg bg-zinc-800 text-xs border-0" />
        </div>
        <div className="text-[10px] text-zinc-500">Actual: {money(currentLimit)}</div>
      </div>
    </Modal>
  );
}
