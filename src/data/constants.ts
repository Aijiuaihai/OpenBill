import type { Channel, TransactionType } from "../types/transaction";

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "收入",
  expense: "支出",
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  alipay: "支付宝",
  wechat: "微信",
  credit_card: "信用卡",
  debit_card: "储蓄卡",
  cash: "现金",
  other: "其他",
};

export const CHANNELS: Channel[] = [
  "alipay",
  "wechat",
  "credit_card",
  "debit_card",
  "cash",
  "other",
];

export const INCOME_CATEGORIES = [
  "工资",
  "兼职",
  "奖金",
  "投资收益",
  "退款",
  "其他收入",
];

export const EXPENSE_CATEGORIES = [
  "餐饮",
  "交通",
  "购物",
  "娱乐",
  "学习",
  "医疗",
  "住房",
  "生活缴费",
  "其他支出",
];

export const getCategoriesByType = (type: TransactionType): string[] =>
  type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
