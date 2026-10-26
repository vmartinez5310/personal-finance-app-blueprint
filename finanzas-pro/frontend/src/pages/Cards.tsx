import { useEffect, useState } from 'react';
import { api } from '../services/api';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

export default function Cards() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.creditCards()
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-400">Cargando tarjetas...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Tarjetas de crédito</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => {
          const inv = card.invoice || {};
          return (
            <div key={card.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{card.name}</div>
                  <div className="text-[10px] text-zinc-500 uppercase">{card.card_type}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-400">Disponible</div>
                  <div className="font-mono text-emerald-400">{formatMoney(inv.real_available_credit)}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-zinc-500">Límite</span><div className="font-mono">{formatMoney(card.credit_limit)}</div></div>
                <div><span className="text-zinc-500">Deuda</span><div className="font-mono text-rose-400">{formatMoney(inv.net_balance_due)}</div></div>
                <div><span className="text-zinc-500">Corte</span><div>{inv.closing_date || '—'}</div></div>
                <div><span className="text-zinc-500">Vence</span><div>{inv.due_date || '—'}</div></div>
              </div>
              {inv.is_closed && <div className="mt-2 text-[10px] text-emerald-400">Factura cerrada</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
