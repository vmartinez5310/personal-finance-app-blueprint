import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../ui/Modal';
import { money } from '../../lib/format';
import { useToast } from '../ui/Toast';

interface Props { open: boolean; onClose: () => void; categoryId: string; categoryName: string; month: string; currentLimit: number; onSaved: () => void }

export default function BudgetModal({ open, onClose, categoryId, categoryName, month, currentLimit, onSaved }: Props) {
  const [amount, setAmount] = useState(currentLimit);
  const [history, setHistory] = useState<{ label: string; spent: number }[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !categoryId) return;
    api.transactions().then(all => {
      const [y, m] = month.split('-').map(Number);
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const hist: { label: string; spent: number }[] = [];
      for (let i = 3; i >= 1; i--) {
        let hM = m - i, hY = y;
        if (hM < 1) { hM += 12; hY -= 1; }
        const key = `${hY}-${String(hM).padStart(2, '0')}`;
        const spent = all.filter(t => String(t.date).startsWith(key) && t.category_id === categoryId && ['expense', 'credit_card_expense'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
        hist.push({ label: `${months[hM - 1]} ${String(hY).slice(2)}`, spent });
      }
      setHistory(hist);
      setTxs(all.filter(t => String(t.date).startsWith(month) && t.category_id === categoryId && ['expense', 'credit_card_expense'].includes(t.type)));
    });
  }, [open, categoryId, month]);

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
        <div className="grid grid-cols-3 gap-2">
          {history.map(h => (
            <div key={h.label} className="p-2 rounded-lg bg-zinc-800 text-center">
              <div className="text-[9px] text-zinc-500">{h.label}</div>
              <div className="text-xs font-mono">{money(h.spent)}</div>
            </div>
          ))}
        </div>
        <div><label className="text-[10px] text-zinc-500">Límite {month}</label>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full mt-1 px-2 py-1.5 rounded-lg bg-zinc-800 text-xs border-0" />
        </div>
        <div className="text-[10px] text-zinc-500">Movimientos del mes ({txs.length})</div>
        <div className="max-h-32 overflow-y-auto text-xs">
          {txs.map(t => (
            <div key={t.id} className="flex justify-between py-1 border-b border-zinc-800">
              <span className="truncate">{t.description}</span>
              <span className="font-mono text-rose-400">−{money(t.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
