import { CHANNEL_LABELS } from "../data/constants";
import type { Transaction } from "../types/transaction";
import { CategoryStats } from "../components/CategoryStats";
import { ChannelStats } from "../components/ChannelStats";
import { PeriodSummaryCards } from "../components/SummaryCards";
import {
  getExpenseStatsByCategory,
  getExpenseStatsByChannel,
  getMonthOptions,
  getPeriodSummaryStats,
  resolveStatisticsRange,
  type StatisticsRange,
} from "../utils/statistics";
import { getCurrentMonthKey } from "../utils/format";
import { useMemo, useState } from "react";

interface StatisticsPageProps {
  transactions: Transaction[];
}

export function StatisticsPage({ transactions }: StatisticsPageProps) {
  const currentMonth = getCurrentMonthKey();
  const monthOptions = useMemo(() => getMonthOptions(transactions), [transactions]);
  const [range, setRange] = useState<StatisticsRange>({
    mode: "current_month",
    month: currentMonth,
    startMonth: currentMonth,
    endMonth: currentMonth,
  });

  const resolvedRange = useMemo(
    () => resolveStatisticsRange(transactions, range, currentMonth),
    [currentMonth, range, transactions],
  );
  const stats = getPeriodSummaryStats(resolvedRange.transactions);
  const channelStats = getExpenseStatsByChannel(
    resolvedRange.transactions,
    CHANNEL_LABELS,
  );
  const categoryStats = getExpenseStatsByCategory(resolvedRange.transactions);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">统计</h2>
        <p className="mt-1 text-sm text-slate-500">
          汇总所有收入、支出、结余，以及支出在渠道和分类上的分布。
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">统计范围</span>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                value={range.mode}
                onChange={(event) =>
                  setRange((current) => ({
                    ...current,
                    mode: event.target.value as StatisticsRange["mode"],
                  }))
                }
              >
                <option value="current_month">当月</option>
                <option value="month">某月</option>
                <option value="month_range">自定义几个月</option>
                <option value="all">全部</option>
              </select>
            </label>

            {range.mode === "month" ? (
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500">月份</span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  list="openbill-months"
                  type="month"
                  value={range.month}
                  onChange={(event) =>
                    setRange((current) => ({
                      ...current,
                      month: event.target.value,
                    }))
                  }
                />
              </label>
            ) : null}

            {range.mode === "month_range" ? (
              <>
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-500">开始月份</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    list="openbill-months"
                    type="month"
                    value={range.startMonth}
                    onChange={(event) =>
                      setRange((current) => ({
                        ...current,
                        startMonth: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-500">结束月份</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    list="openbill-months"
                    type="month"
                    value={range.endMonth}
                    onChange={(event) =>
                      setRange((current) => ({
                        ...current,
                        endMonth: event.target.value,
                      }))
                    }
                  />
                </label>
              </>
            ) : null}
          </div>

          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            当前：{resolvedRange.label} · {resolvedRange.transactions.length} 笔
          </div>
        </div>
        <datalist id="openbill-months">
          {monthOptions.map((month) => (
            <option key={month} value={month} />
          ))}
        </datalist>
      </section>

      <PeriodSummaryCards
        stats={stats}
        labels={{
          income: `${resolvedRange.label}收入`,
          expense: `${resolvedRange.label}支出`,
          balance: `${resolvedRange.label}结余`,
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelStats stats={channelStats} />
        <CategoryStats stats={categoryStats} />
      </div>
    </div>
  );
}
