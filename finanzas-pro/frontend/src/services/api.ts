const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function put<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`${res.status}`);
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
  createAccount: (data: any) => post('/write/accounts', data),
  updateAccount: (id: string, data: any) => put(`/write/accounts/${id}`, data),
  createTx: (data: any) => post('/write/transactions', data),
  updateTx: (id: string, data: any) => put(`/write/transactions/${id}`, data),
  deleteTx: (id: string) => del(`/write/transactions/${id}`),
  createBudget: (data: any) => post('/write/budgets', data),
};
