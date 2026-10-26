import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Modal from '../ui/Modal';
import { money } from '../../lib/format';
import { useToast } from '../ui/Toast';

interface Props { open: boolean; onClose: () => void; cardId: string }

export default function CardDetailModal({ open, onClose, cardId }: Props) {
  const [card, setCard] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open && cardId) {
      Promise.all([api.creditCards(), api.installmentPlans()]).then(([cards, p]) => {
        setCard(cards.find((c: any) => c.id === cardId));
        setPlans(p.filter((pl: any) => pl.credit_card_id === cardId && pl.status === 'active'));
      });
    }
  }, [open, cardId]);

  const accelerate = async (planId: string, full = false) => {
    try {
      await api.payEarly(planId, 1, full);
      toast('success', full ? 'Plan liquidado' : 'Cuota acelerada');
      onClose();
    } catch { toast('error', 'Error'); }
  };

  if (!card) return null;

  return (
    <Modal open={open} onClose={onClose} title={card.name}>
      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div><span className="text-zinc-500">Límite</span><div className="font-mono">{money(card.credit_limit)}</div></div>
          <div><span className="text-zinc-500">Corte / Pago</span><div>{card.cutoff_day} / {card.payment_day}</div></div>
          <div><span className="text-zinc-500">Tasa</span><div>{(card.interest_rate_annual || 0).toFixed(2)}%</div></div>
          <div><span className="text-zinc-500">CAT</span><div>{(card.cat_rate || 0).toFixed(2)}%</div></div>
        </div>
        {plans.length > 0 && (
          <div>
            <div className="text-zinc-500 mb-1">Planes MSI activos</div>
            {plans.map(p => (
              <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-zinc-800">
                <div>
                  <div>{p.description || 'Plan'}</div>
                  <div className="text-[9px] text-zinc-500">{money(p.monthly_amount)} × {p.installments_count}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => accelerate(p.id, false)} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800">+1</button>
                  <button onClick={() => accelerate(p.id, true)} className="text-[9px] px-1.5 py-0.5 rounded bg-rose-900 text-rose-300">Liquidar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
