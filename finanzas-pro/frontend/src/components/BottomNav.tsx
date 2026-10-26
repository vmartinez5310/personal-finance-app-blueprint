import { NavLink } from 'react-router-dom';
import { LayoutGrid, ArrowLeftRight, PieChart, MoreHorizontal, Plus } from 'lucide-react';

interface Props {
  onNewTx: () => void;
}

export default function BottomNav({ onNewTx }: Props) {
  const item = 'flex flex-col items-center gap-0.5 text-[10px] text-zinc-500';
  const active = 'text-blue-600';

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-end justify-around py-2 z-20">
      <NavLink to="/" end className={({ isActive }) => `${item} ${isActive ? active : ''}`}>
        <LayoutGrid className="w-5 h-5" /><span>Dashboard</span>
      </NavLink>
      <NavLink to="/transactions" className={({ isActive }) => `${item} ${isActive ? active : ''}`}>
        <ArrowLeftRight className="w-5 h-5" /><span>Transacciones</span>
      </NavLink>
      <button onClick={onNewTx} className="w-12 h-12 -mt-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg" aria-label="Nueva transacción">
        <Plus className="w-6 h-6" />
      </button>
      <NavLink to="/budget" className={({ isActive }) => `${item} ${isActive ? active : ''}`}>
        <PieChart className="w-5 h-5" /><span>Presupuestos</span>
      </NavLink>
      <NavLink to="/more" className={({ isActive }) => `${item} ${isActive ? active : ''}`}>
        <MoreHorizontal className="w-5 h-5" /><span>Más</span>
      </NavLink>
    </nav>
  );
}
