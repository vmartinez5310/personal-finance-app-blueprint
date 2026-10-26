import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Modal from '../ui/Modal';
import { money } from '../../lib/format';
import { useToast } from '../ui/Toast';

interface Props { open: boolean; onClose: () => void; cardId: string }

export default function CardDetailModal({ open, onClose, cardId }: Props) {
  const [card, setCard] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [tab, setTab] = useState<'invoice' | 'plans'>('invoice');
  const [payFrom, setPayFrom] = useState('');
  const [payAmount, setPayAmount] = useState(0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open && cardId) {
      Promise.all([api.creditCards(), api.installmentPlans(), api.accounts()]).then(([cards, p, a]) => {
        const c = cards.find((x: any) => x.id === cardId);
        setCard(c);
        setPlans(p.filter((pl: any) => pl.credit_card_id === cardId && pl.status === 'active'));
        setAccounts(a);
        setPayAmount(c?.invoice?.net_balance_due || 0);
      });
    }
  }, [open, cardId]);

  const payInvoice = async () => {
    if (!payFrom || payAmount <= 0) return;
    try {
      await api.createTx({ date: new Date().toISOString().slice(0, 10), type: 'cc_payment', amount: payAmount, source_id: payFrom, destination_id: cardId, description: `Pago ${card?.name}` });
      toast('success', 'Factura liquidada');
      onClose();
    } catch { toast('error', 'Error'); }
  };

  const accelerate = async (planId: string, full = false) => {
    try {
      await api.payEarly(planId, 1, full);
      toast('success', full ? 'Liquidado' : 'Acelerado');
      onClose();
    } catch { toast('error', 'Error'); }
  };

  if (!card) return null;
  const due = card.invoice?.net_balance_due || 0;
  const avail = card.invoice?.real_available_credit || card.credit_limit;

  return (
    <Modal open={open} onClose={onClose} title={card.name}>
      <div className="space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium">{card.name}</span>
          {due > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-900 text-amber-300">Vence</span>}
          {due === 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-900 text-emerald-300">Liquidada</span>}
        </div>

        <div className="grid grid-cols-4 gap-2 text-[10px]">
          <div><div className="text-zinc-500">Saldo al corte</div><div className="font-mono">{money(due)}</div><div className="text-amber-400 text-[8px]">{due > 0 ? 'Exigible' : 'Cubierto'}</div></div>
          <div><div className="text-zinc-500">En curso</div><div className="font-mono">{money(card.invoice?.unbilled || 0)}</div><div className="text-zinc-500 text-[8px]">Próx. ciclo</div></div>
          <div><div className="text-zinc-500">Disponible</div><div className="font-mono text-emerald-400">{money(avail)}</div><div className="text-zinc-500 text-[8px]">Línea libre</div></div>
          <div><div className="text-zinc-500">Corte / Pago</div><div>d{card.cutoff_day}</div><div className="text-zinc-500 text-[8px]">Pago: {card.payment_day}</div></div>
        </div>

        <div className="flex gap-1">
          <button onClick={() => setTab('invoice')} className={`flex-1 py-1.5 rounded-lg text-[10px] ${tab === 'invoice' ? 'bg-blue-600 text-white' : 'bg-zinc-800'}`}>Factura del mes</button>
          <button onClick={() => setTab('plans')} className={`flex-1 py-1.5 rounded-lg text-[10px] ${tab === 'plans' ? 'bg-blue-600 text-white' : 'bg-zinc-800'}`}>Planes diferidos ({plans.length})</button>
        </div>

        {tab === 'plans' && plans.map(p => (
          <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-zinc-800">
            <div>
              <div>{p.description || 'Plan'}</div>
              <div className="text-[9px] text-zinc-500">Cuota: {money(p.monthly_amount)}</div>
            </div>
            <button onClick={() => accelerate(p.id, false)} className="text-[9px] text-blue-400">Adelantar</button>
          </div>
        ))}

        <div className="p-2 rounded-lg border border-zinc-700">
          <div className="font-medium mb-2">Liquidar factura exigible</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[9px] text-zinc-500">Pagar desde</div>
              <select value={payFrom} onChange={e => setPayFrom(e.target.value)} className="w-full mt-0.5 px-2 py-1 rounded bg-zinc-800 text-[10px]">
                <option value="">Seleccionar</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <div className="text-[9px] text-zinc-500">Monto</div>
              <input type="number" value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} className="w-full mt-0.5 px-2 py-1 rounded bg-zinc-800 text-[10px]" />
            </div>
          </div>
          <button onClick={payInvoice} className="w-full mt-2 py-1.5 rounded-lg bg-blue-600 text-white text-[10px]">
            {due > 0 ? '✓ Liquidar factura del ciclo' : '✓ Tarjeta liquidada (Abono extra)'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
