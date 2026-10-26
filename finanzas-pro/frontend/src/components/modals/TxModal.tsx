import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import FormModal from '../ui/FormModal';
import { useToast } from '../ui/Toast';

interface Props { open: boolean; onClose: () => void; onSaved: () => void; initial?: any }

export default function TxModal({ open, onClose, onSaved, initial }: Props) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) Promise.all([api.accounts(), api.categories()]).then(([a, c]) => { setAccounts(a); setCategories(c); });
  }, [open]);

  const fields = [
    { key: 'date', label: 'Fecha' },
    { key: 'type', label: 'Tipo', type: 'select' as const, options: [
      { value: 'income', label: 'Ingreso' }, { value: 'expense', label: 'Gasto' },
      { value: 'credit_card_expense', label: 'Compra TDC' }, { value: 'transfer', label: 'Transferencia' },
      { value: 'cc_payment', label: 'Pago de tarjeta' },
    ]},
    { key: 'amount', label: 'Monto', type: 'number' as const },
    { key: 'description', label: 'Descripción' },
    { key: 'source_id', label: 'Origen', type: 'select' as const, options: accounts.map(a => ({ value: a.id, label: a.name })) },
    { key: 'destination_id', label: 'Destino', type: 'select' as const, options: accounts.map(a => ({ value: a.id, label: a.name })) },
    { key: 'category_id', label: 'Categoría', type: 'select' as const, options: categories.map(c => ({ value: c.id, label: c.name })) },
  ];

  const handleSave = async (data: any) => {
    try {
      if (initial?.id) await api.updateTx(initial.id, data);
      else await api.createTx(data);
      toast('success', initial ? 'Actualizada' : 'Creada');
      onSaved();
      onClose();
    } catch { toast('error', 'Error'); }
  };

  return <FormModal open={open} onClose={onClose} title={initial ? 'Editar' : 'Nueva transacción'} fields={fields} initial={initial || { date: new Date().toISOString().slice(0, 10) }} onSave={handleSave} />;
}
