import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Fab from './components/Fab';
import MonthSelector from './components/MonthSelector';
import { useMonth } from './hooks/useMonth';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import More from './pages/More';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(true);
  const month = useMonth();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const openNewTx = () => console.log('Nueva transacción');

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        dark={dark}
        onTheme={() => setDark(!dark)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-end px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <MonthSelector
            label={month.label}
            onPrev={month.prev}
            onNext={month.next}
            onCurrent={month.goCurrent}
            isCurrent={month.isCurrent}
          />
        </header>

        <main className="flex-1 overflow-auto p-4 pb-20 md:pb-6">
          <Routes>
            <Route path="/" element={<Dashboard month={month.month} />} />
            <Route path="/transactions" element={<Transactions month={month.month} />} />
            <Route path="/budget" element={<Budget month={month.month} />} />
            <Route path="/more" element={<More />} />
          </Routes>
        </main>
      </div>

      <BottomNav onNewTx={openNewTx} />
      <Fab onClick={openNewTx} />
    </div>
  );
}
