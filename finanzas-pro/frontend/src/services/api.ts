import type {
  Account, AppData, BudgetRead, BudgetUpsert, Category, CreditCard,
  Loan, MsiPurchaseCreate, MsiPurchaseRead, SavingsGoal,
  TransactionCreate, TransactionRead,
} from '../types';

const API_BASE: string = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly detail: string) {
    super(`HTTP ${status}: ${detail}`);
    this.name = 'ApiError';
  }
}

async function request<T>(method: 'GET' | 'POST' | 'PUT', path: string, payload?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { Accept: 'application/json', ...(payload === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
  });
  if (!response.ok) {
    const detail: unknown = await response.json().catch(() => null);
    const raw = typeof detail === 'object' && detail !== null && 'detail' in detail
      ? (detail as { detail: unknown }).detail : response.statusText;
    const message = Array.isArray(raw)
      ? raw.map((item: { loc?: unknown[]; msg?: string }) => `${item.loc?.slice(1).join('.') ?? 'Campo'}: ${item.msg ?? 'inválido'}`).join('; ')
      : typeof raw === 'string' ? raw : JSON.stringify(raw);
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as T;
}

const get = <T>(path: string) => request<T>('GET', path);
const post = <T>(path: string, body: unknown) => request<T>('POST', path, body);
const put = <T>(path: string, body: unknown) => request<T>('PUT', path, body);

export const api = {
  accounts: () => get<Account[]>('/accounts'),
  categories: () => get<Category[]>('/categories'),
  creditCards: () => get<CreditCard[]>('/credit-cards'),
  transactions: () => get<TransactionRead[]>('/transactions'),
  budgets: (period?: string) => get<BudgetRead[]>(`/budgets${period ? `?period=${encodeURIComponent(period)}` : ''}`),
  savingsGoals: () => get<SavingsGoal[]>('/savings-goals'),
  loans: () => get<Loan[]>('/loans'),
  createTx: (body: TransactionCreate) => post<TransactionRead>('/transactions', body),
  upsertBudget: (body: BudgetUpsert) => put<BudgetRead>('/write/budgets', body),
  createMsiPurchase: (body: MsiPurchaseCreate) => post<MsiPurchaseRead>('/write/msi-purchases', body),
  async getAppData(): Promise<AppData> {
    const [accounts, categories, creditCards, transactions, budgets, savingsGoals, loans] = await Promise.all([
      this.accounts(), this.categories(), this.creditCards(), this.transactions(),
      this.budgets(), this.savingsGoals(), this.loans(),
    ]);
    return { accounts, categories, creditCards, transactions, budgets, savingsGoals, loans };
  },
};
