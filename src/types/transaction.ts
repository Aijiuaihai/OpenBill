export type TransactionType = "income" | "expense";

export type Channel =
  | "alipay"
  | "wechat"
  | "credit_card"
  | "debit_card"
  | "cash"
  | "other";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  channel: Channel;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDraft {
  amount: number;
  type: TransactionType;
  category: string;
  channel: Channel;
  note?: string;
  date: string;
}

export interface TransactionFilters {
  type: TransactionType | "all";
  channel: Channel | "all";
  category: string;
  startDate: string;
  endDate: string;
}
