import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import SearchInput from '../components/ui/SearchInput';
import SelectFilter from '../components/ui/SelectFilter';
import Paginator from '../components/ui/Paginator';
import Button from '../components/ui/Button';

function money(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

interface Props { month: string }

export default function Transactions({ month }: Props) {
  const [txs, setTxs] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [groupBy, setGroupBy] = useState('date');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    Promise.all([api.transactions(), api.accounts(), api.categories()])
      .then(([t, a, c]) => { setTxs(t); setAccounts(a); setCategories(c); })
      .catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    return txs.filter(tx => {
      if (!String(tx.date).startsWith(month)) return false;
      if (typeFilter && tx.type !== typeFilter) return false;
      if (accountFilter && tx.source_id !== accountFilter && tx.destination_id !== accountFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const cat = categories.find(c => c.id === tx.category_id)?.name || '';
        const src = accounts.find(a => a.id === tx.source_id)?.name || '';
        const dst = accounts.find(a => a.id === tx.destination_id)?.name || '';
        if (![tx.description, cat, src, dst, tx.type].some(s => String(s || '').toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [txs, month, typeFilter, accountFilter, search, categories, accounts]);

  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => ['expense', 'credit_card_expense'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach(tx => {
      let key = tx.date;
      if (groupBy === 'category') key = categories.find(c => c.id === tx.category_id)?.name || 'Sin categoría';
      if (groupBy === 'type') key = tx.type;
      if (groupBy === 'account') key = accounts.find(a => a.id === tx.source_id)?.name || '—';
      (map[key] ||= []).push(tx);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered, groupBy, categories, accounts]);

  const flat = grouped.flatMap(([, items]) => items);
  const paged = flat.slice((page - 1) * pageSize, page * pageSize);

  const clear = () => { setSearch(''); setTypeFilter(''); setAccountFilter(''); setPage(1); };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="text-[10px] text-zinc-500">Balance mensual</div>
          <div className={`text-lg font-semibold ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{money(balance)}</div>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="text-[10px] text-zinc-500">Saldo proyectado</div>
          <div className="text-lg font-semibold text-blue-500">{money(balance)}</div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Buscar concepto o categoría..." />
        <div className="grid grid-cols-2 gap-2">
          <SelectFilter value={typeFilter} onChange={v => { setTypeFilter(v); setPage(1); }} options={[
            { value: '', label: 'Todos los tipos' },
            { value: 'income', label: 'Ingreso' },
            { value: 'expense', label: 'Gasto' },
            { value: 'credit_card_expense', label: 'Gasto TDC' },
            { value: 'transfer', label: 'Transferencia' },
            { value: 'cc_payment', label: 'Pago TDC' },
          ]} />
          <SelectFilter value={accountFilter} onChange={v => { setAccountFilter(v); setPage(1); }} options={[
            { value: '', label: 'Todas las cuentas' },
            ...accounts.map(a => ({ value: a.id, label: a.name })),
          ]} />
        </div>
        <div className="flex gap-2">
          <SelectFilter value={groupBy} onChange={setGroupBy} options={[
            { value: 'date', label: 'Agrupar: Fecha' },
            { value: 'category', label: 'Agrupar: Categoría' },
            { value: 'type', label: 'Agrupar: Tipo' },
            { value: 'account', label: 'Agrupar: Cuenta' },
          ]} />
          <Button onClick={clear}>Limpiar</Button>
        </div>
        <div className="text-[10px] text-zinc-500">{filtered.length} movimientos</div>
      </div>

      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
        {paged.map(tx => {
          const cat = categories.find(c => c.id === tx.category_id);
          const src = accounts.find(a => a.id === tx.source_id);
          const dst = accounts.find(a => a.id === tx.destination_id);
          const isIncome = tx.type === 'income';
          const isTransfer = ['transfer', 'cc_payment'].includes(tx.type);
          return (
            <div key={tx.id} className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs">
                {cat?.icon?.[0]?.toUpperCase() || '•'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{tx.description || '—'}</div>
                <div className="text-[10px] text-zinc-500 truncate">
                  {cat?.name || tx.type}
                  {isTransfer && src && dst && ` · ${src.name} → ${dst.name}`}
                </div>
              </div>
              <div className={`font-mono text-sm ${isIncome ? 'text-emerald-500' : isTransfer ? 'text-zinc-400' : 'text-rose-500'}`}>
                {isIncome ? '+' : isTransfer ? '' : '−'}{money(tx.amount)}
              </div>
            </div>
          );
        })}
        {paged.length === 0 && <div className="p-4 text-center text-zinc-500 text-sm">Sin movimientos</div>}
      </div>

      <Paginator page={page} total={flat.length} pageSize={pageSize} onChange={setPage} />
    </div>
  );
}
