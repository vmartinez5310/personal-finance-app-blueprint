import { NavLink } from 'react-router-dom';
import { LayoutGrid, ArrowLeftRight, PieChart, MoreHorizontal, ChevronsLeft, ChevronsRight, Moon, Sun } from 'lucide-react';

const items = [
  { to: '/', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transacciones' },
  { to: '/budget', icon: PieChart, label: 'Presupuestos' },
  { to: '/more', icon: MoreHorizontal, label: 'Más' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  dark: boolean;
  onTheme: () => void;
}

export default function Sidebar({ collapsed, onToggle, dark, onTheme }: Props) {
  return (
    <aside className={`hidden md:flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all relative ${collapsed ? 'w-16' : 'w-56'}`}>
      <button onClick={onToggle} className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-sm z-10" aria-label="Colapsar menú">
        {collapsed ? <ChevronsRight className="w-3 h-3" /> : <ChevronsLeft className="w-3 h-3" />}
      </button>

      <div className="h-14 flex items-center gap-3 px-3 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">FP</div>
        {!collapsed && <div className="min-w-0"><div className="text-sm font-semibold truncate">Finanzas Pro</div><div className="text-[10px] text-zinc-500">Personal</div></div>}
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${isActive ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}>
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-zinc-800">
        <div className={`flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white shrink-0">VM</div>
          {!collapsed && <div className="min-w-0"><div className="text-xs font-medium truncate">Valente</div><div className="text-[10px] text-zinc-500">Perfil</div></div>}
        </div>
      </div>

      <div className="p-2 border-t border-zinc-800">
        <button onClick={onTheme} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 ${collapsed ? 'justify-center' : ''}`}>
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span>{dark ? 'Modo claro' : 'Modo oscuro'}</span>}
        </button>
      </div>
    </aside>
  );
}
