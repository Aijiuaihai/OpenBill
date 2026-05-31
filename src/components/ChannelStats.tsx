import type { StatItem } from "../utils/statistics";
import { formatCurrency } from "../utils/format";

interface ChannelStatsProps {
  stats: StatItem[];
}

export function ChannelStats({ stats }: ChannelStatsProps) {
  return <StatsList title="各渠道支出统计" emptyText="暂无渠道支出数据" stats={stats} />;
}

function StatsList({
  title,
  emptyText,
  stats,
}: {
  title: string;
  emptyText: string;
  stats: StatItem[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {stats.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="space-y-4">
          {stats.map((item) => (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="text-slate-500">
                  {formatCurrency(item.amount)} · {item.percent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-700"
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
