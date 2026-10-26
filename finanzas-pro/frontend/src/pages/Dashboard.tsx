import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { money } from '../lib/format';
import { Wallet, Ticket, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import CardDetailModal from '../components/modals/CardDetailModal';
import FormModal from '../components/ui/FormModal';
import { useToast } from '../components/ui/Toast';

interface Props { month: string }

export default function Dashboard({ month }: Props) {
  const [liq, setLiq] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [cardId, setCardId] = useState('');
  const [editAcc, setEditAcc] = useState<any>(null);
  const { toast } = useToast();

  const load = () => Promise.all([api.liquidity(), api.accounts(), api.creditCards(), api.summary(month)])
    .then(([l, a, c, s]) => { setLiq(l); setAccounts(a); setCards(c); setSummary(s); });

  useEffect(() => { load().catch(console.error); }, [month]);

  const spent = summary?.expenses || 0;
  const budgeted = (summary?.by_category || []).reduce((s: number, c: any) => s + (c.budgeted || 0), 0) || 49500;
  const ratio = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
  const overdue = cards.find(c => c.invoice?.net_balance_due > 0);

  const saveAcc = async (data: any) => {
    try {
      if (editAcc) await api.updateAccount(editAcc.id, data);
      toast('success', 'Cuenta actualizada');
      setEditAcc(null);
      load();
    } catch { toast('error', 'Error'); }
  };

  return (
    <div className="h-full flex flex-col gap-2 overflow-y-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
        <Kpi icon={Wallet} label="Liquidez gastable" value={money(liq?.immediate_liquidity)} color="text-emerald-400" />
        <Kpi icon={Ticket} label="Vales de despensa" value={money(liq?.vouchers_liquidity)} color="text-amber-400" />
        <Kpi icon={TrendingUp} label="Inversiones y reservas" value={money(liq?.investments_balance)} color="text-blue-400" />
        <Kpi icon={Shield} label="Patrimonio neto real" value={money(liq?.net_worth)} color="text-violet-400" />
      </div>

      {overdue && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-950/50 border border-amber-800/50 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Atención: {overdue.name} — Factura pendiente {money(overdue.invoice?.net_balance_due)}</span>
          </div>
          <button onClick={() => setCardId(overdue.id)} className="text-[10px] px-2 py-1 rounded-lg bg-white text-black">Ver extracto</button>
        </div>
      )}

      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
        <div className="flex justify-between text-xs mb-1"><span>Resumen del mes</span><span className="text-zinc-500">{ratio}%</span></div>
        <div className="text-[10px] text-zinc-500 mb-1">Gasto acumulado: {money(spent)}</div>
        <div className="h-1.5 bg-zinc-800 rounded-full mb-1">
          <div className={`h-full rounded-full ${ratio > 90 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, ratio)}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500">
          <span>Has consumido el {ratio}% de tu presupuesto. Te quedan {money(Math.max(0, budgeted - spent))} disponibles.</span>
          <span>Límite: {money(budgeted)}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-2 flex-1 min-h-0">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 overflow-y-auto">
          <div className="text-xs font-medium mb-2">Cuentas y activos</div>
          {accounts.map(a => (
            <div key={a.id} onClick={() => setEditAcc(a)} className="flex items-center justify-between py-2 border-b border-zinc-800/50 cursor-pointer hover:bg-zinc-800/30">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-zinc-500" />
                <div><div className="text-xs">{a.name}</div><div className="text-[10px] text-zinc-500">{a.type}</div></div>
              </div>
              <div className={`text-xs font-mono ${a.initial_balance < 0 ? 'text-rose-400' : ''}`}>{money(a.initial_balance)}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs font-medium">Tarjetas de crédito</div>
            <div className="flex gap-1 text-[9px]">
              <span className="px-1.5 py-0.5 rounded-full bg-blue-600">Por pagar</span>
              <span className="px-1.5 py-0.5 rounded-full bg-zinc-700">Al corriente</span>
            </div>
          </div>
          {cards.map(c => {
            const due = c.invoice?.net_balance_due || 0;
            const avail = c.invoice?.real_available_credit || c.credit_limit;
            const pct = c.credit_limit > 0 ? Math.round((1 - avail / c.credit_limit) * 100) : 0;
            return (
              <div key={c.id} onClick={() => setCardId(c.id)} className="p-2 mb-2 rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-700">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-[9px] text-zinc-500">Pago: {c.payment_day}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <div><div className="text-zinc-500">Saldo al corte</div><div className="font-mono">{money(due)}</div></div>
                  <div><div className="text-zinc-500">En curso</div><div className="font-mono">{money(c.invoice?.unbilled || 0)}</div></div>
                  <div><div className="text-zinc-500">Disponible</div><div className="font-mono text-emerald-400">{money(avail)}</div></div>
                </div>
                <div className="mt-1 h-1 bg-zinc-800 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                <div className="text-[9px] text-zinc-500 mt-0.5">Uso: {pct}% · Límite: {money(c.credit_limit)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <CardDetailModal open={!!cardId} onClose={() => setCardId('')} cardId={cardId} />
      <FormModal open={!!editAcc} onClose={() => setEditAcc(null)} title="Editar cuenta" fields={[
        { key: 'name', label: 'Nombre' },
        { key: 'type', label: 'Tipo', type: 'select', options: [{ value: 'checking', label: 'Débito' }, { value: 'savings', label: 'Ahorro' }] },
        { key: 'initial_balance', label: 'Saldo inicial', type: 'number' },
      ]} initial={editAcc || {}} onSave={saveAcc} />
    </div>
  );
}

function Kpi({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
      <div className="flex justify-between items-start">
        <div className="text-[10px] text-zinc-500">{label}</div>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className={`text-sm font-semibold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
