import { Pencil, Trash2 } from "lucide-react";
import { CHANNEL_LABELS, TRANSACTION_TYPE_LABELS } from "../data/constants";
import type { Transaction } from "../types/transaction";
import { formatDate, formatSignedCurrency } from "../utils/format";

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";

  return (
    <article className="grid gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              isIncome
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {TRANSACTION_TYPE_LABELS[transaction.type]}
          </span>
          <span className="font-medium text-slate-900">
            {transaction.category}
          </span>
          <span className="text-sm text-slate-500">
            {CHANNEL_LABELS[transaction.channel]}
          </span>
          <span className="text-sm text-slate-400">
            {formatDate(transaction.date)}
          </span>
        </div>
        {transaction.note ? (
          <p className="mt-2 break-words text-sm text-slate-500">
            {transaction.note}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <span
          className={`text-lg font-semibold ${
            isIncome ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {formatSignedCurrency(transaction.amount, transaction.type)}
        </span>
        <div className="flex gap-1">
          {onEdit ? (
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              type="button"
              onClick={() => onEdit(transaction)}
              aria-label="编辑账单"
              title="编辑"
            >
              <Pencil size={17} aria-hidden="true" />
            </button>
          ) : null}
          {onDelete ? (
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
              type="button"
              onClick={() => onDelete(transaction.id)}
              aria-label="删除账单"
              title="删除"
            >
              <Trash2 size={17} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
