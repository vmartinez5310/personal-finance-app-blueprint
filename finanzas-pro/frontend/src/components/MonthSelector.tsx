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
    <div className="flex items-center gap-1">
      <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Mes anterior">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm font-medium min-w-[120px] text-center capitalize">{label}</span>
      <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Mes siguiente">
        <ChevronRight className="w-4 h-4" />
      </button>
      {!isCurrent && (
        <button onClick={onCurrent} className="ml-1 text-xs px-2 py-1 rounded-lg bg-blue-600 text-white">
          Hoy
        </button>
      )}
    </div>
  );
}
