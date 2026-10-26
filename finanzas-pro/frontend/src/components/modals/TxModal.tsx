import { useEffect, useState } from 'react';
import { api, ApiError } from '../../services/api';
import type { Account, Category, TransactionCreate } from '../../types';
import FormModal from '../ui/FormModal';
import { useToast } from '../ui/Toast';

interface Props { open: boolean; onClose: () => void; onSaved: () => void; initial?: unknown }
const decimalInput = (value: unknown): string => {
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(value) || !/[1-9]/.test(value)) {
    throw new Error('El monto debe ser un decimal positivo con máximo dos decimales');
  }
  return value;
};
export default function TxModal({ open, onClose, onSaved, initial }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    if (!open) return;
    api.getAppData().then(data => {
      setAccounts(data.accounts); setCategories(data.categories);
    }).catch(error => toast('error', error instanceof Error ? error.message : 'Error al cargar catálogos'));
  }, [open, toast]);
  const fields = [
    { key: 'date', label: 'Fecha' },
    { key: 'type', label: 'Tipo', type: 'select' as const, options: [
      { value: 'income', label: 'Ingreso' }, { value: 'expense', label: 'Gasto' }, { value: 'transfer', label: 'Transferencia' },
    ] },
    { key: 'amount', label: 'Monto' },
    { key: 'description', label: 'Descripción' },
    { key: 'source_account_id', label: 'Cuenta origen', type: 'select' as const, options: accounts.map(a => ({ value: a.id, label: a.name })) },
    { key: 'destination_account_id', label: 'Cuenta destino', type: 'select' as const, options: accounts.map(a => ({ value: a.id, label: a.name })) },
    { key: 'category_id', label: 'Categoría', type: 'select' as const, options: categories.map(c => ({ value: c.id, label: c.name })) },
  ];
  const handleSave = async (data: Record<string, unknown>) => {
    if (saving) return;
    try {
      if (initial) throw new Error('La edición requiere un endpoint específico; no se guardó ningún cambio');
      const type = data.type;
      if (type !== 'income' && type !== 'expense' && type !== 'transfer') throw new Error('Selecciona un tipo válido');
      const optional = (key: string) => typeof data[key] === 'string' && data[key] !== '' ? data[key] as string : null;
      const payload: TransactionCreate = {
        date: String(data.date ?? ''), type, amount: decimalInput(data.amount),
        description: optional('description'), category_id: optional('category_id'),
        source_account_id: optional('source_account_id'), destination_account_id: optional('destination_account_id'),
      };
      if (type === 'income') { payload.source_account_id = null; }
      if (type === 'expense') { payload.destination_account_id = null; }
      if (type === 'income' && !payload.destination_account_id) throw new Error('Selecciona la cuenta destino');
      if (type === 'expense' && !payload.source_account_id) throw new Error('Selecciona la cuenta origen');
      if (type === 'transfer' && (!payload.source_account_id || !payload.destination_account_id || payload.source_account_id === payload.destination_account_id)) throw new Error('Selecciona cuentas origen y destino distintas');
      setSaving(true);
      await api.createTx(payload);
      toast('success', 'Transacción creada'); onSaved(); onClose();
    } catch (error) {
      toast('error', error instanceof ApiError && error.status === 422 ? `Validación: ${error.detail}` : error instanceof Error ? error.message : 'Error al guardar');
    } finally { setSaving(false); }
  };
  return <FormModal open={open} onClose={onClose} title="Nueva transacción" fields={fields} initial={{ date: new Date().toLocaleDateString('en-CA'), type: 'expense', amount: '' }} onSave={handleSave} />;
}
