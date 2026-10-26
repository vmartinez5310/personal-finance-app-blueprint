import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { money } from '../lib/format';
import AddButton from '../components/ui/AddButton';
import FormModal from '../components/ui/FormModal';
import { useToast } from '../components/ui/Toast';
import { CreditCard as CardIcon } from 'lucide-react';

const tabs = [
  { key: 'accounts', label: 'Cuentas' },
  { key: 'credit_cards', label: 'Tarjetas' },
  { key: 'loans', label: 'Préstamos' },
  { key: 'savings_goals', label: 'Metas' },
  { key: 'categories', label: 'Categorías' },
] as const;
type Tab = typeof tabs[number]['key'];

export default function More() {
  const [tab, setTab] = useState<Tab>('accounts');
  const [rows, setRows] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();

  const load = () => api.table(tab).then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, [tab]);

  const accountFields = [
    { key: 'name', label: 'Nombre' },
    { key: 'type', label: 'Tipo', type: 'select' as const, options: [
      { value: 'checking', label: 'Débito' }, { value: 'savings', label: 'Ahorro' },
      { value: 'investment', label: 'Inversión' }, { value: 'cash', label: 'Efectivo' },
    ]},
    { key: 'initial_balance', label: 'Saldo inicial', type: 'number' as const },
  ];

  const handleSave = async (data: any) => {
    try {
      if (tab === 'accounts') {
        if (editing) await api.updateAccount(editing.id, data);
        else await api.createAccount(data);
        toast('success', editing ? 'Cuenta actualizada' : 'Cuenta creada');
      }
      setFormOpen(false);
      setEditing(null);
      load();
    } catch { toast('error', 'Error al guardar'); }
  };

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (row: any) => { setEditing(row); setFormOpen(true); };

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between shrink-0">
        <div className="text-sm font-medium">Consola de configuración</div>
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap ${tab === t.key ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto rounded-xl bg-zinc-900 border border-zinc-800 p-3">
        {tab === 'accounts' && <Accounts rows={rows} onEdit={openEdit} onCreate={openCreate} />}
        {tab === 'credit_cards' && <Cards rows={rows} />}
        {tab === 'loans' && <Loans rows={rows} />}
        {tab === 'savings_goals' && <Goals rows={rows} />}
        {tab === 'categories' && <Categories rows={rows} />}
      </div>

      <FormModal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar cuenta' : 'Nueva cuenta'} fields={accountFields} initial={editing || {}} onSave={handleSave} />
    </div>
  );
}

function Accounts({ rows, onEdit, onCreate }: { rows: any[]; onEdit: (r: any) => void; onCreate: () => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-medium">Catálogo de cuentas</div>
        <AddButton label="Nueva cuenta" onClick={onCreate} />
      </div>
      {rows.map(r => (
        <div key={r.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 cursor-pointer" onClick={() => onEdit(r)}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div>
              <div className="text-xs">{r.name}</div>
              <div className="text-[10px] text-zinc-500">{r.type} · Apertura: {money(r.initial_balance)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono">{money(r.initial_balance)}</div>
            <div className="text-[9px] text-emerald-400">Activa</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Cards({ rows }: { rows: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-medium">Catálogo de tarjetas</div>
        <AddButton label="Nueva tarjeta" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {rows.map(r => (
          <div key={r.id} className="p-3 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2"><CardIcon className="w-4 h-4 text-zinc-500" /><div className="text-xs font-medium">{r.name}</div></div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400">Activa</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Línea: {money(r.credit_limit)} · Corte {r.cutoff_day} / Pago {r.payment_day}</div>
            <div className="text-[10px] text-zinc-500">Tasa: {(r.interest_rate_annual || 0).toFixed(2)}% · CAT: {(r.cat_rate || 0).toFixed(2)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Loans({ rows }: { rows: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-medium">Préstamos y financiamientos</div>
        <AddButton label="Nuevo préstamo" />
      </div>
      {rows.map(r => (
        <div key={r.id} className="flex justify-between py-2 border-b border-zinc-800/50">
          <div>
            <div className="text-xs">{r.name}</div>
            <div className="text-[10px] text-zinc-500">{r.term_months} meses ({(r.interest_rate_annual || 0).toFixed(2)}%)</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono">{money(r.principal_amount)}</div>
            <div className="text-[9px] text-zinc-500">Cuota: {money(r.monthly_amount)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Goals({ rows }: { rows: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-medium">Metas financieras y de ahorro</div>
        <AddButton label="Nueva meta" />
      </div>
      {rows.map(r => (
        <div key={r.id} className="py-2 border-b border-zinc-800/50">
          <div className="flex justify-between text-xs mb-1">
            <span>{r.name}</span>
            <span className="font-mono text-zinc-400">{money(0)} / {money(r.target_amount)}</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }} /></div>
        </div>
      ))}
    </div>
  );
}

function Categories({ rows }: { rows: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-medium">Catálogo maestro de categorías</div>
        <AddButton label="Nueva categoría" />
      </div>
      {rows.map(r => (
        <div key={r.id} className="flex justify-between items-center py-1.5 border-b border-zinc-800/50">
          <span className="text-xs">{r.name}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${r.type === 'income' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
            {r.type === 'income' ? 'Ingreso' : 'Gasto'}
          </span>
        </div>
      ))}
    </div>
  );
}
