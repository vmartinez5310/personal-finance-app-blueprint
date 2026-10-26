const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export const api = {
  table: (name: string) => get<any[]>(`/data/${name}`),

  accounts: () => get<any[]>('/accounts'),
  categories: () => get<any[]>('/categories'),
  creditCards: () => get<any[]>('/credit-cards'),
  transactions: () => get<any[]>('/transactions'),
  liquidity: () => get<any>('/dashboard/liquidity'),
  summary: (period?: string) => get<any>(`/dashboard/summary${period ? `?period=${period}` : ''}`),
  budgets: (period?: string) => get<any[]>(`/budgets${period ? `?period=${period}` : ''}`),
  savingsGoals: () => get<any[]>('/savings-goals'),
  loans: () => get<any[]>('/loans'),
  installmentPlans: () => get<any[]>('/data/installment_plans'),
};
