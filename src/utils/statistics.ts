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

export interface PeriodSummaryStats {
  income: number;
  expense: number;
  balance: number;
}

export type StatisticsRangeMode = "current_month" | "month" | "month_range" | "all";

export interface StatisticsRange {
  mode: StatisticsRangeMode;
  month: string;
  startMonth: string;
  endMonth: string;
}

export interface ResolvedStatisticsRange {
  label: string;
  transactions: Transaction[];
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

export const getPeriodSummaryStats = (
  transactions: Transaction[],
): PeriodSummaryStats => {
  const income = sumByType(transactions, "income");
  const expense = sumByType(transactions, "expense");

  return {
    income,
    expense,
    balance: income - expense,
  };
};

export const getMonthOptions = (transactions: Transaction[]): string[] => {
  const monthSet = new Set<string>();
  for (const transaction of transactions) {
    if (transaction.date.length >= 7) {
      monthSet.add(transaction.date.slice(0, 7));
    }
  }

  return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
};

export const resolveStatisticsRange = (
  transactions: Transaction[],
  range: StatisticsRange,
  currentMonth: string,
): ResolvedStatisticsRange => {
  if (range.mode === "all") {
    return {
      label: "全部",
      transactions,
    };
  }

  if (range.mode === "month_range") {
    const startMonth = range.startMonth || currentMonth;
    const endMonth = range.endMonth || startMonth;
    const normalizedStart = startMonth <= endMonth ? startMonth : endMonth;
    const normalizedEnd = startMonth <= endMonth ? endMonth : startMonth;

    return {
      label:
        normalizedStart === normalizedEnd
          ? formatMonthLabel(normalizedStart)
          : `${formatMonthLabel(normalizedStart)} 至 ${formatMonthLabel(normalizedEnd)}`,
      transactions: transactions.filter((transaction) => {
        const month = transaction.date.slice(0, 7);
        return month >= normalizedStart && month <= normalizedEnd;
      }),
    };
  }

  const month = range.mode === "current_month" ? currentMonth : range.month || currentMonth;

  return {
    label: range.mode === "current_month" ? `本月（${formatMonthLabel(month)}）` : formatMonthLabel(month),
    transactions: transactions.filter((transaction) => transaction.date.startsWith(month)),
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

const formatMonthLabel = (month: string): string => {
  const [year, monthNumber] = month.split("-");
  if (!year || !monthNumber) {
    return month;
  }

  return `${year}年${Number(monthNumber)}月`;
};

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
