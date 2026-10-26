/** Monetary JSON values are canonical decimal strings (never JS numbers). */
export type MoneyString = string;
export type ISODate = string;
export type Period = string;
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface TransactionCreate {
  date: ISODate;
  type: TransactionType;
  amount: MoneyString;
  source_account_id?: string | null;
  destination_account_id?: string | null;
  card_id?: string | null;
  category_id?: string | null;
  description?: string | null;
}
export interface TransactionRead extends TransactionCreate {
  id: string;
  msi_plan_id: string | null;
  status: string;
}
export interface BudgetUpsert {
  period: Period;
  category_id: string;
  budgeted_amount: MoneyString;
}
export interface BudgetRead extends BudgetUpsert { id: string; }
export interface MsiPurchaseCreate {
  card_id: string;
  purchase_date: ISODate;
  description: string;
  total_amount: MoneyString;
  installments_total: number;
  category_id?: string | null;
}
export interface InstallmentPlanRead {
  id: string;
  card_id: string;
  purchase_date: ISODate;
  description: string;
  total_amount: MoneyString;
  installments_total: number;
  monthly_amount: MoneyString;
  installment_type: string;
  status: string;
}
export interface MsiPurchaseRead {
  plan: InstallmentPlanRead;
  transactions: TransactionRead[];
}
export interface Account {
  id: string; name: string; type: string; currency: string;
  initial_balance: MoneyString; is_active: boolean; current_balance?: MoneyString;
}
export interface Category { id: string; name: string; type: string; icon: string; }
export interface CreditCard { id: string; name: string; credit_limit: MoneyString; is_active: boolean; }
export interface SavingsGoal { id: string; name: string; target_amount: MoneyString; target_date: string | null; account_id: string | null; }
export interface Loan { id: string; name: string; principal_amount: MoneyString; monthly_amount: MoneyString; status: string; }
export interface AppData {
  accounts: Account[];
  categories: Category[];
  creditCards: CreditCard[];
  transactions: TransactionRead[];
  budgets: BudgetRead[];
  savingsGoals: SavingsGoal[];
  loans: Loan[];
}
