import type {
  Channel,
  Transaction,
  TransactionFilters,
} from "../types/transaction";

export interface StatItem {
  key: string;
  label: string;
  amount: number;
  count: number;
  percent: number;
}

export interface SummaryStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthIncome: number;
  monthExpense: number;
  monthBalance: number;
}

export const sortTransactionsByDate = (
  transactions: Transaction[],
): Transaction[] =>
  [...transactions].sort((a, b) => {
    const dateDiff = b.date.localeCompare(a.date);
    if (dateDiff !== 0) {
      return dateDiff;
    }

    return b.createdAt.localeCompare(a.createdAt);
  });

export const filterTransactions = (
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] =>
  transactions.filter((transaction) => {
    if (filters.type !== "all" && transaction.type !== filters.type) {
      return false;
    }

    if (filters.channel !== "all" && transaction.channel !== filters.channel) {
      return false;
    }

    if (filters.category && transaction.category !== filters.category) {
      return false;
    }

    if (filters.startDate && transaction.date < filters.startDate) {
      return false;
    }

    if (filters.endDate && transaction.date > filters.endDate) {
      return false;
    }

    return true;
  });

export const getSummaryStats = (
  transactions: Transaction[],
  monthKey: string,
): SummaryStats => {
  const totalIncome = sumByType(transactions, "income");
  const totalExpense = sumByType(transactions, "expense");
  const monthTransactions = transactions.filter((transaction) =>
    transaction.date.startsWith(monthKey),
  );
  const monthIncome = sumByType(monthTransactions, "income");
  const monthExpense = sumByType(monthTransactions, "expense");

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    monthIncome,
    monthExpense,
    monthBalance: monthIncome - monthExpense,
  };
};

export const getExpenseStatsByChannel = (
  transactions: Transaction[],
  labels: Record<Channel, string>,
): StatItem[] =>
  getExpenseStats(transactions, (transaction) => transaction.channel, labels);

export const getExpenseStatsByCategory = (
  transactions: Transaction[],
): StatItem[] =>
  getExpenseStats(transactions, (transaction) => transaction.category);

const sumByType = (
  transactions: Transaction[],
  type: Transaction["type"],
): number =>
  transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

const getExpenseStats = (
  transactions: Transaction[],
  getKey: (transaction: Transaction) => string,
  labels?: Record<string, string>,
): StatItem[] => {
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense",
  );
  const total = expenseTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const statsMap = new Map<string, { amount: number; count: number }>();

  for (const transaction of expenseTransactions) {
    const key = getKey(transaction);
    const current = statsMap.get(key) ?? { amount: 0, count: 0 };
    statsMap.set(key, {
      amount: current.amount + transaction.amount,
      count: current.count + 1,
    });
  }

  return Array.from(statsMap.entries())
    .map(([key, value]) => ({
      key,
      label: labels?.[key] ?? key,
      amount: value.amount,
      count: value.count,
      percent: total > 0 ? Math.round((value.amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};
