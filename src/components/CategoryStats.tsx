import type { StatItem } from "../utils/statistics";
import { formatCurrency } from "../utils/format";

interface CategoryStatsProps {
  stats: StatItem[];
}

export function CategoryStats({ stats }: CategoryStatsProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">各分类支出统计</h2>
      </div>
      {stats.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">暂无分类支出数据</p>
      ) : (
        <div className="space-y-4">
          {stats.map((item) => (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="text-slate-500">
                  {formatCurrency(item.amount)} · {item.count} 笔
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-600"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
