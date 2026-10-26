import { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, ArrowLeftRight, PieChart, MoreHorizontal, Sun, Moon, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import More from './pages/More';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(true);
  const location = useLocation();

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark', !dark);
  };

  const navItems = [
    { to: '/', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transacciones' },
    { to: '/budget', icon: PieChart, label: 'Presupuesto' },
    { to: '/more', icon: MoreHorizontal, label: 'Más' },
  ];

  return (
    <div className={`min-h-screen flex ${dark ? 'dark' : ''}`}>
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-200 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800">
          {!collapsed && (
            <div>
              <div className="text-[10px] text-zinc-400">Finanzas personales</div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Finanzas Pro</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Colapsar menú"
          >
            {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!collapsed && <span>{dark ? 'Modo claro' : 'Modo oscuro'}</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/more" element={<More />} />
            </Routes>
          </div>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-around py-2 z-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] ${
                  active ? 'text-blue-600' : 'text-zinc-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
