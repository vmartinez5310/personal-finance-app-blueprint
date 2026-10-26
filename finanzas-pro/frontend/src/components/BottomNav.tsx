import { NavLink } from 'react-router-dom';
import { LayoutGrid, ArrowLeftRight, PieChart, MoreHorizontal, Plus } from 'lucide-react';

interface Props { onNewTx: () => void }

export default function BottomNav({ onNewTx }: Props) {
  const base = 'flex flex-col items-center gap-0.5 text-[10px]';
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-zinc-900 border-t border-zinc-800 flex items-end justify-around py-2 z-20">
      <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? 'text-blue-400' : 'text-zinc-500'}`}>
        <LayoutGrid className="w-5 h-5" /><span>Dashboard</span>
      </NavLink>
      <NavLink to="/transactions" className={({ isActive }) => `${base} ${isActive ? 'text-blue-400' : 'text-zinc-500'}`}>
        <ArrowLeftRight className="w-5 h-5" /><span>Transacciones</span>
      </NavLink>
      <button onClick={onNewTx} className="w-12 h-12 -mt-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg" aria-label="Nueva transacción">
        <Plus className="w-6 h-6" />
      </button>
      <NavLink to="/budget" className={({ isActive }) => `${base} ${isActive ? 'text-blue-400' : 'text-zinc-500'}`}>
        <PieChart className="w-5 h-5" /><span>Presupuestos</span>
      </NavLink>
      <NavLink to="/more" className={({ isActive }) => `${base} ${isActive ? 'text-blue-400' : 'text-zinc-500'}`}>
        <MoreHorizontal className="w-5 h-5" /><span>Más</span>
      </NavLink>
    </nav>
  );
}
