import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionList } from "../components/TransactionList";
import type {
  Transaction,
  TransactionDraft,
  TransactionFilters,
} from "../types/transaction";
import {
  filterTransactions,
  sortTransactionsByDate,
} from "../utils/statistics";

interface TransactionsPageProps {
  transactions: Transaction[];
  onCreate: (draft: TransactionDraft) => void;
  onUpdate: (id: string, draft: TransactionDraft) => void;
  onDelete: (id: string) => void;
}

const defaultFilters: TransactionFilters = {
  type: "all",
  channel: "all",
  category: "",
  startDate: "",
  endDate: "",
};

export function TransactionsPage({
  transactions,
  onCreate,
  onUpdate,
  onDelete,
}: TransactionsPageProps) {
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const filteredTransactions = useMemo(
    () => sortTransactionsByDate(filterTransactions(transactions, filters)),
    [transactions, filters],
  );

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = (draft: TransactionDraft) => {
    if (editingTransaction) {
      onUpdate(editingTransaction.id, draft);
    } else {
      onCreate(draft);
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("确认删除这笔账单吗？删除后无法恢复。");
    if (confirmed) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">账单管理</h2>
          <p className="mt-1 text-sm text-slate-500">
            共 {transactions.length} 笔，当前筛选 {filteredTransactions.length} 笔
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800"
          type="button"
          onClick={() => {
            setEditingTransaction(null);
            setIsFormOpen(true);
          }}
        >
          <Plus size={18} aria-hidden="true" />
          新增账单
        </button>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      {isFormOpen || editingTransaction ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingTransaction ? "编辑账单" : "新增账单"}
            </h3>
          </div>
          <TransactionForm
            initialTransaction={editingTransaction}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </section>
      ) : null}

      <TransactionList
        transactions={filteredTransactions}
        emptyText="没有符合筛选条件的账单。"
        onEdit={(transaction) => {
          setEditingTransaction(transaction);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}
