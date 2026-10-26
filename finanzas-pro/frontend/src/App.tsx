import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import MonthSelector from './components/MonthSelector';
import TxModal from './components/modals/TxModal';
import { useMonth } from './hooks/useMonth';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import More from './pages/More';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(true);
  const [txOpen, setTxOpen] = useState(false);
  const [txKey, setTxKey] = useState(0);
  const month = useMonth();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} dark={dark} onTheme={() => setDark(!dark)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-10 flex items-center justify-end px-3 border-b border-zinc-800 bg-zinc-900 shrink-0">
          <MonthSelector label={month.label} onPrev={month.prev} onNext={month.next} onCurrent={month.goCurrent} isCurrent={month.isCurrent} />
        </header>

        <main className="flex-1 overflow-hidden p-3">
          <Routes>
            <Route path="/" element={<Dashboard month={month.month} />} />
            <Route path="/transactions" element={<Transactions key={txKey} month={month.month} />} />
            <Route path="/budget" element={<Budget month={month.month} />} />
            <Route path="/more" element={<More />} />
          </Routes>
        </main>
      </div>

      <BottomNav onNewTx={() => setTxOpen(true)} />
      <TxModal open={txOpen} onClose={() => setTxOpen(false)} onSaved={() => setTxKey(k => k + 1)} />
    </div>
  );
}
