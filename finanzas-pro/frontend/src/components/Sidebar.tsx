import { NavLink } from 'react-router-dom';
import { LayoutGrid, ArrowLeftRight, PieChart, MoreHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react';

const items = [
  { to: '/', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transacciones' },
  { to: '/budget', icon: PieChart, label: 'Presupuestos' },
  { to: '/more', icon: MoreHorizontal, label: 'Más' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: Props) {
  return (
    <aside className={`hidden md:flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="h-14 flex items-center justify-end px-2 border-b border-zinc-100 dark:border-zinc-800">
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Colapsar">
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
