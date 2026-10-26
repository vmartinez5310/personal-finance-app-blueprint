import { useState } from 'react';
import Modal from './Modal';

interface Field { key: string; label: string; type?: 'text' | 'number' | 'select'; options?: { value: string; label: string }[] }
interface Props { open: boolean; onClose: () => void; title: string; fields: Field[]; initial?: Record<string, any>; onSave: (data: Record<string, any>) => void }

export default function FormModal({ open, onClose, title, fields, initial = {}, onSave }: Props) {
  const [data, setData] = useState(initial);
  const set = (k: string, v: any) => setData(d => ({ ...d, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title={title} footer={
      <>
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:bg-zinc-800">Cancelar</button>
        <button onClick={() => onSave(data)} className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white">Guardar</button>
      </>
    }>
      <div className="space-y-3">
        {fields.map(f => (
          <div key={f.key}>
            <label className="text-[10px] text-zinc-500">{f.label}</label>
            {f.type === 'select' ? (
              <select value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)} className="w-full mt-1 px-2 py-1.5 rounded-lg bg-zinc-800 text-xs border-0">
                <option value="">Seleccionar</option>
                {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input type={f.type || 'text'} value={data[f.key] || ''} onChange={e => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)} className="w-full mt-1 px-2 py-1.5 rounded-lg bg-zinc-800 text-xs border-0" />
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
