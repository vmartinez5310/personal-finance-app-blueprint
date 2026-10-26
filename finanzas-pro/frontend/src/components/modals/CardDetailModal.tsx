import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Modal from '../ui/Modal';
import { money } from '../../lib/format';

interface Props { open: boolean; onClose: () => void; cardId: string }

export default function CardDetailModal({ open, onClose, cardId }: Props) {
  const [card, setCard] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (open && cardId) {
      Promise.all([api.creditCards(), api.installmentPlans()]).then(([cards, p]) => {
        setCard(cards.find((c: any) => c.id === cardId));
        setPlans(p.filter((pl: any) => pl.credit_card_id === cardId));
      });
    }
  }, [open, cardId]);

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
            <div className="text-zinc-500 mb-1">Planes MSI ({plans.length})</div>
            {plans.map(p => (
              <div key={p.id} className="flex justify-between py-1 border-b border-zinc-800">
                <span>{p.description || 'Plan'}</span>
                <span className="font-mono">{money(p.installment_amount)} × {p.installments_count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
