import { CHANNEL_LABELS, TRANSACTION_TYPE_LABELS } from "../data/constants";
import type { Channel, TransactionType } from "../types/transaction";

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  minimumFractionDigits: 2,
});

export const formatCurrency = (value: number): string =>
  currencyFormatter.format(value);

export const formatSignedCurrency = (
  value: number,
  type: TransactionType,
): string => {
  const sign = type === "income" ? "+" : "-";
  return `${sign}${formatCurrency(Math.abs(value))}`;
};

export const formatDate = (date: string): string => {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${date}T00:00:00`));
};

export const getToday = (): string => new Date().toISOString().slice(0, 10);

export const getCurrentMonthKey = (): string => getToday().slice(0, 7);

export const getTypeLabel = (type: TransactionType): string =>
  TRANSACTION_TYPE_LABELS[type];

export const getChannelLabel = (channel: Channel): string =>
  CHANNEL_LABELS[channel];
