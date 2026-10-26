export interface BudgetRecord { period: string; category_id: string; budgeted_amount: string }
export interface TransactionRecord { date: string; type: string; amount: string; status?: string }

export function cents(value: string): bigint {
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(value)) throw new Error(`Importe inválido: ${value}`);
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = (negative ? value.slice(1) : value).split('.');
  const result = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  return negative ? -result : result;
}

export function decimal(value: bigint): string {
  const absolute = value < 0n ? -value : value;
  return `${value < 0n ? '-' : ''}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`;
}

export function monthlyTotals(period: string, budgets: BudgetRecord[], transactions: TransactionRecord[]) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) throw new Error('Periodo inválido');
  const budget = budgets.filter(b => b.period === period).reduce((sum, b) => sum + cents(b.budgeted_amount), 0n);
  const spent = transactions.filter(t => t.date.slice(0, 7) === period && t.type === 'expense' && t.status !== 'void' && t.status !== 'cancelled')
    .reduce((sum, t) => sum + cents(t.amount), 0n);
  return { budget: decimal(budget), spent: decimal(spent), budgetCents: budget, spentCents: spent };
}
