import { CHANNEL_LABELS, CHANNELS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../data/constants";
import type {
  Channel,
  TransactionFilters,
  TransactionType,
} from "../types/transaction";

interface FilterBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
  onReset: () => void;
}

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const categoryOptions =
    filters.type === "income"
      ? INCOME_CATEGORIES
      : filters.type === "expense"
        ? EXPENSE_CATEGORIES
        : ALL_CATEGORIES;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-slate-500">类型</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            value={filters.type}
            onChange={(event) =>
              onChange({
                ...filters,
                type: event.target.value as TransactionType | "all",
                category: "",
              })
            }
          >
            <option value="all">全部</option>
            <option value="income">收入</option>
            <option value="expense">支出</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-slate-500">渠道</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            value={filters.channel}
            onChange={(event) =>
              onChange({
                ...filters,
                channel: event.target.value as Channel | "all",
              })
            }
          >
            <option value="all">全部</option>
            {CHANNELS.map((channel) => (
              <option key={channel} value={channel}>
                {CHANNEL_LABELS[channel]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-slate-500">分类</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            value={filters.category}
            onChange={(event) =>
              onChange({ ...filters, category: event.target.value })
            }
          >
            <option value="">全部</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-slate-500">开始日期</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            type="date"
            value={filters.startDate}
            onChange={(event) =>
              onChange({ ...filters, startDate: event.target.value })
            }
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-slate-500">结束日期</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            type="date"
            value={filters.endDate}
            onChange={(event) =>
              onChange({ ...filters, endDate: event.target.value })
            }
          />
        </label>

        <div className="flex items-end">
          <button
            className="w-full rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={onReset}
          >
            重置
          </button>
        </div>
      </div>
    </section>
  );
}
