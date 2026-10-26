import { Plus } from 'lucide-react';

interface Props {
  label: string;
  onClick?: () => void;
}

export default function AddButton({ label, onClick }: Props) {
  return (
    <button onClick={onClick} className="text-[10px] px-2 py-1 rounded-lg bg-blue-600 text-white flex items-center gap-1 shrink-0">
      <Plus className="w-3 h-3" /> {label}
    </button>
  );
}
