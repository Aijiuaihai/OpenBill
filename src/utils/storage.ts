import type { Transaction } from "../types/transaction";

const STORAGE_KEY = "openbill_transactions";

const isTransaction = (value: unknown): value is Transaction => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const transaction = value as Record<string, unknown>;
  return (
    typeof transaction.id === "string" &&
    typeof transaction.amount === "number" &&
    (transaction.type === "income" || transaction.type === "expense") &&
    typeof transaction.category === "string" &&
    typeof transaction.channel === "string" &&
    typeof transaction.date === "string" &&
    typeof transaction.createdAt === "string" &&
    typeof transaction.updatedAt === "string"
  );
};

export const loadTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isTransaction);
  } catch {
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};
