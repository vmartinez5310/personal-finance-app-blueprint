import { useRef } from 'react';
import { api } from '../services/api';
import { useToast } from './ui/Toast';

export default function ImportExport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const exportCSV = async () => {
    const txs = await api.transactions();
    const headers = ['date', 'type', 'amount', 'description', 'source_id', 'destination_id', 'category_id'];
    const rows = txs.map(t => headers.map(h => t[h] || '').join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'transacciones.csv';
    a.click();
    toast('success', 'Exportado');
  };

  const importCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').slice(1).filter(Boolean);
    const records = lines.map(line => {
      const [date, type, amount, description, source_id, destination_id, category_id] = line.split(',');
      return { date, type, amount: Number(amount), description, source_id, destination_id, category_id };
    });
    const res = await api.batchImport(records);
    toast('success', `${res.imported || records.length} importadas`);
  };

  const resetAll = async () => {
    if (!confirm('¿Eliminar todos los datos?')) return;
    await api.reset();
    toast('success', 'Datos eliminados');
    window.location.reload();
  };

  return (
    <div className="flex gap-2 text-xs">
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && importCSV(e.target.files[0])} />
      <button onClick={() => inputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-zinc-800">Importar CSV</button>
      <button onClick={exportCSV} className="px-3 py-1.5 rounded-lg bg-zinc-800">Exportar CSV</button>
      <button onClick={resetAll} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white">Empezar de cero</button>
    </div>
  );
}
