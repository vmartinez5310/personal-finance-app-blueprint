const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function apiPut<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  accounts: () => apiGet<any[]>('/accounts'),
  categories: () => apiGet<any[]>('/categories'),
  creditCards: () => apiGet<any[]>('/credit-cards'),
  transactions: (params?: string) => apiGet<any[]>(`/transactions${params || ''}`),
  liquidity: () => apiGet<any>('/dashboard/liquidity'),
  summary: (period?: string) => apiGet<any>(`/dashboard/summary${period ? `?period=${period}` : ''}`),
  budgets: (period?: string) => apiGet<any[]>(`/budgets${period ? `?period=${period}` : ''}`),
  savingsGoals: () => apiGet<any[]>('/savings-goals'),
  loans: () => apiGet<any[]>('/loans'),

  write: {
    createAccount: (data: any) => apiPost('/write/accounts', data),
    updateAccount: (id: string, data: any) => apiPut(`/write/accounts/${id}`, data),
    createTransaction: (data: any) => apiPost('/write/transactions', data),
    updateTransaction: (id: string, data: any) => apiPut(`/write/transactions/${id}`, data),
    deleteTransaction: (id: string) => apiDelete(`/write/transactions/${id}`),
    setBudget: (data: any) => apiPost('/write/budgets', data),
  },
};
