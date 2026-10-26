import { Plus } from 'lucide-react';

interface Props {
  onClick: () => void;
}

export default function Fab({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="hidden md:flex fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 text-white items-center justify-center shadow-lg hover:bg-blue-700 z-20"
      aria-label="Nueva transacción"
    >
      <Plus className="w-5 h-5" />
    </button>
  );
}
