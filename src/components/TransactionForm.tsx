import { useEffect, useMemo, useState } from "react";
import { CHANNEL_LABELS, CHANNELS, getCategoriesByType } from "../data/constants";
import type {
  Channel,
  Transaction,
  TransactionDraft,
  TransactionType,
} from "../types/transaction";
import { getToday } from "../utils/format";

interface TransactionFormProps {
  initialTransaction?: Transaction | null;
  onSubmit: (draft: TransactionDraft) => void;
  onCancel?: () => void;
}

interface FormState {
  amount: string;
  type: TransactionType;
  category: string;
  channel: Channel;
  note: string;
  date: string;
}

const createDefaultState = (): FormState => ({
  amount: "",
  type: "expense",
  category: "餐饮",
  channel: "alipay",
  note: "",
  date: getToday(),
});

export function TransactionForm({
  initialTransaction,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [form, setForm] = useState<FormState>(createDefaultState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialTransaction) {
      setForm(createDefaultState());
      setError("");
      return;
    }

    setForm({
      amount: String(initialTransaction.amount),
      type: initialTransaction.type,
      category: initialTransaction.category,
      channel: initialTransaction.channel,
      note: initialTransaction.note ?? "",
      date: initialTransaction.date,
    });
    setError("");
  }, [initialTransaction]);

  const categories = useMemo(() => getCategoriesByType(form.type), [form.type]);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleTypeChange = (type: TransactionType) => {
    const nextCategory = getCategoriesByType(type)[0] ?? "";
    setForm((current) => ({ ...current, type, category: nextCategory }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("金额必须大于 0。");
      return;
    }

    if (!form.type || !form.category || !form.channel || !form.date) {
      setError("请完整填写类型、分类、渠道和日期。");
      return;
    }

    onSubmit({
      amount,
      type: form.type,
      category: form.category,
      channel: form.channel,
      note: form.note.trim() || undefined,
      date: form.date,
    });

    if (!initialTransaction) {
      setForm(createDefaultState());
    }
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">金额</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            min="0.01"
            step="0.01"
            type="number"
            value={form.amount}
            onChange={(event) => updateField("amount", event.target.value)}
            placeholder="0.00"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">类型</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            value={form.type}
            onChange={(event) =>
              handleTypeChange(event.target.value as TransactionType)
            }
          >
            <option value="expense">支出</option>
            <option value="income">收入</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">分类</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">渠道</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            value={form.channel}
            onChange={(event) =>
              updateField("channel", event.target.value as Channel)
            }
          >
            {CHANNELS.map((channel) => (
              <option key={channel} value={channel}>
                {CHANNEL_LABELS[channel]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">日期</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            type="date"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">备注</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            value={form.note}
            onChange={(event) => updateField("note", event.target.value)}
            placeholder="可选"
          />
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {onCancel ? (
          <button
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={onCancel}
          >
            取消
          </button>
        ) : null}
        <button
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
          type="submit"
        >
          {initialTransaction ? "保存修改" : "新增账单"}
        </button>
      </div>
    </form>
  );
}
