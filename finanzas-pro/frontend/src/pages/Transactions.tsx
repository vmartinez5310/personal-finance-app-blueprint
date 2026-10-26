import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { money } from '../lib/format';
import SearchInput from '../components/ui/SearchInput';
import SelectFilter from '../components/ui/SelectFilter';
import Paginator from '../components/ui/Paginator';
import KpiCard from '../components/ui/KpiCard';
import { X, CreditCard, Wallet, Tag } from 'lucide-react';

const TYPE_LABEL: Record<string, string> = {
  income: 'Ingreso', expense: 'Gasto', credit_card_expense: 'Compra TDC',
  transfer: 'Transferencia', cc_payment: 'Pago de tarjeta',
};

function formatGroup(key: string, groupBy: string) {
  if (groupBy !== 'date') return key;
  return new Date(key + 'T00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
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
  const pageSize = 20;

  useEffect(() => {
    Promise.all([api.transactions(), api.accounts(), api.categories()])
      .then(([t, a, c]) => { setTxs(t); setAccounts(a); setCategories(c); })
      .catch(console.error);
  }, []);

  const filtered = useMemo(() => txs.filter(tx => {
    if (!String(tx.date).startsWith(month)) return false;
    if (typeFilter && tx.type !== typeFilter) return false;
    if (accountFilter && tx.source_id !== accountFilter && tx.destination_id !== accountFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const cat = categories.find(c => c.id === tx.category_id)?.name || '';
      if (![tx.description, cat, tx.type].some(s => String(s || '').toLowerCase().includes(q))) return false;
    }
    return true;
  }), [txs, month, typeFilter, accountFilter, search, categories]);

  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => ['expense', 'credit_card_expense'].includes(t.type)).reduce((s, t) => s + t.amount, 0);

  const groups = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach(tx => {
      const key = groupBy === 'date' ? tx.date : groupBy === 'category'
        ? (categories.find(c => c.id === tx.category_id)?.name || 'Sin categoría')
        : groupBy === 'type' ? TYPE_LABEL[tx.type] || tx.type
        : accounts.find(a => a.id === tx.source_id)?.name || '—';
      (map[key] ||= []).push(tx);
    });
    return Object.entries(map)
      .map(([key, items]) => ({ key, items, total: items.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0) }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [filtered, groupBy, categories, accounts]);

  const allItems = groups.flatMap(g => [{ type: 'header', ...g }, ...g.items.map(i => ({ type: 'item', ...i }))]);
  const paged = allItems.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = search || typeFilter || accountFilter;

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <KpiCard label="Balance mensual" value={money(income - expense)} color={income - expense >= 0 ? 'text-emerald-400' : 'text-rose-400'} sub="Ingresos − Gastos" />
        <KpiCard label="Saldo proyectado" value={money(income - expense)} color="text-blue-400" sub="Con facturas por pagar" />
      </div>

      <div className="shrink-0 flex gap-1.5 items-center">
        <div className="w-[40%]"><SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Buscar..." /></div>
        <div className="w-[20%]"><SelectFilter value={typeFilter} onChange={v => { setTypeFilter(v); setPage(1); }} options={[
          { value: '', label: 'Tipo' }, { value: 'income', label: 'Ingreso' }, { value: 'expense', label: 'Gasto' },
          { value: 'credit_card_expense', label: 'TDC' }, { value: 'transfer', label: 'Transfer' }, { value: 'cc_payment', label: 'Pago' },
        ]} /></div>
        <div className="w-[20%]"><SelectFilter value={accountFilter} onChange={v => { setAccountFilter(v); setPage(1); }} options={[
          { value: '', label: 'Cuenta' }, ...accounts.map(a => ({ value: a.id, label: a.name })),
        ]} /></div>
        <div className="w-[20%]"><SelectFilter value={groupBy} onChange={setGroupBy} options={[
          { value: 'date', label: 'Fecha' }, { value: 'category', label: 'Categoría' }, { value: 'type', label: 'Tipo' }, { value: 'account', label: 'Cuenta' },
        ]} /></div>
        {hasFilters && <button onClick={() => { setSearch(''); setTypeFilter(''); setAccountFilter(''); setPage(1); }} className="p-1.5 rounded-lg bg-zinc-800 shrink-0"><X className="w-3.5 h-3.5 text-zinc-400" /></button>}
      </div>

      <div className="flex-1 min-h-0 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col">
        <div className="text-[10px] text-zinc-500 px-3 py-1 border-b border-zinc-800 shrink-0">{filtered.length} movimientos</div>
        <div className="flex-1 overflow-y-auto">
          {paged.map(row => {
            if (row.type === 'header') {
              return (
                <div key={`h-${row.key}`} className="flex justify-between px-3 py-1.5 bg-zinc-800/50 text-xs sticky top-0">
                  <span className="font-medium capitalize">{formatGroup(row.key, groupBy)}</span>
                  <span className={`font-mono ${row.total >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{money(row.total)} ({row.items.length})</span>
                </div>
              );
            }
            const tx = row;
            const cat = categories.find(c => c.id === tx.category_id);
            const src = accounts.find(a => a.id === tx.source_id);
            const dst = accounts.find(a => a.id === tx.destination_id);
            const isIncome = tx.type === 'income';
            const isTransfer = ['transfer', 'cc_payment'].includes(tx.type);
            const Icon = isTransfer ? CreditCard : isIncome ? Wallet : Tag;
            return (
              <div key={tx.id} className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/50">
                <Icon className={`w-4 h-4 shrink-0 ${isIncome ? 'text-emerald-400' : isTransfer ? 'text-zinc-400' : 'text-rose-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate">{tx.description || '—'}</div>
                  <div className="text-[9px] text-zinc-500 truncate">
                    {cat?.name || TYPE_LABEL[tx.type]} · {isTransfer && src && dst ? `${src.name} → ${dst.name}` : src?.name || ''}
                  </div>
                </div>
                <div className={`font-mono text-xs shrink-0 ${isIncome ? 'text-emerald-400' : isTransfer ? 'text-zinc-400' : 'text-rose-400'}`}>
                  {isIncome ? '+' : isTransfer ? '' : '−'}{money(tx.amount)}
                </div>
              </div>
            );
          })}
          {paged.length === 0 && <div className="p-6 text-center text-zinc-500 text-xs">Sin movimientos</div>}
        </div>
        <div className="shrink-0 border-t border-zinc-800 py-1">
          <Paginator page={page} total={allItems.length} pageSize={pageSize} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
