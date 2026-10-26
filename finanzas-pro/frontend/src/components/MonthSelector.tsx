import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onCurrent: () => void;
  isCurrent: boolean;
}

export default function MonthSelector({ label, onPrev, onNext, onCurrent, isCurrent }: Props) {
  return (
    <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full px-1 py-0.5">
      <button onClick={onPrev} className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700" aria-label="Anterior">
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <span className="text-xs font-medium px-2 min-w-[90px] text-center capitalize">{label}</span>
      <button onClick={onNext} className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700" aria-label="Siguiente">
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
      {!isCurrent && (
        <button onClick={onCurrent} className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white">Hoy</button>
      )}
    </div>
  );
}
